# Web Lectura

Sitio estatico y liviano para publicar relatos en GitHub Pages.

## Como agregar relatos

Crea un archivo `.json` dentro de la carpeta de su categoria:

- `relatos/ultratumba/`
- `relatos/chismes/`

Ejemplo:

```js
{
  id: "titulo-unico-del-relato",
  categoria: "ultratumba",
  titulo: "Titulo del relato",
  fecha: "2026-05-15",
  resumen: "Resumen breve para la tarjeta.",
  contenido: [
    "Primer parrafo del relato.",
    "Segundo parrafo del relato."
  ]
}
```

Luego abre `relatos/relatos.json` y agrega la ruta del nuevo archivo:

```json
[
  "relatos/ultratumba/la-casa-del-final.json",
  "relatos/chismes/el-audio-borrado.json",
  "relatos/ultratumba/nuevo-relato.json"
]
```

Categorias disponibles:

- `ultratumba`
- `chismes`

Importante: para ver la pagina en tu computador con los relatos externos, abre la web usando un servidor local o GitHub Pages. En GitHub Pages funcionara directo.

## Google Ads

Cuando Google AdSense entregue el codigo, reemplaza el bloque `.ad-slot` en `index.html` por el bloque oficial de anuncio. Tambien puedes pegar el script de AdSense en el `<head>`.

## GitHub Pages

Sube estos archivos a un repositorio de GitHub y activa Pages desde `Settings > Pages`. Como no usa frameworks ni compilacion, GitHub puede servirlo directamente.
# weblectura
