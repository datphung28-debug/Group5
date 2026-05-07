import Import from "../models/Import.js";
import Medicine from "../models/Medicine.js";

// Tạo mã phiếu nhập
const generateImportCode = async () => {
  const today = new Date();
  const prefix = `PN${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await Import.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
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
    res.status(500).json({ message: "Lỗi server", error: error.message });
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
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @POST /api/imports - Tạo phiếu nhập và cộng tồn kho
export const createImport = async (req, res) => {
  try {
    const { supplier, items, paymentStatus, importDate, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Phiếu nhập phải có ít nhất một mặt hàng" });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(400).json({ message: `Thuốc không tồn tại: ${item.medicine}` });
      }

      const itemTotal = item.importPrice * item.quantity;
      totalAmount += itemTotal;
      processedItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        importPrice: item.importPrice,
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

    // Cộng tồn kho và cập nhật hạn dùng
    for (const item of processedItems) {
      const update = { $inc: { stock: item.quantity } };
      if (item.expiryDate) update.expiryDate = item.expiryDate;
      if (item.importPrice) update.importPrice = item.importPrice;
      await Medicine.findByIdAndUpdate(item.medicine, update);
    }

    res.status(201).json(importDoc);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
