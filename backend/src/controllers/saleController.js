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

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Hóa đơn phải có ít nhất một sản phẩm" });
    }

    // Kiểm tra tồn kho và tính tổng tiền
    let subTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine || !medicine.isActive) {
        return res.status(400).json({ message: `Thuốc không tồn tại: ${item.medicine}` });
      }
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          message: `Thuốc "${medicine.name}" không đủ tồn kho. Còn lại: ${medicine.stock}`,
        });
      }

      const itemTotal = medicine.sellPrice * item.quantity * (1 - (item.discount || 0) / 100);
      subTotal += itemTotal;
      processedItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        unitPrice: medicine.sellPrice,
        discount: item.discount || 0,
        total: itemTotal,
      });
    }

    const totalAmount = subTotal - discount;
    const changeAmount = amountPaid ? amountPaid - totalAmount : 0;

    const code = await generateSaleCode();
    const sale = await Sale.create({
      code,
      customer,
      prescription,
      items: processedItems,
      subTotal,
      discount,
      totalAmount,
      paymentMethod,
      amountPaid,
      changeAmount,
      notes,
      createdBy: req.user._id,
    });

    // Trừ tồn kho
    for (const item of processedItems) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: -item.quantity },
      });
    }

    // Cộng tổng chi tiêu khách hàng
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalSpent: totalAmount },
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
