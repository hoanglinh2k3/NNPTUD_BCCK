function Drawer({ open, title, children, onClose }) {
  return (
    <div className={`drawer ${open ? 'is-open' : ''}`}>
      <div className="drawer-head">
        <h3>{title}</h3>
        <button className="link-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
      {children}
    </div>
  );
}

export default Drawer;
