# Creepy Confessions

Sitio estatico y liviano para publicar relatos y confesiones inquietantes en GitHub Pages.

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

## Your Story pausado

La opcion `Your Story` queda guardada en el codigo, pero por ahora no es visible ni utilizable para usuarios. Se retomara cuando exista una web con backend seguro.

El formulario esta pensado para recibir tres datos:

- Categoria
- Titulo
- Historia

Como el sitio es estatico, el navegador no puede enviar correos privados ni escribir archivos directamente dentro del repositorio de GitHub sin exponer credenciales o crear riesgos de seguridad. Para activar esta funcion correctamente, hay que agregar un backend o un flujo seguro que reciba la historia, la envie a revision y luego cree el JSON en GitHub.

## Idiomas

El boton `ES / EN` del nav cambia el idioma de los textos propios de la interfaz: navegacion, portada, filtros, formulario, botones y mensajes. Los relatos se mantienen en el idioma original por ahora; la traduccion del contenido de cada relato queda preparada como una mejora futura.

## Rutas compartibles

El sitio usa rutas con `#` para funcionar bien en GitHub Pages sin backend:

- Categoria: `#categoria/ultratumba` o `#categoria/chismes`
- Relato completo: `#relato/id-del-relato`
- Parte especifica de un relato: `#relato/id-del-relato/p/12`

Al abrir un relato, cada parrafo recibe un numero. Si tocas un parrafo mientras lees, la URL se actualiza a ese punto exacto para poder copiarla y compartirla, por ejemplo desde Facebook.

## Google Ads

El sitio no incluye un espacio publicitario manual visible. Para usar anuncios automaticos, pega el script de Google AdSense en el `<head>` y deja que Google decida las ubicaciones.

## GitHub Pages

Sube estos archivos a un repositorio de GitHub y activa Pages desde `Settings > Pages`. Como no usa frameworks ni compilacion, GitHub puede servirlo directamente.
# weblectura
