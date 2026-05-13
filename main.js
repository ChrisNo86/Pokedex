import {
  fetchPokemonList,
  fetchPokemonById,
  fetchPokemonDetails
} from './js/api.js';

import { renderNoResults }
  from './js/templates.js';

import {
  renderPokemonCard
} from './js/templates.js';

import {
  appState
} from './js/state.js';

import {
  renderTypeFilter,
  getFilteredPokemon,
  toggleFilterMenu
} from './js/filters.js';

import {
  setLoadingState,
  delay
} from './js/loading.js';

import {
  openPokemonOverlay,
  closePokemonOverlay,
  switchOverlayTab,
  showPokemonOverlay
} from './js/overlay.js';

import { createCardData }
  from './js/template-data.js';

document.addEventListener('DOMContentLoaded', async () => {
  initializeApplication();
});


async function initializeApplication() {
  initializeUI();

  await loadPokemonList();

  toggleLoadMoreButton(true);
}

function initializeUI() {
  renderTypeFilter(changeSelectedType);

  registerGlobalFunctions();
  initializeKeyboardShortcuts();
  initializeCardEvents();

  toggleLoadMoreButton(false);
}


async function loadPokemonList() {
  if (appState.isLoading) return;

  appState.isLoading = true;

  const initialLoad = isInitialLoad();

  toggleLoader(initialLoad, true);

  await fetchAndRenderPokemon();

  toggleLoader(initialLoad, false);

  appState.isLoading = false;
}

function getActivePokemonList() {
  return getFilteredPokemon();
}

function isInitialLoad() {
  return appState.allPokemon.length === 0;
}

async function fetchAndRenderPokemon() {
  const pokemonList = await fetchPokemonList(
    appState.limit,
    appState.offset
  );

  const pokemonData = await fetchPokemonBatch(
    pokemonList.results
  );

  updatePokemonState(pokemonData);

  appendPokemonToList(pokemonData);
}

function updatePokemonState(pokemonData) {
  appState.allPokemon.push(...pokemonData);

  appState.offset += appState.limit;
}

function toggleLoader(initialLoad, show) {
  if (initialLoad) return;

  const button = document.getElementById(
    'load-more'
  );

  const loader = document.getElementById(
    'loader-text'
  );

  button.disabled = show;

  button.classList.toggle(
    'loading',
    show
  );

  loader.style.display = show
    ? 'block'
    : 'none';
}

async function fetchPokemonBatch(results) {
  const pokemonRequests = results.map(
    pokemon => fetchPokemonDetails(pokemon.url)
  );

  return await Promise.all(pokemonRequests);
}

function initializeKeyboardShortcuts() {
  window.addEventListener(
    'keydown',
    handleEscapeKey
  );
}

function handleEscapeKey(event) {
  if (event.key !== 'Escape') return;

  if (closeActiveOverlay()) return;

  resetSearch();
}

function closeActiveOverlay() {
  const overlay =
    document.getElementById('overlay');

  const isOpen =
    overlay?.classList.contains('show');

  if (!isOpen) return false;

  closePokemonOverlay();

  return true;
}

function resetSearch() {
  const searchInput =
    document.getElementById('search');

  const hasValue =
    searchInput?.value.trim() !== '';

  if (!hasValue) return;

  searchInput.value = '';

  appState.searchTerm = '';

  renderFilteredPokemonList();

  showNoResults(false);

  toggleLoadMoreButton(true);
}

function appendPokemonToList(
  pokemonArray
) {

  renderPokemonList(
    pokemonArray,
    true
  );
}


function renderPokemonList(
  pokemonArray,
  append = false
) {
  const container =
    document.getElementById('list');

  if (!append) {
    container.innerHTML = '';
  }

  const html = pokemonArray
    .map(createCardData)
    .map(renderPokemonCard)
    .join('');

  container.innerHTML += html;
}

function toggleLoadMoreButton(show) {
  const buttonContainer = document.getElementById('load-more-container');

  if (!buttonContainer) return;

  buttonContainer.style.display = show
    ? 'flex'
    : 'none';
}


function showNoResults(show) {
  const noResults = document.getElementById('no-results');

  if (!noResults) return;

  noResults.style.display = show
    ? 'block'
    : 'none';
}

function renderFilteredPokemonList() {
  const filteredPokemon =
    getFilteredPokemon();

  const hasResults =
    filteredPokemon.length > 0;

  const isSearching =
    appState.searchTerm !== '';

  const hasFilter =
    appState.selectedType !== 'all';

  showNoResults(
    !hasResults &&
    (isSearching || hasFilter)
  );

  toggleLoadMoreButton(
    !isSearching &&
    !hasFilter
  );

  renderPokemonList(filteredPokemon);
}


function changeSelectedType(type) {
  appState.selectedType = type;

  renderFilteredPokemonList();
  renderTypeFilter(changeSelectedType);
}


const handleSearchInput = debounce(searchValue => {
  const value =
    searchValue.toLowerCase().trim();

  if (value.length < 3) {
    appState.searchTerm = '';

    renderFilteredPokemonList();
    return;
  }

  appState.searchTerm = value;

  renderFilteredPokemonList();
}, 300);


function registerGlobalFunctions() {
  registerOverlayFunctions();

  registerNavigationFunctions();

  registerSearchFunctions();
}

function registerOverlayFunctions() {
  window.openOverlay = pokemonId => {
  openOverlay(
    pokemonId,
    getActivePokemonList()
  );
};

  window.closeOverlay = closePokemonOverlay;

  window.switchTab = switchOverlay;

  window.openFromEvolution =
    openEvolutionPokemon;
}

function registerNavigationFunctions() {
  window.loadMore = loadMorePokemon;

  window.nextPokemon = () =>
    changePokemon(1);

  window.prevPokemon = () =>
    changePokemon(-1);
}

function registerSearchFunctions() {
  window.toggleFilterMenu =
    toggleFilterMenu;

  window.onSearchInput = input =>
    handleSearchInput(input.value);
}

async function changePokemon(direction) {
  appState.currentIndex += direction;

  if (appState.currentIndex < 0) {
    appState.currentIndex =
      appState.allPokemon.length - 1;
  }

  if (
    appState.currentIndex >=
    appState.allPokemon.length
  ) {
    appState.currentIndex = 0;
  }

  await showPokemonOverlay(appState.allPokemon);
}

function openOverlay(
  pokemonId,
  pokemonList
) {
  openPokemonOverlay(
    pokemonId,
    pokemonList
  );
}

async function switchOverlay(tab) {
  await switchOverlayTab(
    tab,
    appState.allPokemon
  );
}

async function openEvolutionPokemon(
  item,
  allPokemon
) {

  const id =
    Number(item.dataset.evo);

  let pokemon =
    findPokemonById(id);

  if (!pokemon) {
    pokemon =
      await fetchPokemonById(id);

    appState.allPokemon.push(
      pokemon
    );
  }

  openPokemonOverlay(
    id,
    appState.allPokemon
  );
}

function findPokemonById(id) {
  return appState.allPokemon.find(
    pokemon => pokemon.id === id
  );
}

function findPokemonIndex(pokemonId) {
  return appState.allPokemon.findIndex(
    pokemon => pokemon.id === pokemonId
  );
}

async function loadMorePokemon() {
  toggleLoadButton(true);

  await delay(2000);

  await loadPokemonList();

  toggleLoadButton(false);
}

function toggleLoadButton(isLoading) {
  const button = document.getElementById('load-more');
  const loader = document.getElementById('loader-text');
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
  loader.style.display = isLoading ? 'block' : 'none';
}

function initializeCardEvents() {
  const list = document.getElementById('list');

  list.addEventListener('click', event => {
    const card = event.target.closest('.card');

    if (!card) return;

    const id = Number(card.dataset.id);

    openPokemonOverlay(
      id,
      appState.allPokemon
    );
  });
}

function debounce(
  callback,
  delayMilliseconds
) {

  let timeoutId;

  return (...args) => {

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {

      callback(...args);

    }, delayMilliseconds);

  };
}