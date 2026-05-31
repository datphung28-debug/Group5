import Category from "../models/Category.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Medicine from "../models/Medicine.js";
import Supplier from "../models/Supplier.js";
import Unit from "../models/Unit.js";
import { createAuditLog } from "../utils/createAuditLog.js";

// ========== CATEGORY (Nhóm thuốc) ==========
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: { $ne: false } }).sort({ name: 1 });
    const counts = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", medicineCount: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.medicineCount]));

    res.json(categories.map((category) => {
      const data = category.toObject();
      const medicineCount = countMap.get(String(category._id)) || 0;
      return {
        ...data,
        medicineCount,
        status: medicineCount === 0 ? "empty" : "active",
      };
    }));
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    await createAuditLog({
      req,
      action: "create",
      module: "medicine",
      target: category.name,
      description: `Tạo nhóm thuốc ${category.name}`,
    });

    res.status(201).json(category);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: "Không tìm thấy nhóm thuốc" });

    await createAuditLog({
      req,
      action: "update",
      module: "medicine",
      target: category.name,
      description: `Cập nhật nhóm thuốc ${category.name}`,
    });

    res.json(category);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const medicineCount = await Medicine.countDocuments({ category: req.params.id, isActive: true });
    if (medicineCount > 0) {
      return res.status(400).json({ message: "Không thể xóa nhóm thuốc đang có thuốc" });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ message: "Không tìm thấy nhóm thuốc" });

    await createAuditLog({
      req,
      action: "delete",
      module: "medicine",
      target: category.name,
      description: `Xóa nhóm thuốc ${category.name}`,
    });

    res.json({ message: "Đã xóa nhóm thuốc" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// ========== SUPPLIER (Nhà cung cấp) ==========
export const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { isActive: { $ne: false } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { taxCode: { $regex: search, $options: "i" } },
      ];
    }
    const suppliers = await Supplier.find(filter).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, isActive: { $ne: false } });
    if (!supplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    res.json(supplier);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    await createAuditLog({
      req,
      action: "create",
      module: "supplier",
      target: supplier.name,
      description: `Tạo nhà cung cấp ${supplier.name}`,
    });

    res.status(201).json(supplier);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, isActive: { $ne: false } },
      req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!supplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });

    await createAuditLog({
      req,
      action: "update",
      module: "supplier",
      target: supplier.name,
      description: `Cập nhật thông tin nhà cung cấp ${supplier.name}`,
    });

    res.json(supplier);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { returnDocument: "after" });
    if (!supplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });

    await createAuditLog({
      req,
      action: "delete",
      module: "supplier",
      target: supplier.name,
      description: `Xóa nhà cung cấp ${supplier.name}`,
    });

    res.json({ message: "Đã xóa nhà cung cấp" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// ========== UNIT (Đơn vị tính) ==========
export const getUnits = async (req, res) => {
  try {
    const units = await Unit.find({ isActive: { $ne: false } }).sort({ name: 1 });
    res.json(units);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const createUnit = async (req, res) => {
  try {
    const unit = await Unit.create(req.body);
    res.status(201).json(unit);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!unit) return res.status(404).json({ message: "Không tìm thấy đơn vị tính" });
    res.json(unit);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const medicineCount = await Medicine.countDocuments({ unit: req.params.id, isActive: true });
    if (medicineCount > 0) {
      return res.status(400).json({ message: "Không thể xóa đơn vị tính đang có thuốc" });
    }

    const unit = await Unit.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!unit) return res.status(404).json({ message: "Không tìm thấy đơn vị tính" });
    res.json({ message: "Đã xóa đơn vị tính" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
