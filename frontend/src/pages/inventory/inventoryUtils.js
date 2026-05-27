export const getName = (value, fallback = '') => {
  if (!value) return fallback;
  if (typeof value === 'object') return value.name || fallback;
  return value;
};

export const mapMedicineToInventoryRow = (medicine = {}, index = 0) => {
  const stock = Number(medicine.stock || 0);
  const minStock = Number(medicine.minStock || 0);
  const importPrice = Number(medicine.importPrice || 0);

  return {
    id: medicine._id || medicine.id || String(index),
    _id: medicine._id,
    code: medicine.code || '',
    name: medicine.name || '',
    ingredient: medicine.ingredients || medicine.genericName || medicine.ingredient || '',
    manufacturer: medicine.manufacturer || '',
    category: getName(medicine.category, ''),
    categoryId: medicine.category?._id || medicine.category || '',
    batches: Array.isArray(medicine.batches) ? medicine.batches : [],
    totalStock: stock,
    minStock,
    unit: getName(medicine.unit, 'Viên'),
    nearestExpiry: medicine.expiryDate || medicine.nearestExpiry || null,
    location: medicine.location || null,
    inventoryValue: stock * importPrice,
  };
};

export const getDaysToExpiry = (date, today = new Date()) => {
  if (!date) return Infinity;
  const expiryDate = new Date(date);
  if (Number.isNaN(expiryDate.getTime())) return Infinity;

  return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
};

export const getInventoryStatus = (record, today = new Date()) => {
  const daysToExpiry = getDaysToExpiry(record.nearestExpiry, today);

  if (record.totalStock === 0) {
    return { label: 'Hết hàng', color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' };
  }

  if (daysToExpiry <= 30) {
    return { label: 'Cảnh báo HSD', color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' };
  }

  if (record.totalStock <= record.minStock) {
    return { label: 'Sắp hết', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' };
  }

  if (daysToExpiry <= 90) {
    return { label: 'Cảnh báo HSD', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' };
  }

  return { label: 'Bình thường', color: 'var(--color-profit)', bgColor: 'var(--color-profit-bg)' };
};

export const getInventorySummary = (rows = [], today = new Date()) => rows.reduce(
  (acc, row) => {
    const daysToExpiry = getDaysToExpiry(row.nearestExpiry, today);

    return {
      totalItems: acc.totalItems + 1,
      inventoryValue: acc.inventoryValue + row.inventoryValue,
      expiringSoonCount: acc.expiringSoonCount + (daysToExpiry <= 30 ? 1 : 0),
      lowStockCount: acc.lowStockCount + (row.totalStock <= row.minStock ? 1 : 0),
    };
  },
  { totalItems: 0, inventoryValue: 0, expiringSoonCount: 0, lowStockCount: 0 }
);
