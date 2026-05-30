import Sale from "../models/Sale.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Import from "../models/Import.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";

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
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);

    const [
      todaySales,
      monthSales,
      totalMedicines,
      lowStockMedicines,
      totalCustomers,
      totalStaff,
      activeSuppliers,
      medicinesForValuation,
      allSalesForDebt
    ] = await Promise.all([
      Sale.find({
        status: "completed",
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).populate("items.medicine"),
      Sale.find({
        status: "completed",
        createdAt: { $gte: startOfMonth }
      }).populate("items.medicine"),
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$minStock"] } }),
      Customer.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, role: { $in: ["admin", "pharmacist"] } }),
      Supplier.find({ isActive: true }),
      Medicine.find({ isActive: true }),
      Sale.find({ status: "completed" })
    ]);

    // Thuốc sắp hết hạn (30 ngày)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    const expiringMedicines = await Medicine.countDocuments({
      isActive: true,
      expiryDate: { $lte: expiringDate, $gte: new Date() },
    });

    // 1. Calculate Today's metrics
    let revenueToday = 0;
    let profitToday = 0;
    todaySales.forEach(sale => {
      revenueToday += sale.totalAmount || 0;
      (sale.items || []).forEach(item => {
        profitToday += getItemGrossProfit(item);
      });
    });

    // 2. Calculate Month's metrics
    let revenueMonth = 0;
    let profitMonth = 0;
    monthSales.forEach(sale => {
      revenueMonth += sale.totalAmount || 0;
      (sale.items || []).forEach(item => {
        profitMonth += getItemGrossProfit(item);
      });
    });

    // 3. Calculate Debts & Inventory value
    const supplierDebt = activeSuppliers.reduce((sum, s) => sum + (s.currentDebt || 0), 0);
    const inventoryValue = medicinesForValuation.reduce((sum, m) => sum + (m.stock || 0) * (m.importPrice || 0), 0);
    
    let customerDebt = 0;
    allSalesForDebt.forEach(sale => {
      const paid = sale.amountPaid !== undefined && sale.amountPaid !== null ? sale.amountPaid : sale.totalAmount;
      const debt = Math.max(sale.totalAmount - paid, 0);
      customerDebt += debt;
    });

    // 4. Daily revenue & profit for the last 30 days
    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 29);
    startOf30DaysAgo.setHours(0, 0, 0, 0);

    const last30DaysSales = await Sale.find({
      status: "completed",
      createdAt: { $gte: startOf30DaysAgo }
    }).populate("items.medicine");

    const dailyMap = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      dailyMap.set(key, { date: key, revenue: 0, profit: 0 });
    }

    last30DaysSales.forEach(sale => {
      const d = new Date(sale.createdAt);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (dailyMap.has(key)) {
        const item = dailyMap.get(key);
        item.revenue += sale.totalAmount || 0;
        (sale.items || []).forEach(si => {
          item.profit += getItemGrossProfit(si);
        });
        dailyMap.set(key, item);
      }
    });
    const revenueProfit30Days = Array.from(dailyMap.values());

    // 5. Hourly Revenue for Today (7h to 21h)
    const hourlyMap = new Map();
    for (let h = 7; h <= 21; h++) {
      const key = `${h}h`;
      hourlyMap.set(key, { hour: key, revenue: 0 });
    }

    todaySales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      const key = `${hour}h`;
      if (hourlyMap.has(key)) {
        const item = hourlyMap.get(key);
        item.revenue += sale.totalAmount || 0;
        hourlyMap.set(key, item);
      }
    });
    const hourlyRevenueToday = Array.from(hourlyMap.values());

    // 6. Yearly Revenue & Comparative Summary (Current Year vs Last Year)
    const currentYear = today.getFullYear();
    const startOfLastYear = new Date(currentYear - 1, 0, 1, 0, 0, 0, 0);

    const yearlySales = await Sale.find({
      status: "completed",
      createdAt: { $gte: startOfLastYear }
    }).populate("items.medicine");

    const yearlyMap = new Map();
    const monthLabels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    monthLabels.forEach((m, idx) => {
      yearlyMap.set(idx, { month: m, revenueThisYear: 0, revenueLastYear: 0, profitThisYear: 0 });
    });

    let totalRevThisYear = 0;
    let totalRevLastYear = 0;
    let totalProfitThisYear = 0;

    yearlySales.forEach(sale => {
      const d = new Date(sale.createdAt);
      const saleYear = d.getFullYear();
      const monthIdx = d.getMonth();

      const val = yearlyMap.get(monthIdx);
      if (val) {
        if (saleYear === currentYear) {
          val.revenueThisYear += sale.totalAmount || 0;
          totalRevThisYear += sale.totalAmount || 0;
          (sale.items || []).forEach(si => {
            const profit = getItemGrossProfit(si);
            val.profitThisYear += profit;
            totalProfitThisYear += profit;
          });
        } else if (saleYear === currentYear - 1) {
          val.revenueLastYear += sale.totalAmount || 0;
          totalRevLastYear += sale.totalAmount || 0;
        }
        yearlyMap.set(monthIdx, val);
      }
    });

    const yearlyRevenue = Array.from(yearlyMap.values());
    const yearlySummary = {
      revenueThisYear: totalRevThisYear,
      revenueLastYear: totalRevLastYear,
      profitThisYear: totalProfitThisYear
    };

    res.json({
      today: {
        revenue: revenueToday,
        profit: profitToday,
        orders: todaySales.length,
      },
      month: {
        revenue: revenueMonth,
        profit: profitMonth,
        orders: monthSales.length,
      },
      inventory: {
        total: totalMedicines,
        lowStock: lowStockMedicines,
        expiring: expiringMedicines,
        value: inventoryValue,
      },
      customers: totalCustomers,
      staff: totalStaff,
      customerDebt,
      supplierDebt,
      revenueProfit30Days,
      hourlyRevenueToday,
      yearlyRevenue,
      yearlySummary
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
      { $project: {
          name: "$medicine.name",
          code: "$medicine.code",
          totalSold: 1,
          revenue: 1,
          profit: { $subtract: ["$revenue", { $multiply: ["$totalSold", "$medicine.importPrice"] }] }
      } },
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
