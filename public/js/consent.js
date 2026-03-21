(function () {
  var stored = localStorage.getItem('ga-consent');
  if (stored === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  if (stored === 'denied') return;

  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  var text = lang === 'en'
    ? 'We use analytics cookies to improve the site.'
    : 'Usamos cookies analíticas para mejorar el sitio.';
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
    localStorage.setItem('ga-consent', 'granted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    bar.remove();
  };

  rejectBtn.onclick = function () {
    localStorage.setItem('ga-consent', 'denied');
    bar.remove();
  };
})();
