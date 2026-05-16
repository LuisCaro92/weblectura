let relatos = [];
let activeFilter = "todos";
let currentStoryId = null;
let currentLanguage = localStorage.getItem("language") || "es";
let isRouting = false;
const userStoriesKey = "creepy-confessions-user-stories";

// Diccionario base para traducir solo la interfaz; los relatos se traduciran en una etapa futura.
const translations = {
  es: {
    navHome: "Inicio",
    navUltratumba: "Ultratumba",
    navChismes: "Chismes",
    navYourStory: "Tu historia",
    heroEyebrow: "LECTURAS CORTAS. SECRETOS OSCUROS.",
    heroTitle: "Historias creepy, rumores salvajes y secretos que no deberias leer a solas.",
    heroText: "Un espacio sencillo para descubrir confesiones, rumores y relatos inquietantes, organizado por secciones y pensado para cargar rapido en cualquier dispositivo.",
    adSlot: "Espacio para Google Ads",
    libraryEyebrow: "Biblioteca",
    libraryTitle: "Ultimos relatos",
    filterAll: "Todos",
    filterUltratumba: "Ultratumba",
    filterChismes: "Chismes",
    submitEyebrow: "Envia una confesion",
    submitTitle: "Tu historia",
    formCategory: "Categoria",
    formTitle: "Titulo",
    formStory: "Historia",
    optionUltratumba: "Ultratumba",
    optionChismes: "Chisme",
    titlePlaceholder: "Escribe el titulo",
    storyPlaceholder: "Pega o escribe la historia completa",
    createHistory: "Crear historia",
    backToStories: "Volver a relatos",
    footerRights: "Todos los derechos reservados.",
    readStory: "Leer relato",
    loadError: "No se pudieron cargar los relatos. Revisa que los archivos JSON existan y que la pagina se abra desde un servidor o GitHub Pages.",
    emptyStory: "La historia necesita texto antes de crear el JSON.",
    storySaved: "Historia guardada en este navegador.",
    storySavedHint: "Ya aparece automaticamente en su seccion. Para publicarla para todos los usuarios, hace falta conectar un backend o un flujo seguro hacia GitHub.",
    langButton: "EN"
  },
  en: {
    navHome: "Home",
    navUltratumba: "Afterlife",
    navChismes: "Gossip",
    navYourStory: "Your Story",
    heroEyebrow: "SHORT READS. DARK SECRETS.",
    heroTitle: "Creepy stories, wild rumors, and secrets you shouldn’t read alone.",
    heroText: "A simple place to discover confessions, rumors, and unsettling stories, organized by sections and built to load fast on any device.",
    adSlot: "Google Ads space",
    libraryEyebrow: "Library",
    libraryTitle: "Latest stories",
    filterAll: "All",
    filterUltratumba: "Afterlife",
    filterChismes: "Gossip",
    submitEyebrow: "Submit a confession",
    submitTitle: "Your Story",
    formCategory: "Category",
    formTitle: "Title",
    formStory: "Story",
    optionUltratumba: "Afterlife",
    optionChismes: "Gossip",
    titlePlaceholder: "Write the title",
    storyPlaceholder: "Paste or write the full story",
    createHistory: "Create History",
    backToStories: "Back to stories",
    footerRights: "All rights reserved.",
    readStory: "Read story",
    loadError: "Stories could not be loaded. Check that the JSON files exist and that the page is opened from a server or GitHub Pages.",
    emptyStory: "The story needs text before creating the JSON.",
    storySaved: "Story saved in this browser.",
    storySavedHint: "It now appears automatically in its section. To publish it for every user, the site needs a backend or a secure GitHub workflow.",
    langButton: "ES"
  }
};

if (!translations[currentLanguage]) currentLanguage = "es";

// Guarda una referencia al body para activar estados visuales de lectura, chismes y formulario.
const pageBody = document.body;

// Guarda referencias a los elementos del DOM que se actualizan desde JavaScript.
const storyList = document.querySelector("#storyList");
const reader = document.querySelector("#lector");
const readerCategory = document.querySelector("#readerCategory");
const readerTitle = document.querySelector("#readerTitle");
const readerDate = document.querySelector("#readerDate");
const readerBody = document.querySelector("#readerBody");
const contentBand = document.querySelector(".content-band");
const submission = document.querySelector("#your-story");
const filterButtons = document.querySelectorAll(".filter-button");
const sectionLinks = document.querySelectorAll("[data-section-link]");
const languageToggle = document.querySelector("#languageToggle");
const storyForm = document.querySelector("#storyForm");
const storyCategory = document.querySelector("#storyCategory");
const storyTitle = document.querySelector("#storyTitle");
const storyContent = document.querySelector("#storyContent");
const submissionResult = document.querySelector("#submissionResult");

document.querySelector("#year").textContent = new Date().getFullYear();

// Mantiene Your Story desactivado hasta tener un backend seguro para recibir relatos.
storyForm.querySelectorAll("input, select, textarea, button").forEach((control) => {
  control.disabled = true;
});

/**
 * Obtiene un texto traducido de la interfaz segun el idioma activo.
 */
function t(key) {
  return translations[currentLanguage][key] || translations.es[key] || key;
}

/**
 * Traduce las categorias internas de los JSON a etiquetas legibles por idioma.
 */
function getCategoryLabel(category) {
  if (category === "chismes") return t("filterChismes");
  if (category === "ultratumba") return t("filterUltratumba");
  return category;
}

/**
 * Aplica el idioma elegido a los textos estaticos de la interfaz y refresca vistas dinamicas.
 */
function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  localStorage.setItem("language", currentLanguage);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  languageToggle.textContent = t("langButton");
  languageToggle.setAttribute("aria-label", currentLanguage === "es" ? "Switch to English" : "Cambiar a español");

  if (!contentBand.hidden) renderStories(activeFilter);
  if (!reader.hidden && currentStoryId) refreshReaderMetadata(currentStoryId);
}

/**
 * Convierte una fecha en formato YYYY-MM-DD a una fecha larga en espanol de Chile.
 */
function formatDate(date) {
  const locale = currentLanguage === "es" ? "es-CL" : "en-US";
  return new Intl.DateTimeFormat(locale, {
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
 * Crea un id seguro para archivos y URLs a partir del titulo ingresado.
 */
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "historia-sin-titulo";
}

/**
 * Divide la historia en parrafos limpios para guardarla en el formato JSON del sitio.
 */
function formatStoryContent(text) {
  return text
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * Lee las historias creadas desde el formulario y guardadas en este navegador.
 */
function loadUserStories() {
  try {
    return JSON.parse(localStorage.getItem(userStoriesKey)) || [];
  } catch {
    return [];
  }
}

/**
 * Guarda una historia creada por el usuario en este navegador.
 */
function saveUserStory(story) {
  const storedStories = loadUserStories().filter((item) => item.id !== story.id);
  localStorage.setItem(userStoriesKey, JSON.stringify([...storedStories, story]));
}

/**
 * Evita id duplicados cuando el usuario crea varias historias con titulos parecidos.
 */
function getUniqueStoryId(baseId) {
  let nextId = baseId;
  let counter = 2;

  while (relatos.some((relato) => relato.id === nextId)) {
    nextId = `${baseId}-${counter}`;
    counter += 1;
  }

  return nextId;
}

/**
 * Genera la ruta hash de una categoria para compartir secciones sin servidor.
 */
function getCategoryRoute(category) {
  if (category === "ultratumba" || category === "chismes") return `#categoria/${category}`;
  return "#relatos";
}

/**
 * Genera la ruta hash de un relato y, opcionalmente, de un parrafo especifico.
 */
function getStoryRoute(storyId, paragraphNumber) {
  return paragraphNumber ? `#relato/${storyId}/p/${paragraphNumber}` : `#relato/${storyId}`;
}

/**
 * Cambia la ruta sin disparar un ciclo duplicado cuando la navegacion ya viene del router.
 */
function updateRoute(route) {
  if (isRouting || window.location.hash === route) return;
  window.location.hash = route;
}

/**
 * Hace scroll a un parrafo concreto del relato abierto cuando la ruta lo solicita.
 */
function scrollToStoryParagraph(paragraphNumber) {
  document.querySelectorAll(".story-paragraph.is-linked").forEach((item) => {
    item.classList.remove("is-linked");
  });
  const paragraph = document.querySelector(`#story-p-${paragraphNumber}`);
  if (paragraph) {
    paragraph.classList.add("is-linked");
    paragraph.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/**
 * Actualiza la URL al parrafo tocado sin reabrir el relato; sirve para copiar enlaces exactos.
 */
function markParagraphRoute(paragraphNumber) {
  if (!currentStoryId) return;
  history.replaceState(null, "", getStoryRoute(currentStoryId, paragraphNumber));
  scrollToStoryParagraph(paragraphNumber);
}

/**
 * Controla el fondo visual global segun la categoria activa.
 * Chismes usa una imagen distinta tanto en listado como en modo lectura.
 */
function setPageBackground({ filter = activeFilter, readerOpen = false } = {}) {
  pageBody.classList.toggle("is-chismes-list", filter === "chismes");
  pageBody.classList.toggle("is-chismes-theme", filter === "chismes");
  pageBody.classList.toggle("is-reader-open", readerOpen);
  pageBody.classList.remove("is-submission-open");
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

    relatos = [...await Promise.all(storyRequests), ...loadUserStories()];
    relatos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    handleRoute();
  } catch (error) {
    storyList.innerHTML = `
      <p class="load-error">
        ${t("loadError")}
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
  submission.hidden = true;
  contentBand.hidden = false;

  const visibleStories = filter === "todos"
    ? relatos
    : relatos.filter((relato) => relato.categoria === filter);

  storyList.innerHTML = visibleStories.map((relato) => `
    <article class="story-card">
      <div>
        <p class="story-category">${getCategoryLabel(relato.categoria)}</p>
        <h3>${relato.titulo}</h3>
      </div>
      <p>${getExcerpt(relato.resumen)}</p>
      <p class="story-date">${formatDate(relato.fecha)}</p>
      <button type="button" data-story-id="${relato.id}">${t("readStory")}</button>
    </article>
  `).join("");
}

/**
 * Abre una categoria desde rutas compartibles y sincroniza los botones activos.
 */
function openCategory(category) {
  filterButtons.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.filter === category);
  });
  reader.hidden = true;
  renderStories(category);
  document.querySelector("#relatos").scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Refresca los metadatos traducibles del lector sin cambiar el texto del relato.
 */
function refreshReaderMetadata(storyId) {
  const story = relatos.find((relato) => relato.id === storyId);
  if (!story) return;

  readerCategory.textContent = getCategoryLabel(story.categoria);
  readerDate.textContent = formatDate(story.fecha);
}

/**
 * Abre el lector con el relato seleccionado, rellena su informacion y oculta la grilla.
 */
function openStory(storyId) {
  const story = relatos.find((relato) => relato.id === storyId);
  if (!story) return;

  currentStoryId = story.id;
  readerCategory.textContent = getCategoryLabel(story.categoria);
  readerTitle.textContent = story.titulo;
  readerDate.textContent = formatDate(story.fecha);
  readerBody.innerHTML = story.contenido.map((paragraph, index) => `
    <p id="story-p-${index + 1}" class="story-paragraph" data-paragraph="${index + 1}">${paragraph}</p>
  `).join("");

  contentBand.hidden = true;
  submission.hidden = true;
  reader.hidden = false;
  setPageBackground({ filter: story.categoria, readerOpen: true });
  updateRoute(getStoryRoute(story.id));
  reader.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Cierra el lector, vuelve a mostrar la lista de relatos y desplaza la pagina a la biblioteca.
 */
function closeReader() {
  currentStoryId = null;
  reader.hidden = true;
  contentBand.hidden = false;
  submission.hidden = true;
  setPageBackground({ filter: activeFilter, readerOpen: false });
  updateRoute(getCategoryRoute(activeFilter));
  document.querySelector("#relatos").scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Abre el formulario de prueba para crear una historia visible en este navegador.
 */
function openSubmissionForm() {
  reader.hidden = true;
  contentBand.hidden = true;
  submission.hidden = false;
  setPageBackground({ filter: "chismes", readerOpen: false });
  pageBody.classList.add("is-submission-open");
  updateRoute("#your-story");
  submission.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Lee la ruta hash actual y abre inicio, categoria, formulario, relato o parrafo especifico.
 */
function handleRoute() {
  const route = window.location.hash.replace(/^#/, "");
  const parts = route.split("/").filter(Boolean);

  isRouting = true;

  if (parts[0] === "relato" && parts[1]) {
    openStory(parts[1]);
    if (parts[2] === "p" && parts[3]) {
      requestAnimationFrame(() => scrollToStoryParagraph(parts[3]));
    }
  } else if (parts[0] === "categoria" && (parts[1] === "ultratumba" || parts[1] === "chismes")) {
    openCategory(parts[1]);
  } else if (route === "your-story") {
    renderStories("todos");
    history.replaceState(null, "", "#inicio");
  } else {
    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.filter === "todos");
    });
    reader.hidden = true;
    submission.hidden = true;
    renderStories("todos");
  }

  isRouting = false;
}

/**
 * Guarda una historia creada desde el formulario y la muestra al instante en su seccion.
 * En GitHub Pages queda guardada en el navegador; publicar para todos requiere backend.
 */
function saveSubmittedStory(event) {
  event.preventDefault();

  const categoria = storyCategory.value;
  const titulo = storyTitle.value.trim();
  const contenido = formatStoryContent(storyContent.value);
  const id = getUniqueStoryId(slugify(titulo));

  if (!contenido.length) {
    submissionResult.hidden = false;
    submissionResult.innerHTML = `<p>${t("emptyStory")}</p>`;
    return;
  }

  const story = {
    id,
    categoria,
    titulo,
    fecha: new Date().toISOString().slice(0, 10),
    resumen: getExcerpt(contenido[0] || titulo),
    contenido,
    localOnly: true
  };

  relatos = [...relatos.filter((relato) => relato.id !== story.id), story];
  relatos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  saveUserStory(story);
  storyForm.reset();
  renderStories(categoria);

  submissionResult.hidden = false;
  submissionResult.innerHTML = `
    <p><strong>${t("storySaved")}</strong></p>
    <p>${t("storySavedHint")}</p>
  `;
}

// Detecta clicks en los botones de cada tarjeta y abre el relato correspondiente.
storyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-story-id]");
  if (button) updateRoute(getStoryRoute(button.dataset.storyId));
});

// Al tocar un parrafo del lector, la URL queda apuntando exactamente a esa parte del relato.
readerBody.addEventListener("click", (event) => {
  const paragraph = event.target.closest("[data-paragraph]");
  if (paragraph) markParagraphRoute(paragraph.dataset.paragraph);
});

// Conecta el boton de volver con la funcion que cierra el lector.
document.querySelector("#backToList").addEventListener("click", closeReader);

// Conecta el formulario de prueba con el guardado automatico en este navegador.
storyForm.addEventListener("submit", saveSubmittedStory);

// Cambia entre espanol e ingles para los textos propios de la interfaz.
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "es" ? "en" : "es";
  applyLanguage();
});

// Activa los filtros de categoria y vuelve a pintar la lista segun el filtro elegido.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentStoryId = null;
    reader.hidden = true;
    updateRoute(getCategoryRoute(button.dataset.filter));
    handleRoute();
  });
});

// Sincroniza los enlaces del menu superior con los filtros de la biblioteca.
sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    sectionLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
    const section = link.dataset.sectionLink;
    if (section === "inicio") {
      reader.hidden = true;
      contentBand.hidden = false;
      submission.hidden = true;
      updateRoute("#inicio");
      setPageBackground({ filter: "todos", readerOpen: false });
    }
    if (section === "your-story") {
      event.preventDefault();
      renderStories("todos");
      updateRoute("#inicio");
    }
    if (section === "ultratumba" || section === "chismes") {
      event.preventDefault();
      updateRoute(getCategoryRoute(section));
      handleRoute();
    }
  });
});

// Permite abrir rutas compartidas manualmente o desde enlaces externos como Facebook.
window.addEventListener("hashchange", handleRoute);

// Inicia la interfaz con el idioma guardado y luego carga los relatos desde los archivos JSON.
applyLanguage();
loadStories();
