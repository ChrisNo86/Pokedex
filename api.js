// api.js
import { pokemonCache, evolutionCache, getCache, setCache } from './cache.js';

export async function fetchPokemonList(limit, offset) {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  return await res.json();
}

export async function fetchPokemonDetails(url) {
  const cached = getCache(pokemonCache, url);
  if (cached) return cached;

  const res = await fetch(url);
  const data = await res.json();

  setCache(pokemonCache, url, data);
  return data;
}

export async function fetchEvolutionChain(speciesUrl) {
  const cached = getCache(evolutionCache, speciesUrl);
  if (cached) return cached;

  const speciesRes = await fetch(speciesUrl);
  const speciesData = await speciesRes.json();

  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  setCache(evolutionCache, speciesUrl, evoData);
  return evoData;
}

// api.js ergänzen
export function extractEvolutionChain(chain) {
  const result = [];

  function traverse(node) {
    result.push(node.species.name);
    node.evolves_to.forEach(e => traverse(e));
  }

  traverse(chain);
  return result;
}

export function extractEvolutionChainDetailed(chain) {
  const result = [];

  function traverse(node) {
    const url = node.species.url;

    // ID aus URL ziehen
    const id = url.split('/').filter(Boolean).pop();

    result.push({
      name: node.species.name,
      id: Number(id)
    });

    node.evolves_to.forEach(e => traverse(e));
  }

  traverse(chain);
  return result;
}