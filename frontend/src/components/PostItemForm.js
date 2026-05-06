/**
 * PostItemForm.js
 *
 * Stateless form component for creating a new listing.
 * Receives all state and handlers from usePostItem controller.
 */

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500";

const selectClass = `${inputClass} cursor-pointer`;

function FieldGroup({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function PostItemForm({
  title,
  setTitle,
  category,
  setCategory,
  conditionLevel,
  setConditionLevel,
  originType,
  setOriginType,
  city,
  setCity,
  description,
  setDescription,
  pickupType,
  setPickupType,
  pickupNotes,
  setPickupNotes,
  imageUrl,
  setImageUrl,
  loading,
  error,
  success,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && !error && (
        <div className="mb-6 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Listing created successfully! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Basic Info Section */}
        <div className="sm:col-span-2 space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

          <FieldGroup label="Item Title" required>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g., Dining Table"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup label="Category" required>
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
              <option value="Appliances">Appliances</option>
              <option value="Decor">Decor</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
          </FieldGroup>

          <FieldGroup label="Description">
            <textarea
              className={inputClass}
              rows="4"
              placeholder="Describe the item's features, size, and any relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FieldGroup>
        </div>

        {/* Condition & Origin */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
            Condition & Origin
          </h3>

          <FieldGroup label="Condition" required>
            <select
              className={selectClass}
              value={conditionLevel}
              onChange={(e) => setConditionLevel(e.target.value)}
              required
            >
              <option value="">Select condition</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </FieldGroup>

          <FieldGroup label="Where did you get this item?" required>
            <select
              className={selectClass}
              value={originType}
              onChange={(e) => setOriginType(e.target.value)}
              required
            >
              <option value="">Select origin</option>
              <option value="owned">I owned it</option>
              <option value="street_find">Street find</option>
            </select>
          </FieldGroup>
        </div>

        {/* Location & Pickup */}
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Location & Pickup</h3>

          <FieldGroup label="City" required>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g., Amherst, Northampton, Hadley"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Your city helps people find items nearby</p>
          </FieldGroup>

          <FieldGroup label="Pickup Type">
            <select
              className={selectClass}
              value={pickupType}
              onChange={(e) => setPickupType(e.target.value)}
            >
              <option value="">Select pickup type</option>
              <option value="owner_meetup">Meet with owner</option>
              <option value="curbside">Curbside pickup</option>
              <option value="street_find">Street location</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How should people pick up this item?</p>
          </FieldGroup>

          <FieldGroup label="Pickup Notes">
            <textarea
              className={inputClass}
              rows="3"
              placeholder="e.g., Available weekends after 2pm, Near Amherst Commons on Main St, Left curbside at 123 College Ave..."
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Share your availability, general area/neighborhood, or specific location.
              <span className="block mt-0.5">
                💡 Tip: For privacy, share exact address only after someone requests the item
              </span>
            </p>
          </FieldGroup>
        </div>

        {/* Image URL */}
        <div className="sm:col-span-2 space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Image (Optional)</h3>

          <FieldGroup label="Image URL">
            <input
              className={inputClass}
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste a public image URL (e.g., from Imgur, Unsplash). Must be under 2000 characters.
              <span className="block text-red-500 mt-0.5">
                ⚠️ Do not paste base64 data URLs (starting with "data:image")
              </span>
            </p>
          </FieldGroup>

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Preview:</p>
              <div className="rounded-lg border border-gray-200 overflow-hidden w-full h-48 bg-gray-100 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = `<span class="text-gray-400 text-sm">Invalid image URL</span>`;
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}

export default PostItemForm;
