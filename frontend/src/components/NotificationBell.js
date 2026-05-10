import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../models/notificationModel";
import { useAuth } from "../context/AuthContext";

function getNotificationTarget(item) {
  switch (item.type) {
    case "new_request":
      return {
        pathname: "/profile",
        search: `?tab=posted&openRequests=1&listingId=${item.listing_id || ""}`,
        state: {
          openRequests: true,
          listingId: item.listing_id,
          requestId: item.request_id,
        },
      };

    case "new_message":
      return {
        pathname: item.listing_id ? `/item/${item.listing_id}` : "/profile",
        search: item.message_id
          ? `?openChat=1&messageId=${item.message_id}`
          : "?openChat=1",
        state: {
          openChat: true,
          listingId: item.listing_id,
          messageId: item.message_id,
        },
      };

    case "request_accepted":
      return {
        pathname: item.listing_id ? `/item/${item.listing_id}` : "/profile",
        search: "?openChat=1",
        state: {
          openChat: true,
          listingId: item.listing_id,
          requestId: item.request_id,
        },
      };

    case "request_rejected":
      return {
        pathname: item.listing_id ? `/item/${item.listing_id}` : "/profile",
        search: "",
        state: {
          listingId: item.listing_id,
          requestId: item.request_id,
        },
      };

    default:
      return item.listing_id
        ? {
            pathname: `/item/${item.listing_id}`,
            search: "",
            state: {},
          }
        : {
            pathname: "/profile",
            search: "",
            state: {},
          };
  }
}

function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadUnreadCount() {
    if (!user) return;

    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadNotifications(currentPage = 1) {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const data = await fetchNotifications({
        page: currentPage,
        pageSize,
      });

      setNotifications(data.items ?? []);
      setUnreadCount(data.unread_count ?? 0);
      setTotalPages(data.total_pages ?? 1);
      setPage(data.page ?? currentPage);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();

    const intervalId = setInterval(() => {
      if (open) {
        loadNotifications(page);
      } else {
        loadUnreadCount();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [user, open, page]);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications(1);
    }
  }

  async function handleMarkAsRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotificationClick(item) {
    if (!item.is_read) {
      await handleMarkAsRead(item.id);
    }

    setOpen(false);

    const target = getNotificationTarget(item);

    navigate(
      {
        pathname: target.pathname,
        search: target.search,
      },
      {
        state: target.state,
      }
    );
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePrevPage() {
    if (page > 1) {
      await loadNotifications(page - 1);
    }
  }

  async function handleNextPage() {
    if (page < totalPages) {
      await loadNotifications(page + 1);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-1.29 1.29A1 1 0 0 0 5 19h14a1 1 0 0 0 .71-1.71L18 16z" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>

            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-sm text-gray-500">Loading...</div>
            )}

            {error && (
              <div className="px-4 py-6 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-500">
                No notifications.
              </div>
            )}

            {!loading &&
              !error &&
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                    item.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.is_read && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {item.title}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        {item.message}
                      </div>

                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="text-sm px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className="text-sm px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;