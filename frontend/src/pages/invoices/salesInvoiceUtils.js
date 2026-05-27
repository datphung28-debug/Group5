export const getSalesFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.sales)) return data.sales;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const normalizeInvoice = (sale = {}) => ({
  ...sale,
  id: sale._id || sale.id,
  customerName: sale.customer?.name || 'Khách lẻ',
  customerPhone: sale.customer?.phone || '—',
  staff: sale.createdBy?.name || '—',
  total: sale.totalAmount || 0,
  paid: sale.amountPaid || sale.totalAmount || 0,
  items: (sale.items || []).map((item, index) => ({
    id: item._id || `${sale._id}-${index}`,
    name: item.medicine?.name || 'Không rõ thuốc',
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    discount: item.discount || 0,
    total: item.total || 0,
  })),
});
