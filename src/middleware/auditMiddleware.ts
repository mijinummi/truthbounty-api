import { resolveClientIp } from "../utils/ipAddress";

export function auditMiddleware(req: any, res: any, next: any) {
  const ipAddress = resolveClientIp(req);

  req.auditContext = {
    ipAddress,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  return next();
}