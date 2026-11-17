import { Router } from "express";
import { auth } from "../middleware/auth.js";
import type { Repositories } from "../repositories/index.js";
import { diskEncryptionCompliance } from "../services/compliance.js";

export function devicesRouter(repos: Repositories) {
  const router = Router();

  // GET /api/devices — the devices of the caller's company, with their owner and compliance.
  // Support staff can pass ?companyId= to look at a given company.
  router.get("/", (req, res) => {
    const companyId =
      (req.query.companyId as string | undefined) ?? auth(req).companyId;
    const devices = repos.devices.listByCompany(companyId).map((device) => {
      const owner = device.ownerId
        ? repos.employees.findById(device.companyId, device.ownerId)
        : undefined;
      const latest = repos.encryptionReports.latestByDevice(
        device.companyId,
        device.id,
      );
      return {
        ...device,
        owner: owner
          ? {
              id: owner.id,
              name: `${owner.firstName} ${owner.lastName}`,
              status: owner.status,
            }
          : null,
        diskEncryption: {
          enabled: latest?.diskEncryptionEnabled ?? null,
          reportedAt: latest?.reportedAt ?? null,
          compliance: diskEncryptionCompliance(latest),
        },
      };
    });
    res.json({ devices });
  });

  // GET /api/devices/:id/encryption-reports — the raw MDM reports of one device, oldest first.
  router.get("/:id/encryption-reports", (req, res) => {
    const { companyId } = auth(req);
    const device = repos.devices.findById(companyId, req.params.id);
    if (!device) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({
      reports: repos.encryptionReports.listByDevice(companyId, device.id),
    });
  });

  return router;
}
