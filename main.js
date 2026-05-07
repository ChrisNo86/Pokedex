import {
  fetchPokemonList,
  fetchPokemonDetails
} from './js/api.js';

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


document.addEventListener('DOMContentLoaded', async () => {
  initializeApplication();
});


async function initializeApplication() {
  renderTypeFilter(changeSelectedType);
  registerGlobalFunctions();

  await loadPokemonList();
}


async function loadPokemonList() {
  if (appState.isLoading) return;

  setLoadingState(true);

  const pokemonList = await fetchPokemonList(
    appState.limit,
    appState.offset
  );

  const pokemonData = await fetchPokemonBatch(
    pokemonList.results
  );

  appendPokemonToList(pokemonData);

  appState.offset += appState.limit;

  setLoadingState(false);
}


async function fetchPokemonBatch(results) {
  const pokemonRequests = results.map(
    pokemon => fetchPokemonDetails(pokemon.url)
  );

  return await Promise.all(pokemonRequests);
}


function appendPokemonToList(pokemonArray) {
  appState.allPokemon.push(...pokemonArray);

  renderPokemonList(pokemonArray, true);
}


function renderPokemonList(pokemonArray, append = false) {
  const container = document.getElementById('list');

  if (!append) {
    container.innerHTML = '';
  }

  container.innerHTML += pokemonArray
    .map(pokemon => renderPokemonCard(pokemon))
    .join('');
}


function renderFilteredPokemonList() {
  const filteredPokemon = getFilteredPokemon();

  renderPokemonList(filteredPokemon);
}


function changeSelectedType(type) {
  appState.selectedType = type;

  renderFilteredPokemonList();
  renderTypeFilter(changeSelectedType);
}


const handleSearchInput = debounce(searchValue => {
  appState.searchTerm = searchValue.toLowerCase();

  renderFilteredPokemonList();
}, 300);


function registerGlobalFunctions() {
  window.openOverlay = pokemonId => {
    openPokemonOverlay(
      pokemonId,
      appState.allPokemon
    );
  };

  window.closeOverlay = () => {
    closePokemonOverlay();
  };

  window.switchTab = async tab => {
    await switchOverlayTab(
      tab,
      appState.allPokemon
    );
  };

  window.toggleFilterMenu = () => {
    toggleFilterMenu();
  };

  window.onSearchInput = input => {
    handleSearchInput(input.value);
  };

  window.loadMore = async () => {
    await loadMorePokemon();
  };

  window.nextPokemon = async () => {
    await changePokemon(1);
  };

  window.prevPokemon = async () => {
    await changePokemon(-1);
  };

  window.openFromEvolution = async pokemonId => {
    const index = appState.allPokemon.findIndex(
      pokemon => pokemon.id === pokemonId
    );

    if (index === -1) return;

    appState.currentIndex = index;

    await showPokemonOverlay(appState.allPokemon);
  };
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


async function loadMorePokemon() {
  if (appState.isLoading) return;

  const button = document.getElementById('load-more');
  const loader = document.getElementById('loader-text');

  button.disabled = true;
  loader.style.display = 'block';

  await delay(1000);

  await loadPokemonList();

  loader.style.display = 'none';
  button.disabled = false;
}


function debounce(callback, delayMilliseconds) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delayMilliseconds);
  };
}
