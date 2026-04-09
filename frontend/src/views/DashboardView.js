import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ItemGrid from "../components/ItemGrid";
import useDashboard from "../controllers/useDashboard";

function DashboardView() {
  const { listings, searchQuery, setSearchQuery, loading, error } = useDashboard();

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
          <ItemGrid listings={listings} />
        )}
      </main>
    </div>
  );
}

export default DashboardView;
