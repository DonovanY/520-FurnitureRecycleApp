import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ItemGrid from "../components/ItemGrid";
import MapView from "../components/MapView";
import ItemScrollRow from "../components/ItemScrollRow";
import useDashboard from "../controllers/useDashboard";

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function DashboardView() {
  const {
    listings,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    page,
    total,
    totalPages,
    goToPrevPage,
    goToNextPage,
  } = useDashboard();

  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const isMapMode = viewMode === "map";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Available Items</h1>
          <p className="text-gray-500 mt-1">Find free furniture in your community.</p>
        </div>

        {/* Search bar + view toggle */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Toggle button */}
          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                !isMapMode
                  ? "bg-green-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <GridIcon />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              type="button"
              onClick={() => setViewMode("map")}
              title="Map view"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                isMapMode
                  ? "bg-green-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <MapIcon />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 text-center py-8">{error}</div>}

        {!error && loading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {!error && !loading && (
          <>
            {isMapMode ? (
              <>
                <MapView listings={listings} />

                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Items on this page
                  </h2>
                  <ItemScrollRow listings={listings} />
                </div>
              </>
            ) : (
              <ItemGrid listings={listings} />
            )}

            {/* Pagination — shown in both modes */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages} · {total} items
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goToPrevPage}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardView;
