import { useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvoices } from "../../hooks/useInvoices";

const TAX_RATE = 0.13;
const ITEMS_PER_PAGE = 20;

const DEFAULT_COMPANY = {
  name: "Manakamana Heavy Equipments Pvt. Ltd.",
  address: "Kritipur, Chovar, Bagmati Province, Nepal",
  city: "Kathmandu, Nepal",
  phone: "+977-9851068337",
  email: "mhektm@gmail.com",
  pan: "XXXXXXXXX",
  fy: "FY2082/083",
};

const EMPTY_CLIENT = {
  name: "",
  company: "",
  address: "",
  phone: "",
  gstin: "",
  payment: "Cash/Credit",
};

function numberToWords(n) {
  n = Number(n) || 0;
  if (n === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convert(num) {
    if (num < 20) return ones[num];

    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    }

    if (num < 1000) {
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + convert(num % 100) : "")
      );
    }

    if (num < 100000) {
      return (
        convert(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + convert(num % 1000) : "")
      );
    }

    if (num < 10000000) {
      return (
        convert(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + convert(num % 100000) : "")
      );
    }

    return (
      convert(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + convert(num % 10000000) : "")
    );
  }

  const rupees = Math.floor(n);
  const paisa = Math.round((n - rupees) * 100);

  let words = convert(rupees) + " Rupees";
  if (paisa > 0) words += " And " + convert(paisa) + " Paisa";

  return words + " Only";
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const PRINT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  color: #111;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.invoice-page {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  overflow: hidden;
  padding: 10mm 13mm 10mm 13mm;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.invoice-page + .invoice-page {
  page-break-before: always;
  break-before: page;
}

.inv-header {
  text-align: center;
  padding-bottom: 5pt;
  border-bottom: 2px solid #1a1a2e;
  margin-bottom: 5pt;
  flex-shrink: 0;
}

.inv-header .co-name {
  font-size: 15pt;
  font-weight: 800;
  letter-spacing: 0.4px;
  line-height: 1.2;
  color: #1a1a2e;
}

.inv-header .co-sub {
  font-size: 8.5pt;
  font-weight: 600;
  color: #444;
  margin-top: 1.5pt;
}

.page-label {
  font-size: 8pt;
  color: #666;
  text-align: right;
  margin-bottom: 3pt;
  flex-shrink: 0;
}

.info-grid {
  width: 100%;
  border-collapse: collapse;
  border: 1.5px solid #1a1a2e;
  flex-shrink: 0;
}

.info-grid td {
  padding: 4pt 6pt;
  vertical-align: top;
  font-size: 9pt;
  border: none;
}

.info-grid .left-col {
  width: 57%;
  border-right: 1.5px solid #1a1a2e;
}

.info-kv {
  width: 100%;
  border-collapse: collapse;
}

.info-kv td {
  padding: 1pt 2pt;
  vertical-align: top;
  font-size: 9pt;
  border: none;
}

.info-kv .lbl {
  font-weight: 700;
  white-space: nowrap;
  padding-right: 3pt;
}

.info-kv .colon {
  padding-right: 4pt;
}

.info-kv .val-bold {
  font-weight: 800;
}

.items-table-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  flex: 1;
}

.items-table th {
  border: 1.5px solid #1a1a2e;
  border-top: none;
  padding: 4pt 4pt;
  font-size: 9pt;
  font-weight: 800;
  text-align: center;
  background: #f0f4ff;
  color: #1a1a2e;
}

.items-table th.left {
  text-align: left;
}

.items-table th:not(:first-child) {
  border-left: none;
}

.items-table td {
  border: 1.5px solid #1a1a2e;
  border-top: none;
  padding: 3.5pt 4pt;
  font-size: 9pt;
  vertical-align: middle;
}

.items-table td:not(:first-child) {
  border-left: none;
}

.items-table td.center {
  text-align: center;
}

.items-table td.right {
  text-align: right;
}

.items-table td.bold {
  font-weight: 700;
}

.items-table tr.stretch-row {
  height: 100%;
}

.items-table tr.stretch-row td {
  height: 100%;
  vertical-align: top;
}

.continued-label {
  text-align: right;
  font-size: 8.5pt;
  font-style: italic;
  color: #555;
  padding: 4pt 2pt;
  flex-shrink: 0;
}

.totals-table {
  width: 100%;
  border-collapse: collapse;
  flex-shrink: 0;
}

.totals-table td {
  border: 1.5px solid #1a1a2e;
  border-top: none;
  vertical-align: top;
}

.inwords-cell {
  width: 55%;
  padding: 5pt 7pt;
  font-size: 9pt;
  border-right: none;
}

.totals-cell {
  padding: 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5pt 7pt;
  font-size: 9pt;
  border-bottom: 1px solid #1a1a2e;
}

.total-row:last-child {
  border-bottom: none;
}

.total-row.grand {
  font-weight: 800;
  background: #f0f4ff;
}

.total-row .t-val {
  display: flex;
  gap: 6pt;
}

.total-row .t-num {
  min-width: 70pt;
  text-align: right;
}

.remarks {
  font-size: 9pt;
  margin-top: 7pt;
  flex-shrink: 0;
}

.sig-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top: 18pt;
  flex-shrink: 0;
}

.sig-col {
  text-align: center;
  padding: 0 5pt;
}

.sig-name {
  font-weight: 700;
  font-size: 9.5pt;
  height: 16pt;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sig-line {
  border-top: 1.5px solid #1a1a2e;
  margin-top: 2pt;
  margin-bottom: 2pt;
}

.sig-role {
  font-size: 8.5pt;
  color: #333;
}

.print-date {
  font-size: 8pt;
  color: #555;
  margin-top: 7pt;
  flex-shrink: 0;
}

@page {
  size: A4 portrait;
  margin: 0;
}

@media print {
  html, body {
    margin: 0;
    padding: 0;
    width: 210mm;
  }

  .invoice-page {
    box-shadow: none;
  }
}
`;

export default function AdminInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const { invoices, loading } = useInvoices();

  const invoice = useMemo(
    () => invoices.find((item) => item.id === id),
    [invoices, id]
  );

  const company = invoice?.company || DEFAULT_COMPANY;

  const client = {
    ...EMPTY_CLIENT,
    ...(invoice?.client || {}),
    name: invoice?.client?.name || invoice?.clientName || "",
  };

  const items = invoice?.items || [];
  const invoiceNo = invoice?.invoiceNo || "";
  const invoiceDate = invoice?.invoiceDate || "";
  const dueDate = invoice?.dueDate || "";
  const docType = invoice?.docType || "Invoice";
  const notes = invoice?.notes || "";

  const subtotal =
    invoice?.subtotal ??
    items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0),
      0
    );

  const discountPct = Number(invoice?.discountPct || 0);
  const discount = invoice?.discount ?? subtotal * (discountPct / 100);
  const taxable = subtotal - discount;
  const taxEnabled = invoice?.taxEnabled ?? true;
  const tax = invoice?.tax ?? (taxEnabled ? taxable * TAX_RATE : 0);
  const total = invoice?.total ?? taxable + tax;

  const totalRows = [
    ["Sub Total", fmt(subtotal), false],
    ...(discountPct > 0 ? [[`Discount (${discountPct}%)`, fmt(discount), false]] : []),
    ["Taxable Value", fmt(taxable), false],
    ...(taxEnabled ? [["13% VAT", fmt(tax), false]] : []),
    ["Total Amount", fmt(total), true],
  ];

  const chunks = [];

  if (items.length === 0) {
    chunks.push([]);
  } else {
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
  }

  const totalPages = chunks.length;

  const dateTimeStr = invoiceDate ? `${invoiceDate} 12:00:00PM` : "—";

  const nowStr = () => {
    const date = new Date();

    return `${date.toLocaleDateString("en-IN")} ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const safeTitle = `${docType} ${invoiceNo}`.replace(/[<>"'&]/g, "");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${safeTitle}</title>
          <style>${PRINT_STYLES}</style>
        </head>
        <body>
          <div id="print-root"></div>
        </body>
      </html>
    `);

    printWindow.document.close();

    const clone = printRef.current.cloneNode(true);
    clone.querySelectorAll("script").forEach((element) => element.remove());
    clone.removeAttribute("style");

    printWindow.document.getElementById("print-root").appendChild(clone);
    printWindow.focus();

    printWindow.onafterprint = function () {
      printWindow.close();
    };

    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const HeaderBlock = () => (
    <div className="inv-header">
      <div className="co-name">
        {company.name} [{company.fy || "FY2082/083"}]
      </div>
      <div className="co-sub">
        Phone : {company.phone} &nbsp; | &nbsp; PAN NO : {company.pan || "XXXXXXXXX"}
      </div>
    </div>
  );

  const InfoBlock = () => (
    <table className="info-grid">
      <tbody>
        <tr>
          <td className="left-col">
            <table className="info-kv">
              <tbody>
                {[
                  ["Customer", client.name || "—", true],
                  ["Address", client.address || "—", false],
                  ["Contact No.", client.phone || "—", false],
                  ["VAT/PAN No.", client.gstin || "—", false],
                  ["Payment", client.payment || "Cash/Credit", false],
                ].map(([label, value, bold]) => (
                  <tr key={label}>
                    <td className="lbl">{label}</td>
                    <td className="colon">:</td>
                    <td className={bold ? "val-bold" : ""}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>

          <td>
            <table className="info-kv">
              <tbody>
                {[
                  ["Invoice No", invoiceNo || "—", true],
                  ["Date & Time", dateTimeStr, false],
                  ["Miti", dueDate || "—", false],
                  ["Order No & Dt", "", false],
                  ["Transport", "", false],
                ].map(([label, value, bold]) => (
                  <tr key={label}>
                    <td className="lbl">{label}</td>
                    <td className="colon">:</td>
                    <td className={bold ? "val-bold" : ""}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const TableHead = () => (
    <thead>
      <tr>
        <th style={{ width: "5%" }}>SNo</th>
        <th style={{ width: "11%" }}>HS Code</th>
        <th className="left" style={{ width: "32%" }}>Product</th>
        <th style={{ width: "10%" }}>Quantity</th>
        <th style={{ width: "8%" }}>Uom</th>
        <th style={{ width: "14%" }}>Rate</th>
        <th style={{ width: "20%" }}>Net Amount</th>
      </tr>
    </thead>
  );

  const InvoiceDoc = (
    <div ref={printRef}>
      {chunks.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === totalPages - 1;
        const globalStart = pageIndex * ITEMS_PER_PAGE;

        return (
          <div className="invoice-page" key={pageIndex}>
            <HeaderBlock />

            {totalPages > 1 && (
              <div className="page-label">
                Page {pageIndex + 1} of {totalPages}
              </div>
            )}

            <InfoBlock />

            <div className="items-table-wrap">
              <table className="items-table">
                <TableHead />

                <tbody>
                  {pageItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="center">{globalStart + index + 1}</td>
                      <td className="center">{item.hsCode || ""}</td>
                      <td className="bold">{item.name}</td>
                      <td className="center">{fmt(item.qty)}</td>
                      <td className="center">{item.unit}</td>
                      <td className="right">{fmt(item.rate)}</td>
                      <td className="right bold">
                        {fmt(Number(item.qty || 0) * Number(item.rate || 0))}
                      </td>
                    </tr>
                  ))}

                  <tr className="stretch-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {!isLastPage && (
              <div className="continued-label">Continued on next page…</div>
            )}

            {isLastPage && (
              <>
                <table className="totals-table">
                  <tbody>
                    <tr>
                      <td className="inwords-cell">
                        <strong>In Words : </strong>
                        {numberToWords(total)}
                      </td>

                      <td className="totals-cell">
                        {totalRows.map(([label, value, bold]) => (
                          <div
                            key={label}
                            className={`total-row${bold ? " grand" : ""}`}
                          >
                            <span>{label}</span>
                            <span className="t-val">
                              <span>:</span>
                              <span className="t-num">{value}</span>
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="remarks">
                  <strong>Remarks :</strong> {notes}
                </div>

                <div className="sig-grid">
                  {[
                    { name: "", role: "Received By" },
                    { name: "admin", role: "Prepared" },
                    { name: "admin", role: "Printed By" },
                    { name: "", role: "Authorize By." },
                  ].map(({ name, role }) => (
                    <div key={role} className="sig-col">
                      <div className="sig-name">{name}</div>
                      <div className="sig-line" />
                      <div className="sig-role">{role}</div>
                    </div>
                  ))}
                </div>

                <div className="print-date">
                  Printed Date &amp; Time : {nowStr()}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const PREVIEW_W = 760;
  const A4_PX = 210 * (96 / 25.4);
  const A4_H_PX = 297 * (96 / 25.4);
  const SCALE = PREVIEW_W / A4_PX;

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.empty}>Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <h1 style={s.notFoundTitle}>Invoice not found</h1>
          <p style={s.notFoundText}>The invoice may have been deleted.</p>

          <button style={s.backBtn} onClick={() => navigate("/admin/invoices")}>
            ← Back to invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={s.backBtn} onClick={() => navigate("/admin/invoices")}>
              ← Back
            </button>

            <div>
              <h1 style={s.pageTitle}>View / Print {docType}</h1>
              <p style={s.pageSub}>#{invoiceNo}</p>
            </div>
          </div>

          <div style={s.topActions}>
            <button
              style={{ ...s.btn, ...s.btnGhost }}
              onClick={() => navigate(`/admin/invoice/${id}`)}
            >
              ✏️ Edit
            </button>

            <button style={{ ...s.btn, ...s.btnPrint }} onClick={handlePrint}>
              🖨 Print / PDF
            </button>
          </div>
        </div>

        <div style={s.summaryCard}>
          <div>
            <div style={s.summaryLabel}>Client</div>
            <div style={s.summaryValue}>{client.name || "—"}</div>
          </div>

          <div>
            <div style={s.summaryLabel}>Date</div>
            <div style={s.summaryValue}>{invoiceDate || "—"}</div>
          </div>

          <div>
            <div style={s.summaryLabel}>Items</div>
            <div style={s.summaryValue}>{items.length}</div>
          </div>

          <div>
            <div style={s.summaryLabel}>Total</div>
            <div style={{ ...s.summaryValue, color: "#ea580c" }}>
              Rs {fmt(total)}
            </div>
          </div>
        </div>

        <div style={s.previewLabel}>
          INVOICE PREVIEW
          {totalPages > 1 && (
            <span style={{ marginLeft: 8, color: "#f59e0b", fontWeight: 800 }}>
              {totalPages} PAGES
            </span>
          )}
        </div>

        <div
          style={{
            ...s.previewScroll,
            width: PREVIEW_W,
            height: Math.round(A4_H_PX * SCALE) + 4,
          }}
        >
          <div
            style={{
              transformOrigin: "top left",
              transform: `scale(${SCALE})`,
              width: A4_PX,
            }}
          >
            {InvoiceDoc}
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "24px 16px 50px",
  },
  topBar: {
    maxWidth: 1180,
    margin: "0 auto 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  backBtn: {
    background: "#e0f2fe",
    border: "1.5px solid #bae6fd",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    color: "#0369a1",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
  },
  pageSub: {
    fontSize: 12,
    color: "#64748b",
    margin: "2px 0 0",
  },
  topActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  btn: {
    padding: "9px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnGhost: {
    background: "#fff",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
  },
  btnPrint: {
    background: "#0369a1",
    color: "#fff",
  },
  summaryCard: {
    maxWidth: 1180,
    margin: "0 auto 18px",
    background: "#fff",
    borderRadius: 14,
    padding: "16px 18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: 14,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: 800,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: 900,
  },
  previewLabel: {
    maxWidth: 760,
    margin: "0 auto 8px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  previewScroll: {
    margin: "0 auto",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#f8fafc",
    boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
  },
  empty: {
    maxWidth: 540,
    margin: "60px auto",
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    color: "#64748b",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  notFoundTitle: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: 24,
  },
  notFoundText: {
    margin: "0 0 18px",
    color: "#64748b",
  },
};
