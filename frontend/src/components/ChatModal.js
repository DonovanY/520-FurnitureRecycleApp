/**
 * ChatModal.js
 *
 * Modal component for messaging between poster and requester.
 */

import { useEffect, useState, useRef } from "react";
import { fetchConversation, sendMessage } from "../models/requestActionsModel";

function ChatModal({
  listingId,
  listingTitle,
  otherUserId,
  otherUserName: propOtherUserName,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState(propOtherUserName || "");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
    // Only poll if no error (prevents retrying on validation errors)
    const interval = !error ? setInterval(loadConversation, 5000) : null;
    return () => interval && clearInterval(interval);
  }, [listingId, error]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === "function"
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchConversation(listingId);
      setMessages(data.messages);
      setOtherUserName(data.other_user_name || "User");
    } catch (err) {
      setError(err.message || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    try {
      setSending(true);
      setError("");
      await sendMessage(listingId, otherUserId, messageInput.trim());
      setMessageInput("");
      await loadConversation();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chat with {otherUserName}</h2>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
          {loading && messages.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading messages...</div>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-900">No messages yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Start the conversation by sending a message below.
              </p>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender_user_id !== otherUserId;
                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-shadow"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;
