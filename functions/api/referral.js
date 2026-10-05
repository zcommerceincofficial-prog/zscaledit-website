// functions/api/referral.js
//
// The /referrals form posts here. We check the fields, drop bots (the hidden
// company_website field), and forward one JSON payload to a GoHighLevel inbound
// webhook. The webhook URL is NOT in the repo: it lives in the Cloudflare Pages
// environment variable REFERRAL_WEBHOOK_URL (production AND preview).
//
// Works with and without JavaScript:
//   fetch with Accept: application/json  -> JSON { ok } back
//   plain form post                      -> 303 to /referrals?sent=1 (or ?error=1)

const REQUIRED = [
  'referrer_name', 'referrer_email', 'referrer_phone',
  'business_name', 'owner_name', 'owner_phone', 'business_type', 'city_state', 'knows_about_it'
];
const OPTIONAL = ['owner_email', 'notes'];
const MAX = 2000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const reply = (ok, status) => wantsJson
    ? Response.json({ ok }, { status })
    : Response.redirect(new URL(ok ? '/referrals?sent=1#referral-form' : '/referrals?error=1#referral-form', request.url), 303);

  let fields;
  try {
    const form = await request.formData();
    fields = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v).trim().slice(0, MAX)]));
  } catch {
    return reply(false, 400);
  }

  // a bot filled the hidden field: pretend it worked, send nothing
  if (fields.company_website) return reply(true, 200);

  const missing = REQUIRED.filter((k) => !fields[k]);
  const badEmail = !EMAIL.test(fields.referrer_email || '') || (fields.owner_email && !EMAIL.test(fields.owner_email));
  if (missing.length || badEmail) return reply(false, 422);

  if (!env.REFERRAL_WEBHOOK_URL) {
    console.error('REFERRAL_WEBHOOK_URL is not set: referral not sent', fields.business_name);
    return reply(false, 503);
  }

  const payload = { source: 'zscaledit.site/referrals', submitted_at: new Date().toISOString() };
  for (const k of [...REQUIRED, ...OPTIONAL]) payload[k] = fields[k] || '';

  try {
    const res = await fetch(env.REFERRAL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('webhook answered ' + res.status);
  } catch (e) {
    console.error('referral webhook failed:', e.message);
    return reply(false, 502);
  }
  return reply(true, 200);
}
