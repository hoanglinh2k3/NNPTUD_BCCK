import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Topbar() {
  const { user } = useAuth();
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="admin-topbar glass-panel">
      <div>
        <span className="eyebrow">Admin / Staff</span>
        <h2>Decor operations dashboard</h2>
        <p>{formattedDate}</p>
      </div>
      <div className="admin-topbar-actions">
        <Link className="button button-secondary" to="/admin/profile">
          Profile
        </Link>
        <Link className="button button-ghost" to="/">
          View storefront
        </Link>
        <div className="admin-topbar-user">
          <strong>{user?.fullName}</strong>
          <span>{user?.role}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
