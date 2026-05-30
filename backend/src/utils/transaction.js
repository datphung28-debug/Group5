import mongoose from "mongoose";

/**
 * Execute operations within a MongoDB transaction.
 * If the MongoDB instance is standalone and does not support transactions,
 * it will automatically fallback to executing the operations without a transaction.
 * 
 * @param {Function} transactionCallback - Function containing operations to run inside a transaction. Receives `session` as argument.
 * @param {Function} fallbackCallback - Function containing operations to run if transaction is not supported.
 * @returns {Promise<any>}
 */
export const executeTransaction = async (transactionCallback, fallbackCallback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await transactionCallback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    
    // Check if the error is due to MongoDB not supporting transactions (e.g. standalone)
    const isTxNotSupported = 
      error.message?.includes("Transaction") || 
      error.codeName === "TransactionOutcomeUnknown" || 
      error.message?.includes("replica set") || 
      error.message?.includes("retryable writes");

    if (isTxNotSupported && fallbackCallback) {
      console.warn("⚠️ Transaction not supported by MongoDB instance. Falling back to non-transaction operations.");
      return await fallbackCallback();
    }
    
    // If it's a normal error, or no fallback provided, rethrow it
    throw error;
  } finally {
    session.endSession();
  }
};
