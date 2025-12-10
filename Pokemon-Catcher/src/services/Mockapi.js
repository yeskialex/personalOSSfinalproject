import axios from "axios";

const API_URL = "https://693540defa8e704dafbd467f.mockapi.io";

// CREATE (Catch)
export const catchPokemon = (data) => axios.post(`${API_URL}/CaughtPokemons`, data);

// READ (Get user’s Pokémon)
export const getUserPokemons = (firebaseId) =>
  axios.get(`${API_URL}/CaughtPokemons?firebaseId=${firebaseId}`);

// DELETE (Release)
export const releasePokemon = (id) => axios.delete(`${API_URL}/CaughtPokemons/${id}`);

// UPDATE (Update nickname or other info)
export const updatePokemon = (id, data) => axios.put(`${API_URL}/CaughtPokemons/${id}`, data);

// --- Team API ---

export const getUserTeams = (firebaseId) => {
  return axios.get(`${API_URL}/teams`, {
    params: {
      firebaseId,
    },
  });
};

export const createTeam = (teamData) => {
  return axios.post(`${API_URL}/teams`, teamData);
};

export const updateTeam = (id, teamData) => {
  return axios.put(`${API_URL}/teams/${id}`, teamData);
};

export const deleteTeam = (id) => {
  return axios.delete(`${API_URL}/teams/${id}`);
};
