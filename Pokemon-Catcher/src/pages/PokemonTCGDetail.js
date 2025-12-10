import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPokemonDetail, getPokemonSpecies, getEvolutionChain } from "../api/pokeapi";

export default function PokemonTCGDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolution, setEvolution] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getPokemonDetail(id);
      setPokemon(data);

      const speciesData = await getPokemonSpecies(id);
      setSpecies(speciesData);

      // Evolution chain
      const evoData = await getEvolutionChain(speciesData.evolution_chain.url);
      setEvolution(parseEvolutionChain(evoData.chain));
    }
    loadData();
  }, [id]);

  if (!pokemon) return <div className="text-center py-5">Loading...</div>;

  const flavor =
    species?.flavor_text_entries?.find((e) => e.language.name === "en")
      ?.flavor_text || "";

  const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat;

  return (
    <div className="container py-4">
      <div
        className="mx-auto shadow-lg p-3"
        style={{
          maxWidth: "420px",
          borderRadius: "18px",
          background: "#fff7df",
          border: "4px solid #e3cc7a",
          position: "relative",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between px-2 mt-2">
          <h2 className="fw-bold text-capitalize">{pokemon.name}</h2>
          <h3 className="fw-bold text-danger">HP {hp}</h3>
        </div>

        {/* Artwork */}
        <div
          className="text-center p-2"
          style={{
            background: "linear-gradient(135deg, #fff, #ffe4b5)",
            borderRadius: "12px",
            border: "3px solid #d8bf6a",
          }}
        >
          <img
            src={pokemon.sprites.other["official-artwork"].front_default}
            alt={pokemon.name}
            className="img-fluid"
            style={{ height: "260px", objectFit: "contain" }}
          />
        </div>

        {/* TYPE BADGE — FIXED */}
        <div className="text-center mt-2">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="badge bg-warning text-dark mx-1 px-3 py-2 rounded-pill"
              style={{ fontSize: "14px" }}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        {/* ABILITIES */}
        <div className="mt-3 p-2" style={{ background: "#fff2c7", borderRadius: "10px" }}>
          <h5 className="fw-bold">Abilities</h5>
          {pokemon.abilities.map((a) => (
            <div key={a.ability.name} className="ms-2">
              <strong>{a.ability.name}</strong>
            </div>
          ))}
        </div>

        {/* MOVES */}
        <div
          className="mt-3 p-2"
          style={{
            background: "#fff",
            borderRadius: "10px",
            border: "2px solid #e6d389",
          }}
        >
          <h5 className="fw-bold mb-2">Moves</h5>
          {pokemon.moves.slice(0, 4).map((m) => (
            <div key={m.move.name} className="border-bottom py-2">
              <div className="d-flex justify-content-between">
                <strong className="text-capitalize">{m.move.name}</strong>
                <span className="fw-bold">—</span>
              </div>
              <small className="text-muted">TCG move description placeholder</small>
            </div>
          ))}
        </div>

        {/* EVOLUTION */}
        <h5 className="fw-bold mt-3">Evolution</h5>
        <div className="d-flex justify-content-center gap-3 mt-2">
          {evolution.map((evo) => (
            <div
              key={evo.id}
              className="p-2 text-center"
              style={{
                background: "#fff",
                borderRadius: "10px",
                border: "2px solid #d6c26c",
              }}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                alt={evo.name}
              />
              <div className="text-capitalize">{evo.name}</div>
            </div>
          ))}
        </div>

        {/* FLAVOR TEXT */}
        <div className="mt-4 p-2" style={{ opacity: 0.8 }}>
          <em>{flavor}</em>
        </div>
      </div>
    </div>
  );
}

function parseEvolutionChain(chain) {
  let evo = [];
  function traverse(node) {
    const url = node.species.url;
    const id = url.split("/")[url.split("/").length - 2];
    evo.push({ id, name: node.species.name });
    node.evolves_to.forEach(traverse);
  }
  traverse(chain);
  return evo;
}
