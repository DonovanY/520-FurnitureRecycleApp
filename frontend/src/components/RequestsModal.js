/**
 * RequestsModal.js
 *
 * Modal component for displaying requests for a listing.
 */

import { useEffect, useState } from "react";
import { fetchListingRequests } from "../models/listingRequestsModel";
import { updateRequestStatus } from "../models/requestActionsModel";
import ChatModal from "./ChatModal";

function RequestsModal({ listingId, listingTitle, onClose, onRequestUpdated }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [listingId]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchListingRequests(listingId);
      setRequests(data);
    } catch (err) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setActionLoading(requestId);
      await updateRequestStatus(requestId, "accepted");
      await loadRequests();
      if (onRequestUpdated) onRequestUpdated();
    } catch (err) {
      setError(err.message || "Failed to accept request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setActionLoading(requestId);
      await updateRequestStatus(requestId, "rejected");
      await loadRequests();
      if (onRequestUpdated) onRequestUpdated();
    } catch (err) {
      setError(err.message || "Failed to decline request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenChat = (request) => {
    setSelectedRequester({
      id: request.requester.id,
      name: request.requester.full_name || request.requester.email,
    });
    setChatOpen(true);
  };

  return (
    <>
      {chatOpen && selectedRequester && (
        <ChatModal
          listingId={listingId}
          listingTitle={listingTitle}
          otherUserId={selectedRequester.id}
          otherUserName={selectedRequester.name}
          onClose={() => {
            setChatOpen(false);
            setSelectedRequester(null);
          }}
        />
      )}

      {!chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Requests</h2>
                <p className="text-sm text-gray-500 mt-0.5">{listingTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Loading requests...</div>
                </div>
              )}

              {error && !loading && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!loading && !error && requests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="h-12 w-12 text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">No requests yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    When someone requests this item, they'll appear here.
                  </p>
                </div>
              )}

              {!loading && !error && requests.length > 0 && (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {request.requester.full_name || request.requester.email}
                          </p>
                          {request.requester.full_name && (
                            <p className="text-sm text-gray-500">{request.requester.email}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                          {request.message}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecline(request.id)}
                              disabled={actionLoading === request.id}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === request.id ? "..." : "Decline"}
                            </button>
                            <button
                              onClick={() => handleAccept(request.id)}
                              disabled={actionLoading === request.id}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === request.id ? "..." : "Accept"}
                            </button>
                          </div>
                        )}
                        {request.status === "accepted" && (
                          <button
                            onClick={() => handleOpenChat(request)}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            💬 Message
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RequestsModal;
