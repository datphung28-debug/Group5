export const PAYROLL_STATUS_META = {
  draft: {
    label: 'Nháp',
    color: 'var(--color-text-secondary)',
    bg: 'var(--color-bg-subtle)',
    border: 'var(--color-border)',
  },
  pending: {
    label: 'Chờ duyệt',
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-bg)',
    border: 'var(--color-warning)',
  },
  approved: {
    label: 'Đã duyệt',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
    border: 'var(--color-primary-border)',
  },
  paid: {
    label: 'Đã chi trả',
    color: 'var(--color-profit)',
    bg: 'var(--color-profit-bg)',
    border: 'var(--color-profit)',
  },
};
