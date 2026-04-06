import { getStatusTone } from '../../utils/format';

function StatusBadge({ value }) {
  return <span className={`pill pill-${getStatusTone(value)}`}>{value}</span>;
}

export default StatusBadge;
