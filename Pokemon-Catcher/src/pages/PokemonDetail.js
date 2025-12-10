import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { catchPokemon } from "../services/Mockapi";
import { getPokemonDetail } from "../api/pokeapi";

export default function PokemonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trainer } = useContext(AuthContext);
  const [pokemon, setPokemon] = useState(null);
  const [showTeamPrompt, setShowTeamPrompt] = useState(false);

  useEffect(() => {
    getPokemonDetail(id).then(setPokemon);
  }, [id]);

  const handleCatch = async () => {
    if (!trainer) {
      alert("Please login first!");
      return;
    }

    const nickname = prompt("Give your Pokémon a nickname:");
    if (!nickname) return;

    const data = {
      firebaseId: trainer.uid,
      pokemonId: id,
      name: pokemon.name,
      nickname,
      image: pokemon.sprites.front_default,
      height: pokemon.height,
      weight: pokemon.weight,
      types: pokemon.types.map((t) => t.type.name),
      abilities: pokemon.abilities.map((a) => a.ability.name),
      baseStats: pokemon.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
      datecaught: new Date().toISOString().split("T")[0],
      favofood: "",
    };

    await catchPokemon(data);
    alert(`${pokemon.name} was added to your collection!`);
    setShowTeamPrompt(true);
  };

  const handleAddToTeam = () => {
    setShowTeamPrompt(false);
    navigate("/teams");
  };

  const handleSkipTeam = () => {
    setShowTeamPrompt(false);
  };

  if (!pokemon)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="pokemon-detail">

      {/* HEADER */}
      <div
        className="text-center text-white py-4"
        style={{
          backgroundColor: "#3B82F6",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          maxWidth: "600px",
          margin: "0 auto"
        }}
      >
        <img
          src={pokemon.sprites.other["official-artwork"].front_default}
          alt={pokemon.name}
          className="img-fluid mb-3"
          style={{ width: "180px" }}
        />

        <h1 className="fw-bold text-capitalize">{pokemon.name}</h1>
        <p className="mb-0" style={{ opacity: 0.95 }}>
          #{String(pokemon.id).padStart(3, "0")}
        </p>
      </div>

      {/* BODY */}
      <div
        className="container bg-white shadow px-4 pb-5"
        style={{
          maxWidth: "600px",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
      >
        {/* TYPES */}
        <h4 className="mt-4 fw-bold">TYPES</h4>
        <div className="mb-3">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="badge me-2"
              style={{
                background: "#dbeafe",
                color: "#1e3a8a",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "8px",
              }}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        {/* HEIGHT + WEIGHT */}
        <div className="row text-center my-4">
          <div className="col">
            <h5 className="fw-bold">HEIGHT</h5>
            <p>{pokemon.height / 10} m</p>
          </div>
          <div className="col">
            <h5 className="fw-bold">WEIGHT</h5>
            <p>{pokemon.weight / 10} kg</p>
          </div>
        </div>

        {/* ABILITIES */}
        <h4 className="fw-bold">ABILITIES</h4>
        <p className="mb-4">
          {pokemon.abilities.map((a) => (
            <span key={a.ability.name} className="me-3">
              {a.ability.name}
            </span>
          ))}
        </p>

        {/* BASE STATS */}
        <h4 className="fw-bold">BASE STATS</h4>

        {pokemon.stats.map((s) => (
          <div key={s.stat.name} className="mb-2">
            <div className="d-flex justify-content-between">
              <span className="text-capitalize">{s.stat.name}</span>
              <span>{s.base_stat}</span>
            </div>

            <div className="progress" style={{ height: "6px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${(s.base_stat / 200) * 100}%`,
                  backgroundColor: "#3B82F6",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* STICKY CATCH BUTTON */}
      <div
        className="position-fixed bottom-0 start-0 end-0 p-3"
        style={{ background: "white" }}
      >
        <button
          className="btn btn-danger w-100 py-3 fw-bold"
          style={{
            borderRadius: "12px",
            fontSize: "18px",
          }}
          onClick={handleCatch}
        >
          ❤️ Catch {pokemon.name}!
        </button>
      </div>

      {/* TEAM PROMPT MODAL */}
      {showTeamPrompt && (
        <div
          className="modal"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4">
              <p className="fw-bold fs-5">
                Would you like to add {pokemon.name} to your team?
              </p>
              <div className="d-flex justify-content-center">
                <button className="btn btn-primary me-3" onClick={handleAddToTeam}>Add to Team</button>
                <button className="btn btn-secondary" onClick={handleSkipTeam}>Skip</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
