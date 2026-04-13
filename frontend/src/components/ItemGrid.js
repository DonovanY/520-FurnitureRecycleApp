import ItemCard from "./ItemCard";

function ItemGrid({ listings }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500">No items found.</p>
        <p className="text-sm text-gray-400 mt-2">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ItemCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

export default ItemGrid;