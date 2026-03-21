// ─── Google Analytics 4 ───────────────────────────────────────────────────────
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Consent Mode v2: cookieless by default until user accepts
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  wait_for_update: 500,
});

gtag('js', new Date());
gtag('config', 'G-M8XLQ99J8T');

// ─── Meta Pixel ───────────────────────────────────────────────────────────────
!function(f,b,e,v,n,t,s){
  if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)
}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

fbq('consent', 'revoke');
fbq('init', '1677678859912016');

// ─── Consent gate ─────────────────────────────────────────────────────────────
(function () {
  var stored = localStorage.getItem('cookie-consent');

  if (stored === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
    fbq('consent', 'grant');
    fbq('track', 'PageView');
    return;
  }
  if (stored === 'denied') return;

  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  var text = lang === 'en'
    ? 'We use cookies for analytics and marketing to improve the site and show relevant ads.'
    : 'Usamos cookies analíticas y de marketing para mejorar el sitio y mostrar anuncios relevantes.';
  var acceptLabel = lang === 'en' ? 'Accept' : 'Aceptar';
  var rejectLabel = lang === 'en' ? 'Reject' : 'Rechazar';

  var bar = document.createElement('div');
  bar.id = 'cookie-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', lang === 'en' ? 'Cookie consent' : 'Consentimiento de cookies');

  var msg = document.createElement('span');
  msg.textContent = text;

  var acceptBtn = document.createElement('button');
  acceptBtn.id = 'cb-accept';
  acceptBtn.textContent = acceptLabel;

  var rejectBtn = document.createElement('button');
  rejectBtn.id = 'cb-reject';
  rejectBtn.textContent = rejectLabel;

  bar.appendChild(msg);
  bar.appendChild(acceptBtn);
  bar.appendChild(rejectBtn);
  document.body.appendChild(bar);

  acceptBtn.onclick = function () {
    localStorage.setItem('cookie-consent', 'granted');
    gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
    fbq('consent', 'grant');
    fbq('track', 'PageView');
    bar.remove();
  };

  rejectBtn.onclick = function () {
    localStorage.setItem('cookie-consent', 'denied');
    bar.remove();
  };
})();
