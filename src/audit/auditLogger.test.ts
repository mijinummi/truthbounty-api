import { writeAuditLog } from "./auditLogger";

describe("auditLogger invariants", () => {
  it("throws if ipAddress is missing", () => {
    expect(() =>
      writeAuditLog({ ipAddress: "" })
    ).toThrow();
  });

  it("accepts valid ipAddress", () => {
    expect(() =>
      writeAuditLog({ ipAddress: "local", action: "LOGIN" })
    ).not.toThrow();
  });
});