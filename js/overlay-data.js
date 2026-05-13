export function createAboutData(
  pokemon,
  species
) {
  return {
    rows: createAboutRows(
      pokemon,
      species
    )
  };
}

function createAboutRows(
  pokemon,
  species
) {
  return `
    ${createRow(
      'Height',
      pokemon.height / 10 + ' m'
    )}

    ${createRow(
      'Weight',
      pokemon.weight / 10 + ' kg'
    )}

    ${createRow(
      'Species',
      getSpecies(species)
    )}

     ${createRow(
      'Base Exp',
      pokemon.base_experience
    )}

     ${createRow(
      'Types',
      getTypes(pokemon)
    )}
  `;
}

function createRow(label, value) {
  return `
    <div class="about-row">
      <span>${label}</span>
      <span>${value}</span>
    </div>
  `;
}

function getSpecies(species) {
  return species.genera.find(
    g => g.language.name === 'en'
  )?.genus || 'Unknown';
}

export function createStatsData(pokemon) {
  return {
    rows: createStatsRows(pokemon)
  };
}

function getTypes(pokemon) {
  return pokemon.types
    .map(type =>
      type.type.name
    )
    .join(', ');
}

function createStatsRows(pokemon) {
  return pokemon.stats.map(createStatRow).join('');
}

function createStatRow(stat) {
  return `
    <div class="stat-row">

      <span class="stat-name">
        ${formatStatName(stat)}
      </span>

      <div class="bar">
        <div
          class="fill"
          style="width:${stat.base_stat / 2}%"
        ></div>
      </div>

      <span class="stat-value">
        ${stat.base_stat}
      </span>

    </div>
  `;
}

function formatStatName(stat) {
  return stat.stat.name
    .replace('special-attack', 'Sp. Atk')
    .replace('special-defense', 'Sp. Def')
    .toUpperCase();
}

export function createMovesData(pokemon) {
  return {
    moves: createMoves(pokemon)
  };
}

function createMoves(pokemon) {
  return pokemon.moves
    .slice(0, 20)
    .map(createMove)
    .join('');
}

function createMove(move) {
  return `
    <span class="move">
      ${move.move.name}
    </span>
  `;
}

export function createEvolutionData(
  evolution
) {
  return {
    cards: createEvolutionCards(
      evolution
    )
  };
}

function createEvolutionCards(
  evolution
) {
  return evolution.map(createCard).join('');
}

function createCard(pokemon) {
  return `
    <div
      class="evo-item"
      data-evo="${pokemon.id}"
    >

      <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png"
        alt="${pokemon.name}"
      >

      <span>
        ${pokemon.name}
      </span>

    </div>
  `;
}