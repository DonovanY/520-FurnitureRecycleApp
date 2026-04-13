import { Link } from "react-router-dom";

const CONDITION_MAP = {
  like_new: { label: "Like New", classes: "bg-green-100 text-green-800" },
  good: { label: "Good", classes: "bg-blue-100 text-blue-800" },
  fair: { label: "Fair", classes: "bg-yellow-100 text-yellow-800" },
  poor: { label: "Poor", classes: "bg-red-100 text-red-800" },
};

function ItemCard({ listing }) {
  const condition = CONDITION_MAP[listing.condition_level] ?? {
    label: listing.condition_level || "Unknown",
    classes: "bg-gray-100 text-gray-800",
  };

  return (
    <Link
      to={`/item/${listing.id}`}
      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        {listing.primary_image_url ? (
          <img
            src={listing.primary_image_url}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image available</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {listing.title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${condition.classes}`}
          >
            {condition.label}
          </span>
        </div>

        {listing.city && (
          <div className="flex items-center text-gray-500 text-sm">
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {listing.city}
              {listing.state ? `, ${listing.state}` : ""}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ItemCard;