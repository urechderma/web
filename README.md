# urechderma.com

Web personal de la Dra. Marta Urech, publicada con GitHub Pages en https://www.urechderma.com.

El dominio está en GoDaddy: el registro CNAME `www` apunta a `urechderma.github.io` y `urechderma.com` (sin www) se reenvía a `https://www.urechderma.com`. Los registros MX y TXT son del correo de Google Workspace: no tocarlos.

## Cómo está organizada

La web está en cuatro idiomas: español (raíz), inglés (`/en/`), francés (`/fr/`) e italiano (`/it/`).

- `_data/paginas/`: **los textos de cada página**, un archivo por página con los 4 idiomas uno debajo de otro (`es`, `en`, `fr`, `it`). Para cambiar un texto, se cambia aquí en cada idioma.
- `_data/i18n.yml`: textos comunes (menú, botones, pie, bloque de cita) en los 4 idiomas.
- `_data/publicaciones.yml`: lista de publicaciones.
- `_config.yml`: teléfono, correos, dirección y enlace de citas. Se cambian aquí y se actualizan en toda la web.
- `_includes/paginas/`: la estructura (maquetación) de cada página, común a los 4 idiomas.
- `index.html`, `sobre-mi.html`… y las carpetas `en/`, `fr/`, `it/`: solo indican la dirección de cada página y qué plantilla usa.
- `_includes/`: cabecera con banderas, pie y bloque de "Pedir cita". `assets/css/main.css`: diseño.
- `assets/img/`: fotos. `assets/fonts/`: tipografías Fraunces y Montserrat (licencia SIL Open Font License).

## Cómo hacer un cambio

1. Abre en GitHub el archivo de `_data/paginas/` de la página y pulsa el icono del lápiz.
2. Cambia el texto en los idiomas que toque. Si una línea contiene dos puntos seguidos de espacio (`: `), el texto debe ir entre comillas.
3. Pulsa "Commit changes". En uno o dos minutos la web se actualiza sola.

## Probar en local

```bash
gem install jekyll jekyll-sitemap jekyll-feed
jekyll serve
```

Y abre http://localhost:4000/.
