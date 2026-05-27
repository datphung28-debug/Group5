import CashbookTransaction from "../models/CashbookTransaction.js";
import Import from "../models/Import.js";
import Sale from "../models/Sale.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

const PAYMENT_METHOD_LABELS = {
  cash: "Tiền mặt",
  card: "Thẻ",
  transfer: "Chuyển khoản",
};

const getCreatorName = (record) => record?.createdBy?.name || "Hệ thống";

const normalizePaymentMethod = (method) => {
  if (method === "Tiền mặt") return "cash";
  if (method === "Chuyển khoản") return "transfer";
  if (method === "Thẻ") return "card";
  return method || "cash";
};

const buildDateFilter = ({ startDate, endDate } = {}) => {
  if (!startDate && !endDate) return null;
  const filter = {};
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    filter.$gte = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }
  return filter;
};

export const normalizeCashbookEntries = ({ sales = [], imports = [], manualTransactions = [] } = {}) => {
  const saleEntries = sales.map((sale) => ({
    id: `sale-${sale._id}`,
    source: "sale",
    type: "thu",
    category: "Bán hàng",
    paymentMethod: sale.paymentMethod || "cash",
    paymentMethodLabel: PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod || "Tiền mặt",
    description: `Thu tiền hóa đơn ${sale.code}`,
    amount: Number(sale.totalAmount || 0),
    staff: getCreatorName(sale),
    timestamp: sale.createdAt,
    reference: sale.code,
  }));

  const importEntries = imports
    .filter((item) => item.paymentStatus === "paid" || item.paymentStatus === "partial")
    .map((item) => ({
      id: `import-${item._id}`,
      source: "import",
      type: "chi",
      category: "Nhập hàng",
      paymentMethod: "transfer",
      paymentMethodLabel: "Chuyển khoản",
      description: `Thanh toán phiếu nhập ${item.code}${item.supplier?.name ? ` - ${item.supplier.name}` : ""}`,
      amount: Number(item.totalAmount || 0),
      staff: getCreatorName(item),
      timestamp: item.importDate || item.createdAt,
      reference: item.code,
    }));

  const manualEntries = manualTransactions.map((transaction) => {
    const paymentMethod = normalizePaymentMethod(transaction.paymentMethod);
    return {
      id: `manual-${transaction._id}`,
      source: "manual",
      type: transaction.type,
      category: transaction.category,
      paymentMethod,
      paymentMethodLabel: PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod,
      description: transaction.description,
      amount: Number(transaction.amount || 0),
      staff: getCreatorName(transaction),
      timestamp: transaction.transactionDate || transaction.createdAt,
      reference: transaction.reference,
      note: transaction.note,
    };
  });

  return [...saleEntries, ...importEntries, ...manualEntries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
};

export const buildCashbookSummary = (transactions = []) => {
  const initialPaymentSummaries = {
    cash: { count: 0, total: 0 },
    transfer: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
  };

  return transactions.reduce((summary, transaction) => {
    const amount = Number(transaction.amount || 0);
    const signedAmount = transaction.type === "thu" ? amount : -amount;
    const method = normalizePaymentMethod(transaction.paymentMethod);

    if (!summary.paymentSummaries[method]) {
      summary.paymentSummaries[method] = { count: 0, total: 0 };
    }

    summary.paymentSummaries[method].count += 1;
    summary.paymentSummaries[method].total += signedAmount;

    if (transaction.type === "thu") {
      summary.kpis.totalRevenue += amount;
    } else {
      summary.kpis.totalExpense += amount;
    }

    summary.kpis.netBalance = summary.kpis.totalRevenue - summary.kpis.totalExpense;
    summary.kpis.currentBalance = summary.kpis.netBalance;

    return summary;
  }, {
    kpis: {
      totalRevenue: 0,
      totalExpense: 0,
      netBalance: 0,
      currentBalance: 0,
    },
    paymentSummaries: initialPaymentSummaries,
  });
};

export const getCashbook = async (req, res) => {
  try {
    const { type, paymentMethod, category } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const saleFilter = { status: "completed" };
    const importFilter = {};
    const manualFilter = {};

    if (dateFilter) {
      saleFilter.createdAt = dateFilter;
      importFilter.importDate = dateFilter;
      manualFilter.transactionDate = dateFilter;
    }
    if (paymentMethod) {
      saleFilter.paymentMethod = paymentMethod;
      manualFilter.paymentMethod = paymentMethod;
    }
    if (type) manualFilter.type = type;
    if (category) manualFilter.category = category;

    const [sales, imports, manualTransactions] = await Promise.all([
      type && type !== "thu"
        ? []
        : Sale.find(saleFilter).populate("createdBy", "name").sort({ createdAt: -1 }).limit(500),
      type && type !== "chi"
        ? []
        : Import.find(importFilter).populate("supplier", "name").populate("createdBy", "name").sort({ importDate: -1 }).limit(500),
      CashbookTransaction.find(manualFilter).populate("createdBy", "name").sort({ transactionDate: -1 }).limit(500),
    ]);

    let transactions = normalizeCashbookEntries({ sales, imports, manualTransactions });
    if (category) {
      transactions = transactions.filter((transaction) => transaction.category === category);
    }

    const summary = buildCashbookSummary(transactions);
    res.json({ transactions, ...summary });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const createCashbookTransaction = async (req, res) => {
  try {
    const { type, category, paymentMethod, description, amount, transactionDate, reference, note } = req.body;

    if (!type || !category || !description || amount === undefined) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin giao dịch" });
    }

    const transaction = await CashbookTransaction.create({
      type,
      category,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      description,
      amount,
      transactionDate: transactionDate || new Date(),
      reference,
      note,
      createdBy: req.user._id,
    });

    const populated = await transaction.populate("createdBy", "name");
    const [entry] = normalizeCashbookEntries({ manualTransactions: [populated] });
    res.status(201).json(entry);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
