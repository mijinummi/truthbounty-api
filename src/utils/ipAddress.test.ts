import { resolveClientIp } from "./ipAddress";

describe("resolveClientIp", () => {
  it("returns x-forwarded-for first IP", () => {
    const req = {
      headers: {
        "x-forwarded-for": "203.0.113.10, 70.41.3.18",
      },
    };

    expect(resolveClientIp(req)).toBe("203.0.113.10");
  });

  it("handles socket.remoteAddress", () => {
    const req = {
      socket: {
        remoteAddress: "198.51.100.5",
      },
    };

    expect(resolveClientIp(req)).toBe("198.51.100.5");
  });

  it("normalizes localhost IPv4", () => {
    const req = {
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(resolveClientIp(req)).toBe("local");
  });

  it("normalizes localhost IPv6", () => {
    const req = {
      socket: { remoteAddress: "::1" },
    };

    expect(resolveClientIp(req)).toBe("local");
  });

  it("returns unknown when missing", () => {
    const req = {};
    expect(resolveClientIp(req)).toBe("unknown");
  });
});