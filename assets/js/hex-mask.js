/*
  Silueta hexagonal de las fotos de piel.
  Recorta cada foto (pseudo-elemento ::before/::after con la malla hex.svg) siguiendo la misma
  rejilla de hexágonos, y en el borde algunos hexágonos se van desprendiendo.
  Sin JavaScript, la foto se ve como un rectángulo normal.
*/
(function () {
  var R = 16, COL = 24, ROW = 27.713, HALF = 13.856;

  // Pseudoaleatorio fijo por casilla: el dibujo es siempre el mismo.
  function azar(i, j) {
    var x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function hexagono(cx, cy) {
    return 'M' + (cx - R) + ' ' + cy + 'L' + (cx - 8) + ' ' + (cy - HALF) + 'H' + (cx + 8) +
      'L' + (cx + R) + ' ' + cy + 'L' + (cx + 8) + ' ' + (cy + HALF) + 'H' + (cx - 8) + 'Z';
  }

  function silueta(el) {
    var pseudo = el.getAttribute('data-hex-pseudo');
    var cs = getComputedStyle(el, pseudo);
    var w = parseFloat(cs.width), h = parseFloat(cs.height);
    if (!w || !h) return;
    // En móvil la foto ocupa todo el ancho y se deshace por abajo; en ordenador, por los bordes indicados.
    var movil = w >= el.clientWidth - 1;
    var bordes = movil ? ['abajo'] : el.getAttribute('data-hex').split(' ');
    var banda = movil ? 90 : 140;
    var d = '';
    for (var k = 0; k * COL <= w + R; k++) {
      var cx = R + k * COL;
      for (var j = -1; j * ROW <= h + ROW; j++) {
        var cy = (k % 2 === 0 ? HALF : 0) + j * ROW;
        // Distancia de la casilla al borde (positiva = dentro de la foto).
        var prof = Infinity;
        if (bordes.indexOf('izquierda') > -1) prof = Math.min(prof, cx - banda);
        if (bordes.indexOf('abajo') > -1) prof = Math.min(prof, h - banda * 0.7 - cy);
        var p = prof >= 30 ? 1 : prof <= -banda ? 0 : Math.pow((prof + banda) / (banda + 30), 1.8);
        if (azar(k, j) < p) d += hexagono(cx, +cy.toFixed(3));
      }
    }
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h +
      "' viewBox='0 0 " + w + ' ' + h + "'><path d='" + d + "'/></svg>";
    el.style.setProperty('--hex-mask', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
  }

  function todo() {
    var els = document.querySelectorAll('[data-hex]');
    for (var i = 0; i < els.length; i++) silueta(els[i]);
  }

  todo();
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { todo(); });
    document.querySelectorAll('[data-hex]').forEach(function (el) { ro.observe(el); });
  } else {
    window.addEventListener('resize', todo);
  }
})();
