// functions/_middleware.js
//
// One canonical host. Anyone who arrives on www.zscaledit.site gets a single
// permanent (301) hop to https://zscaledit.site, with the path and the query
// string kept, so ad click ids (gclid, fbclid) and deep links survive.
// Every other request passes through untouched.

const CANONICAL_HOST = 'zscaledit.site';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.' + CANONICAL_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
