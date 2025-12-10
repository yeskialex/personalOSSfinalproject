import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserPokemons, releasePokemon } from "../services/Mockapi";
import { Modal, Button } from "react-bootstrap";

export default function MyPokemons() {
  const { trainer } = useContext(AuthContext);
  const [pokemons, setPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trainer) {
      getUserPokemons(trainer.uid).then((res) => setPokemons(res.data));
    }
  }, [trainer]);

  const handleOpen = (pokemon) => {
    setSelectedPokemon(pokemon);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedPokemon(null);
  };

  const remove = async (id) => {
    await releasePokemon(id);
    setPokemons(pokemons.filter((p) => p.id !== id));
    handleClose();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Pokémon</h2>

      {/* SMALL CARDS */}
      <div className="row g-3">
        {pokemons.map((p) => (
          <div className="col-6 col-md-4" key={p.id}>
            <div
              className="card shadow-sm text-center"
              style={{ borderRadius: "16px", cursor: "pointer" }}
              onClick={() => handleOpen(p)}
            >
              <img
                src={p.image}
                className="card-img-top p-3"
                style={{ height: "120px", objectFit: "contain" }}
              />

              <div className="card-body p-2">
                <h6 className="fw-bold text-capitalize mb-0">{p.nickname}</h6>
                <small className="text-muted text-capitalize">{p.name}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOOTSTRAP MODAL */}
      {selectedPokemon && (
        <Modal show={show} onHide={handleClose} centered size="md">
          {/* HEADER */}
          <div
            className="text-center text-white p-4"
            style={{
              background: "#3B82F6",
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
            }}
          >
            <img
              src={selectedPokemon.image}
              className="img-fluid mb-3"
              style={{ width: "150px" }}
            />
            <h2 className="fw-bold text-capitalize">{selectedPokemon.nickname}</h2>
            <p className="mb-0 opacity-75 text-capitalize">{selectedPokemon.name}</p>
          </div>

          {/* BODY */}
          <Modal.Body>
            {/* TYPES */}
            <h5 className="fw-bold">Types</h5>
            <div className="mb-3">
              {selectedPokemon.types.map((t) => (
                <span
                  key={t}
                  className="badge bg-primary me-2"
                  style={{ opacity: 0.9 }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* HEIGHT WEIGHT */}
            <div className="row text-center my-3">
              <div className="col">
                <h6 className="fw-bold">Height</h6>
                <p>{selectedPokemon.height / 10} m</p>
              </div>
              <div className="col">
                <h6 className="fw-bold">Weight</h6>
                <p>{selectedPokemon.weight / 10} kg</p>
              </div>
            </div>

            {/* ABILITIES */}
            <h5 className="fw-bold">Abilities</h5>
            <p>{selectedPokemon.abilities.join(", ")}</p>

            {/* STATS */}
            <h5 className="fw-bold mt-3">Base Stats</h5>

            {selectedPokemon.baseStats.map((s) => (
              <div key={s.name} className="mb-2">
                <div className="d-flex justify-content-between">
                  <span className="text-capitalize">{s.name}</span>
                  <span>{s.value}</span>
                </div>

                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${(s.value / 200) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="danger" className="w-100" onClick={() => remove(selectedPokemon.id)}>
              Release Pokémon
            </Button>

            <Button variant="secondary" className="w-100" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}