
import { fetchPokemonList, fetchPokemonDetails, fetchEvolutionChain, extractEvolutionChain, extractEvolutionChainDetailed} from './api.js';
import { 
  renderPokemonCard, 
  renderOverlay,
  renderStats,
  renderInfo,
  renderEvolution
} from './templates.js';

let offset = 0;
const limit = 30;
let currentIndex = 0;
let allPokemon = [];
let isLoading = false;
let searchTerm = "";
let selectedType = "all";
let activeTab = "stats";

async function loadPokemon() {
  if (isLoading) return;

  isLoading = true;
  toggleLoading(true);

  const list = await fetchPokemonList(limit, offset);

  const promises = list.results.map(p => fetchPokemonDetails(p.url));
  const data = await Promise.all(promises);

  allPokemon.push(...data);
  renderList(data);

  offset += limit;
  isLoading = false;
  toggleLoading(false);
}

const handleSearch = debounce((value) => {
  searchTerm = value.toLowerCase();
  renderFilteredList();
}, 300);

window.onSearchInput = function (input) {
  handleSearch(input.value);
};

window.onTypeChange = function (type) {
  selectedType = type;
  renderFilteredList();
};


function getFilteredPokemon() {
  return allPokemon.filter(pokemon => {
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(searchTerm);

    const matchesType =
      selectedType === "all" ||
      pokemon.types.some(t => t.type.name === selectedType);

    return matchesSearch && matchesType;
  });
}

function renderFilteredList() {
  const container = document.getElementById("list");
  const filtered = getFilteredPokemon();

  container.innerHTML = filtered
    .map(p => renderPokemonCard(p))
    .join("");
}

function debounce(fn, delay) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function renderList(pokemonArray) {
  const container = document.getElementById('list');

  pokemonArray.forEach(p => {
    container.innerHTML += renderPokemonCard(p);
  });
}

function toggleLoading(state) {
  document.getElementById('loader').classList.toggle('active', state);
}

window.openOverlay = function(id) {
  const index = allPokemon.findIndex(p => p.id === id);

  if (index !== -1) {
    currentIndex = index;
    showOverlay();
  }
};

window.closeOverlay = function() {
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = 'auto';
};

window.onload = loadPokemon;
window.loadMore = loadPokemon;


window.nextPokemon = function() {
  currentIndex = (currentIndex + 1) % allPokemon.length;
  showOverlay();
};

window.prevPokemon = function() {
  currentIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
  showOverlay();
};

async function loadEvolution(pokemon) {
  const requestId = pokemon.id;

  const evoData = await fetchEvolutionChain(pokemon.species.url);

  // 🔥 verhindert falsche Chains beim schnellen klicken
  if (allPokemon[currentIndex].id !== requestId) return;

  const list = extractEvolutionChainDetailed(evoData.chain);

  const container = document.getElementById("tab-content");
  if (!container) return;

  container.innerHTML = renderEvolution(list);
}

window.switchTab = function(tab) {
  activeTab = tab;

  const pokemon = allPokemon[currentIndex];
  switchTabWithPokemon(tab, pokemon);
  const container = document.getElementById("tab-content");

  if (!container) return;

  if (tab === "evo") {
    container.innerHTML = "Loading...";
    loadEvolution(pokemon); // 🔥 DAS ist die einzige Quelle
  }
};

window.showOverlay = function() {
  const pokemon = allPokemon[currentIndex];
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = renderOverlay(pokemon);
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  activeTab = "stats";

  switchTabWithPokemon(activeTab, pokemon);
};

window.openFromEvolution = function(id) {
  const index = allPokemon.findIndex(p => p.id === id);

  if (index !== -1) {
    currentIndex = index;
    showOverlay();
  }
};

function updateActiveTab(active) {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.tab === active
    );
  });
}

function switchTabWithPokemon(tab, pokemon) {
  const container = document.getElementById("tab-content");

  if (!container) return;

  if (tab === "stats") {
    container.innerHTML = renderStats(pokemon);
  }

  if (tab === "info") {
    container.innerHTML = renderInfo(pokemon);
  }

  if (tab === "evo") {
    container.innerHTML = "Loading evolution...";
    loadEvolution(pokemon);
  }

  updateActiveTab(tab);
}

window.loadMore = async function() {
  const btn = document.getElementById("load-more");

  btn.classList.add("loading");
  btn.disabled = true;

  await loadPokemon();

  btn.classList.remove("loading");
  btn.disabled = false;
};