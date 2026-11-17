import { useEffect, useState } from "react";
import { apiFetch, setCurrentUser, type DevUser } from "./api";
import { DevicesPage } from "./pages/DevicesPage";

// Local stand-in for login: pick who you are in the header.
export function App() {
  const [users, setUsers] = useState<DevUser[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ users: DevUser[] }>("/dev/users").then(({ users }) => {
      setUsers(users);
      const first = users.find((u) => u.role === "admin") ?? users[0];
      if (first) {
        setCurrentUser(first.id);
        setUserId(first.id);
      }
    });
  }, []);

  return (
    <div className="app">
      <header>
        <strong>mini-Primo</strong>
        <label>
          Signed in as{" "}
          <select
            value={userId ?? ""}
            onChange={(e) => {
              setCurrentUser(e.target.value);
              setUserId(e.target.value);
            }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.company} ({u.role})
              </option>
            ))}
          </select>
        </label>
      </header>
      <main>{userId ? <DevicesPage key={userId} /> : <p>Loading…</p>}</main>
    </div>
  );
}
