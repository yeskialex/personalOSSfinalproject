import React from 'react';
import { typeColors } from "./typeColors";

const statNames = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export default function PokemonDetailModal({ pokemon, initialBounds, onClose, onCatch }) {
  if (!pokemon) return null;

  const primaryType = pokemon.types[0];
  const modalHeaderStyle = {
    background: `linear-gradient(135deg, ${typeColors[primaryType] || '#E6E6FA'} 50%, #f0f2f5 100%)`,
  };

  // Calculate animation properties from the initial card bounds
  const animationStyle = initialBounds ? {
    '--card-origin-x': `${initialBounds.left + initialBounds.width / 2}px`,
    '--card-origin-y': `${initialBounds.top + initialBounds.height / 2}px`,
    '--card-scale-x': initialBounds.width / window.innerWidth,
    '--card-scale-y': initialBounds.height / window.innerHeight,
  } : {};

  return (
    <div
      className="modal show d-block card-popup-animation"
      style={animationStyle}
      tabIndex="-1"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={e => e.stopPropagation()}>
        <div className="modal-content" style={{ borderRadius: '20px', border: 'none' }}>
          {/* Modal Header */}
          <div className="modal-header text-center p-4" style={{ ...modalHeaderStyle, borderBottom: 'none', borderRadius: '20px 20px 0 0' }}>
            <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose}></button>
            <div className="w-100">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                alt={pokemon.name}
                className="img-fluid mb-2"
                style={{ height: "150px", filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
              />
              <h3 className="text-capitalize pokemon-font" style={{ color: '#333' }}>{pokemon.name}</h3>
              <p className="mb-0 fw-bold" style={{ opacity: 0.7 }}>
                #{String(pokemon.id).padStart(3, "0")}
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {/* Types */}
            <div className="text-center mb-3">
              {pokemon.types.map((t) => (
                <span
                  key={t}
                  className="type-badge me-2 px-3 py-1"
                  style={{ backgroundColor: typeColors[t] || '#E6E6FA', color: '#333' }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Physical Info */}
            <div className="row text-center my-4">
              <div className="col">
                <h6 className="fw-bold text-muted">HEIGHT</h6>
                <p className="fs-5 fw-bold">{pokemon.height / 10} m</p>
              </div>
              <div className="col">
                <h6 className="fw-bold text-muted">WEIGHT</h6>
                <p className="fs-5 fw-bold">{pokemon.weight / 10} kg</p>
              </div>
            </div>

            {/* Base Stats */}
            <h5 className="fw-bold text-center mb-3">Base Stats</h5>
            {Object.entries(pokemon.baseStats).map(([name, value]) => (
              <div key={name} className="mb-2">
                <div className="d-flex justify-content-between">
                  <span className="text-capitalize fw-bold text-muted" style={{ fontSize: '0.8rem' }}>{statNames[name] || name}</span>
                  <span className="fw-bold">{value}</span>
                </div>
                <div className="progress" style={{ height: "8px", borderRadius: '4px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${(value / 200) * 100}%`,
                      backgroundColor: typeColors[primaryType] || '#3B82F6',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-0 p-3">
             <button
              className="btn w-100 py-2 fw-bold"
              style={{
                backgroundColor: '#FF1B1C',
                color: 'white',
                borderRadius: "12px",
                fontSize: "18px",
              }}
              onClick={() => onCatch(pokemon)}
            >
              ❤️ Catch {pokemon.name}!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}