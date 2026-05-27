const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getName = (value, fallback = '') => {
  if (!value) return fallback;
  if (typeof value === 'object') return value.name || fallback;
  return value;
};

export const getDaysRemaining = (expiryDate, today = new Date()) => {
  if (!expiryDate) return Infinity;
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return Infinity;

  return Math.ceil((expiry - today) / MS_PER_DAY);
};

export const getExpirySeverity = (daysRemaining) => {
  if (daysRemaining <= 7) return 'emergency';
  if (daysRemaining <= 30) return 'warning';
  return 'tracking';
};

export const mapMedicineToExpiryRow = (medicine = {}, today = new Date()) => {
  const daysRemaining = getDaysRemaining(medicine.expiryDate, today);
  const stock = Number(medicine.stock || 0);
  const importPrice = Number(medicine.importPrice || 0);
  const categoryName = getName(medicine.category, '');
  const supplierName = getName(medicine.supplier, medicine.manufacturer || '');

  return {
    id: medicine._id || medicine.id,
    _id: medicine._id,
    name: medicine.name || '',
    description: [categoryName, supplierName].filter(Boolean).join(' / '),
    batch: medicine.batchNumber || medicine.code || '',
    expiryDate: medicine.expiryDate,
    daysRemaining,
    stock,
    unit: getName(medicine.unit, 'Viên'),
    value: stock * importPrice,
    severity: getExpirySeverity(daysRemaining),
  };
};

export const getExpirySummary = (rows = []) => rows.reduce(
  (acc, row) => ({
    emergencyCount: acc.emergencyCount + (row.severity === 'emergency' ? 1 : 0),
    warningCount: acc.warningCount + (row.severity === 'warning' ? 1 : 0),
    trackingCount: acc.trackingCount + (row.severity === 'tracking' ? 1 : 0),
  }),
  { emergencyCount: 0, warningCount: 0, trackingCount: 0 }
);
