# urechderma.com

Web personal de la Dra. Marta Urech, publicada con GitHub Pages en https://www.urechderma.com.

El dominio está en GoDaddy: el registro CNAME `www` apunta a `urechderma.github.io` y `urechderma.com` (sin www) se reenvía a `https://www.urechderma.com`. Los registros MX y TXT son del correo de Google Workspace: no tocarlos.

## Cómo está organizada

- `_config.yml`: datos comunes (teléfono, correos, dirección, enlace de citas y menú). Si cambia el teléfono, se cambia aquí y se actualiza en toda la web.
- `index.html`, `sobre-mi.html`, `dermatologia.html`, `asesoria.html`, `donde-encontrarme.html`, `contacto.html`: una página cada uno.
- `aviso-legal.html`, `politica-de-privacidad.html`, `politica-de-cookies.html`: textos legales.
- `_layouts/default.html`: estructura común de todas las páginas.
- `_includes/`: cabecera, pie y bloque de "Pedir cita".
- `assets/css/main.css`: diseño (colores, tipografías, maquetación).
- `assets/img/`: fotos. `assets/fonts/`: tipografías Fraunces y Montserrat (licencia SIL Open Font License).

## Cómo hacer un cambio

1. Abre el archivo de la página en GitHub y pulsa el icono del lápiz.
2. Cambia el texto que haya entre las etiquetas (por ejemplo, entre `<p>` y `</p>`).
3. Pulsa "Commit changes". En uno o dos minutos la web se actualiza sola.

## Probar en local

```bash
gem install jekyll jekyll-sitemap jekyll-feed
jekyll serve
```

Y abre http://localhost:4000/.
