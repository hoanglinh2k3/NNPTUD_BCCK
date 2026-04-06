import { useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../../hooks/useAuth';

function Header() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const { user, logout } = useAuth();
  const isAdminConsole = user?.role === 'Admin' || user?.role === 'Staff';
  const accountPath = isAdminConsole ? '/admin/profile' : '/profile';
  const userInitial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'D';

  useEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) {
      return undefined;
    }

    const syncHeaderHeight = () => {
      const nextHeight = Math.ceil(headerElement.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--site-header-height', `${nextHeight}px`);
    };

    syncHeaderHeight();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncHeaderHeight) : null;

    resizeObserver?.observe(headerElement);
    window.addEventListener('resize', syncHeaderHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncHeaderHeight);
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container site-header-stack">
        <div className="top-strip glass-ribbon">
          <div className="top-strip-links">
            <span className="top-strip-note">Curated decor with calm textures, warm light, and quick support.</span>
          </div>
          <div className="top-strip-links">
            <Link to="/chat">Support</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to={isAdminConsole ? '/admin/orders' : '/orders'}>My orders</Link>
          </div>
        </div>

        <div className="header-main glass-panel">
          <div className="header-main-row">
            <Link className="brand-mark" to="/">
              <span>Terracotta</span>
              <strong>Decor Shop</strong>
            </Link>

            <nav className="header-nav">
              <NavLink className={({ isActive }) => `header-nav-link ${isActive ? 'is-active' : ''}`} end to="/">
                Home
              </NavLink>
              <NavLink className={({ isActive }) => `header-nav-link ${isActive ? 'is-active' : ''}`} to="/products">
                Shop
              </NavLink>
              {user ? (
                <NavLink
                  className={({ isActive }) => `header-nav-link ${isActive ? 'is-active' : ''}`}
                  to={isAdminConsole ? '/admin' : '/orders'}
                >
                  {isAdminConsole ? 'Dashboard' : 'Orders'}
                </NavLink>
              ) : null}
            </nav>

            <div className="header-actions">
              {!isAdminConsole ? (
                <div className="header-icons">
                  <NavLink className="header-action-link" to="/notifications">
                    Notifications
                  </NavLink>
                  <NavLink className="header-action-link" to="/chat">
                    Chat
                  </NavLink>
                  <NavLink className="header-action-link" to="/cart">
                    Cart
                  </NavLink>
                </div>
              ) : (
                <div className="header-icons">
                  <Link className="header-action-link" to="/admin">
                    Console
                  </Link>
                </div>
              )}

              {user ? (
                <div className="account-cluster">
                  <Link className="account-pill" to={accountPath}>
                    <span className="avatar-pill">{userInitial}</span>
                    <span className="account-copy">
                      <strong>{user.fullName}</strong>
                      <small>{user.role}</small>
                    </span>
                  </Link>
                  <button className="button button-primary header-logout" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-actions">
                  <Link className="button button-ghost" to="/register">
                    Register
                  </Link>
                  <Link className="button button-primary" to="/login">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          <SearchBar
            buttonLabel="Find decor"
            className="header-search"
            placeholder="Search for decor lamps, mirrors, wall art..."
            onSearch={(keyword) => navigate(`/products?keyword=${encodeURIComponent(keyword)}`)}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
