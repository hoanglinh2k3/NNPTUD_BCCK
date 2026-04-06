import { useContext, useEffect, useState } from 'react';
import { notificationApi } from '../../api/services';
import BackButton from '../../components/shared/BackButton';
import NotificationList from '../../components/customer/NotificationList';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SocketContext } from '../../contexts/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { usePageData } from '../../hooks/usePageData';

function NotificationPage() {
  const { user } = useAuth();
  const { notificationSocket } = useContext(SocketContext);
  const [items, setItems] = useState([]);
  const { data, loading } = usePageData(() => notificationApi.getAll(), []);

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  useEffect(() => {
    if (!notificationSocket) {
      return undefined;
    }

    const handleNewNotification = (notification) => {
      setItems((current) => [notification, ...current]);
    };

    notificationSocket.on('new_notification', handleNewNotification);

    return () => {
      notificationSocket.off('new_notification', handleNewNotification);
    };
  }, [notificationSocket]);

  if (loading) {
    return <LoadingSpinner label="Loading notifications..." />;
  }

  return (
    <section className="container page-stack">
      <div className="section-card notifications-head">
        <div>
          <span className="eyebrow">Notifications</span>
          <h1>Stay updated in real time</h1>
        </div>
        <div className="inline-actions">
          <button
            className="button button-secondary"
            onClick={async () => {
              await notificationApi.markAllRead();
              setItems((current) => current.map((item) => ({ ...item, isRead: true })));
            }}
            type="button"
          >
            Mark all as read
          </button>
          <BackButton fallbackTo={user?.role === 'Admin' || user?.role === 'Staff' ? '/admin' : '/'} />
        </div>
      </div>
      <section className="section-card">
        <NotificationList
          notifications={items}
          onRead={async (id) => {
            await notificationApi.markRead(id);
            setItems((current) =>
              current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
            );
          }}
        />
      </section>
    </section>
  );
}

export default NotificationPage;
