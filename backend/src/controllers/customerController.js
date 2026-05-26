import Customer from "../models/Customer.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Sale from "../models/Sale.js";

// @GET /api/customers
export const getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    res.json({ customers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/customers/:id
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(customer);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/customers/:id/history - Lịch sử mua hàng
export const getCustomerHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Sale.countDocuments({ customer: req.params.id });
    const sales = await Sale.find({ customer: req.params.id })
      .populate("items.medicine", "name code")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ sales, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/customers
export const createCustomer = async (req, res) => {
  try {
    const exists = await Customer.findOne({ phone: req.body.phone });
    if (exists) return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(customer);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @DELETE /api/customers/:id
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json({ message: "Đã xóa khách hàng" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
