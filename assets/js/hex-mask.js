/*
  Silueta hexagonal de las fotos de piel.
  - La foto (pseudo-elemento ::before/::after con la malla hex.svg) se recorta siguiendo la misma
    rejilla de hexágonos, con un borde suave tipo costa (sin entrantes ni agujeros).
  - En la orilla, algunos hexágonos están a punto de desprenderse (separados por una grieta fina).
  - Más allá de la costa flotan hexágonos sueltos, como icebergs: cada uno es una pieza aparte con su
    trozo de foto y de malla, girada, que se mece despacio y nunca toca a las demás.
  La animación se desactiva si el visitante tiene activado "reducir movimiento".
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

      // 1) Casillas de la rejilla y su profundidad respecto a la costa (positiva = tierra firme).
      var celdas = [], mapa = {};
      for (var k = 0; k * COL <= w + R; k++) {
        var cx = R + k * COL;
        for (var j = -1; j * ROW <= h + ROW; j++) {
          var cy = +(((k % 2 === 0) ? HALF : 0) + j * ROW).toFixed(3);
          var prof = Infinity, sale = [-1, 0];
          if (bordes.indexOf('izquierda') > -1) { var pi = cx - banda - costa(cy, 1.7); if (pi < prof) { prof = pi; sale = [-1, 0]; } }
          if (bordes.indexOf('abajo') > -1) { var pa = (h - banda * 0.7) - cy - costa(cx, 4.1); if (pa < prof) { prof = pa; sale = [0, 1]; } }
          var c = { k: k, j: j, cx: cx, cy: cy, prof: prof, sale: sale, tipo: prof >= 0 ? 'tierra' : 'mar' };
          // Algunas casillas de la orilla están a punto de desprenderse.
          if (c.tipo === 'tierra' && prof < 26 && azar(k, j, 3) < 0.14) c.tipo = 'grieta';
          celdas.push(c); mapa[k + ',' + j] = c;
        }
      }
      function vecinas(c, radio, fn) {
        for (var dk = -radio; dk <= radio; dk++) for (var dj = -radio; dj <= radio; dj++) {
          var v = mapa[(c.k + dk) + ',' + (c.j + dj)]; if (v && v !== c) fn(v);
        }
      }
      function dist(a, b) { return Math.sqrt((a.cx - b.cx) * (a.cx - b.cx) + (a.cy - b.cy) * (a.cy - b.cy)); }

      // 2) Icebergs: piezas sueltas en el mar, cada vez más escasas, que nunca se tocan
      //    (ni entre sí ni con la costa), aunque giren y floten.
      var sueltas = [];
      celdas.forEach(function (c) {
        if (c.tipo !== 'mar' || c.prof > -30 || c.prof < -banda) return;
        if (azar(c.k, c.j) >= 0.6 * Math.pow(1 + c.prof / banda, 1.3)) return;
        var libre = true;
        vecinas(c, 3, function (v) {
          if ((v.tipo === 'tierra' && dist(c, v) < 38) || (v.tipo === 'grieta' && dist(c, v) < 40)) libre = false;
        });
        sueltas.forEach(function (o) { if (dist(c, o) < 40) libre = false; });
        if (libre) { c.tipo = 'suelta'; sueltas.push(c); }
      });

      var d = '', piezas = [];
      celdas.forEach(function (c) {
        if (c.tipo === 'tierra') d += hexagono(c.cx, c.cy);
        else if (c.tipo === 'grieta' || c.tipo === 'suelta') piezas.push(c);
      });
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
      piezas.forEach(function (c) {
        var x0 = c.cx - R, y0 = c.cy - HALF, sp = document.createElement('span');
        var signo = azar(c.k, c.j, 1) < 0.5 ? -1 : 1, st = sp.style;
        st.left = x0 + 'px';
        st.top = y0 + 'px';
        st.backgroundImage = urlMalla + ', url("' + urlFoto + '")';
        st.backgroundSize = '48px 27.713px, ' + bw + 'px ' + bh + 'px';
        st.backgroundPosition = (-x0) + 'px ' + (-y0) + 'px, ' + (ox - x0) + 'px ' + (oy - y0) + 'px';
        if (c.tipo === 'suelta') {
          // Iceberg: girado y meciéndose despacio.
          st.setProperty('--r', (signo * (6 + 12 * azar(c.k, c.j, 2))).toFixed(1) + 'deg');
          st.setProperty('--dx', ((azar(c.k, c.j, 4) - 0.5) * 6).toFixed(1) + 'px');
          st.setProperty('--dy', ((azar(c.k, c.j, 5) - 0.5) * 6).toFixed(1) + 'px');
          st.setProperty('--dr', ((azar(c.k, c.j, 6) - 0.5) * 5).toFixed(1) + 'deg');
          st.setProperty('--dur', (6 + 4 * azar(c.k, c.j, 7)).toFixed(1) + 's');
        } else {
          // A punto de desprenderse: separado por una grieta fina, un poco salido y apenas temblando.
          sp.className = 'grieta';
          st.setProperty('--r', (signo * (2 + 1.5 * azar(c.k, c.j, 2))).toFixed(1) + 'deg');
          st.setProperty('--tx', (c.sale[0] * 2) + 'px');
          st.setProperty('--ty', (c.sale[1] * 2) + 'px');
          st.setProperty('--dx', ((azar(c.k, c.j, 4) - 0.5) * 1.2).toFixed(1) + 'px');
          st.setProperty('--dy', ((azar(c.k, c.j, 5) - 0.5) * 1.2).toFixed(1) + 'px');
          st.setProperty('--dr', ((azar(c.k, c.j, 6) - 0.5) * 2).toFixed(1) + 'deg');
          st.setProperty('--dur', (4 + 3 * azar(c.k, c.j, 7)).toFixed(1) + 's');
        }
        st.setProperty('--del', (-10 * azar(c.k, c.j, 8)).toFixed(1) + 's');
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
