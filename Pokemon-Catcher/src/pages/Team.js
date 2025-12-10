import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { UserDataContext } from "../context/UserDataContext";
import { createTeam, updateTeam, deleteTeam } from "../services/Mockapi";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useDroppable,
  useSensors,
  MeasuringStrategy,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableItem from "../components/SortableItem";

function Droppable({ id, children }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transition: "background-color 0.2s ease" }}
    >
      {children}
    </div>
  );
}

export default function Teams() {
  const { trainer } = useContext(AuthContext);
  const { userPokemons, userTeams, loading, setUserTeams } =
    useContext(UserDataContext);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Initialize teams and active team ID when data loads
  useEffect(() => {
    async function initializeTeams() {
      if (!loading && trainer) {
        if (userTeams.length > 0) {
          setActiveTeamId(userTeams[0].id);
        } else {
          const defaultTeam = {
            firebaseId: trainer.uid,
            name: "Team 1",
            pokemons: [],
          };
          const newTeamRes = await createTeam(defaultTeam);
          setUserTeams([newTeamRes.data]);
          setActiveTeamId(newTeamRes.data.id);
        }
      }
    }
    initializeTeams();
  }, [loading, userTeams, trainer, setUserTeams]);

  // Active team
  const activeTeam = userTeams.find((t) => t.id === activeTeamId) || { pokemons: [] };
  const team = activeTeam.pokemons || [];

  // Collection = allCaught minus those already in teams
  const pokemonInAnyTeam = new Set(
    userTeams.flatMap((t) => t.pokemons?.map((p) => p.id) || [])
  );
  const collection = userPokemons.filter((p) => !pokemonInAnyTeam.has(p.id));

  const updateActiveTeam = async (newPokemons) => {
    const updatedTeams = userTeams.map((t) =>
      t.id === activeTeamId ? { ...t, pokemons: newPokemons } : t
    );

    setUserTeams(updatedTeams);

    const teamToUpdate = updatedTeams.find((t) => t.id === activeTeamId);
    if (teamToUpdate) {
      await updateTeam(activeTeamId, teamToUpdate);
    }
  };

  // Team creation
  const createNewTeam = async () => {
    const teamName = prompt(
      "Enter a name for your new team:",
      `Team ${userTeams.length + 1}`
    );
    if (!teamName) return;

    const newTeamData = {
      firebaseId: trainer.uid,
      name: teamName,
      pokemons: [],
    };
    const res = await createTeam(newTeamData);
    const newTeam = res.data;

    setUserTeams((prev) => [...prev, newTeam]);
    setActiveTeamId(newTeam.id);
  };

  // Rename
  const renameActiveTeam = async () => {
    const activeTeam = userTeams.find((t) => t.id === activeTeamId);
    if (!activeTeam) return;

    const newName = prompt("Enter a new name for your team:", activeTeam.name);
    if (!newName || newName === activeTeam.name) return;

    const updated = { ...activeTeam, name: newName };
    await updateTeam(activeTeamId, updated);

    setUserTeams((prev) =>
      prev.map((t) => (t.id === activeTeamId ? { ...t, name: newName } : t))
    );
  };

  // Delete
  const deleteActiveTeam = async () => {
    if (userTeams.length <= 1) {
      alert("You must have at least one team.");
      return;
    }

    if (!window.confirm(`Delete ${activeTeam.name}?`)) return;

    await deleteTeam(activeTeamId);

    const remaining = userTeams.filter((t) => t.id !== activeTeamId);
    setUserTeams(remaining);
    setActiveTeamId(remaining[0]?.id || null);
  };

  // Drag Handlers
  const onDragStart = (event) => {
    setActiveItem(event.active.id);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const activeFrom = active.data.current?.from;
    const overFrom = over.data.current?.from;

    const isOverTeamArea =
      over.id === "team-area" || overFrom === "team";

    const isOverCollectionArea =
      over.id === "collection-area" || overFrom === "collection";

    // Sorting inside team
    if (activeFrom === "team" && overFrom === "team" && active.id !== over.id) {
      const oldIndex = team.findIndex((p) => p.id === active.id);
      const newIndex = team.findIndex((p) => p.id === over.id);

      updateActiveTeam(arrayMove(team, oldIndex, newIndex));
    }

    // Move collection → team
    else if (activeFrom === "collection" && isOverTeamArea) {
      if (team.length >= 6) {
        alert("Your team is full! (Max 6 Pokémon)");
        return;
      }
      const item = collection.find((p) => p.id === active.id);
      if (item) updateActiveTeam([...team, item]);
    }

    // Move team → collection
    else if (activeFrom === "team" && isOverCollectionArea) {
      const item = team.find((p) => p.id === active.id);
      if (item) updateActiveTeam(team.filter((p) => p.id !== active.id));
    }

    setActiveItem(null);
  };

  return (
  <div className= "team-page">
    <div className="container py-4">
      <h1 className="fw-bold text-center mb-4 pokemon-font">Team Builder</h1>
      <p className="text-center text-muted mb-4">
        Drag Pokémon from your Poké Box to the Battle Roster (max 6).
      </p>

      {/* Team Management */}
      <div className="team-management-ui mb-4">
        <ul className="nav nav-tabs nav-fill">
          {userTeams.map((t) => (
            <li className="nav-item" key={t.id}>
              {/* 
                --------------------------------------------------------
                FIXED: <a href="#"> removed → becomes a <button>
                --------------------------------------------------------
              */}
              <button
                className={`nav-link ${
                  t.id === activeTeamId
                    ? "active fw-bold pokemon-font"
                    : "text-muted"
                }`}
                onClick={() => setActiveTeamId(t.id)}
                style={
                  t.id === activeTeamId
                    ? {
                        backgroundColor: "#4A90E2",
                        color: "white",
                        borderBottom: "2px solid #4A90E2",
                      }
                    : {}
                }
              >
                {t.name}
              </button>
            </li>
          ))}

          <li className="nav-item">
            <button
              className="nav-link btn btn-link text-success"
              onClick={createNewTeam}
            >
              + Add Team
            </button>
          </li>
        </ul>

        <div className="card-body bg-light p-2 d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={renameActiveTeam}
          >
            Rename Team
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={deleteActiveTeam}
          >
            Delete Team
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="row g-4">
          {/* COLLECTION */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 w-100">
              <h4 className="mb-3 text-center pokemon-font">Poké Box</h4>

              <Droppable id="collection-area">
                <SortableContext items={collection.map((p) => p.id)}>
                  <div className="d-flex flex-row flex-wrap gap-3">
                    {collection.map((p) => (
                      <SortableItem
                        key={p.id}
                        id={p.id}
                        data={{ from: "collection" }}
                        pokemon={p}
                      />
                    ))}
                  </div>
                </SortableContext>
              </Droppable>
            </div>
          </div>

          {/* TEAM */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 w-100">
              <h4 className="mb-3 text-center pokemon-font">
                Battle Roster (Max 6)
              </h4>

              <Droppable id="team-area">
                <SortableContext items={team.map((p) => p.id)}>
                  <div className="d-flex flex-row flex-wrap gap-3">
                    {team.map((p) => (
                      <SortableItem
                        key={p.id}
                        id={p.id}
                        data={{ from: "team" }}
                        pokemon={p}
                      />
                    ))}
                  </div>
                </SortableContext>
              </Droppable>
            </div>
          </div>
        </div>

        {/* Drag Preview */}
        <DragOverlay>
          {activeItem && (
            <SortableItem
              isOverlay
              id={activeItem}
              pokemon={[...collection, ...team].find(
                (p) => p.id === activeItem
              )}
              data={{}}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  </div>
  );
}
