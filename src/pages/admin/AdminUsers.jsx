import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  name: "",
  email: "",
  role: "staff",
  active: true,
};

function safeDocId(email) {
  return email.trim().toLowerCase().replace(/\//g, "_");
}

export default function AdminUsers() {
  const { role, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const list = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (a.email || "").localeCompare(b.email || ""));

        setUsers(list);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((item) =>
      [item.name, item.email, item.role]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(q))
    );
  }, [users, search]);

  const isMainAdmin = role === "admin";

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const editUser = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      email: item.email || "",
      role: item.role || "staff",
      active: item.active !== false,
    });
  };

  const saveUser = async (event) => {
    event.preventDefault();

    if (!isMainAdmin) {
      alert("Only admin role can manage users.");
      return;
    }

    const email = form.email.trim().toLowerCase();

    if (!email) {
      alert("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const data = {
        name: form.name.trim(),
        email,
        role: form.role,
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "users", editingId), data);
      } else {
        await setDoc(doc(db, "users", safeDocId(email)), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    if (!isMainAdmin) {
      alert("Only admin role can manage users.");
      return;
    }

    if (item.email === user?.email) {
      alert("You cannot deactivate your own account.");
      return;
    }

    await updateDoc(doc(db, "users", item.id), {
      active: item.active === false,
      updatedAt: serverTimestamp(),
    });
  };

  const removeUser = async (item) => {
    if (!isMainAdmin) {
      alert("Only admin role can manage users.");
      return;
    }

    if (item.email === user?.email) {
      alert("You cannot delete your own account profile.");
      return;
    }

    const ok = confirm(`Delete ${item.email} from admin users?`);

    if (!ok) return;

    await deleteDoc(doc(db, "users", item.id));
  };

  const sendReset = async (email) => {
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to send password reset email.");
    }
  };

  if (!isMainAdmin) {
    return (
      <div style={s.page}>
        <div style={s.denied}>
          <h1 style={s.title}>Admin Users</h1>
          <p style={s.sub}>Only users with the admin role can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Admin Users</h1>
            <p style={s.sub}>
              Manage who can log in to the admin panel. Passwords are changed by reset email.
            </p>
          </div>
        </div>

        <div style={s.grid}>
          <form style={s.card} onSubmit={saveUser}>
            <h2 style={s.cardTitle}>{editingId ? "Edit User" : "Add User Profile"}</h2>

            <p style={s.note}>
              First create the email/password user in Firebase Authentication. Then add the
              same email here and choose the role.
            </p>

            <label style={s.label}>Name</label>
            <input
              style={s.input}
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Staff name"
            />

            <label style={s.label}>Email</label>
            <input
              style={s.input}
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="staff@example.com"
              disabled={Boolean(editingId)}
            />

            <label style={s.label}>Role</label>
            <select
              style={s.input}
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value }))
              }
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>

            <label style={s.checkRow}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
              Active user
            </label>

            <div style={s.formActions}>
              <button style={s.saveBtn} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update User" : "Add User"}
              </button>

              {editingId && (
                <button type="button" style={s.cancelBtn} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div style={s.card}>
            <div style={s.tableTop}>
              <h2 style={s.cardTitle}>Users</h2>

              <input
                style={s.search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
              />
            </div>

            {loading ? (
              <div style={s.empty}>Loading users...</div>
            ) : filtered.length === 0 ? (
              <div style={s.empty}>No users found.</div>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>User</th>
                      <th style={s.th}>Role</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td style={s.td}>
                          <div style={s.userName}>{item.name || "—"}</div>
                          <div style={s.userEmail}>{item.email}</div>
                        </td>

                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              ...(item.role === "admin" ? s.badgeAdmin : s.badgeStaff),
                            }}
                          >
                            {item.role || "staff"}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              ...(item.active === false
                                ? s.badgeInactive
                                : s.badgeActive),
                            }}
                          >
                            {item.active === false ? "Inactive" : "Active"}
                          </span>
                        </td>

                        <td style={s.td}>
                          <div style={s.actions}>
                            <button style={s.smallBtn} onClick={() => editUser(item)}>
                              Edit
                            </button>

                            <button
                              style={s.smallBtn}
                              onClick={() => sendReset(item.email)}
                            >
                              Reset Password
                            </button>

                            <button
                              style={s.smallBtn}
                              onClick={() => toggleActive(item)}
                            >
                              {item.active === false ? "Activate" : "Deactivate"}
                            </button>

                            <button style={s.deleteBtn} onClick={() => removeUser(item)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "28px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  sub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    maxWidth: 620,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 18,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
  },
  note: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    color: "#0369a1",
    fontSize: 12,
    lineHeight: 1.5,
    borderRadius: 10,
    padding: 10,
    margin: "0 0 14px",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    marginBottom: 12,
    outline: "none",
    boxSizing: "border-box",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 14,
  },
  formActions: {
    display: "flex",
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    background: "linear-gradient(135deg,#ea580c,#f97316)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    borderRadius: 9,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  search: {
    width: 220,
    padding: "9px 12px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    outline: "none",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 800,
    color: "#94a3b8",
    background: "#fafaf9",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px",
    fontSize: 13,
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },
  userName: {
    fontWeight: 800,
    color: "#0f172a",
  },
  userEmail: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    display: "inline-block",
    borderRadius: 999,
    padding: "3px 9px",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  badgeAdmin: {
    background: "#fef3c7",
    color: "#92400e",
  },
  badgeStaff: {
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  badgeActive: {
    background: "#dcfce7",
    color: "#166534",
  },
  badgeInactive: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  actions: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  smallBtn: {
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    padding: "6px 9px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: 7,
    padding: "6px 9px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    padding: 40,
  },
  denied: {
    maxWidth: 520,
    margin: "40px auto",
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
};
