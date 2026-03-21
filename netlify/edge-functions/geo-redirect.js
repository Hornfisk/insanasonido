export default async (request, context) => {
  const url = new URL(request.url);
  const { pathname } = url;

  // Skip: already English, static assets (contain dot), CMS admin
  if (pathname.startsWith('/en') || pathname.startsWith('/420') || /\.[a-z]+$/i.test(pathname)) return;

  // Skip: search engine crawlers and social media bots — they must see canonical 200
  const ua = request.headers.get('user-agent') ?? '';
  if (/googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|pingdom/i.test(ua)) return;

  // Respect manual language override cookie
  const cookie = request.headers.get('cookie') ?? '';
  if (cookie.includes('lang-pref=es')) return;

  // Spain (or unknown geo) → serve Spanish default
  const country = context.geo?.country?.code;
  if (!country || country === 'ES') return;

  // All other countries → redirect to English version of same path
  if (pathname !== '/' && !/^\/[a-zA-Z0-9\-_./]+$/.test(pathname)) return;
  const enPath = `/en/${pathname === '/' ? '' : pathname.replace(/^\//, '')}`;
  return Response.redirect(`${url.origin}${enPath}`, 302);
};

export const config = { path: "/*" };
