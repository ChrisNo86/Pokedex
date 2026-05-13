import {
  renderOverlay
} from './templates.js';

import {
  renderAbout,
  renderStats,
  renderMoves,
  renderEvolution
} from './overlay-templates.js';

import {
  createAboutData,
  createStatsData,
  createMovesData,
  createEvolutionData
} from './overlay-data.js';

import {
  fetchEvolutionChain,
  extractEvolutionChainDetailed,
} from './api.js';

import { appState } from './state.js';

export function openPokemonOverlay(pokemonId, allPokemon) {
  appState.currentIndex = allPokemon.findIndex(
    pokemon => pokemon.id === pokemonId
  );

  showPokemonOverlay(allPokemon);
}

export function closePokemonOverlay() {
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = 'auto';
  document.body.classList.remove('no-scroll');
}

export async function showPokemonOverlay(
  allPokemon
) {

  const pokemon =
    getCurrentPokemon(allPokemon);

  renderPokemonOverlay(
    pokemon,
    allPokemon
  );

  openOverlay();

  await switchOverlayTab(
    'about',
    allPokemon
  );

  fadeInOverlay();
}

function getCurrentPokemon(allPokemon) {
  return allPokemon[appState.currentIndex];
}

function renderPokemonOverlay(
  pokemon,
  allPokemon
) {

  const overlay =
    document.getElementById(
      'overlay'
    );

  overlay.innerHTML =
    createOverlayHTML(pokemon);

  registerOverlayEvents(
    overlay,
    allPokemon
  );
}

function createOverlayHTML(pokemon) {
  return renderOverlay({
    name: pokemon.name.toUpperCase(),

    image:
      pokemon.sprites.other[
        'official-artwork'
      ].front_default
  });
}

function openOverlay() {
  const overlay =
    document.getElementById(
      'overlay'
    );

  overlay.classList.add('show');

  document.body.style.overflow =
    'hidden';
}

function fadeInOverlay() {
  requestAnimationFrame(() => {
    document.getElementById(
      'overlay'
    ).style.opacity = '1';
  });
}

export async function switchOverlayTab(
  tab,
  allPokemon
) {

  const pokemon =
    getCurrentPokemon(allPokemon);

  const content =
    getTabContent();

  updateActiveTabButton(tab);

  await renderTab(
    tab,
    pokemon,
    content,
    allPokemon
  );
}

async function renderTab(
  tab,
  pokemon,
  content,
  allPokemon
) {

  const action =
    getTabAction(
      tab,
      pokemon,
      content,
      allPokemon
    );

  await action();
}

function getTabAction(
  tab,
  pokemon,
  content,
  allPokemon
) {

  const tabMap = createTabMap(
    pokemon,
    content,
    allPokemon
  );

  return tabMap[tab];
}

function getTabContent() {
  return document.getElementById(
    'tab-content'
  );
}

function createTabMap(
  pokemon,
  content,
  allPokemon
) {

  return {
    about: () =>
      renderAboutTab(
        pokemon,
        content
      ),

    stats: () =>
      renderStatsTab(
        pokemon,
        content
      ),

    moves: () =>
      renderMovesTab(
        pokemon,
        content
      ),

    evo: () =>
      renderEvolutionTab(
        pokemon,
        content,
        allPokemon
      )
  };
}

function updateActiveTabButton(tab) {
  document.querySelectorAll('.tabs button').forEach(button => {
    button.classList.remove('active');

    if (button.textContent.toLowerCase().includes(tab)) {
      button.classList.add('active');
    }
  });
}

function registerOverlayEvents(
  overlay,
  allPokemon
) {
  stopOverlayClosing(overlay);

  registerCloseButton(overlay);

  registerTabButtons(
    overlay,
    allPokemon
  );

  registerNavButtons(
    overlay,
    allPokemon
  );
}

function stopOverlayClosing(overlay) {
  const card =
    overlay.querySelector('.overlay-card');

  card.addEventListener(
    'click',
    event => {
      event.stopPropagation();
    }
  );
}

function registerCloseButton(overlay) {
  const button =
    overlay.querySelector(
      '.overlay-close'
    );

  button.addEventListener(
    'click',
    closePokemonOverlay
  );
}

function registerTabButtons(
  overlay,
  allPokemon
) {

  const buttons =
    getTabButtons(overlay);

  buttons.forEach(button => {
    addTabEvent(
      button,
      allPokemon
    );
  });
}

function getTabButtons(overlay) {
  return overlay.querySelectorAll(
    '[data-tab]'
  );
}

function addTabEvent(
  button,
  allPokemon
) {

  button.addEventListener(
    'click',
    event => {
      handleTabClick(
        event,
        button,
        allPokemon
      );
    }
  );
}

function handleTabClick(
  event,
  button,
  allPokemon
) {

  event.stopPropagation();

  switchOverlayTab(
    button.dataset.tab,
    allPokemon
  );
}

function registerNavButtons(
  overlay,
  allPokemon
) {

  const buttons =
    getNavButtons(overlay);

  buttons.forEach(button => {
    addNavEvent(
      button,
      allPokemon
    );
  });
}

function getNavButtons(overlay) {
  return overlay.querySelectorAll(
    '[data-nav]'
  );
}

function addNavEvent(
  button,
  allPokemon
) {

  button.addEventListener(
    'click',
    event => {
      handleNavClick(
        event,
        button,
        allPokemon
      );
    }
  );
}

function handleNavClick(
  event,
  button,
  allPokemon
) {

  event.stopPropagation();

  changePokemon(
    Number(button.dataset.nav),
    allPokemon
  );
}

function changePokemon(
  direction,
  allPokemon
) {

  appState.currentIndex += direction;

  handlePokemonOverflow(
    allPokemon
  );

  showPokemonOverlay(allPokemon);
}

function handlePokemonOverflow(
  allPokemon
) {

  if (isBeforeFirstPokemon()) {
    appState.currentIndex =
      allPokemon.length - 1;
  }

  if (isAfterLastPokemon(allPokemon)) {
    appState.currentIndex = 0;
  }
}

function isBeforeFirstPokemon() {
  return appState.currentIndex < 0;
}

function isAfterLastPokemon(allPokemon) {
  return (
    appState.currentIndex >=
    allPokemon.length
  );
}

async function renderAboutTab(
  pokemon,
  content
) {
  const response = await fetch(
    pokemon.species.url
  );

  const species =
    await response.json();

  const data =
    createAboutData(
      pokemon,
      species
    );

  content.innerHTML =
    renderAbout(data);
}

function renderStatsTab(
  pokemon,
  content
) {
  const data =
    createStatsData(pokemon);

  content.innerHTML =
    renderStats(data);
}

function renderMovesTab(
  pokemon,
  content
) {
  const data =
    createMovesData(pokemon);

  content.innerHTML =
    renderMoves(data);
}

async function renderEvolutionTab(
  pokemon,
  content,
  allPokemon
) {

  const evolution =
    await getEvolutionChain(
      pokemon
    );

  renderEvolutionContent(
    evolution,
    content
  );

  registerEvolutionEvents(
    allPokemon
  );
}

function renderEvolutionContent(
  evolution,
  content
) {

  const data =
    createEvolutionData(
      evolution
    );

  content.innerHTML =
    renderEvolution(data);
}

function openEvolution(
  card,
  allPokemon
) {
  const id =
    Number(card.dataset.evo);

  openPokemonOverlay(
    id,
    allPokemon
  );
}

async function getEvolutionChain(
  pokemon
) {
  const species =
    await fetch(
      pokemon.species.url
    ).then(r => r.json());

  const chainUrl =
  species.evolution_chain.url;

const chain =
  await fetch(chainUrl)
    .then(response => response.json());

  return extractEvolutionChainDetailed(
    chain.chain
  );
}

function registerEvolutionEvents(
  allPokemon
) {
  const items =
    document.querySelectorAll(
      '.evo-item'
    );

  items.forEach(item => {
    item.addEventListener(
      'click',
      () => {
        openEvolutionPokemon(
          item,
          allPokemon
        );
      }
    );
  });
}

function openEvolutionPokemon(
  item,
  allPokemon
) {
  const id =
    Number(item.dataset.evo);

  openPokemonOverlay(
    id,
    allPokemon
  );
}