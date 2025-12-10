import { useRef } from "react";

const typeColors = {
	fire: '#FF6961',
	water: '#77B5FE',
	grass: '#77DD77',
	electric: '#FFDB58',
	psychic: '#F4C2C2',
	ice: '#A0E7E5',
	dragon: '#97B3E6',
	dark: '#A9A9A9',
	fairy: '#FFDFD3',
	normal: '#E6E6FA',
	fighting: '#FFD1DC',
	flying: '#E6E6FA',
	poison: '#DDA0DD',
	ground: '#F4A460',
	rock: '#D2B48C',
	bug: '#F0E68C',
	ghost: '#E0BBE4',
	steel: '#B0C4DE',
};

export default function PokemonCard({ pokemon, onCardClick }) {
  const cardRef = useRef(null);

  const primaryType = pokemon.types[0];
  const cardStyle = {
    background: `linear-gradient(135deg, ${
      typeColors[primaryType] || "#f0f0f0"
    } 30%, #ffffff 100%)`,
  };

  return (
    <div ref={cardRef} onClick={() => onCardClick(cardRef.current)} className="pokemon-card-link w-100" style={{ cursor: 'pointer' }}>
      <div className="card pokemon-card h-100">
        <span className="pokemon-card-id">#{String(pokemon.id).padStart(3, "0")}</span>
        <div className="pokemon-card-image-bg" style={cardStyle}>
          <img src={pokemon.image} alt={pokemon.name} className="pokemon-card-image" />
        </div>
        <div className="card-body text-center p-2">
          <h5 className="card-title text-capitalize pokemon-card-name mb-1">{pokemon.name}</h5>
          <div className="types">
            {pokemon.types.map((t) => (
              <span
                key={t}
                className="type-badge me-1"
                style={{ backgroundColor: typeColors[t] || '#E6E6FA', color: '#333' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
