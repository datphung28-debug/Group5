export const STATUS_META = {
  complete: { label: 'Đủ công', color: 'var(--color-profit)', bg: 'var(--color-profit-bg)', border: 'var(--color-profit)' },
  late: { label: 'Đi muộn', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning)' },
  missing: { label: 'Thiếu chấm công', color: 'var(--color-debt)', bg: 'var(--color-debt-bg)', border: 'var(--color-debt)' },
  overtime: { label: 'Tăng ca', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', border: 'var(--color-primary-border)' },
};

export const METHOD_META = {
  pos: 'POS',
  manual: 'Thủ công',
  mobile: 'Mobile',
};
