let relatos = [];
let activeFilter = "todos";

// Traduce las categorias internas de los JSON a etiquetas legibles para la interfaz.
const categoryLabels = {
  ultratumba: "Ultratumba",
  chismes: "Chismes"
};

// Configura el tema inicial usando la preferencia guardada o el modo del sistema.
const root = document.documentElement;
const pageBody = document.body;
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");

// Guarda referencias a los elementos del DOM que se actualizan desde JavaScript.
const storyList = document.querySelector("#storyList");
const reader = document.querySelector("#lector");
const readerCategory = document.querySelector("#readerCategory");
const readerTitle = document.querySelector("#readerTitle");
const readerDate = document.querySelector("#readerDate");
const readerBody = document.querySelector("#readerBody");
const contentBand = document.querySelector(".content-band");
const filterButtons = document.querySelectorAll(".filter-button");
const sectionLinks = document.querySelectorAll("[data-section-link]");

document.querySelector("#year").textContent = new Date().getFullYear();

// Cambia entre tema claro y oscuro, y guarda la eleccion para futuras visitas.
document.querySelector("#themeToggle").addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
});

/**
 * Convierte una fecha en formato YYYY-MM-DD a una fecha larga en espanol de Chile.
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

/**
 * Acorta un texto largo para mostrarlo como resumen dentro de las tarjetas.
 */
function getExcerpt(text) {
  return text.length > 132 ? `${text.slice(0, 132).trim()}...` : text;
}

/**
 * Controla el fondo visual global segun la categoria activa.
 * Chismes usa una imagen distinta tanto en listado como en modo lectura.
 */
function setPageBackground({ filter = activeFilter, readerOpen = false } = {}) {
  pageBody.classList.toggle("is-chismes-list", filter === "chismes");
  pageBody.classList.toggle("is-chismes-theme", filter === "chismes");
  pageBody.classList.toggle("is-reader-open", readerOpen);
}

/**
 * Carga el indice de relatos, descarga cada archivo JSON, ordena los relatos por fecha
 * y luego pinta el destacado y la grilla principal. Si algo falla, muestra un error.
 */
async function loadStories() {
  try {
    const response = await fetch("relatos/relatos.json");
    if (!response.ok) throw new Error("No se pudo cargar el indice de relatos.");

    const storyFiles = await response.json();
    const storyRequests = storyFiles.map(async (file) => {
      const storyResponse = await fetch(file);
      if (!storyResponse.ok) throw new Error(`No se pudo cargar ${file}.`);
      return storyResponse.json();
    });

    relatos = await Promise.all(storyRequests);
    relatos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    renderStories();
  } catch (error) {
    storyList.innerHTML = `
      <p class="load-error">
        No se pudieron cargar los relatos. Revisa que los archivos JSON existan y que la pagina se abra desde un servidor o GitHub Pages.
        ${error.message}
      </p>
    `;
  }
}

/**
 * Renderiza las tarjetas de relatos. Puede mostrar todos o solo los de una categoria.
 */
function renderStories(filter = "todos") {
  activeFilter = filter;
  setPageBackground({ filter: activeFilter, readerOpen: false });

  const visibleStories = filter === "todos"
    ? relatos
    : relatos.filter((relato) => relato.categoria === filter);

  storyList.innerHTML = visibleStories.map((relato) => `
    <article class="story-card">
      <div>
        <p class="story-category">${categoryLabels[relato.categoria]}</p>
        <h3>${relato.titulo}</h3>
      </div>
      <p>${getExcerpt(relato.resumen)}</p>
      <p class="story-date">${formatDate(relato.fecha)}</p>
      <button type="button" data-story-id="${relato.id}">Leer relato</button>
    </article>
  `).join("");
}

/**
 * Abre el lector con el relato seleccionado, rellena su informacion y oculta la grilla.
 */
function openStory(storyId) {
  const story = relatos.find((relato) => relato.id === storyId);
  if (!story) return;

  readerCategory.textContent = categoryLabels[story.categoria];
  readerTitle.textContent = story.titulo;
  readerDate.textContent = formatDate(story.fecha);
  readerBody.innerHTML = story.contenido.map((paragraph) => `<p>${paragraph}</p>`).join("");

  contentBand.hidden = true;
  reader.hidden = false;
  setPageBackground({ filter: story.categoria, readerOpen: true });
  reader.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Cierra el lector, vuelve a mostrar la lista de relatos y desplaza la pagina a la biblioteca.
 */
function closeReader() {
  reader.hidden = true;
  contentBand.hidden = false;
  setPageBackground({ filter: activeFilter, readerOpen: false });
  document.querySelector("#relatos").scrollIntoView({ behavior: "smooth", block: "start" });
}

// Detecta clicks en los botones de cada tarjeta y abre el relato correspondiente.
storyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-story-id]");
  if (button) openStory(button.dataset.storyId);
});

// Conecta el boton de volver con la funcion que cierra el lector.
document.querySelector("#backToList").addEventListener("click", closeReader);

// Activa los filtros de categoria y vuelve a pintar la lista segun el filtro elegido.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    closeReader();
    renderStories(button.dataset.filter);
  });
});

// Sincroniza los enlaces del menu superior con los filtros de la biblioteca.
sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    sectionLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
    const section = link.dataset.sectionLink;
    if (section === "inicio") {
      setPageBackground({ filter: "todos", readerOpen: false });
    }
    if (section === "ultratumba" || section === "chismes") {
      event.preventDefault();
      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.filter === section);
      });
      closeReader();
      renderStories(section);
    }
  });
});

// Inicia la aplicacion cargando los relatos desde los archivos JSON.
loadStories();
