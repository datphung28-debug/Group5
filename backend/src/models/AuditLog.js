import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ["login", "create", "update", "delete"],
    },
    module: {
      type: String,
      required: true,
      enum: ["auth", "medicine", "sale", "inventory", "supplier", "user"],
    },
    target: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["success", "warning"],
      default: "success",
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Indexes:
// - { createdAt: -1 }
// - { user: 1, createdAt: -1 }
// - { module: 1, action: 1, createdAt: -1 }
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
