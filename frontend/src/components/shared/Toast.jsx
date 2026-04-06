function Toast({ message, tone = 'info' }) {
  if (!message) {
    return null;
  }

  return <div className={`toast toast-${tone}`}>{message}</div>;
}

export default Toast;
