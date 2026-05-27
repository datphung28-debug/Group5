export const getImportsFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.imports)) return data.imports;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getImportId = (importDoc) => importDoc?._id || importDoc?.id;

export const getSupplierName = (importDoc) => {
  const supplier = importDoc?.supplier;

  if (typeof supplier === 'object' && supplier?.name) return supplier.name;
  if (typeof supplier === 'string' && supplier) return supplier;
  return 'Chưa có NCC';
};

export const getPaymentStatusMeta = (status) => {
  const statusMap = {
    paid: { label: 'Đã thanh toán', color: 'success' },
    partial: { label: 'Thanh toán một phần', color: 'warning' },
    unpaid: { label: 'Chưa thanh toán', color: 'error' },
  };

  return statusMap[status] || { label: 'Không rõ', color: 'default' };
};
