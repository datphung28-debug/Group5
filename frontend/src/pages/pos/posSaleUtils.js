const stripUndefined = (payload) => Object.fromEntries(
  Object.entries(payload).filter(([, value]) => value !== undefined)
);

export const buildSalePayload = ({
  cart = [],
  customer,
  prescription,
  discount = 0,
  paymentMethod = 'cash',
  amountPaid,
}) => stripUndefined({
  items: cart.map((item) => ({
    medicine: item.medicine._id,
    quantity: Number(item.quantity || 1),
    discount: Number(item.discount || 0),
    dosage: item.dosage || "",
  })),
  customer: customer || undefined,
  prescription: prescription || undefined,
  discount: Number(discount || 0),
  paymentMethod,
  amountPaid: Number(amountPaid || 0),
});

export const getCartStockIssue = (cart = []) => {
  const externalItem = cart.find((item) => item.medicine?.isExternal);
  if (externalItem) {
    return 'Giỏ hàng chứa thuốc không nằm trong danh mục hệ thống. Vui lòng xóa các thuốc này trước khi thanh toán.';
  }

  for (const item of cart) {
    const stock = Number(item.medicine?.stock || 0);
    const quantity = Number(item.quantity || 0);
    if (stock <= 0) return `Thuốc "${item.medicine?.name}" đã hết hàng`;
    if (quantity > stock) return `Thuốc "${item.medicine?.name}" không đủ tồn kho. Còn lại: ${stock}`;
  }

  return null;
};

export const getCashPaymentIssue = ({ paymentMethod, amountPaid, total }) => {
  if (paymentMethod !== 'cash') return null;
  if (Number(amountPaid || 0) < Number(total || 0)) return 'Tiền khách đưa không đủ thanh toán';
  return null;
};
