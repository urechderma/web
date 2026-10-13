/*
  Silueta hexagonal de las fotos de piel.
  - La foto (pseudo-elemento ::before/::after con la malla hex.svg) se recorta siguiendo la misma
    rejilla de hexágonos, con un borde suave tipo costa (sin entrantes ni agujeros).
  - Más allá de la costa, algunos hexágonos se desprenden: cada uno es una pieza aparte con su trozo
    de foto y de malla, ligeramente rotada.
  Sin JavaScript, la foto se ve como un rectángulo normal.
*/
(function () {
  var R = 16, COL = 24, ROW = 27.713, HALF = 13.856;
  var HEX_CLIP = 'polygon(0 50%, 25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%)';

  // Pseudoaleatorio fijo por casilla: el dibujo es siempre el mismo.
  function azar(i, j, s) {
    var x = Math.sin(i * 127.1 + j * 311.7 + (s || 0) * 74.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // Línea de costa: ondulación suave a lo largo del borde (longitudes de onda largas = sin fiordos).
  function costa(t, semilla) {
    return 30 * Math.sin(t / 58 + semilla) + 12 * Math.sin(t / 24 + semilla * 2.3);
  }

  function hexagono(cx, cy) {
    return 'M' + (cx - R) + ' ' + cy + 'L' + (cx - 8) + ' ' + (cy - HALF) + 'H' + (cx + 8) +
      'L' + (cx + R) + ' ' + cy + 'L' + (cx + 8) + ' ' + (cy + HALF) + 'H' + (cx - 8) + 'Z';
  }

  var tamanos = {};
  function tamanoImagen(url, listo) {
    if (tamanos[url]) return listo(tamanos[url]);
    var img = new Image();
    img.onload = function () { tamanos[url] = [img.naturalWidth, img.naturalHeight]; listo(tamanos[url]); };
    img.src = url;
  }

  function silueta(el) {
    var pseudo = el.getAttribute('data-hex-pseudo');
    var cs = getComputedStyle(el, pseudo);
    var w = parseFloat(cs.width), h = parseFloat(cs.height);
    if (!w || !h) return;
    var capas = cs.backgroundImage.match(/url\(["']?[^"')]+["']?\)/g) || [];
    var urlMalla = capas[0], urlFoto = capas[1] && capas[1].replace(/^url\(["']?|["']?\)$/g, '');
    if (!urlFoto) return;

    tamanoImagen(urlFoto, function (nat) {
      // En móvil la foto ocupa todo el ancho y se deshace por abajo; en ordenador, por los bordes indicados.
      var movil = w >= el.clientWidth - 1;
      var bordes = movil ? ['abajo'] : el.getAttribute('data-hex').split(' ');
      var banda = movil ? 90 : 150;
      // Foto en modo "cover", centrada (igual que en el CSS).
      var esc = Math.max(w / nat[0], h / nat[1]);
      var bw = nat[0] * esc, bh = nat[1] * esc, ox = (w - bw) / 2, oy = (h - bh) / 2;

      var d = '', piezas = [];
      for (var k = 0; k * COL <= w + R; k++) {
        var cx = R + k * COL;
        for (var j = -1; j * ROW <= h + ROW; j++) {
          var cy = +(((k % 2 === 0) ? HALF : 0) + j * ROW).toFixed(3);
          // Profundidad respecto a la costa (positiva = tierra firme).
          var prof = Infinity;
          if (bordes.indexOf('izquierda') > -1) prof = Math.min(prof, cx - banda - costa(cy, 1.7));
          if (bordes.indexOf('abajo') > -1) prof = Math.min(prof, (h - banda * 0.7) - cy - costa(cx, 4.1));
          if (prof >= 0) { d += hexagono(cx, cy); continue; }
          // Mar: hexágonos sueltos, cada vez más escasos, y siempre separados de la costa.
          if (prof > -30 || prof < -banda) continue;
          var p = 0.6 * Math.pow(1 + prof / banda, 1.3);
          if (azar(k, j) >= p) continue;
          var giro = (azar(k, j, 1) < 0.5 ? -1 : 1) * (6 + 12 * azar(k, j, 2));
          piezas.push([cx - R, cy - HALF, giro]);
        }
      }
      var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h +
        "' viewBox='0 0 " + w + ' ' + h + "'><path d='" + d + "'/></svg>";
      el.style.setProperty('--hex-mask', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');

      // Capa con las piezas sueltas, en la misma posición que la foto.
      var capa = el.querySelector(':scope > .hex-sueltos');
      if (!capa) {
        capa = document.createElement('div');
        capa.className = 'hex-sueltos';
        capa.setAttribute('aria-hidden', 'true');
        el.insertBefore(capa, el.firstChild);
      }
      capa.style.cssText = 'top:' + cs.top + ';right:' + cs.right + ';bottom:' + cs.bottom + ';left:' + cs.left +
        ';width:' + w + 'px;height:' + h + 'px;opacity:' + cs.opacity;
      capa.textContent = '';
      piezas.forEach(function (pz) {
        var x0 = pz[0], y0 = pz[1], sp = document.createElement('span');
        sp.style.left = x0 + 'px';
        sp.style.top = y0 + 'px';
        sp.style.transform = 'rotate(' + pz[2].toFixed(1) + 'deg)';
        sp.style.backgroundImage = urlMalla + ', url("' + urlFoto + '")';
        sp.style.backgroundSize = '48px 27.713px, ' + bw + 'px ' + bh + 'px';
        sp.style.backgroundPosition = (-x0) + 'px ' + (-y0) + 'px, ' + (ox - x0) + 'px ' + (oy - y0) + 'px';
        capa.appendChild(sp);
      });
    });
  }

  function todo() {
    var els = document.querySelectorAll('[data-hex]');
    for (var i = 0; i < els.length; i++) silueta(els[i]);
  }

  todo();
  if (window.ResizeObserver) {
    var ultimo = new WeakMap();
    var ro = new ResizeObserver(function (entradas) {
      // Solo se redibuja si cambia el tamaño de verdad (evita bucles).
      entradas.forEach(function (e) {
        var wh = Math.round(e.contentRect.width) + 'x' + Math.round(e.contentRect.height);
        if (ultimo.get(e.target) !== wh) { ultimo.set(e.target, wh); silueta(e.target); }
      });
    });
    document.querySelectorAll('[data-hex]').forEach(function (el) { ro.observe(el); });
  } else {
    window.addEventListener('resize', todo);
  }
})();
