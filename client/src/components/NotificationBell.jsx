
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Clock
} from 'lucide-react';

import api from '../services/api';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'ticket_assigned':
      return <UserPlus size={17} />;

    case 'ticket_commented':
      return <MessageSquare size={17} />;

    case 'ticket_status_changed':
      return <RefreshCw size={17} />;

    case 'ticket_due_soon':
      return <Clock size={17} />;

    default:
      return <Bell size={17} />;
  }
};

const formatTime = (date) => {
  const notificationDate = new Date(date);
  const now = new Date();

  const difference = Math.floor(
    (now.getTime() - notificationDate.getTime()) / 1000
  );

  if (Number.isNaN(difference)) {
    return '';
  }

  if (difference < 60) {
    return 'Just now';
  }

  if (difference < 3600) {
    return `${Math.floor(difference / 60)}m ago`;
  }

  if (difference < 86400) {
    return `${Math.floor(difference / 3600)}h ago`;
  }

  if (difference < 604800) {
    return `${Math.floor(difference / 86400)}d ago`;
  }

  return notificationDate.toLocaleDateString();
};

const NotificationBell = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await api.getNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await api.markNotificationRead(notification._id);

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (err) {
      setError(err.message || 'Unable to update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Unable to update notifications.');
    }
  };

  const handleDelete = async (id) => {
    const notification = notifications.find(
      (item) => item._id === id
    );

    try {
      await api.deleteNotification(id);

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (notification && !notification.isRead) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }
    } catch (err) {
      setError(err.message || 'Unable to delete notification.');
    }
  };

  const handleNotificationClick = async (notification) => {
    await handleMarkAsRead(notification);

    setIsOpen(false);

    if (notification.ticket?._id) {
      navigate(`/tickets/${notification.ticket._id}`);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);

          if (nextState) {
            fetchNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {unreadCount} unread notifications
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-violet-400"
                  >
                    <CheckCheck size={17} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {error && (
              <div className="border-b border-red-900/40 bg-red-950/30 px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-zinc-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
                    <Bell size={22} />
                  </div>

                  <p className="text-sm font-medium text-white">
                    You're all caught up
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`group flex gap-3 border-b border-zinc-800/70 px-4 py-4 transition hover:bg-zinc-900/70 ${
                      !notification.isRead ? 'bg-violet-500/[0.04]' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className="flex min-w-0 flex-1 gap-3 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-5 text-zinc-200">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[11px] text-zinc-500">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete notification"
                      className="h-8 shrink-0 rounded-lg p-2 text-zinc-600 opacity-100 transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zinc-800 px-4 py-3">
              <p className="text-center text-[11px] text-zinc-600">
                Showing your 50 most recent notifications
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
