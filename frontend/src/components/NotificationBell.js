import { useEffect, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../models/notificationModel";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadUnreadCount() {
    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadNotifications(currentPage = 1) {
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
    loadUnreadCount();
  }, []);

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
            {unreadCount}
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
              className="text-sm text-blue-600 hover:underline"
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
                  onClick={() => {
                    if (!item.is_read) {
                      handleMarkAsRead(item.id);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                    item.is_read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(item.created_at).toLocaleString()}
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