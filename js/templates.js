import { typeColors } from '/js/typecolor.js';
import { getTypeIcon } from '/js/utils.js';

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

      <div class="tabs">
        <button onclick="switchTab('about')">About</button>
        <button onclick="switchTab('stats')">Base Stats</button>
        <button onclick="switchTab('evo')">Evolution</button>
        <button onclick="switchTab('moves')">Moves</button>
      </div>

      <div id="tab-content"></div>

      <div class="overlay-nav">
        <button onclick="prevPokemon()">◀</button>
        <button onclick="nextPokemon()">▶</button>
      </div>

    </div>
  `;
}

export function renderAbout(pokemon, speciesData) {
  const height = pokemon.height / 10;
  const weight = pokemon.weight / 10;

  const abilities = pokemon.abilities
    .map(a => a.ability.name)
    .join(", ");

  const genderRate = speciesData.gender_rate;

  const femaleRate = genderRate >= 0
    ? genderRate * 12.5
    : 0;

  const maleRate = genderRate >= 0
    ? 100 - femaleRate
    : 0;

  const eggGroups = speciesData.egg_groups
    .map(group => group.name)
    .join(", ");

  const eggCycles = speciesData.hatch_counter;

  const genus = speciesData.genera.find(
    g => g.language.name === "en"
  )?.genus || "Unknown";

  return `
    <div class="about">

      <div class="about-section">

      <h4 class="section-title">
  Pokédex Data
</h4>

        <div class="about-row">
          <span>Species</span>
          <span>${genus}</span>
        </div>

        <div class="about-row">
          <span>Height</span>
          <span>${height} m</span>
        </div>

        <div class="about-row">
          <span>Weight</span>
          <span>${weight} kg</span>
        </div>

        <div class="about-row">
          <span>Abilities</span>
          <span>${abilities}</span>
        </div>

      </div>

      <div class="about-section">

        <h4 class="section-title">
          Breeding
        </h4>

        <div class="about-row">
          <span>Gender</span>

          <span>
            ♂ ${maleRate}% / ♀ ${femaleRate}%
          </span>
        </div>

        <div class="about-row">
          <span>Egg Groups</span>
          <span>${eggGroups}</span>
        </div>

        <div class="about-row">
          <span>Egg Cycle</span>
          <span>${eggCycles}</span>
        </div>

      </div>

    </div>
  `;
}

export function renderEvolution(pokemonList) {
  return `
    <div class="evo-chain">
      ${pokemonList.map((p, index) => `
        <div class="evo-item" onclick="openFromEvolution(${p.id})">

          <img src="${p.sprites.other['official-artwork'].front_default}"
            alt="${p.name}"
          >

          <span>${p.name.toUpperCase()}</span>

        </div>

        ${index < pokemonList.length - 1 ? '<div class="arrow">➜</div>' : ''}
      `).join("")}
    </div>
  `;
}

export function renderStats(pokemon) {
  return `
    <div class="stats-container">

      ${pokemon.stats.map(stat => {
        const value = stat.base_stat;
        const name = formatStatName(stat.stat.name);

        return `
          <div class="stat-row">

            <span class="stat-name">${name}</span>

            <div class="bar">
              <div class="fill" style="width:${value / 2}%"></div>
            </div>

            <span class="stat-value">${value}</span>

          </div>
        `;
      }).join("")}

    </div>
  `;
}

export function renderMoves(pokemon) {
  return `
    <div class="moves">

      ${pokemon.moves.slice(0, 20).map(m => `
        <span class="move">${m.move.name}</span>
      `).join("")}

    </div>
  `;
}

function formatStatName(name) {
  return name
    .replace("special-attack", "Sp. Atk")
    .replace("special-defense", "Sp. Def")
    .toUpperCase();
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

