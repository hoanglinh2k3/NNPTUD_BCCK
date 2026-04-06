function EmptyState({
  title = 'Nothing here yet',
  description = 'Try changing the filters or adding new data.',
  action
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action || null}
    </div>
  );
}

export default EmptyState;
