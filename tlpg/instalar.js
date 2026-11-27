// Botón «Instalar la app» y avisos para instalarla sin buscar menús.
// - Android (Chrome, Internet de Samsung): botón que abre la ventana de instalación del propio móvil.
// - iPhone: Apple no deja instalar con un botón; cartel con botón «Copiar enlace» (para pegarlo en Safari) y los pasos.
// - Abierta dentro de WhatsApp u otra app: aviso para abrirla en el navegador.
// - Ya instalada (abierta desde el icono): no sale nada.
// Para probar en el ordenador: ?ver=android | ?ver=ios | ?ver=whatsapp
(function () {
  var ver = (location.search.match(/[?&]ver=(\w+)/) || [])[1] || '';
  var ua = navigator.userAgent || '';
  var instalada = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (instalada && !ver) return;
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua);
  // navegador metido dentro de otra app (WhatsApp, Instagram…): en iPhone no lleva «Safari/»; en Android lleva «; wv)»
  var dentro = /WhatsApp|FBAN|FBAV|Instagram/.test(ua) || (android && /; wv\)/.test(ua)) || (ios && !/Safari\//.test(ua));
  if (ver === 'android') { android = true; ios = false; dentro = false; }
  if (ver === 'ios') { ios = true; android = false; dentro = false; }
  if (ver === 'whatsapp') { dentro = true; }

  var css = document.createElement('style');
  css.textContent =
    '#instalar{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:5;background:#fff;color:#1f3b5c;' +
    'border:2px solid #1f3b5c;border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.3);padding:12px 14px;font:16px system-ui,-apple-system,Roboto,sans-serif;display:none}' +
    '#instalar .x{position:absolute;top:4px;right:6px;background:none;border:0;font-size:26px;line-height:1;color:#6b7785;padding:4px 8px}' +
    '#instalar .bt{display:block;width:100%;margin-top:8px;padding:14px;border:0;border-radius:12px;background:#2e7d32;color:#fff;font-size:20px;font-weight:700}' +
    '#instalar b{color:#1f3b5c} #instalar ol{margin:6px 0 0;padding-left:22px;line-height:1.5} #instalar .t{font-weight:700;font-size:17px;padding-right:30px}' +
    '#instalar svg{vertical-align:-4px}' +
    '#instalar .flecha{text-align:center;font-size:28px;line-height:1;margin-top:4px;color:#1f3b5c}';
  document.head.appendChild(css);

  var caja = document.createElement('div');
  caja.id = 'instalar';
  document.body.appendChild(caja);
  function cerrar() { caja.style.display = 'none'; }
  function mostrar(html) {
    caja.innerHTML = '<button class="x" aria-label="Cerrar">×</button>' + html;
    caja.querySelector('.x').onclick = cerrar;
    caja.style.display = 'block';
  }
  var compartir = '<svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="#007aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 14V2M6 6l4-4 4 4"/><path d="M6 9H3v11h14V9h-3"/></svg>';

  // botón que copia el enlace de esta página (para pegarlo en Safari)
  var enlace = location.origin + location.pathname;
  function botonCopiar() {
    var b = caja.querySelector('.copiar');
    if (!b) return;
    b.onclick = function () {
      function hecho() { b.textContent = '✅ Copiado. Ahora abre Safari y pégalo arriba'; b.style.background = '#1f3b5c'; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(enlace).then(hecho, viejo); else viejo();
      function viejo() {
        var t = document.createElement('textarea'); t.value = enlace; t.setAttribute('readonly', '');
        t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t);
        t.select(); t.setSelectionRange(0, 999);
        try { document.execCommand('copy'); hecho(); } catch (e) { b.textContent = enlace; }
        document.body.removeChild(t);
      }
    };
  }
  var pasoSafari = '<li><b>Tiene que estar abierta en Safari.</b> Si has entrado desde WhatsApp: ' +
    'toca <b>Copiar enlace</b>, abre <b>Safari</b>, pégalo arriba y entra</li>';
  var btCopiar = '<button class="bt copiar">📋 Copiar enlace</button>';

  if (dentro) {
    if (ios) {
      mostrar('<div class="t">En iPhone hay que abrirla en Safari</div>' +
        '<ol><li>Toca <b>Copiar enlace</b></li><li>Abre <b>Safari</b>, pégalo arriba y entra</li>' +
        '<li>Allí te dirá cómo instalarla</li></ol>' + btCopiar);
      botonCopiar();
    } else {
      mostrar('<div class="t">Para instalar la app, ábrela en el navegador</div>' +
        '<ol><li>Toca los tres puntos <b>⋮</b> de arriba a la derecha</li><li>Elige <b>Abrir en el navegador</b> (o en Chrome)</li></ol>');
    }
    return;
  }
  if (ios) {
    // el navegador de WhatsApp en iPhone se parece a Safari y no siempre se distingue: se pide siempre el paso de Safari
    mostrar('<div class="t">Instala la app en tu iPhone</div>' +
      '<ol>' + pasoSafari + '<li>Toca el botón <b>Compartir</b> ' + compartir + ' de abajo (si no lo ves, toca antes <b>···</b>)</li>' +
      '<li>Baja y toca <b>Añadir a pantalla de inicio</b></li><li>Toca <b>Añadir</b></li></ol>' +
      btCopiar + '<div class="flecha">⬇</div>');
    botonCopiar();
    return;
  }
  // Android: el móvil avisa cuando se puede instalar (si ya está instalada, no avisa y no sale nada)
  var aviso = null;
  function boton() {
    mostrar('<div class="t">Ten la app en el móvil, con su icono</div><button class="bt">📲 Instalar la app</button>');
    caja.querySelector('.bt').onclick = function () {
      if (!aviso) { cerrar(); return; }
      aviso.prompt();
      aviso.userChoice.then(function (r) { aviso = null; if (r.outcome !== 'accepted') cerrar(); });
    };
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); aviso = e; boton(); });
  window.addEventListener('appinstalled', function () {
    mostrar('<div class="t">✅ ¡Instalada!</div><div style="margin-top:6px">A partir de ahora entra siempre desde el icono <b>Locos Golf</b> de la pantalla del móvil.</div>');
  });
  if (ver === 'android') boton();
})();
