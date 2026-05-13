import { getTypeIcon } from './utils.js';

export function createCardData(pokemon) {
  return {
    id: pokemon.id,
    type: getType(pokemon),
    name: getName(pokemon),
    number: getNumber(pokemon),
    image: getImage(pokemon),
    icons: getIcons(pokemon)
  };
}

function getType(pokemon) {
  return pokemon.types[0].type.name;
}

function getName(pokemon) {
  return pokemon.name.toUpperCase();
}

function getNumber(pokemon) {
  return `#${pokemon.id.toString().padStart(3, '0')}`;
}

function getImage(pokemon) {
  return pokemon.sprites.other[
    'official-artwork'
  ].front_default;
}

function getIcons(pokemon) {
  return pokemon.types.map(createIcon).join('');
}

function createIcon(typeData) {
  const type = typeData.type.name;

  return `
    <img
      class="type-icon"
      src="${getTypeIcon(type)}"
      alt="${type}"
    >
  `;
}