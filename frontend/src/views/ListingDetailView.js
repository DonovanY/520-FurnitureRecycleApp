import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function DetailMetaRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="w-32 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value || "N/A"}</span>
    </div>
  );
}

function ListingDetailView({
  listing,
  loading,
  error,
  condition,
  requestMessage,
  setRequestMessage,
  submittingRequest,
  requestSuccess,
  handleRequestItem,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Listings
          </Link>
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-400">Loading listing...</div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && listing && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 min-h-[320px] lg:min-h-[520px] flex items-center justify-center">
                  {listing.primary_image_url ? (
                    <img
                      src={listing.primary_image_url}
                      alt={listing.item?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No image available
                    </span>
                  )}
                </div>

                <div className="p-6 sm:p-8 flex flex-col">
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${condition.classes}`}
                      >
                        {condition.label}
                      </span>

                      {listing.item?.status && (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {listing.item.status}
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                      {listing.item?.title}
                    </h1>

                    {listing.location && (
                      <div className="mt-3 flex items-center text-gray-500 text-sm">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
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
                          {listing.location.city}
                          {listing.location.state
                            ? `, ${listing.location.state}`
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pb-6 border-b border-gray-100">
                    <DetailMetaRow
                      label="Category"
                      value={listing.item?.category || "Furniture"}
                    />
                    <DetailMetaRow
                      label="Condition"
                      value={condition.label}
                    />
                    <DetailMetaRow
                      label="Origin Type"
                      value={listing.item?.origin_type || "Unknown"}
                    />
                    <DetailMetaRow
                      label="Availability"
                      value={listing.item?.status || "Available"}
                    />
                  </div>

                  <div className="py-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h2>
                    <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
                      {listing.item?.description ||
                        "No description has been provided for this item."}
                    </p>
                  </div>

                  <div className="pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Request This Item
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Send a short message to let the owner know why you are
                      interested and coordinate next steps.
                    </p>

                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Hi! I'm interested in this item and would love to arrange a pickup."
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />

                    {requestSuccess && (
                      <div className="mt-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                        {requestSuccess}
                      </div>
                    )}

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleRequestItem}
                        disabled={submittingRequest}
                        className="inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium px-6 py-3 transition-colors"
                      >
                        {submittingRequest ? "Submitting..." : "Request This Item"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListingDetailView;