export function renderPokemonCard(data) {
  return `
    <div
      class="card ${data.type}"
      data-id="${data.id}"
    >

      <div class="card-inner">

        <div class="card-id">
          ${data.number}
        </div>

        <img
          class="pokemon-img"
          src="${data.image}"
          alt="${data.name}"
        >

        <h3>${data.name}</h3>

        <div class="type-icons">
          ${data.icons}
        </div>

      </div>

    </div>
  `;
}

export function renderOverlay(data) {
  return `
    <div class="overlay-card">

      <button class="overlay-close">
  <span>✕</span>
</button>

      <h2>${data.name}</h2>

      <img
        class="overlay-img"
        src="${data.image}"
        alt="${data.name}"
      >

      <div class="tabs">

        <button data-tab="about">
          About
        </button>

        <button data-tab="stats">
          Base Stats
        </button>

        <button data-tab="evo">
          Evolution
        </button>

        <button data-tab="moves">
          Moves
        </button>

      </div>

      <div id="tab-content"></div>

      <div class="overlay-nav">

        <button data-nav="-1">
          ◀
        </button>

        <button data-nav="1">
          ▶
        </button>

      </div>

    </div>
  `;
}

export function renderNoResults() {
  return `
    <div class="no-results">
      <h2>No Pokémon found</h2>

      <p>
        Try another search.
      </p>
    </div>
  `;
}