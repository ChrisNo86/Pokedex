import {
  fetchPokemonList,
  fetchPokemonDetails,
  fetchEvolutionChain,
  extractEvolutionChainDetailed
} from './api.js';

import {
  renderPokemonCard,
  renderOverlay,
  renderStats,
  renderInfo,
  renderEvolution,
  renderMoves,
  renderAbout
} from './templates.js';

import {
  getTypeIcon,
  pokemonTypes
} from './utils.js';


/* ================= STATE ================= */

let offset = 0;
const limit = 30;

let allPokemon = [];
let currentIndex = 0;

let isLoading = false;
let searchTerm = "";
let selectedType = "all";
let activeTab = "stats";


/* ================= INIT ================= */

window.onload = () => {
  renderTypeFilter();
  loadPokemon();
};

/* ================= LOAD ================= */

async function loadPokemon() {
  if (isLoading) return;

  setLoading(true);

  const list = await fetchPokemonList(limit, offset);
  const pokemonData = await fetchPokemonBatch(list.results);

  appendPokemon(pokemonData);

  offset += limit;
  setLoading(false);
}

function renderTypeFilter() {
  const container = document.getElementById("type-filter");

  container.innerHTML = pokemonTypes.map(type => `
    <button
      class="type-btn ${type === selectedType ? "active" : ""}"
      onclick="onTypeChange('${type}')"
      title="${type}"
    >
      ${type === "all"
        ? "🌐"
        : `<img src="${getTypeIcon(type)}" alt="${type}">`}
    </button>
  `).join("");
}

async function fetchPokemonBatch(results) {
  const promises = results.map(p => fetchPokemonDetails(p.url));
  return await Promise.all(promises);
}


function appendPokemon(pokemonArray) {
  allPokemon.push(...pokemonArray);
  renderPokemonList(pokemonArray, true);
}

async function loadEvolutionPokemon(evoList) {
  const fullData = [];

  for (let p of evoList) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
    const data = await res.json();
    fullData.push(data);
  }

  return fullData;
}


/* ================= RENDER ================= */

function renderPokemonList(pokemonArray, append = false) {
  const container = document.getElementById("list");

  if (!append) container.innerHTML = "";

  container.innerHTML += pokemonArray
    .map(p => renderPokemonCard(p))
    .join("");
}


function renderFilteredList() {
  const filtered = getFilteredPokemon();
  renderPokemonList(filtered, false);
}


/* ================= FILTER ================= */

function getFilteredPokemon() {
  return allPokemon.filter(matchesSearch && matchesType);
}


function matchesSearch(pokemon) {
  return pokemon.name.toLowerCase().includes(searchTerm);
}


function matchesType(pokemon) {
  return selectedType === "all" ||
    pokemon.types.some(t => t.type.name === selectedType);
}

window.toggleFilterMenu = () => {
  const filter = document.getElementById("type-filter");

  filter.classList.toggle("show");
};

/* ================= SEARCH ================= */

const handleSearch = debounce(value => {
  searchTerm = value.toLowerCase();
  renderFilteredList();
}, 300);


window.onSearchInput = input => handleSearch(input.value);


window.onTypeChange = type => {
  selectedType = type;
  renderFilteredList();
  renderTypeFilter();
};


/* ================= OVERLAY ================= */

window.openOverlay = id => {
  currentIndex = findPokemonIndex(id);
  showOverlay();
};


function findPokemonIndex(id) {
  return allPokemon.findIndex(p => p.id === id);
}


function showOverlay() {
  const pokemon = getCurrentPokemon();

  renderOverlayUI(pokemon);
  switchTab("about");
}


function getCurrentPokemon() {
  return allPokemon[currentIndex];
}


async function renderOverlayUI(pokemon) {
  const overlay = document.getElementById("overlay");

  overlay.innerHTML = renderOverlay(pokemon);

  overlay.classList.add("show");

  document.body.style.overflow = "hidden";

  await switchTab("about");

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });
}


window.closeOverlay = () => {
  document.getElementById("overlay").classList.remove("show");
  document.body.style.overflow = "auto";
};


/* ================= TABS ================= */

window.switchTab = async (tab) => {
  const pokemon = getCurrentPokemon();
  const content = document.getElementById("tab-content");
  
  
  setActiveTabUI(tab);

 if (tab === "about") {
  const speciesData = await fetchSpeciesData(pokemon);

  content.innerHTML = renderAbout(
    pokemon,
    speciesData
  );
}

  if (tab === "stats") {
    content.innerHTML = renderStats(pokemon);
  }

  if (tab === "evo") {
    content.innerHTML = await loadEvolutionUI(pokemon);
  }

  if (tab === "moves") {
    content.innerHTML = renderMoves(pokemon);
  }
};

function setActiveTabUI(tab) {
  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.classList.remove("active");

    if (btn.textContent.toLowerCase().includes(tab)) {
      btn.classList.add("active");
    }
  });
}

async function fetchSpeciesData(pokemon) {
  const response = await fetch(pokemon.species.url);
  return await response.json();
}

/* ================= EVOLUTION ================= */

async function loadEvolutionUI(pokemon) {
  if (!pokemon?.species?.url) {
    return "No evolution data";
  }

  const evoData = await fetchEvolutionChain(pokemon.species.url);

  const chain = extractEvolutionChainDetailed(evoData.chain);

const fullPokemonData = await Promise.all(
  chain.map(async evo => {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${evo.name}`
    );

    return await response.json();
  })
);

  return renderEvolution(fullPokemonData);
}


/* ================= NAVIGATION ================= */

window.nextPokemon = () => changePokemon(1);
window.prevPokemon = () => changePokemon(-1);


function changePokemon(direction) {
  currentIndex += direction;

  if (currentIndex < 0) currentIndex = allPokemon.length - 1;
  if (currentIndex >= allPokemon.length) currentIndex = 0;

  showOverlay();
}


/* ================= LOADING ================= */

function setLoading(state) {
  isLoading = state;
  toggleLoader(state);
}


function toggleLoader(show) {
  const loader = document.getElementById("loader-text");

  if (!loader) return;

  loader.style.display = show
    ? "block"
    : "none";
}


window.loadMore = async () => {
  if (isLoading) return;

  const button = document.getElementById("load-more");
  const loader = document.getElementById("loader-text");

  button.disabled = true;
  loader.style.display = "block";

  await delay(2000);

  await loadPokemon();

  loader.style.display = "none";
  button.disabled = false;
};
/* ================= UTILS ================= */

function debounce(fn, delay) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.openFromEvolution = (id) => {
  const index = allPokemon.findIndex(p => p.id === id);
  if (index === -1) return;

  currentIndex = index;

  const pokemon = getCurrentPokemon();
  renderOverlayUI(pokemon);
  switchTab("about");

  showOverlay();
};