import Sale from "../models/Sale.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Import from "../models/Import.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

const PAYMENT_LABELS = {
  cash: "Tiền mặt",
  card: "Thẻ",
  transfer: "Chuyển khoản",
};

const formatTrendDate = (date, groupType) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  if (groupType === "monthly") return `${month}/${date.getFullYear()}`;
  return `${day}/${month}`;
};

export const normalizeRevenueRange = (query = {}) => {
  const now = new Date();
  const groupType = query.type === "monthly" ? "monthly" : "daily";

  if (query.fromDate || query.toDate) {
    const start = query.fromDate
      ? new Date(query.fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = query.toDate
      ? new Date(query.toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, groupType };
  }

  const year = Number(query.year) || now.getFullYear();
  if (groupType === "monthly") {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
      groupType,
    };
  }

  const month = Number(query.month) || now.getMonth() + 1;
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
    groupType,
  };
};

const getMedicineCategoryName = (medicine) => {
  if (!medicine?.category) return "Khác";
  if (typeof medicine.category === "object") return medicine.category.name || "Khác";
  return "Khác";
};

const getItemGrossProfit = (item) => {
  const revenue = Number(item.total || 0);
  const importPrice = Number(item.medicine?.importPrice || 0);
  const quantity = Number(item.quantity || 0);
  return revenue - importPrice * quantity;
};

export const buildRevenueReportPayload = ({ sales = [], groupType = "daily" } = {}) => {
  const trendMap = new Map();
  const paymentMap = new Map();
  const categoryMap = new Map();

  let totalRevenue = 0;
  let grossProfit = 0;

  sales.forEach((sale) => {
    const saleTotal = Number(sale.totalAmount || 0);
    totalRevenue += saleTotal;

    const trendKey = formatTrendDate(new Date(sale.createdAt), groupType);
    const currentTrend = trendMap.get(trendKey) || { revenue: 0, grossProfit: 0 };
    currentTrend.revenue += saleTotal;

    const paymentKey = sale.paymentMethod || "cash";
    const currentPayment = paymentMap.get(paymentKey) || { value: 0, count: 0 };
    currentPayment.value += saleTotal;
    currentPayment.count += 1;
    paymentMap.set(paymentKey, currentPayment);

    (sale.items || []).forEach((item) => {
      const itemRevenue = Number(item.total || 0);
      const itemProfit = getItemGrossProfit(item);
      grossProfit += itemProfit;
      currentTrend.grossProfit += itemProfit;

      const categoryName = getMedicineCategoryName(item.medicine);
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + itemRevenue);
    });

    trendMap.set(trendKey, currentTrend);
  });

  const trendData = [];
  trendMap.forEach((value, date) => {
    trendData.push({ date, type: "Doanh thu", value: value.revenue });
    trendData.push({ date, type: "Lãi gộp", value: value.grossProfit });
  });

  return {
    kpis: {
      totalRevenue,
      grossProfit,
      margin: totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0,
      invoiceCount: sales.length,
      avgOrderValue: sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0,
    },
    trendData,
    paymentData: Array.from(paymentMap.entries()).map(([method, value]) => ({
      type: PAYMENT_LABELS[method] || method,
      value: value.value,
      count: value.count,
    })),
    categoryData: Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue),
  };
};

// @GET /api/reports/dashboard
export const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todaySales,
      monthSales,
      totalMedicines,
      lowStockMedicines,
      totalCustomers,
      totalStaff,
    ] = await Promise.all([
      Sale.aggregate([
        { $match: { status: "completed", createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { status: "completed", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$minStock"] } }),
      Customer.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, role: { $in: ["admin", "pharmacist"] } }),
    ]);

    // Thuốc sắp hết hạn (30 ngày)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    const expiringMedicines = await Medicine.countDocuments({
      isActive: true,
      expiryDate: { $lte: expiringDate, $gte: new Date() },
    });

    res.json({
      today: {
        revenue: todaySales[0]?.total || 0,
        orders: todaySales[0]?.count || 0,
      },
      month: {
        revenue: monthSales[0]?.total || 0,
        orders: monthSales[0]?.count || 0,
      },
      inventory: {
        total: totalMedicines,
        lowStock: lowStockMedicines,
        expiring: expiringMedicines,
      },
      customers: totalCustomers,
      staff: totalStaff,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/reports/revenue - Doanh thu theo ngày/tháng
export const getRevenueReport = async (req, res) => {
  try {
    const { start, end, groupType } = normalizeRevenueRange(req.query);
    const sales = await Sale.find({
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    })
      .populate({
        path: "items.medicine",
        select: "name code importPrice category",
        populate: { path: "category", select: "name" },
      })
      .sort({ createdAt: 1 });

    res.json(buildRevenueReportPayload({ sales, groupType }));
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/reports/top-medicines - Thuốc bán chạy nhất
export const getTopMedicines = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const match = { status: "completed" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const topMedicines = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      { $group: { _id: "$items.medicine", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.total" } } },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) },
      { $lookup: { from: "medicines", localField: "_id", foreignField: "_id", as: "medicine" } },
      { $unwind: "$medicine" },
      { $project: { name: "$medicine.name", code: "$medicine.code", totalSold: 1, revenue: 1 } },
    ]);

    res.json(topMedicines);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/reports/inventory - Báo cáo tồn kho
export const getInventoryReport = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true })
      .populate("category", "name")
      .populate("unit", "name")
      .select("name code stock minStock sellPrice importPrice expiryDate category unit")
      .sort({ stock: 1 });

    const totalValue = medicines.reduce((sum, m) => sum + m.stock * m.importPrice, 0);

    res.json({ medicines, totalValue });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
