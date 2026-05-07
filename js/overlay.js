import {
  renderOverlay,
  renderStats,
  renderMoves,
  renderEvolution,
  renderAbout
} from '/js/templates.js';

import {
  fetchEvolutionChain,
  extractEvolutionChainDetailed,
  fetchPokemonByName
} from '/js/api.js';

import { appState } from '/js/state.js';

export function openPokemonOverlay(pokemonId, allPokemon) {
  appState.currentIndex = allPokemon.findIndex(
    pokemon => pokemon.id === pokemonId
  );

  showPokemonOverlay(allPokemon);
}

export function closePokemonOverlay() {
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = 'auto';
}

export async function showPokemonOverlay(allPokemon) {
  const pokemon = allPokemon[appState.currentIndex];
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = renderOverlay(pokemon);

  overlay.classList.add('show');

  document.body.style.overflow = 'hidden';

  await switchOverlayTab('about', allPokemon);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
}

export async function switchOverlayTab(tab, allPokemon) {
  const pokemon = allPokemon[appState.currentIndex];
  const content = document.getElementById('tab-content');

  updateActiveTabButton(tab);

  if (tab === 'about') {
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();

    content.innerHTML = renderAbout(
      pokemon,
      speciesData
    );
  }

  if (tab === 'stats') {
    content.innerHTML = renderStats(pokemon);
  }

  if (tab === 'moves') {
    content.innerHTML = renderMoves(pokemon);
  }

  if (tab === 'evo') {
    content.innerHTML = await renderEvolutionTab(pokemon);
  }
}

function updateActiveTabButton(tab) {
  document.querySelectorAll('.tabs button').forEach(button => {
    button.classList.remove('active');

    if (button.textContent.toLowerCase().includes(tab)) {
      button.classList.add('active');
    }
  });
}

async function renderEvolutionTab(pokemon) {
  if (!pokemon?.species?.url) {
    return 'No evolution data';
  }

  const evolutionData = await fetchEvolutionChain(
    pokemon.species.url
  );

  const evolutionChain = extractEvolutionChainDetailed(
    evolutionData.chain
  );

  const fullPokemonData = await Promise.all(
    evolutionChain.map(async evolutionPokemon => {
      return await fetchPokemonByName(
        evolutionPokemon.name
      );
    })
  );

  return renderEvolution(fullPokemonData);
}
