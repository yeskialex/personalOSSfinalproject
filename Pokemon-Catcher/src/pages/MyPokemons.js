import { useContext, useState } from "react";
import { UserDataContext } from "../context/UserDataContext";
import { updatePokemon, releasePokemon, updateTeam } from "../services/Mockapi";
import { typeColors } from "../components/typeColors";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

export default function MyPokemons() {
  const { userPokemons, setUserPokemons, userTeams, setUserTeams, loading } =
    useContext(UserDataContext);
  const [selected, setSelected] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const navigate = useNavigate();

  const openEdit = (poke) => {
    setSelected({ ...poke });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    const updated = {
      ...selected,
      datecaught: selected.datecaught,
      favfood: selected.favfood,
    };

    await updatePokemon(selected.id, updated);

    // Update the userPokemons in the context with the new data
    setUserPokemons(
      userPokemons.map((p) => (p.id === selected.id ? { ...p, ...updated } : p))
    );

    setShowEdit(false);
  };

  const remove = async (id) => {
    if (window.confirm("Are you sure you want to release this Pokémon?")) {
      // 1. Release the Pokémon from the main collection
      await releasePokemon(id);

      // 2. Update the local state for the main collection
      setUserPokemons(userPokemons.filter((p) => p.id !== id));

      // 3. Identify which teams need to be updated and prepare the API calls
      const updatePromises = [];
      const updatedTeams = userTeams.map(team => {
        const newPokemons = team.pokemons.filter(p => p.id !== id);
        if (newPokemons.length < team.pokemons.length) {
          const updatedTeam = { ...team, pokemons: newPokemons };
          updatePromises.push(updateTeam(team.id, updatedTeam));
          return updatedTeam;
        }
        return team;
      });

      // 4. Wait for all team updates to complete and then update the local state
      await Promise.all(updatePromises);
      setUserTeams(updatedTeams);
    }
  };

  if (loading) {
    return <div className="container py-4 text-center">Loading your Pokémon...</div>;
  }

  return (
    <div className="my-pokemons-page">
      <div className="container">
        <h1 className="mb-4 text-center pokemon-font" style={{ color: '#333' }}>My Pokémon Storage</h1>

        <div className="row g-4">
          {userPokemons.map((p, index) => {
            const primaryType = p.types[0];
            const cardHeaderStyle = {
              background: `linear-gradient(135deg, ${typeColors[primaryType] || '#E6E6FA'} 30%, #ffffff 100%)`,
            };

            return (
              <div className="pokemon-card col-12 col-sm-6 col-md-4 col-lg-3" key={p.id} onClick={() => navigate(`/pokemon/${p.pokemonId}/tcg`)}>
                <div
                  className="pokemon-storage-card h-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header with Sprite */}
                  <div className="pokemon-storage-card-header" style={cardHeaderStyle}>
                    <img src={p.image} alt={p.name} className="sprite" />
                  </div>

                  {/* Card Body */}
                  <div className="pokemon-storage-card-body">
                    <div className="d-flex justify-content-between align-items-baseline">
                      <h5 className="text-capitalize fw-bold mb-0">{p.nickname}</h5>
                      <small className="text-muted fw-bold">#{p.pokemonId}</small>
                    </div>
                    <p className="text-capitalize text-muted mb-2" style={{ fontSize: '0.9rem' }}>{p.name}</p>

                    {/* HP Bar */}
                    <div className="hp-bar-container">
                      <div
                        className="hp-bar"
                        style={{ width: `${(p.baseStats.find(s => s.name === 'hp').value / 255) * 100}%` }}
                      ></div>
                    </div>

                    {/* TYPES */}
                    <div className="mt-2">
                      {p.types.map((t) => (
                        <span
                          key={t}
                          className="badge rounded-pill me-1"
                          style={{
                            backgroundColor: typeColors[t] || '#E6E6FA',
                            color: '#333',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* EXTRA INFO */}
                    <div className="mt-auto pt-3" style={{ fontSize: "0.8rem" }}>
                      {p.datecaught && <div><strong>Caught:</strong> {p.datecaught}</div>}
                      {p.favfood && <div><strong>Food:</strong> {p.favfood}</div>}
                    </div>
                  </div>

                  {/* Card Footer with Buttons */}
                  <div className="pokemon-storage-card-footer d-flex gap-2">
                    <button
                      className="btn-gamified btn-edit w-100"
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-gamified btn-release w-100"
                      onClick={(e) => { e.stopPropagation(); remove(p.id); }}
                    >
                      Release
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EDIT MODAL */}
        <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Pokémon Info</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selected && (
              <Form>
                {/* NICKNAME */}
                <Form.Group className="mb-3">
                  <Form.Label>Nickname</Form.Label>
                  <Form.Control
                    type="text"
                    value={selected.nickname || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, nickname: e.target.value })
                    }
                  />
                </Form.Group>

                {/* DATE CAUGHT */}
                <Form.Group className="mb-3">
                  <Form.Label>Date Caught</Form.Label>
                  <Form.Control
                    type="date"
                    value={selected.datecaught || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, datecaught: e.target.value })
                    }
                  />
                </Form.Group>

                {/* FAVORITE FOOD */}
                <Form.Group className="mb-3">
                  <Form.Label>Favorite Food</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Berries"
                    value={selected.favfood || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, favfood: e.target.value })
                    }
                  />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={saveEdit}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
