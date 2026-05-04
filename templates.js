import { typeColors } from './typecolor.js';
import { getTypeIcon } from './utils.js';

export function renderPokemonCard(pokemon) {
  const name = pokemon.name.toUpperCase();

  const id = `#${pokemon.id.toString().padStart(3, '0')}`;

  const icons = pokemon.types.map(t => {
    const type = t.type.name;
    return `
      <img 
        class="type-icon" 
        src="${getTypeIcon(type)}" 
        alt="${type}"
      >
    `;
  }).join("");

  return `
    <div class="card ${pokemon.types[0].type.name}" 
         onclick="openOverlay(${pokemon.id})">

      <div class="card-inner">

        <div class="card-id">${id}</div>

        <img class="pokemon-img"
             src="${pokemon.sprites.other['official-artwork'].front_default}">

        <h3>${name}</h3>

        <div class="type-icons">
          ${icons}
        </div>

      </div>

    </div>
  `;
}

function getTypeClass(pokemon) {
  return pokemon.types[0].type.name;
}

function getCardStyle(pokemon) {
  const type = pokemon.types[0].type.name;
  const color = typeColors[type] || "#999";

  return `
    background: linear-gradient(135deg, ${color}, #0f172a);
    box-shadow: 0 0 20px ${color}55;
  `;
}

export function renderOverlay(pokemon) {
  return `
    <div class="overlay-card" onclick="event.stopPropagation()">

      <h2>${pokemon.name.toUpperCase()}</h2>

      <img class="overlay-img"
           src="${pokemon.sprites.other['official-artwork'].front_default}">

      <!-- 🔥 TABS -->
      <div class="tabs">
        <button class="tab active" onclick="switchTab('stats')" data-tab="stats">Stats</button>
        <button class="tab" onclick="switchTab('info')" data-tab="info">Info</button>
        <button class="tab" onclick="switchTab('evo')" data-tab="evo">Evolution</button>
      </div>

      <!-- 🔥 CONTENT -->
      <div id="tab-content">
        ${renderStats(pokemon)}
      </div>

      <div class="overlay-nav">
        <button onclick="prevPokemon()">◀</button>
        <button onclick="nextPokemon()">▶</button>
      </div>

    </div>
  `;
}

export function renderEvolution(pokemonList) {
  return `
    <div class="evo-chain">
      ${pokemonList.map((p, index) => {
        const name = p?.name || "unknown";
        const id = p?.id || 0;

        return `
          <div class="evo-item" onclick="openFromEvolution(${id})">

            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png"
              alt="${name}"
            >

            <span>${name.toUpperCase()}</span>

          </div>

          ${index < pokemonList.length - 1 ? '<div class="arrow">➜</div>' : ''}
        `;
      }).join("")}
    </div>
  `;
}

export function renderStats(pokemon) {
  return `
    <div class="stats-container">
      ${(pokemon.stats || []).map(stat => {
        const value = stat.base_stat;
        const label = stat.stat.name.toUpperCase();

        return `
          <div class="stat">
            <span>${label}</span>
            <div class="bar">
              <div class="fill" style="width: ${value / 2}%"></div>
            </div>
            <span>${value}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

export function renderInfo(pokemon) {
  const height = pokemon.height / 10;
  const weight = pokemon.weight / 10;

  return `
    <div class="info">
      <p><strong>Height:</strong> ${height} m</p>
      <p><strong>Weight:</strong> ${weight} kg</p>
      <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
    </div>
  `;
}

