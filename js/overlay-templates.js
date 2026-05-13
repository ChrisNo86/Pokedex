export function renderAbout(data) {
  return `
    <div class="about">

      ${data.rows}

    </div>
  `;
}

export function renderStats(data) {
  return `
    <div class="stats-container">

      ${data.rows}

    </div>
  `;
}

export function renderMoves(data) {
  return `
    <div class="moves">

      ${data.moves}

    </div>
  `;
}

export function renderEvolution(data) {
  return `
    <div class="evo-chain">

      ${data.cards}

    </div>
  `;
}