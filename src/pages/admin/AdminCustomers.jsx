import { useState } from "react";
import { useCustomers } from "../../hooks/useCustomers";
import { useInvoices } from "../../hooks/useInvoices";

const EMPTY = {
  name: "",
  company: "",
  phone: "",
  address: "",
  gstin: "",
  email: "",
  notes: "",
};

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCustomersCSV(customers, invoices) {
  const headers = [
    "Name",
    "Company",
    "Phone",
    "Address",
    "VAT/PAN",
    "Email",
    "Notes",
    "Invoice Count",
    "Total Billed",
  ];

  const getCustomerInvoices = (customerName) =>
    invoices.filter(
      (inv) =>
        (inv.clientName || inv.client?.name || "").toLowerCase() ===
        customerName.toLowerCase()
    );

  const rows = customers.map((customer) => {
    const customerInvoices = getCustomerInvoices(customer.name || "");
    const totalBilled = customerInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.total || 0),
      0
    );

    return [
      customer.name || "",
      customer.company || "",
      customer.phone || "",
      customer.address || "",
      customer.gstin || "",
      customer.email || "",
      customer.notes || "",
      customerInvoices.length,
      totalBilled.toFixed(2),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

export default function AdminCustomers() {
  const {
    customers,
    loading,
    useLocal,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const { invoices } = useInvoices();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [delConfirm, setDelConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);

  const filtered = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone || "").includes(search) ||
      (customer.gstin || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      company: customer.company || "",
      phone: customer.phone || "",
      address: customer.address || "",
      gstin: customer.gstin || "",
      email: customer.email || "",
      notes: customer.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await updateCustomer(editing.id, form);
      } else {
        await addCustomer(form);
      }

      setShowModal(false);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getCustomerInvoices = (customerName) =>
    invoices
      .filter(
        (invoice) =>
          (invoice.clientName || invoice.client?.name || "").toLowerCase() ===
          customerName.toLowerCase()
      )
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const getCustomerTotal = (customerName) =>
    getCustomerInvoices(customerName).reduce(
      (sum, invoice) => sum + (invoice.total || 0),
      0
    );

  const fmt = (number) =>
    Number(number).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtDate = (invoice) => {
    if (invoice.invoiceDate) return invoice.invoiceDate;
    if (invoice.createdAt?.seconds) {
      return new Date(invoice.createdAt.seconds * 1000).toLocaleDateString("en-IN");
    }
    return "—";
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <div>
            <p style={s.labelTag}>ADMIN · CUSTOMERS</p>
            <h1 style={s.title}>Customer Directory</h1>
          </div>

          <div style={s.headerRight}>
            <input
              style={s.search}
              placeholder="🔍 Search name, company, phone…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {customers.length > 0 && (
              <button
                style={s.exportBtn}
                onClick={() => exportCustomersCSV(customers, invoices)}
              >
                📥 Export CSV
              </button>
            )}

            <button style={s.addBtn} onClick={openAdd}>
              + Add Customer
            </button>
          </div>
        </div>

        <div style={{ ...s.banner, ...(useLocal ? s.bannerLocal : s.bannerFire) }}>
          {useLocal
            ? "⚠️ Firebase not configured — customers saved in browser localStorage."
            : `✅ Firebase connected — ${customers.length} customer${
                customers.length !== 1 ? "s" : ""
              } in directory.`}
        </div>

        <div style={s.statsRow}>
          {[
            ["👥", customers.length, "Total Customers"],
            ["🧾", invoices.length, "Total Invoices"],
            [
              "💰",
              "Rs " + fmt(invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)),
              "Total Revenue",
            ],
          ].map(([icon, value, label]) => (
            <div key={label} style={s.statCard}>
              <div style={s.statIcon}>{icon}</div>
              <div style={s.statVal}>{value}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={s.loading}>
            <div style={s.spinner} />
            <p>Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 52 }}>👤</div>
            <p style={{ color: "#64748b", marginTop: 10 }}>
              {search
                ? `No customers match "${search}"`
                : "No customers yet. Add one or save an invoice to auto-create."}
            </p>

            {!search && (
              <button style={{ ...s.addBtn, marginTop: 14 }} onClick={openAdd}>
                + Add First Customer
              </button>
            )}
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>VAT/PAN</th>
                  <th style={s.th}>Invoices</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Total Billed</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((customer, index) => {
                  const invoiceCount = getCustomerInvoices(customer.name).length;
                  const total = getCustomerTotal(customer.name);

                  return (
                    <tr key={customer.id} style={index % 2 === 0 ? s.trEven : s.trOdd}>
                      <td style={{ ...s.td, color: "#94a3b8", fontSize: 11 }}>
                        {index + 1}
                      </td>

                      <td style={s.td}>
                        <div style={s.customerName}>{customer.name}</div>

                        {customer.company && (
                          <div style={s.customerCompany}>{customer.company}</div>
                        )}

                        {customer.address && (
                          <div style={s.customerAddress}>{customer.address}</div>
                        )}

                        {customer.email && (
                          <div style={s.customerEmail}>{customer.email}</div>
                        )}
                      </td>

                      <td style={s.td}>
                        {customer.phone ? (
                          <span style={s.phoneBadge}>📞 {customer.phone}</span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>

                      <td style={s.td}>
                        {customer.gstin ? (
                          <span style={s.gstBadge}>{customer.gstin}</span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>

                      <td style={{ ...s.td, textAlign: "center" }}>
                        {invoiceCount > 0 ? (
                          <span
                            style={s.invBadge}
                            onClick={() => setViewCustomer(customer)}
                            title="View invoices"
                          >
                            {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: 12 }}>None</span>
                        )}
                      </td>

                      <td
                        style={{
                          ...s.td,
                          textAlign: "right",
                          fontWeight: 700,
                          color: total > 0 ? "#0369a1" : "#94a3b8",
                        }}
                      >
                        {total > 0 ? "Rs " + fmt(total) : "—"}
                      </td>

                      <td style={s.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={s.btnEdit} onClick={() => openEdit(customer)}>
                            ✏️
                          </button>

                          <button
                            style={s.btnView}
                            onClick={() => setViewCustomer(customer)}
                          >
                            👁
                          </button>

                          <button
                            style={s.btnDel}
                            onClick={() => setDelConfirm(customer.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(event) => event.stopPropagation()}>
            <h2 style={s.modalTitle}>
              {editing ? "✏️ Edit Customer" : "➕ Add Customer"}
            </h2>

            <div style={s.fGrid}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={s.lbl}>
                  Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={s.inp}
                  placeholder="e.g. Ram Bahadur Shrestha"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div>
                <label style={s.lbl}>Company / Firm</label>
                <input
                  style={s.inp}
                  placeholder="e.g. ABC Traders Pvt. Ltd."
                  value={form.company}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, company: event.target.value }))
                  }
                />
              </div>

              <div>
                <label style={s.lbl}>Phone</label>
                <input
                  style={s.inp}
                  placeholder="e.g. 9841234567"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>

              <div>
                <label style={s.lbl}>Email</label>
                <input
                  type="email"
                  style={s.inp}
                  placeholder="e.g. ram@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>

              <div>
                <label style={s.lbl}>VAT / PAN No.</label>
                <input
                  style={s.inp}
                  placeholder="e.g. 500123456"
                  value={form.gstin}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, gstin: event.target.value }))
                  }
                />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={s.lbl}>Address</label>
                <input
                  style={s.inp}
                  placeholder="e.g. Kathmandu, Bagmati Province"
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={s.lbl}>Notes (internal)</label>
                <textarea
                  style={{ ...s.inp, height: 60, resize: "vertical" }}
                  placeholder="Any internal notes…"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                style={{ ...s.btn, ...s.btnSecondary, flex: 1 }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                style={{
                  ...s.btn,
                  ...s.btnPrimary,
                  flex: 1,
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div style={s.overlay} onClick={() => setDelConfirm(null)}>
          <div
            style={{ ...s.modal, maxWidth: 360 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 style={{ ...s.modalTitle, color: "#ef4444" }}>Delete Customer?</h2>
            <p style={s.deleteText}>
              This removes them from the directory only. Their invoices are not deleted.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{ ...s.btn, ...s.btnSecondary, flex: 1 }}
                onClick={() => setDelConfirm(null)}
              >
                Cancel
              </button>

              <button
                style={{
                  ...s.btn,
                  flex: 1,
                  background: "#ef4444",
                  color: "#fff",
                }}
                onClick={async () => {
                  await deleteCustomer(delConfirm);
                  setDelConfirm(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewCustomer && (
        <div style={s.overlay} onClick={() => setViewCustomer(null)}>
          <div
            style={{ ...s.modal, maxWidth: 620 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={s.viewHeader}>
              <div>
                <h2 style={{ ...s.modalTitle, marginBottom: 4 }}>
                  {viewCustomer.name}
                </h2>

                {viewCustomer.company && (
                  <p style={s.viewCompany}>{viewCustomer.company}</p>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={s.btnEdit}
                  onClick={() => {
                    setViewCustomer(null);
                    openEdit(viewCustomer);
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  style={{
                    ...s.btn,
                    ...s.btnSecondary,
                    padding: "6px 12px",
                    fontSize: 12,
                  }}
                  onClick={() => setViewCustomer(null)}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div style={s.infoGrid}>
              {[
                ["📞 Phone", viewCustomer.phone || "—"],
                ["✉️ Email", viewCustomer.email || "—"],
                ["📍 Address", viewCustomer.address || "—"],
                ["🏷 VAT/PAN", viewCustomer.gstin || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={s.infoLabel}>{label}</div>
                  <div style={s.infoValue}>{value}</div>
                </div>
              ))}

              {viewCustomer.notes && (
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={s.infoLabel}>📝 Notes</div>
                  <div style={s.infoNote}>{viewCustomer.notes}</div>
                </div>
              )}
            </div>

            <h3 style={s.historyTitle}>
              Invoice History ({getCustomerInvoices(viewCustomer.name).length})
            </h3>

            {getCustomerInvoices(viewCustomer.name).length === 0 ? (
              <div style={s.noInvoices}>No invoices yet</div>
            ) : (
              <div style={s.historyWrap}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Invoice No", "Date", "Items", "Amount", "Type"].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "8px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textAlign: heading === "Amount" ? "right" : "left",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {getCustomerInvoices(viewCustomer.name).map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc" }}
                      >
                        <td style={s.histInvNo}>{invoice.invoiceNo || "—"}</td>
                        <td style={s.histTd}>{fmtDate(invoice)}</td>
                        <td style={s.histTd}>{(invoice.items || []).length}</td>
                        <td style={s.histAmount}>Rs {fmt(invoice.total || 0)}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={s.histType}>{invoice.docType || "Invoice"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr style={s.historyTotalRow}>
                      <td colSpan={3} style={s.historyTotalLabel}>
                        Total Billed
                      </td>
                      <td style={s.historyTotalAmount}>
                        Rs {fmt(getCustomerTotal(viewCustomer.name))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";

const s = {
  page: {
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "28px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 12,
  },
  labelTag: {
    color: PRIMARY_LIGHT,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 2,
    margin: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    margin: "4px 0 0",
  },
  headerRight: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  search: {
    padding: "9px 14px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    width: 280,
    boxSizing: "border-box",
  },
  exportBtn: {
    background: "#fff",
    color: "#334155",
    border: "1.5px solid #e2e8f0",
    borderRadius: 9,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  addBtn: {
    background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT})`,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(234,88,12,0.25)",
  },
  banner: {
    borderRadius: 10,
    padding: "10px 16px",
    marginBottom: 20,
    fontSize: 13,
    fontWeight: 500,
  },
  bannerFire: {
    background: "#ecfdf5",
    border: "1px solid #6ee7b7",
    color: "#065f46",
  },
  bannerLocal: {
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    color: "#92400e",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    textAlign: "center",
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  loading: {
    textAlign: "center",
    padding: "60px 0",
    color: "#64748b",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${PRIMARY}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 12px",
  },
  empty: {
    textAlign: "center",
    padding: "60px 0",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "#f8fafc",
  },
  th: {
    padding: "11px 14px",
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
  },
  td: {
    padding: "12px 14px",
    fontSize: 13,
    borderBottom: "1px solid #f8fafc",
    verticalAlign: "top",
  },
  trEven: {
    background: "#fff",
  },
  trOdd: {
    background: "#fafcff",
  },
  customerName: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: 14,
  },
  customerCompany: {
    fontSize: 11,
    color: "#64748b",
  },
  customerAddress: {
    fontSize: 11,
    color: "#94a3b8",
  },
  customerEmail: {
    fontSize: 11,
    color: "#0369a1",
  },
  phoneBadge: {
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: 12,
    fontWeight: 600,
    padding: "2px 9px",
    borderRadius: 6,
    border: "1px solid #bbf7d0",
  },
  gstBadge: {
    background: "#fefce8",
    color: "#a16207",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 6,
    border: "1px solid #fde68a",
    fontFamily: "monospace",
  },
  invBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 10px",
    borderRadius: 6,
    border: "1px solid #bfdbfe",
    cursor: "pointer",
  },
  btnEdit: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: 6,
    padding: "5px 9px",
    cursor: "pointer",
    fontSize: 13,
  },
  btnView: {
    background: "#eff6ff",
    border: "none",
    borderRadius: 6,
    padding: "5px 9px",
    cursor: "pointer",
    fontSize: 13,
  },
  btnDel: {
    background: "#fee2e2",
    border: "none",
    borderRadius: 6,
    padding: "5px 9px",
    cursor: "pointer",
    fontSize: 13,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 16,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    borderRadius: 18,
    padding: 28,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    marginTop: 0,
    marginBottom: 16,
  },
  fGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 14px",
  },
  lbl: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 5,
  },
  inp: {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 7,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    color: "#0f172a",
    marginBottom: 12,
    boxSizing: "border-box",
    outline: "none",
  },
  btn: {
    padding: "9px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnPrimary: {
    background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT})`,
    color: "#fff",
  },
  btnSecondary: {
    background: "#f1f5f9",
    color: "#334155",
  },
  deleteText: {
    color: "#64748b",
    marginBottom: 24,
    fontSize: 14,
  },
  viewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  viewCompany: {
    color: "#0369a1",
    fontWeight: 600,
    fontSize: 13,
    margin: 0,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
    background: "#f8fafc",
    borderRadius: 10,
    padding: 14,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 13,
    color: "#0f172a",
    marginTop: 2,
  },
  infoNote: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0369a1",
    letterSpacing: 1,
    textTransform: "uppercase",
    margin: "0 0 10px",
  },
  noInvoices: {
    textAlign: "center",
    padding: 20,
    color: "#94a3b8",
    border: "2px dashed #e2e8f0",
    borderRadius: 8,
  },
  historyWrap: {
    maxHeight: 280,
    overflowY: "auto",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  histInvNo: {
    padding: "8px 10px",
    fontSize: 13,
    fontWeight: 700,
    color: "#0369a1",
  },
  histTd: {
    padding: "8px 10px",
    fontSize: 12,
    color: "#64748b",
  },
  histAmount: {
    padding: "8px 10px",
    fontSize: 13,
    fontWeight: 700,
    textAlign: "right",
    color: "#0f172a",
  },
  histType: {
    background: "#f0f9ff",
    color: "#0369a1",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 4,
  },
  historyTotalRow: {
    background: "#f0f9ff",
    borderTop: "2px solid #bae6fd",
  },
  historyTotalLabel: {
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 700,
    color: "#0369a1",
  },
  historyTotalAmount: {
    padding: "8px 10px",
    fontSize: 14,
    fontWeight: 800,
    textAlign: "right",
    color: "#0369a1",
  },
};
