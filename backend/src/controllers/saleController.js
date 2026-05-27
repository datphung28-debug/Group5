import Sale from "../models/Sale.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";

// Hàm tạo mã hóa đơn tự động
const generateSaleCode = async () => {
  const today = new Date();
  const prefix = `HD${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await Sale.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

export const validateCreateSalePayload = ({ items, discount = 0 } = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { message: "Hóa đơn phải có ít nhất một sản phẩm" };
  }
  if (!Number.isFinite(Number(discount))) return { message: "Chiết khấu hóa đơn không hợp lệ" };
  if (Number(discount) < 0) return { message: "Chiết khấu hóa đơn không được âm" };

  for (const item of items) {
    if (!item?.medicine) return { message: "Vui lòng chọn thuốc bán" };
    if (item.quantity === undefined || item.quantity === null || item.quantity === "") {
      return { message: "Vui lòng nhập số lượng bán" };
    }
    if (!Number.isFinite(Number(item.quantity))) return { message: "Số lượng bán không hợp lệ" };
    if (Number(item.quantity) <= 0) return { message: "Số lượng bán phải lớn hơn 0" };
    if (!Number.isFinite(Number(item.discount || 0))) return { message: "Chiết khấu sản phẩm không hợp lệ" };
    if (Number(item.discount || 0) < 0 || Number(item.discount || 0) > 100) {
      return { message: "Chiết khấu sản phẩm phải từ 0 đến 100" };
    }
  }

  return null;
};

export const buildProcessedSaleItem = (item, medicine) => {
  const quantity = Number(item.quantity);
  const discount = Number(item.discount || 0);
  const unitPrice = Number(medicine.sellPrice || 0);

  return {
    medicine: medicine._id,
    quantity,
    unitPrice,
    discount,
    total: unitPrice * quantity * (1 - discount / 100),
  };
};

export const calculateSalePayment = ({ subTotal, discount = 0, amountPaid } = {}) => {
  const normalizedSubTotal = Number(subTotal || 0);
  const normalizedDiscount = Number(discount || 0);
  const totalAmount = normalizedSubTotal - normalizedDiscount;

  if (normalizedDiscount > normalizedSubTotal) {
    return { message: "Chiết khấu hóa đơn không được lớn hơn tổng tiền hàng" };
  }
  if (totalAmount < 0) return { message: "Tổng tiền hóa đơn không hợp lệ" };

  const normalizedAmountPaid = amountPaid === undefined || amountPaid === null || amountPaid === ""
    ? totalAmount
    : Number(amountPaid);

  if (!Number.isFinite(normalizedAmountPaid)) return { message: "Tiền khách đưa không hợp lệ" };
  if (normalizedAmountPaid < totalAmount) return { message: "Tiền khách đưa không đủ thanh toán" };

  return {
    totalAmount,
    amountPaid: normalizedAmountPaid,
    changeAmount: normalizedAmountPaid - totalAmount,
  };
};

export const buildMedicineStockDecreaseUpdate = (item) => ({
  $inc: { stock: -Number(item.quantity) },
});

// @GET /api/sales
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, customer } = req.query;
    const filter = {};
    if (customer) filter.customer = customer;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate("customer", "name phone")
      .populate("createdBy", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ sales, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/sales/:id
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name phone address")
      .populate("items.medicine", "name code unit")
      .populate("prescription", "code patientName")
      .populate("createdBy", "name");
    if (!sale) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.json(sale);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/sales - Tạo hóa đơn bán hàng
export const createSale = async (req, res) => {
  try {
    const { customer, prescription, items, discount = 0, paymentMethod, amountPaid, notes } = req.body;

    const validationError = validateCreateSalePayload({ items, discount });
    if (validationError) return res.status(400).json(validationError);

    // Kiểm tra tồn kho và tính tổng tiền
    let subTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findOne({ _id: item.medicine, isActive: true });
      if (!medicine) {
        return res.status(400).json({ message: `Thuốc không tồn tại: ${item.medicine}` });
      }
      if (medicine.stock < Number(item.quantity)) {
        return res.status(400).json({
          message: `Thuốc "${medicine.name}" không đủ tồn kho. Còn lại: ${medicine.stock}`,
        });
      }

      const processedItem = buildProcessedSaleItem(item, medicine);
      subTotal += processedItem.total;
      processedItems.push(processedItem);
    }

    const payment = calculateSalePayment({ subTotal, discount, amountPaid });
    if (payment.message) return res.status(400).json(payment);

    const code = await generateSaleCode();
    const sale = await Sale.create({
      code,
      customer,
      prescription,
      items: processedItems,
      subTotal,
      discount: Number(discount || 0),
      totalAmount: payment.totalAmount,
      paymentMethod,
      amountPaid: payment.amountPaid,
      changeAmount: payment.changeAmount,
      notes,
      createdBy: req.user._id,
    });

    // Trừ tồn kho
    for (const item of processedItems) {
      await Medicine.findByIdAndUpdate(item.medicine, buildMedicineStockDecreaseUpdate(item), {
        runValidators: true,
      });
    }

    // Cộng tổng chi tiêu khách hàng
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalSpent: payment.totalAmount },
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/sales/:id/cancel - Hủy hóa đơn
export const cancelSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    if (sale.status !== "completed") {
      return res.status(400).json({ message: "Chỉ có thể hủy hóa đơn đã hoàn thành" });
    }

    sale.status = "cancelled";
    await sale.save();

    // Hoàn kho
    for (const item of sale.items) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({ message: "Hóa đơn đã được hủy" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
