import ItemCard from "./ItemCard";

export default function ItemScrollRow({ listings }) {
  if (!listings.length) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">No items to display.</p>
    );
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-3"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
    >
      {listings.map((listing) => (
        <div key={listing.id} className="flex-none w-60">
          <ItemCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
