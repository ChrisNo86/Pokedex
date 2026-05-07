import { pokemonTypes, getTypeIcon } from '/js/utils.js';
import { appState } from '/js/state.js';

export function renderTypeFilter(onTypeChange) {
  const container = document.getElementById('type-filter');

  container.innerHTML = pokemonTypes.map(type => `
    <button
      class="type-btn ${type === appState.selectedType ? 'active' : ''}"
      data-type="${type}"
      title="${type}"
    >
      ${type === 'all'
        ? '🌐'
        : `<img src="${getTypeIcon(type)}" alt="${type}">`}
    </button>
  `).join('');

  container.querySelectorAll('[data-type]').forEach(button => {
    button.addEventListener('click', () => {
      onTypeChange(button.dataset.type);
    });
  });
}

export function matchesSearch(pokemon) {
  return pokemon.name
    .toLowerCase()
    .includes(appState.searchTerm);
}

export function matchesType(pokemon) {
  return appState.selectedType === 'all' ||
    pokemon.types.some(type => (
      type.type.name === appState.selectedType
    ));
}

export function getFilteredPokemon() {
  return appState.allPokemon.filter(
    pokemon => matchesSearch(pokemon) && matchesType(pokemon)
  );
}

export function toggleFilterMenu() {
  const filterContainer = document.getElementById('type-filter');
  filterContainer.classList.toggle('show');
}
