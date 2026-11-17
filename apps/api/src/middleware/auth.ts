import type { NextFunction, Request, Response } from "express";
import type { EmployeeRole } from "../domain.js";
import type { Repositories } from "../repositories/index.js";

export interface AuthContext {
  userId: string;
  companyId: string;
  role: EmployeeRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

// Stand-in for real authentication: the caller says who they are in `x-user-id`.
// What matters is what comes after: req.auth.companyId is the tenant of the request.
export function authenticate(repos: Repositories) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header("x-user-id");
    const user = userId ? repos.employees.findByIdUnscoped(userId) : undefined;
    if (!user || user.status !== "active") {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    req.auth = { userId: user.id, companyId: user.companyId, role: user.role };
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  next();
}

// Internal endpoints (jobs) are called by the scheduler, not by users. It sends the shared key.
export function requireJobKey(jobKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.header("x-job-key") !== jobKey) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    next();
  };
}

export function auth(req: Request): AuthContext {
  if (!req.auth)
    throw new Error("auth() called on a route without authenticate()");
  return req.auth;
}
