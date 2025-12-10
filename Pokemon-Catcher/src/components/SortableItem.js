import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, pokemon, data }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="team-card">
      <img src={pokemon.image} alt="" />
      <p>{pokemon.nickname}</p>
    </div>
  );
}
