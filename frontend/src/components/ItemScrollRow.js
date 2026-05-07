import { useEffect, useRef } from "react";
import ItemCard from "./ItemCard";

export default function ItemScrollRow({ listings, selectedId }) {
  const containerRef = useRef(null);

  // Selected item floats to the front
  const ordered = selectedId
    ? [
        ...listings.filter((l) => l.id === selectedId),
        ...listings.filter((l) => l.id !== selectedId),
      ]
    : listings;

  // Scroll back to the left edge whenever selection changes
  useEffect(() => {
    if (selectedId && containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [selectedId]);

  if (!listings.length) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">No items to display.</p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex gap-4 overflow-x-auto py-6 px-4"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
    >
      {ordered.map((listing) => {
        const isSelected = listing.id === selectedId;
        return (
          <div
            key={listing.id}
            className={`flex-none w-60 rounded-xl transition-all duration-200 ${
              isSelected
                ? "outline outline-[2.5px] outline-green-500 scale-[1.06] z-10 shadow-xl"
                : "scale-100 z-0"
            }`}
          >
            <ItemCard listing={listing} />
          </div>
        );
      })}
    </div>
  );
}
