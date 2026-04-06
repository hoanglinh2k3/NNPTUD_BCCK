import { formatDate } from '../../utils/format';
import EmptyState from '../shared/EmptyState';

function NotificationList({ notifications = [], onRead }) {
  if (!notifications.length) {
    return (
      <EmptyState
        description="New order updates, chat alerts, and staff messages will appear here."
        title="No notifications yet"
      />
    );
  }

  return (
    <div className="stack-list">
      {notifications.map((notification) => (
        <article className={`notification-card ${notification.isRead ? '' : 'is-unread'}`} key={notification.id}>
          <div>
            <strong>{notification.title}</strong>
            <p>{notification.content}</p>
            <span>{formatDate(notification.createdAt)}</span>
          </div>
          {!notification.isRead ? (
            <button className="button button-ghost" onClick={() => onRead?.(notification.id)} type="button">
              Mark read
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default NotificationList;
