import { useEffect, useState } from "react";
import { apiFetch, type DeviceRow } from "../api";

export function DevicesPage() {
  const [devices, setDevices] = useState<DeviceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ devices: DeviceRow[] }>("/api/devices")
      .then(({ devices }) => setDevices(devices))
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!devices) return <p>Loading…</p>;

  return (
    <section>
      <h1>Devices</h1>
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Owner</th>
            <th>Disk encryption</th>
            <th>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td>
                {d.model}
                <div className="muted">
                  {d.serialNumber} · {d.platform}
                </div>
              </td>
              <td>
                {d.owner ? (
                  d.owner.name
                ) : (
                  <span className="muted">In stock</span>
                )}
              </td>
              <td>
                <span className={`badge ${d.diskEncryption.compliance}`}>
                  {d.diskEncryption.compliance === "compliant"
                    ? "Encrypted"
                    : "Non-compliant"}
                </span>
              </td>
              <td>{new Date(d.lastSeenAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
