import { useNavigate } from 'react-router-dom';

function BackButton({ fallbackTo = '/', label = 'Back', className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button className={`button button-ghost back-button ${className}`.trim()} onClick={handleBack} type="button">
      <span>&lt;</span>
      <span>{label}</span>
    </button>
  );
}

export default BackButton;
