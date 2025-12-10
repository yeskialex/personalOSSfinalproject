import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { getPokemonList, getPokemonDetail } from "../api/pokeapi";
import { typeColors } from "../components/typeColors";
import PokemonCard from "../components/PokemonCard";
import { CSSTransition } from "react-transition-group";
import PokemonDetailModal from "../components/PokemonDetailModal";
import { AuthContext } from '../context/AuthContext';
import { UserDataContext } from "../context/UserDataContext";
import { catchPokemon } from '../services/Mockapi';

export default function Home() {
  const [pokemonData, setPokemonData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const { trainer } = useContext(AuthContext);
  const { userPokemons, setUserPokemons } = useContext(UserDataContext);

  // FILTER STATES
  const [typeFilter, setTypeFilter] = useState("");
  const [generationFilter, setGenerationFilter] = useState("");
  const [legendaryOnly, setLegendaryOnly] = useState(false);

  // SORT STATES
  const [sortCriteria, setSortCriteria] = useState(""); // e.g., "hp", "attack"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  const [showFilters, setShowFilters] = useState(false);

  // MODAL STATE
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [cardBounds, setCardBounds] = useState(null);
  const filterPanelRef = useRef(null);

  // -------------------------
  // FIXED: Memoize loadMorePokemon
  // -------------------------
  const loadMorePokemon = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const list = await getPokemonList(1025, offset);

      if (list.results.length === 0) {
        setHasMore(false);
        return;
      }
      const detailPromises = list.results.map(async (p) => {
        try {
          const parts = p.url.split("/").filter(Boolean);
          const id = parts[parts.length - 1];
          const d = await getPokemonDetail(id);

          const speciesResponse = await fetch(d.species.url);
          const speciesData = await speciesResponse.json();

          let generation = "UNKNOWN";
          const pokemonId = parseInt(id);
          if (pokemonId <= 151) generation = "I";
          else if (pokemonId <= 251) generation = "II";
          else if (pokemonId <= 386) generation = "III";
          else if (pokemonId <= 493) generation = "IV";
          else if (pokemonId <= 649) generation = "V";
          else if (pokemonId <= 721) generation = "VI";
          else if (pokemonId <= 809) generation = "VII";
          else if (pokemonId <= 898) generation = "VIII";

          return {
            id,
            name: d.name,
            image: d.sprites.front_default,
            height: d.height,
            weight: d.weight,
            types: d.types.map((t) => t.type.name),
            baseStats: {
              hp: d.stats[0].base_stat,
              attack: d.stats[1].base_stat,
              defense: d.stats[2].base_stat,
              specialAttack: d.stats[3].base_stat,
              specialDefense: d.stats[4].base_stat,
              speed: d.stats[5].base_stat,
            },
            isLegendary: speciesData.is_legendary,
            generation,
          };
        } catch (err) {
          console.error("Error fetching pokemon:", p.url, err);
          return null;
        }
      });

      const details = await Promise.all(detailPromises);
      const validDetails = details.filter((d) => d !== null);

      const deduplicatedNewDetails = Array.from(
        new Map(validDetails.map((item) => [item.id, item])).values()
      );

      setPokemonData((prev) => {
        const combined = [...prev, ...deduplicatedNewDetails];
        return Array.from(new Map(combined.map((item) => [item.id, item])).values());
      });

      setOffset((prev) => prev + 1025);
    } catch (err) {
      console.error("Error loading pokemon list:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, offset, hasMore]); // <--- FIX: Proper dependencies

  // Initial load
  useEffect(() => {
    loadMorePokemon();
  }, [loadMorePokemon]);

  // -------------------------
  // FIXED: Infinite Scroll with stable handler
  // -------------------------
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMorePokemon();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePokemon]);

  // ---------- LIVE SEARCH ----------
  const smartFiltered = pokemonData.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toString() === q ||
      p.types.some((t) => t.toLowerCase().includes(q))
    );
  });

  // ---------- AUTOCOMPLETE ----------
  const autocomplete = pokemonData
    .filter((p) => p.name.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10);

  // ---------- FILTERS ----------
  const finalFiltered = smartFiltered.filter((p) => {
    return (
      (!typeFilter || p.types.includes(typeFilter)) &&
      (!generationFilter || p.generation === generationFilter) &&
      (!legendaryOnly || p.isLegendary)
    );
  }).sort((a, b) => {
    if (!sortCriteria) return 0;

    const statA = a.baseStats[sortCriteria];
    const statB = b.baseStats[sortCriteria];

    if (statA === undefined || statB === undefined) {
      // Handle cases where a stat might be missing (though it shouldn't for baseStats)
      return 0;
    }

    let comparison = 0;
    if (statA > statB) {
      comparison = 1;
    } else if (statA < statB) {
      comparison = -1;
    }

    return sortOrder === "desc" ? comparison * -1 : comparison;
  });

  const statOptions = [
    { value: "hp", label: "HP" },
    { value: "attack", label: "Attack" },
    { value: "defense", label: "Defense" },
    { value: "specialAttack", label: "Sp. Attack" },
    { value: "specialDefense", label: "Sp. Defense" },
    { value: "speed", label: "Speed" },
  ];

  // Helper to get contrasting text color (black or white)
  const getContrastingTextColor = (hexColor) => {
    if (!hexColor) return '#000000';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  };

  const clearFilters = () => {
    setTypeFilter("");
    setGenerationFilter("");
    setLegendaryOnly(false);
    setSortCriteria("");
  };

  const handleCardClick = (pokemon, cardElement) => {
    const bounds = cardElement.getBoundingClientRect();
    setCardBounds(bounds);
    setSelectedPokemon(pokemon);
  };

  const handleCatch = async (pokemonToCatch) => {
    if (!trainer) {
      alert("Please login first!");
      return;
    }

    const nickname = prompt(`Give your ${pokemonToCatch.name} a nickname:`);
    if (!nickname) return;

    const data = {
      firebaseId: trainer.uid,
      pokemonId: pokemonToCatch.id,
      name: pokemonToCatch.name,
      nickname,
      image: pokemonToCatch.image,
      types: pokemonToCatch.types,
      height: pokemonToCatch.height,
      weight: pokemonToCatch.weight,
      baseStats: Object.entries(pokemonToCatch.baseStats).map(([name, value]) => ({
        name,
        value,
      })),
      datecaught: new Date().toISOString().split("T")[0],
      favofood: "",
    };

    const response = await catchPokemon(data);
    alert(`${pokemonToCatch.name} was added to your collection!`);

    setUserPokemons([...userPokemons, response.data]);

    setSelectedPokemon(null);
    setCardBounds(null);
  };

  return (
  <div className= "home-page">
    <div className="container py-4">
      {/* HEADER */}
      <div className="row align-items-center mb-4">
        <div className="col-12 col-md-4">
          <h1 className="fw-bold pokemon-font">Pokédex</h1>
        </div>

        {/* SEARCH */}
        <div className="col-12 col-md-4 position-relative" style={{ zIndex: 1000 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, ID, or type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ position: "relative", zIndex: 1001 }}
          />

          {query && autocomplete.length > 0 && (
            <div
              className="autocomplete-box border position-absolute w-100 mt-1 shadow-sm"
              style={{ zIndex: 1002, pointerEvents: "auto" }}
            >
              {autocomplete.map((a) => (
                <div
                  key={a.id}
                  className="p-2 autocomplete-item"
                  style={{ cursor: "pointer", pointerEvents: "auto" }}
                  onClick={() => setQuery(a.name)}
                >
                  {a.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
          <button
            className={`btn ${showFilters ? "btn-danger" : "btn-filter"}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <CSSTransition in={showFilters} timeout={300} classNames="slide-down" unmountOnExit nodeRef={filterPanelRef}>
        <div className="filter-panel-gamified mb-4" ref={filterPanelRef}>
          <div className="row">
            {/* Type Filter */}
            <div className="col-12 mb-4">
              <h5 className="filter-section-title">TYPE</h5>
              <div className="type-icon-filter">
                {Object.keys(typeColors).map(t => (
                  <button
                    key={t}
                    className={`type-icon ${
                      typeFilter === t ? 'active' : typeFilter ? 'inactive' : ''
                    }`}
                    style={{
                      backgroundColor: typeColors[t],
                      color: getContrastingTextColor(typeColors[t])
                    }}
                    onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Filters */}
            <div className="col-lg-8">
              <div className="row">
                {/* Generation Filter */}
                <div className="col-md-6 mb-4">
                  <h5 className="filter-section-title">GENERATION</h5>
                  <div className="btn-group filter-btn-group w-100" role="group">
                    {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map(gen => (
                      <button
                        key={gen}
                        type="button"
                        className={`btn btn-outline-dark ${generationFilter === gen ? 'active' : ''}`}
                        onClick={() => setGenerationFilter(generationFilter === gen ? '' : gen)}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort by Stat */}
                <div className="col-md-6 mb-4">
                  <h5 className="filter-section-title">SORT BY</h5>
                  <div className="btn-group filter-btn-group w-100" role="group">
                    {statOptions.map(stat => (
                      <button
                        key={stat.value}
                        type="button"
                        className={`btn btn-outline-dark ${sortCriteria === stat.value ? 'active' : ''}`}
                        onClick={() => setSortCriteria(sortCriteria === stat.value ? '' : stat.value)}
                      >
                        {stat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Toggles */}
            <div className="col-lg-4">
              <div className="row">
                {/* Sort Order */}
                <div className="col-md-12 mb-4">
                  <h5 className="filter-section-title">ORDER</h5>
                  <div className="btn-group filter-btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn btn-outline-dark ${sortOrder === 'asc' ? 'active' : ''}`}
                      onClick={() => setSortOrder('asc')}
                      disabled={!sortCriteria}
                    >
                      Asc
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-dark ${sortOrder === 'desc' ? 'active' : ''}`}
                      onClick={() => setSortOrder('desc')}
                      disabled={!sortCriteria}
                    >
                      Desc
                    </button>
                  </div>
                </div>

                {/* Legendary Toggle & Clear */}
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                  <div className="form-check form-switch fs-5">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="legendarySwitch"
                      checked={legendaryOnly}
                      onChange={(e) => setLegendaryOnly(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold" htmlFor="legendarySwitch">
                      Legendary
                    </label>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>

      {/* GRID */}
      <div className="row gy-4">
        {finalFiltered.map((p) => (
          <div className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex" key={p.id}>
            <PokemonCard pokemon={p} onCardClick={(el) => handleCardClick(p, el)} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading more Pokémon...</p>
        </div>
      )}

      {selectedPokemon && (
        <PokemonDetailModal
          pokemon={selectedPokemon}
          initialBounds={cardBounds}
          onClose={() => {
            setSelectedPokemon(null);
            setCardBounds(null);
          }}
          onCatch={handleCatch}
        />
      )}
    </div>
  </div>
  );
}
