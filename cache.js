// cache.js
const pokemonCache = new Map();
const evolutionCache = new Map();

export function getCache(cache, key) {
  return cache.get(key);
}

export function setCache(cache, key, value) {
  cache.set(key, value);
}

export { pokemonCache, evolutionCache };