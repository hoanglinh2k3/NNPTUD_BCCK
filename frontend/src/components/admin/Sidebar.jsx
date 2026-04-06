import { Link, NavLink } from 'react-router-dom';
import { adminMenu } from '../../assets/mock-data';
import { useAuth } from '../../hooks/useAuth';

function Sidebar() {
  const { user, logout } = useAuth();
  const filteredMenu = adminMenu.filter((item) => {
    if (user?.role !== 'Admin' && ['/admin/users', '/admin/roles'].includes(item.path)) {
      return false;
    }

    return true;
  });
  const userInitial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'D';

  return (
    <aside className="admin-sidebar glass-panel">
      <div className="admin-brand">
        <span className="eyebrow">Operations</span>
        <strong>Decor Console</strong>
        <p>Daily order flow, stock control, customer chat, and live notifications in one surface.</p>
      </div>
      <nav className="admin-nav">
        {filteredMenu.map((item) => (
          <NavLink
            className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
            key={item.path}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-footer glass-ribbon">
        <div className="admin-user-card">
          <span className="avatar-pill admin-avatar">{userInitial}</span>
          <div className="account-copy">
            <strong>{user?.fullName}</strong>
            <small>{user?.role}</small>
          </div>
        </div>
        <div className="admin-sidebar-actions">
          <Link className="button button-secondary" to="/">
            Storefront
          </Link>
          <button className="button button-primary admin-logout" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
