import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ItemGrid from "../components/ItemGrid";
import useDashboard from "../controllers/useDashboard";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Available Items</h1>
          <p className="text-gray-500 mt-1">Find free furniture in your community.</p>
        </div>

        <div className="mb-6 max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {error && (
          <div className="text-red-600 text-center py-8">{error}</div>
        )}

        {!error && loading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {!error && !loading && (
          <>
            <ItemGrid listings={listings} />

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