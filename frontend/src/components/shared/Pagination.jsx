function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="button button-secondary"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        type="button"
      >
        Previous
      </button>
      <span>
        Page {meta.page} / {meta.totalPages}
      </span>
      <button
        className="button button-secondary"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
        type="button"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
