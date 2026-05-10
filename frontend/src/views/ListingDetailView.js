import Navbar from "../components/Navbar";
import ChatModal from "../components/ChatModal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function DetailMetaRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="w-32 text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">
        {value || "N/A"}
      </span>
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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [chatOpen, setChatOpen] = useState(false);
  const [autoChatHandled, setAutoChatHandled] = useState(false);

  const isOwner = !!user && !!listing?.owner?.id && user.id === listing.owner.id;

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const shouldOpenChat =
      params.get("openChat") === "1" || location.state?.openChat === true;

    if (!shouldOpenChat || !listing || autoChatHandled) {
      return;
    }

    setChatOpen(true);
    setAutoChatHandled(true);
  }, [location.search, location.state, listing, autoChatHandled]);

  function handleCloseChat() {
    setChatOpen(false);

    const params = new URLSearchParams(location.search);
    if (params.has("openChat") || params.has("messageId")) {
      params.delete("openChat");
      params.delete("messageId");

      navigate(
        {
          pathname: location.pathname,
          search: params.toString() ? `?${params.toString()}` : "",
        },
        {
          replace: true,
          state: null,
        }
      );
    }
  }

  return (
    <>
      {chatOpen && listing && (
        <ChatModal
          listingId={listing.id}
          listingTitle={listing.item?.title}
          otherUserId={listing.owner?.id}
          otherUserName={listing.owner?.full_name || listing.owner?.email}
          onClose={handleCloseChat}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>

          {loading && (
            <div className="text-center py-20 text-gray-400">
              Loading listing...
            </div>
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
                          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${condition.classes}`}
                        >
                          {condition.label}
                        </span>

                        {listing.item?.status && (
                          <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-800">
                            {listing.item.status}
                          </span>
                        )}
                      </div>

                      <h1 className="text-3xl font-bold text-gray-900">
                        {listing.item?.title}
                      </h1>

                      {listing.location &&
                        (listing.location.address_line_1 ||
                          listing.location.city) && (
                          <div className="mt-3 flex items-start text-gray-500 text-sm">
                            <svg
                              className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
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

                            <span className="leading-snug">
                              {listing.location.address_line_1 ? (
                                <>
                                  {listing.location.address_line_1}
                                  {listing.location.address_line_2 &&
                                    `, ${listing.location.address_line_2}`}
                                  {listing.location.city &&
                                    `, ${listing.location.city}`}
                                  {listing.location.state &&
                                    `, ${listing.location.state}`}
                                </>
                              ) : (
                                <>
                                  {listing.location.city}
                                  {listing.location.state
                                    ? `, ${listing.location.state}`
                                    : ""}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="space-y-4 pb-6 border-b border-gray-100">
                      <DetailMetaRow
                        label="Category"
                        value={listing.item?.category || "Furniture"}
                      />
                      <DetailMetaRow label="Condition" value={condition.label} />
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

                    {(listing.pickup_type || listing.pickup_notes) && (
                      <div className="py-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                          Pickup Information
                        </h2>

                        {listing.pickup_type && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-600">
                              Pickup Type:{" "}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {listing.pickup_type === "owner_meetup" &&
                                "Meet with owner"}
                              {listing.pickup_type === "curbside" &&
                                "Curbside pickup"}
                              {listing.pickup_type === "street_find" &&
                                "Street location"}
                            </span>
                          </div>
                        )}

                        {listing.pickup_notes && (
                          <div>
                            <p className="text-sm leading-6 text-gray-600 whitespace-pre-line">
                              {listing.pickup_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-6">
                      {isOwner ? (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Manage Your Listing
                          </h2>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <p className="text-sm text-gray-500 mb-4">
                              This is your listing. Requests from interested
                              users appear in your profile under Posted Items.
                            </p>
                            <Link
                              to={`/post?edit=${listing.id}`}
                              className="inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-3 transition-colors"
                            >
                              Edit Listing
                            </Link>
                          </div>
                        </div>
                      ) : listing.user_request ? (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Your Request
                          </h2>
                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    listing.user_request.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : listing.user_request.status ===
                                          "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {listing.user_request.status
                                    .charAt(0)
                                    .toUpperCase() +
                                    listing.user_request.status.slice(1)}
                                </span>
                              </div>

                              <span className="text-xs text-gray-500">
                                {new Date(
                                  listing.user_request.created_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            {listing.user_request.message && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Your message:
                                </p>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-200">
                                  {listing.user_request.message}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <p className="text-xs text-blue-700">
                                {listing.user_request.status === "accepted"
                                  ? "Your request has been accepted! Use the message button to coordinate pickup."
                                  : "You've already requested this item. The owner will contact you if they accept your request."}
                              </p>

                              {listing.user_request.status === "accepted" && (
                                <button
                                  onClick={() => setChatOpen(true)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                  💬 Message
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Request This Item
                          </h2>
                          <p className="text-sm text-gray-500 mb-4">
                            Send a short message to let the owner know why you
                            are interested and coordinate next steps.
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
                              {submittingRequest
                                ? "Submitting..."
                                : "Request This Item"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default ListingDetailView;