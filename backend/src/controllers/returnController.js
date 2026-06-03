import Return from "../models/Return.js";
import Sale from "../models/Sale.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import { executeTransaction } from "../utils/transaction.js";
import { createAuditLog } from "../utils/createAuditLog.js";

const generateReturnCode = async () => {
  const today = new Date();
  const prefix = `RT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await Return.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

const returnMedicineStock = async (medicineId, quantity, session = null) => {
  const med = await Medicine.findById(medicineId);
  if (!med) return;

  med.stock += Number(quantity);

  if (med.batches && med.batches.length > 0) {
    med.batches.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    med.batches[0].quantity += Number(quantity);
  } else {
    if (!med.batches) med.batches = [];
    med.batches.push({
      batchNumber: "TRA-HANG",
      expiryDate: med.expiryDate || new Date(Date.now() + 365*24*60*60*1000),
      quantity: Number(quantity),
      importPrice: Number(med.importPrice || 0),
    });
  }

  if (session) await med.save({ session });
  else await med.save();
};

export const createReturn = async (req, res) => {
  try {
    const { saleId, items, refundAmount, refundMethod, reason, note } = req.body;

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    if (sale.status !== "completed") return res.status(400).json({ message: "Hóa đơn này không thể trả hàng" });

    const code = await generateReturnCode();

    const returnPayload = {
      code,
      sale: sale._id,
      invoiceCode: sale.code,
      customer: sale.customer,
      items,
      refundAmount: Number(refundAmount),
      status: "pending",
      refundMethod,
      reason,
      note,
      createdBy: req.user._id,
    };

    const newReturn = await Return.create(returnPayload);

    await createAuditLog({
      req,
      action: "create",
      module: "return",
      target: code,
      description: `Tạo yêu cầu trả hàng ${code} cho hóa đơn ${sale.code}`,
    });

    res.status(201).json(newReturn);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getReturns = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { invoiceCode: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Return.countDocuments(filter);
    const returns = await Return.find(filter)
      .populate("customer", "name phone")
      .populate("items.medicine", "name code")
      .populate("createdBy", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ returns, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const returnDoc = await Return.findById(id);
    if (!returnDoc) return res.status(404).json({ message: "Không tìm thấy phiếu trả hàng" });
    if (returnDoc.status !== "pending") return res.status(400).json({ message: "Chỉ có thể duyệt/từ chối phiếu chờ duyệt" });

    if (status === "rejected") {
      returnDoc.status = "rejected";
      await returnDoc.save();
      return res.json(returnDoc);
    }

    if (status === "approved" || status === "completed") {
      // Auto complete when approved for simplicity
      const result = await executeTransaction(
        async (session) => {
          returnDoc.status = "completed";
          await returnDoc.save({ session });

          // Restock items
          for (const item of returnDoc.items) {
            await returnMedicineStock(item.medicine, item.quantity, session);
          }

          // Deduct customer points and spend
          if (returnDoc.customer) {
            const c = await Customer.findById(returnDoc.customer);
            if (c) {
              const pointsToDeduct = Math.floor(returnDoc.refundAmount / 10000);
              c.totalSpent = Math.max(0, c.totalSpent - returnDoc.refundAmount);
              c.points = Math.max(0, c.points - pointsToDeduct);
              
              let newTier = "Thường";
              if (c.totalSpent >= 50000000) newTier = "Kim cương";
              else if (c.totalSpent >= 20000000) newTier = "Vàng";
              else if (c.totalSpent >= 5000000) newTier = "Bạc";
              c.memberTier = newTier;

              await c.save({ session });
            }
          }

          // Cập nhật lại hóa đơn gốc để liên kết với doanh thu (trừ bớt doanh thu)
          const saleToUpdate = await Sale.findById(returnDoc.sale);
          if (saleToUpdate) {
            saleToUpdate.totalAmount = Math.max(0, saleToUpdate.totalAmount - returnDoc.refundAmount);
            saleToUpdate.subTotal = Math.max(0, saleToUpdate.subTotal - returnDoc.refundAmount);
            
            for (const retItem of returnDoc.items) {
              const sItem = saleToUpdate.items.find(i => i.medicine.toString() === retItem.medicine.toString());
              if (sItem) {
                sItem.quantity = Math.max(0, sItem.quantity - retItem.quantity);
                sItem.total = Math.max(0, sItem.total - retItem.total);
              }
            }
            
            // Xóa các sản phẩm đã trả hết (số lượng = 0)
            saleToUpdate.items = saleToUpdate.items.filter(i => i.quantity > 0);
            
            if (saleToUpdate.items.length === 0) {
              saleToUpdate.status = "refunded"; // Đổi trạng thái nếu trả toàn bộ hóa đơn
            }
            await saleToUpdate.save({ session });
          }

          return returnDoc;
        },
        async () => {
          returnDoc.status = "completed";
          await returnDoc.save();
          for (const item of returnDoc.items) {
            await returnMedicineStock(item.medicine, item.quantity);
          }
          if (returnDoc.customer) {
            const c = await Customer.findById(returnDoc.customer);
            if (c) {
              const pointsToDeduct = Math.floor(returnDoc.refundAmount / 10000);
              c.totalSpent = Math.max(0, c.totalSpent - returnDoc.refundAmount);
              c.points = Math.max(0, c.points - pointsToDeduct);
              
              let newTier = "Thường";
              if (c.totalSpent >= 50000000) newTier = "Kim cương";
              else if (c.totalSpent >= 20000000) newTier = "Vàng";
              else if (c.totalSpent >= 5000000) newTier = "Bạc";
              c.memberTier = newTier;

              await c.save();
            }
          }

          const saleToUpdate = await Sale.findById(returnDoc.sale);
          if (saleToUpdate) {
            saleToUpdate.totalAmount = Math.max(0, saleToUpdate.totalAmount - returnDoc.refundAmount);
            saleToUpdate.subTotal = Math.max(0, saleToUpdate.subTotal - returnDoc.refundAmount);
            
            for (const retItem of returnDoc.items) {
              const sItem = saleToUpdate.items.find(i => i.medicine.toString() === retItem.medicine.toString());
              if (sItem) {
                sItem.quantity = Math.max(0, sItem.quantity - retItem.quantity);
                sItem.total = Math.max(0, sItem.total - retItem.total);
              }
            }
            
            saleToUpdate.items = saleToUpdate.items.filter(i => i.quantity > 0);
            
            if (saleToUpdate.items.length === 0) {
              saleToUpdate.status = "refunded";
            }
            await saleToUpdate.save();
          }

          return returnDoc;
        }
      );

      await createAuditLog({
        req,
        action: "update",
        module: "return",
        target: returnDoc.code,
        description: `Duyệt hoàn tất yêu cầu trả hàng ${returnDoc.code}`,
      });

      return res.json(result);
    }
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
