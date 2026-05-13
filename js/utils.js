export function getTypeIcon(type) {
  return `./assets/types/${type}.svg`;
}
export const pokemonTypes = [
  "all",
  "normal","fire","water","electric","grass","ice",
  "fighting","poison","ground","flying","psychic",
  "bug","rock","ghost","dragon","dark","steel","fairy"
];
export function extractEvolutionChainDetailed(chain) {
  const result = [];

  function traverse(node) {
    result.push({
      name: node.species.name,
      url: node.species.url
    });

    node.evolves_to.forEach(e => traverse(e));
  }

  traverse(chain);

  return result;
}