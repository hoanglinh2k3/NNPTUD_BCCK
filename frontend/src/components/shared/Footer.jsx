import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell glass-panel">
        <div className="footer-grid">
          <div>
            <span className="eyebrow">Decor Shop</span>
            <h3>Designed to feel calm, warm, and lived in.</h3>
            <p>Thoughtful decor picks for bedrooms, living corners, and calm workspaces.</p>
          </div>
          <div>
            <strong>Customer care</strong>
            <p>Order support, account help, and shipping guidance every day.</p>
          </div>
          <div>
            <strong>Collections</strong>
            <p>Lamps, mirrors, art, vases, shelves, candles, and workspace accents.</p>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/products">Browse catalog</Link>
          <Link to="/chat">Support chat</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/profile">Account</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
