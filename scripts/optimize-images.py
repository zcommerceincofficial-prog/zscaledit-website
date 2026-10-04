#!/usr/bin/env python3
"""
optimize-images.py, the image weight pass.

WHAT IT DOES: walks an assets folder, and for every PNG, JPG, TIFF or BMP it writes a WebP
beside the original, resized down so the longest side fits the maximum for the folder it
sits in. Originals are never touched or deleted; they stay as the source you re-encode from.
Files that look like social share images or browser icons are skipped, because those two
formats have to stay PNG. It is safe to run again: a WebP that is already newer than its
source is left alone unless you pass --force.

HOW TO RUN:
  python scripts/optimize-images.py                     # walks site/assets, then assets
  python scripts/optimize-images.py path/to/folder
  python scripts/optimize-images.py --dry-run           # prints the table, writes nothing
  python scripts/optimize-images.py --quality 78 --max-edge 1400 --force

WHAT IT NEEDS: Python 3.9 or newer and Pillow. Install Pillow with:
  python -m pip install pillow

WHAT IT PRINTS: one row per file (before KB, after KB, saving, new pixel size, and a mark
when the result is over the size ceiling for its folder), then totals, then a reminder that
a changed picture needs a NEW filename because the old one sits in caches for a year.

EXIT CODES: 0 finished. 1 at least one file could not be converted. 2 could not start
(Pillow missing, folder missing, unknown flag).
"""

import io
import math
import os
import re
import sys

# ---------------------------------------------------------------------------
# The rules. Edit these, not the code below.
# ---------------------------------------------------------------------------

# Longest side allowed, in pixels, by folder. The key is matched against the path of the
# folder the file sits in, relative to the folder you point the script at. "" is the
# default for anything that does not match. Nothing on a local business site needs to
# reach a phone wider than about 1600.
MAX_EDGE = {
    "": 1600,          # default for everything
    "hero": 1920,      # full-bleed banners, the one place extra width shows
    "gallery": 1400,
    "cards": 1200,
    "logos": 800,
    "icons": 512,
}

# Size ceilings after conversion, in KB, by folder. Over these, the source dimensions or
# the quality number needs another pass. These are flagged, not enforced.
CEILING_KB = {
    "": 60,            # an in-page visual
    "hero": 100,       # a hero photo
    "logos": 30,       # a logo or a mark
    "icons": 30,
}

# WebP quality, 0 to 100. 82 is the point where a photo stops losing anything you can see
# on a phone. Raise it for large flat areas of colour, which show banding first.
QUALITY = 82

# Files whose names match any of these are left alone. Social share images and browser
# icons stay PNG: platforms are inconsistent about WebP for previews, and the icon specs
# expect PNG. Note the patterns look for "og" as a word, not as any two letters, so
# logo.png and blog-hero.jpg still get optimised.
SKIP_PATTERNS = [
    r"(^|[-_.])og([-_.]|$)",   # og-image.png, hero.og.png, share_og.jpg
    r"opengraph",
    r"favicon",
    r"apple-touch",
    r"android-chrome",
    r"mstile",
]

SOURCE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}
DEFAULT_FOLDERS = ["site/assets", "assets"]

# ---------------------------------------------------------------------------


def die(message, code=2):
    print("\noptimize-images stopped: " + message + "\n", file=sys.stderr)
    sys.exit(code)


def usage():
    print(
        """
optimize-images.py, the image weight pass

  python scripts/optimize-images.py [folder] [flags]

  folder            the assets folder to walk. Default: site/assets, then assets.
  --dry-run         print the table, write nothing.
  --quality <0-100> WebP quality. Default: %d
  --max-edge <px>   longest side for every folder, overriding the per-folder table.
  --force           re-encode even when the WebP is already newer than its source.
  -h, --help        this text

Skipped by name: %s
Per-folder maximum longest side: %s
"""
        % (QUALITY, ", ".join(p for p in SKIP_PATTERNS), MAX_EDGE)
    )


def parse_args(argv):
    opts = {"folder": None, "dry_run": False, "quality": QUALITY, "max_edge": None, "force": False}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("-h", "--help"):
            usage()
            sys.exit(0)
        elif a == "--dry-run":
            opts["dry_run"] = True
        elif a == "--force":
            opts["force"] = True
        elif a in ("--quality", "--max-edge"):
            i += 1
            if i >= len(argv):
                die("The flag %s needs a number after it." % a)
            try:
                value = int(argv[i])
            except ValueError:
                die("%s is not a whole number, so I cannot use it for %s." % (argv[i], a))
            if a == "--quality":
                if not 0 <= value <= 100:
                    die("Quality has to be between 0 and 100. You passed %d." % value)
                opts["quality"] = value
            else:
                if value < 16:
                    die("A maximum edge of %d pixels is too small to be a real setting." % value)
                opts["max_edge"] = value
        elif a.startswith("-"):
            die("I do not know the flag %s. Run with --help to see the list." % a)
        elif opts["folder"] is None:
            opts["folder"] = a
        else:
            die("I can only walk one folder at a time. You gave me %s and %s." % (opts["folder"], a))
        i += 1
    return opts


def rule_for(rel_dir, table, default_key=""):
    """Pick the rule for the folder a file sits in: the longest matching path part wins."""
    parts = [p.lower() for p in rel_dir.replace("\\", "/").split("/") if p]
    best = table.get(default_key)
    best_len = -1
    for key, value in table.items():
        if key == default_key:
            continue
        k = key.lower()
        if k in parts and len(k) > best_len:
            best, best_len = value, len(k)
    return best


def should_skip(name):
    lower = name.lower()
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, lower):
            return pattern
    return None


def kb(n):
    return n / 1024.0


def fmt_kb(n):
    """Small files get a decimal, so a 700 byte icon does not print as 0 KB."""
    size = kb(n)
    return ("%.1f KB" % size) if size < 10 else ("%.0f KB" % size)


def main():
    opts = parse_args(sys.argv[1:])

    try:
        from PIL import Image
    except ImportError:
        die(
            "Pillow is not installed, and this script cannot read images without it.\n"
            "  Install it with:  python -m pip install pillow\n"
            "  Then run this script again.",
            2,
        )

    folder = opts["folder"]
    if folder is None:
        for candidate in DEFAULT_FOLDERS:
            if os.path.isdir(candidate):
                folder = candidate
                break
    if folder is None:
        die(
            "I could not find an assets folder. I looked for %s.\n"
            "  Pass the folder you want walked, for example:  python scripts/optimize-images.py dist/assets"
            % " and ".join(DEFAULT_FOLDERS)
        )
    if not os.path.isdir(folder):
        die("%s is not a folder I can open." % folder)

    root = os.path.abspath(folder)
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in sorted(dirnames) if not d.startswith(".")]
        for name in sorted(filenames):
            if os.path.splitext(name)[1].lower() in SOURCE_EXTENSIONS:
                files.append(os.path.join(dirpath, name))

    if not files:
        print("No PNG or JPG files under %s. Nothing to do." % root)
        return 0

    print("Folder:   %s" % root)
    print("Quality:  %d%s" % (opts["quality"], "" if opts["max_edge"] is None else "   max edge: %dpx (flag)" % opts["max_edge"]))
    print("Mode:     %s" % ("DRY RUN, nothing is written" if opts["dry_run"] else "writing .webp beside each source"))
    print("")
    header = "%-40s %10s %10s %8s  %-22s %s" % ("FILE", "BEFORE", "AFTER", "SAVED", "PIXELS", "NOTE")
    print(header)
    print("-" * len(header))

    total_before = 0
    total_after = 0
    counted = 0   # files that contributed bytes to the totals
    converted = skipped = failed = over = 0

    for src in files:
        rel = os.path.relpath(src, root).replace("\\", "/")
        rel_dir = os.path.dirname(rel)
        name = os.path.basename(src)
        before = os.path.getsize(src)

        reason = should_skip(name)
        if reason:
            skipped += 1
            print("%-40s %10s %10s %8s  %-22s %s" % (rel[-40:], fmt_kb(before), "-", "-", "-", "skipped, stays PNG"))
            continue

        dest = os.path.splitext(src)[0] + ".webp"
        if (not opts["force"]) and os.path.exists(dest) and os.path.getmtime(dest) >= os.path.getmtime(src):
            skipped += 1
            after = os.path.getsize(dest)
            total_before += before
            total_after += after
            counted += 1
            print("%-40s %10s %10s %8s  %-22s %s" % (rel[-40:], fmt_kb(before), fmt_kb(after), "-", "-", "already done"))
            continue

        max_edge = opts["max_edge"] if opts["max_edge"] is not None else rule_for(rel_dir, MAX_EDGE)
        ceiling = rule_for(rel_dir, CEILING_KB)

        try:
            with Image.open(src) as im:
                im.load()
                width, height = im.size
                # Flatten anything with a palette; keep real transparency.
                if im.mode in ("P", "LA"):
                    im = im.convert("RGBA")
                elif im.mode not in ("RGB", "RGBA", "L"):
                    im = im.convert("RGB")
                longest = max(width, height)
                if longest > max_edge:
                    scale = max_edge / float(longest)
                    new_size = (max(1, int(round(width * scale))), max(1, int(round(height * scale))))
                    im = im.resize(new_size, Image.LANCZOS)
                else:
                    new_size = (width, height)

                # Encode both ways and keep the smaller file. Photographs always win on
                # the lossy setting. Flat graphics with big areas of one colour, which is
                # most logos and diagrams, are often SMALLER lossless, and encoding those
                # lossy would hand you a bigger file than the PNG you started with.
                lossy = io.BytesIO()
                im.save(lossy, "WEBP", quality=opts["quality"], method=6)
                lossless = io.BytesIO()
                im.save(lossless, "WEBP", lossless=True, quality=100, method=6)
                best = lossy if lossy.tell() <= lossless.tell() else lossless
                encoding = "lossy" if best is lossy else "lossless"
                after = best.tell()

                if opts["dry_run"]:
                    after = None
                else:
                    with open(dest, "wb") as out:
                        out.write(best.getvalue())
                    after = os.path.getsize(dest)
        except Exception as err:  # a corrupt file should not stop the whole pass
            failed += 1
            print("%-40s %10s %10s %8s  %-22s %s" % (rel[-40:], fmt_kb(before), "-", "-", "-", "FAILED: %s" % err))
            continue

        converted += 1
        pixels = "%dx%d" % new_size
        if new_size != (width, height):
            pixels = "%dx%d -> %s" % (width, height, pixels)
        note = ""
        if after is None:
            print("%-40s %10s %10s %8s  %-22s %s" % (rel[-40:], fmt_kb(before), "would write", "-", pixels[:22], "dry run"))
            total_before += before
            continue

        total_before += before
        total_after += after
        counted += 1
        # Round DOWN, so a 99.9 percent cut never prints as 100.
        saved = math.floor(100.0 * (before - after) / before) if before else 0
        if after >= before:
            # WebP is not always smaller. Say so rather than pretending it is a win.
            note = "no saving (%s), keep the original" % encoding
        elif ceiling is not None and kb(after) > ceiling:
            note = "! over the %d KB ceiling" % ceiling
            over += 1
        print("%-40s %10s %10s %7d%%  %-22s %s" % (rel[-40:], fmt_kb(before), fmt_kb(after), saved, pixels[:22], note))

    print("-" * len(header))
    if opts["dry_run"]:
        print("DRY RUN: %d file(s) would be converted, %d skipped by name or already done, %d unreadable." % (converted, skipped, failed))
        print("Run it again without --dry-run to write the WebP files.")
    else:
        saved_total = math.floor(100.0 * (total_before - total_after) / total_before) if total_before else 0
        print("%-40s %10s %10s %7d%%" % ("TOTAL (%d file(s))" % counted, fmt_kb(total_before), fmt_kb(total_after), saved_total))
        print("")
        print("%d converted, %d skipped by name or already done, %d unreadable, %d over ceiling." % (converted, skipped, failed, over))
        print("Originals are untouched. Point the page at the .webp file, and remember:")
        print("a CHANGED picture gets a NEW filename, or caches serve the old one for months.")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
