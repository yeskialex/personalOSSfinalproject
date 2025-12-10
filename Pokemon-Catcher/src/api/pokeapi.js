import axios from "axios";

// -------------------------
// BASIC LIST + DETAIL
// -------------------------
export const getPokemonList = async (limit = 50, offset = 0) => {
  const res = await axios.get(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  return res.data;
};

export const getPokemonDetail = async (id) => {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return res.data;
};

// -------------------------
// SPECIES (flavor text, evolution chain URL)
// -------------------------
export const getPokemonSpecies = async (id) => {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  return res.data;
};

// -------------------------
// EVOLUTION CHAIN
// -------------------------
export const getEvolutionChain = async (url) => {
  const res = await axios.get(url);
  return res.data;
};
