import Import from "../models/Import.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Medicine from "../models/Medicine.js";
import Supplier from "../models/Supplier.js";
import mongoose from "mongoose";

// Tạo mã phiếu nhập
const generateImportCode = async () => {
  const today = new Date();
  const prefix = `PN${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await Import.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

export const validateCreateImportPayload = ({ supplier, items } = {}) => {
  if (!supplier) return { message: "Vui lòng chọn nhà cung cấp" };
  if (!Array.isArray(items) || items.length === 0) {
    return { message: "Phiếu nhập phải có ít nhất một mặt hàng" };
  }

  for (const item of items) {
    if (!item?.medicine) return { message: "Vui lòng chọn thuốc nhập" };
    if (item.quantity === undefined || item.quantity === null || item.quantity === "") {
      return { message: "Vui lòng nhập số lượng" };
    }
    if (item.importPrice === undefined || item.importPrice === null || item.importPrice === "") {
      return { message: "Vui lòng nhập giá nhập" };
    }
    if (!Number.isFinite(Number(item.quantity))) return { message: "Số lượng nhập không hợp lệ" };
    if (!Number.isFinite(Number(item.importPrice))) return { message: "Giá nhập không hợp lệ" };
    if (Number(item.quantity) <= 0) return { message: "Số lượng nhập phải lớn hơn 0" };
    if (Number(item.importPrice) < 0) return { message: "Giá nhập không được âm" };
  }

  return null;
};

export const buildMedicineImportUpdate = (item) => {
  const update = {
    $inc: { stock: Number(item.quantity) },
  };

  if (item.importPrice !== undefined && item.importPrice !== null) {
    update.importPrice = Number(item.importPrice);
  }
  if (item.expiryDate) update.expiryDate = item.expiryDate;
  if (item.manufacturingDate) update.manufacturingDate = item.manufacturingDate;

  return update;
};

// @GET /api/imports
export const getImports = async (req, res) => {
  try {
    const { page = 1, limit = 20, supplier, startDate, endDate } = req.query;
    const filter = {};
    if (supplier) filter.supplier = supplier;
    if (startDate || endDate) {
      filter.importDate = {};
      if (startDate) filter.importDate.$gte = new Date(startDate);
      if (endDate) filter.importDate.$lte = new Date(endDate);
    }

    const total = await Import.countDocuments(filter);
    const imports = await Import.find(filter)
      .populate("supplier", "name phone")
      .populate("createdBy", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ imports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/imports/:id
export const getImportById = async (req, res) => {
  try {
    const importDoc = await Import.findById(req.params.id)
      .populate("supplier", "name phone address")
      .populate("items.medicine", "name code unit")
      .populate("createdBy", "name");
    if (!importDoc) return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });
    res.json(importDoc);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/imports - Tạo phiếu nhập và cộng tồn kho
export const createImport = async (req, res) => {
  try {
    const { supplier, items, paymentStatus, importDate, notes } = req.body;

    const validationError = validateCreateImportPayload({ supplier, items });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const supplierExists = await Supplier.findOne({ _id: supplier, isActive: { $ne: false } });
    if (!supplierExists) {
      return res.status(400).json({ message: "Nhà cung cấp không tồn tại" });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findOne({ _id: item.medicine, isActive: true });
      if (!medicine) {
        return res.status(400).json({ message: `Thuốc không tồn tại: ${item.medicine}` });
      }

      const quantity = Number(item.quantity);
      const importPrice = Number(item.importPrice);
      const itemTotal = importPrice * quantity;
      totalAmount += itemTotal;
      processedItems.push({
        medicine: medicine._id,
        quantity,
        importPrice,
        expiryDate: item.expiryDate,
        manufacturingDate: item.manufacturingDate,
        batchNumber: item.batchNumber,
        total: itemTotal,
      });
    }

    const code = await generateImportCode();
    const importDoc = await Import.create({
      code,
      supplier,
      items: processedItems,
      totalAmount,
      paymentStatus,
      importDate: importDate || new Date(),
      notes,
      createdBy: req.user._id,
    });

    // Increment stock, add to batch, and update expiry/manufacturing dates
    for (const item of processedItems) {
      const med = await Medicine.findById(item.medicine);
      if (med) {
        med.stock += Number(item.quantity);
        if (item.importPrice !== undefined && item.importPrice !== null) {
          med.importPrice = Number(item.importPrice);
        }
        if (item.expiryDate) med.expiryDate = item.expiryDate;
        if (item.manufacturingDate) med.manufacturingDate = item.manufacturingDate;

        // Xử lý số lô (batch)
        if (item.batchNumber) {
          if (!med.batches) med.batches = [];
          const existingBatchIdx = med.batches.findIndex(b => b.batchNumber === item.batchNumber);
          if (existingBatchIdx > -1) {
            med.batches[existingBatchIdx].quantity += Number(item.quantity);
            if (item.importPrice !== undefined) {
              med.batches[existingBatchIdx].importPrice = Number(item.importPrice);
            }
            if (item.expiryDate) {
              med.batches[existingBatchIdx].expiryDate = item.expiryDate;
            }
          } else {
            med.batches.push({
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate || new Date(Date.now() + 365*24*60*60*1000), // Mặc định 1 năm nếu không có hạn dùng
              quantity: Number(item.quantity),
              importPrice: Number(item.importPrice || med.importPrice || 0),
            });
          }

          // Cập nhật lại hạn sử dụng của thuốc theo lô sắp hết hạn nhất
          if (med.batches.length > 0) {
            med.batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
            med.expiryDate = med.batches[0].expiryDate;
          }
        }
        await med.save();
      }
    }

    // Increase supplier debt and append to history if unpaid or partial
    if (paymentStatus === "unpaid" || paymentStatus === "partial") {
      await Supplier.findByIdAndUpdate(supplier, {
        $inc: { currentDebt: totalAmount },
        $push: {
          debtHistory: {
            id: importDoc.code,
            date: new Date(importDoc.importDate).toISOString().split("T")[0],
            note: `Purchase - Order ${importDoc.code}`,
            amount: totalAmount,
          },
        },
        status: "Đang nợ",
      });
    }

    res.status(201).json(importDoc);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
