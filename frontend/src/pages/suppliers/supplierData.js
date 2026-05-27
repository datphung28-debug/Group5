export const supplierStatusOptions = ['Bình thường', 'Đang nợ', 'Quá hạn', 'Tạm ngưng'];

export const statusStyles = {
  'Bình thường': 'success',
  'Đang nợ': 'processing',
  'Quá hạn': 'error',
  'Tạm ngưng': 'default',
};

export const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
