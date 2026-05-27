const toIsoString = (value) => value?.toISOString?.();

const stripUndefined = (payload) => Object.fromEntries(
  Object.entries(payload).filter(([, value]) => value !== undefined)
);

export const getValidPurchaseItems = (items = []) => items.filter((item) => item.medicineId);

export const summarizePurchaseItems = ({ items = [], discountPercent = 0 }) => {
  const totalItems = getValidPurchaseItems(items).length;
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const importPrice = Number(item.importPrice || 0);
    const discount = Number(item.discount || 0);
    return sum + quantity * importPrice * (1 - discount / 100);
  }, 0);

  return {
    totalItems,
    totalQuantity,
    subtotal,
    total: subtotal * (1 - Number(discountPercent || 0) / 100),
  };
};

export const buildImportPayload = ({ values = {}, items = [], discountPercent = 0 }) => {
  const validItems = getValidPurchaseItems(items);

  if (validItems.length === 0) {
    throw new Error('Vui lòng thêm ít nhất một loại thuốc');
  }

  return {
    supplier: values.supplierId,
    paymentStatus: values.paymentMethod === 'debt' ? 'unpaid' : 'paid',
    importDate: toIsoString(values.orderDate) || new Date().toISOString(),
    notes: values.note,
    items: validItems.map((item) => stripUndefined({
      medicine: item.medicineId,
      quantity: Number(item.quantity || 1),
      importPrice: Math.round(
        Number(item.importPrice || 0)
          * (1 - Number(item.discount || 0) / 100)
          * (1 - Number(discountPercent || 0) / 100)
      ),
      batchNumber: item.batchNumber || undefined,
      expiryDate: toIsoString(item.expiryDate),
      manufacturingDate: toIsoString(item.manufacturingDate),
    })),
  };
};
