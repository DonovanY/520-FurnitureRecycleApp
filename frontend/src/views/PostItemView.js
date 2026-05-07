import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostItemForm from "../components/PostItemForm";
import usePostItem from "../controllers/usePostItem";
import { fetchListingById } from "../api/listingsApi";

function PostItemView() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [initialData, setInitialData] = useState(null);
  const [prefillLoading, setPrefillLoading] = useState(!!editId);
  const [prefillError, setPrefillError] = useState("");

  useEffect(() => {
    if (!editId) return;
    fetchListingById(editId)
      .then((data) => setInitialData(data))
      .catch(() => setPrefillError("Could not load listing for editing."))
      .finally(() => setPrefillLoading(false));
  }, [editId]);

  const formProps = usePostItem(
    editId ? { initialData, listingId: editId } : undefined
  );

  const isEdit = !!editId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEdit ? "Edit Listing" : "Add a New Item"}
            </h1>
            <p className="text-gray-500">
              {isEdit ? "Update your listing details" : "Share furniture with your community"}
            </p>
          </div>

          {prefillLoading && (
            <div className="text-center py-12 text-gray-400">Loading listing...</div>
          )}

          {prefillError && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {prefillError}
            </div>
          )}

          {!prefillLoading && !prefillError && (
            <PostItemForm {...formProps} isEdit={isEdit} />
          )}
        </div>
      </main>
    </div>
  );
}

export default PostItemView;
