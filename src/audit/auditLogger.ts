export function writeAuditLog(entry: {
  ipAddress: string;
  [key: string]: any;
}) {
  if (!entry.ipAddress || typeof entry.ipAddress !== "string") {
    throw new Error("Audit invariant violated: ipAddress must be a string");
  }

  // Example persistence
  console.log("AUDIT_LOG:", JSON.stringify(entry));
}