import Navbar from "../components/Navbar";
import PostItemForm from "../components/PostItemForm";
import usePostItem from "../controllers/usePostItem";

function PostItemView() {
  const formProps = usePostItem();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add a New Item</h1>
            <p className="text-gray-500">Share furniture with your community</p>
          </div>

          {/* Form */}
          <PostItemForm {...formProps} />
        </div>
      </main>
    </div>
  );
}

export default PostItemView;
