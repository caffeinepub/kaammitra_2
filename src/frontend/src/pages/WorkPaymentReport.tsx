import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  FileText,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type WorkPaymentRecord,
  addPaymentEntry,
  calculateWorkDays,
  deleteWorkPaymentRecord,
  getPaidAmount,
  getPendingAmount,
  loadWorkPaymentRecords,
  saveWorkPaymentRecord,
} from "../lib/paymentData";

// Style constants
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };
const orange = "#FF6F00";
const green = "#4CAF50";
const red = "#F44336";

const ALL_WORK_TYPES = [
  "Mason / Raj Mistri",
  "Helper / Labour",
  "JCB Operator",
  "Excavator Operator",
  "Crane Operator",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Welder",
  "Driver",
  "Loader / Unloader",
  "Security Guard",
  "Housekeeping",
  "Cook / Chef",
  "Office Assistant",
  "Supervisor",
  "Other",
];

function generatePDFReport(r: WorkPaymentRecord) {
  const days = calculateWorkDays(r.startDate, r.endDate);
  const paid = getPaidAmount(r);
  const pending = getPendingAmount(r);

  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
      .header { background: linear-gradient(135deg, #FF6F00, #E53935); color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 22px; }
      .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.85; }
      .section { border: 1px solid #ddd; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
      .section h2 { margin: 0 0 10px; font-size: 14px; color: #FF6F00; border-bottom: 1px solid #FFE0B2; padding-bottom: 6px; }
      .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
      .row:last-child { border-bottom: none; }
      .label { color: #666; }
      .paid { color: #2e7d32; font-weight: bold; }
      .pending { color: #c62828; font-weight: bold; }
      .payment-entry { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
    </style>
    </head><body>
    <div class="header">
      <h1>🏗 KaamMitra — Work Payment Report</h1>
      <p>Generated on ${new Date().toLocaleDateString("en-IN")}</p>
    </div>
    <div class="section">
      <h2>Worker Details</h2>
      <div class="row"><span class="label">Worker Name</span><span>${r.workerName}</span></div>
      <div class="row"><span class="label">Work Type</span><span>${r.workType}</span></div>
      <div class="row"><span class="label">Period</span><span>${r.startDate} → ${r.endDate}</span></div>
      <div class="row"><span class="label">Total Days</span><span>${days} days</span></div>
    </div>
    <div class="section">
      <h2>Payment Summary</h2>
      <div class="row"><span class="label">Total Amount</span><span>₹${r.totalAmount.toLocaleString()}</span></div>
      <div class="row"><span class="label">Paid Amount</span><span class="paid">₹${paid.toLocaleString()}</span></div>
      <div class="row"><span class="label">Pending Amount</span><span class="${pending > 0 ? "pending" : "paid"}">₹${pending.toLocaleString()}</span></div>
    </div>
    <div class="section">
      <h2>Payment History</h2>
      ${r.payments.length === 0 ? "<p style='color:#999;font-size:12px'>No payments recorded</p>" : r.payments.map((p) => `<div class="payment-entry"><span>${p.date}${p.note ? ` — ${p.note}` : ""}</span><span class="paid">₹${p.amount}</span></div>`).join("")}
    </div>
    </body></html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

function sendWhatsAppReminder(r: WorkPaymentRecord) {
  const pending = getPendingAmount(r);
  const msg = encodeURIComponent(
    `Namaskar! KaamMitra se payment reminder:\n\n*Worker:* ${r.workerName}\n*Work:* ${r.workType}\n*Period:* ${r.startDate} se ${r.endDate}\n*Pending Amount:* ₹${pending}\n\nKripya payment jaldi clear karein. Dhanyawad! 🙏\n\n— KaamMitra App`,
  );
  window.open(`https://wa.me/?text=${msg}`);
}

interface AddPaymentDialogState {
  open: boolean;
  recordId: string;
  date: string;
  amount: string;
  note: string;
}

interface AddRecordDialogState {
  open: boolean;
  workerName: string;
  workerMobile: string;
  workType: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
}

export function WorkPaymentReport() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<WorkPaymentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [addPayment, setAddPayment] = useState<AddPaymentDialogState>({
    open: false,
    recordId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    note: "",
  });

  const [addRecord, setAddRecord] = useState<AddRecordDialogState>({
    open: false,
    workerName: "",
    workerMobile: "",
    workType: "",
    startDate: "",
    endDate: "",
    totalAmount: "",
  });

  const loadRecords = () => setRecords(loadWorkPaymentRecords());

  useEffect(() => {
    setRecords(loadWorkPaymentRecords());
  }, []);

  const totalWorkers = records.length;
  const totalAmount = records.reduce((s, r) => s + r.totalAmount, 0);
  const totalPaid = records.reduce((s, r) => s + getPaidAmount(r), 0);
  const totalPending = records.reduce((s, r) => s + getPendingAmount(r), 0);

  const uniqueWorkTypes = useMemo(
    () => [...new Set(records.map((r) => r.workType))],
    [records],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = r.workerName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchType =
        workTypeFilter === "all" || r.workType === workTypeFilter;
      const pending = getPendingAmount(r);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && pending === 0) ||
        (statusFilter === "pending" && pending > 0);
      return matchSearch && matchType && matchStatus;
    });
  }, [records, search, workTypeFilter, statusFilter]);

  const handleAddPayment = () => {
    const amount = Number.parseFloat(addPayment.amount);
    if (!addPayment.date || Number.isNaN(amount) || amount <= 0) {
      toast.error("Date aur valid amount required hai");
      return;
    }
    addPaymentEntry(addPayment.recordId, {
      date: addPayment.date,
      amount,
      note: addPayment.note || undefined,
    });
    loadRecords();
    toast.success("Payment add ho gaya! ✅");
    setAddPayment({
      open: false,
      recordId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      note: "",
    });
  };

  const handleAddRecord = () => {
    if (
      !addRecord.workerName ||
      !addRecord.workType ||
      !addRecord.startDate ||
      !addRecord.endDate ||
      !addRecord.totalAmount
    ) {
      toast.error("Sab required fields fill karein");
      return;
    }
    saveWorkPaymentRecord({
      id: `wr_${Date.now()}`,
      workerName: addRecord.workerName,
      workerMobile: addRecord.workerMobile || undefined,
      workType: addRecord.workType,
      startDate: addRecord.startDate,
      endDate: addRecord.endDate,
      totalAmount: Number.parseFloat(addRecord.totalAmount),
      payments: [],
      createdBy: "9876543210",
      createdAt: Date.now(),
    });
    loadRecords();
    toast.success("Record add ho gaya! ✅");
    setAddRecord({
      open: false,
      workerName: "",
      workerMobile: "",
      workType: "",
      startDate: "",
      endDate: "",
      totalAmount: "",
    });
  };

  const liveDays =
    addRecord.startDate && addRecord.endDate
      ? calculateWorkDays(addRecord.startDate, addRecord.endDate)
      : null;

  return (
    <div
      style={{
        ...fontPoppins,
        background: "#F5F5F5",
        minHeight: "100vh",
        paddingBottom: "32px",
      }}
    >
      {/* ── STICKY HEADER ── */}
      <div
        data-ocid="payment_report.section"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: `linear-gradient(135deg, ${orange} 0%, #E65100 100%)`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(255,111,0,0.35)",
        }}
      >
        <button
          type="button"
          data-ocid="payment_report.link"
          onClick={() => navigate({ to: "/" })}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <span
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            flex: 1,
            textAlign: "center",
          }}
        >
          📊 Work Payment Report
        </span>
        <button
          type="button"
          data-ocid="payment_report.open_modal_button"
          onClick={() => setAddRecord((p) => ({ ...p, open: true }))}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "20px",
            padding: "6px 14px",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            ...fontPoppins,
          }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div
        style={{
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* ── SUMMARY CARDS ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <div
            data-ocid="payment_report.card"
            style={{
              background: "white",
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              borderTop: "3px solid #2196F3",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9E9E9E",
                margin: 0,
                fontWeight: 600,
              }}
            >
              👷 Total Workers
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#1565C0",
                margin: "4px 0 0",
              }}
            >
              {totalWorkers}
            </p>
          </div>
          <div
            data-ocid="payment_report.card"
            style={{
              background: "white",
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              borderTop: `3px solid ${orange}`,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9E9E9E",
                margin: 0,
                fontWeight: 600,
              }}
            >
              💰 Total Amount
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: orange,
                margin: "4px 0 0",
              }}
            >
              ₹{totalAmount.toLocaleString()}
            </p>
          </div>
          <div
            data-ocid="payment_report.card"
            style={{
              background: "white",
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              borderTop: `3px solid ${green}`,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9E9E9E",
                margin: 0,
                fontWeight: 600,
              }}
            >
              ✅ Total Paid
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: green,
                margin: "4px 0 0",
              }}
            >
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div
            data-ocid="payment_report.card"
            style={{
              background: "white",
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              borderTop: `3px solid ${red}`,
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9E9E9E",
                margin: 0,
                fontWeight: 600,
              }}
            >
              ⚠️ Pending
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: red,
                margin: "4px 0 0",
              }}
            >
              ₹{totalPending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── PENDING ALERTS BANNER ── */}
        {totalPending > 0 && (
          <div
            data-ocid="payment_report.panel"
            style={{
              background: "#FFF8E1",
              border: "1px solid #FFD54F",
              borderRadius: 12,
              padding: "10px 14px",
            }}
          >
            <span
              style={{
                ...fontPoppins,
                fontSize: 13,
                fontWeight: 700,
                color: "#F57F17",
                display: "block",
                marginBottom: 8,
              }}
            >
              🔔 {records.filter((r) => getPendingAmount(r) > 0).length} workers
              ka payment pending hai
            </span>
            {records
              .filter((r) => getPendingAmount(r) > 0)
              .map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 6,
                    background: "white",
                    borderRadius: 8,
                    padding: "6px 10px",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    ₹{getPendingAmount(r)} pending — {r.workerName}
                  </span>
                  <button
                    type="button"
                    data-ocid="payment_report.button"
                    onClick={() => sendWhatsAppReminder(r)}
                    style={{
                      background: "#25D366",
                      color: "white",
                      border: "none",
                      borderRadius: 20,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      ...fontPoppins,
                    }}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* ── SEARCH + FILTERS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9E9E9E",
              }}
            />
            <Input
              data-ocid="payment_report.search_input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Worker naam se search karein..."
              style={{
                paddingLeft: 38,
                borderRadius: 10,
                border: "1px solid #E0E0E0",
                ...fontPoppins,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
              <SelectTrigger
                data-ocid="payment_report.select"
                style={{
                  flex: 1,
                  borderRadius: 10,
                  ...fontPoppins,
                  fontSize: 13,
                }}
              >
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueWorkTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="payment_report.select"
                style={{
                  flex: 1,
                  borderRadius: 10,
                  ...fontPoppins,
                  fontSize: 13,
                }}
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── WORKER RECORDS LIST ── */}
        {filteredRecords.length === 0 ? (
          <div
            data-ocid="payment_report.empty_state"
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "white",
              borderRadius: 14,
              color: "#9E9E9E",
            }}
          >
            <p style={{ fontSize: 32, margin: 0 }}>📋</p>
            <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>
              Koi record nahi mila
            </p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              "Add Record" button se naya worker record add karein
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredRecords.map((r, idx) => {
              const paid = getPaidAmount(r);
              const pending = getPendingAmount(r);
              const isPaid = pending === 0;
              const paidPct =
                r.totalAmount > 0
                  ? Math.min(100, (paid / r.totalAmount) * 100)
                  : 0;
              const isExpanded = expandedId === r.id;

              return (
                <div
                  key={r.id}
                  data-ocid={`payment_report.item.${idx + 1}`}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
                    borderLeft: `4px solid ${isPaid ? green : red}`,
                  }}
                >
                  <div style={{ padding: "14px 14px 12px" }}>
                    {/* TOP ROW */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: 15,
                            color: "#212121",
                          }}
                        >
                          {r.workerName}
                        </p>
                        {r.workerMobile && (
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 11,
                              color: "#9E9E9E",
                            }}
                          >
                            📱 {r.workerMobile}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: isPaid ? "#E8F5E9" : "#FFEBEE",
                          color: isPaid ? green : red,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isPaid ? "✅ PAID" : `⚠ ₹${pending} Pending`}
                      </span>
                    </div>

                    {/* CHIPS */}
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          background: "#FFF3E0",
                          color: "#E65100",
                          fontSize: 11,
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontWeight: 600,
                        }}
                      >
                        {r.workType}
                      </span>
                      <span
                        style={{
                          background: "#E3F2FD",
                          color: "#1565C0",
                          fontSize: 11,
                          padding: "2px 10px",
                          borderRadius: 20,
                        }}
                      >
                        {calculateWorkDays(r.startDate, r.endDate)} days
                      </span>
                      <span style={{ fontSize: 11, color: "#9E9E9E" }}>
                        {r.startDate} → {r.endDate}
                      </span>
                    </div>

                    {/* PAYMENT SUMMARY */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 4,
                        marginBottom: 10,
                        background: "#F9F9F9",
                        borderRadius: 10,
                        padding: "8px 12px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            color: "#9E9E9E",
                            fontWeight: 600,
                          }}
                        >
                          Total
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#212121",
                          }}
                        >
                          ₹{r.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          borderLeft: "1px solid #EEE",
                          borderRight: "1px solid #EEE",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            color: "#9E9E9E",
                            fontWeight: 600,
                          }}
                        >
                          Paid
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 800,
                            color: green,
                          }}
                        >
                          ₹{paid.toLocaleString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            color: "#9E9E9E",
                            fontWeight: 600,
                          }}
                        >
                          Pending
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 800,
                            color: pending > 0 ? red : green,
                          }}
                        >
                          ₹{pending.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "#EEE",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 3,
                          background: green,
                          width: `${paidPct}%`,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        data-ocid={`payment_report.button.${idx + 1}`}
                        onClick={() =>
                          setAddPayment({
                            open: true,
                            recordId: r.id,
                            date: new Date().toISOString().split("T")[0],
                            amount: "",
                            note: "",
                          })
                        }
                        style={{
                          flex: 1,
                          minWidth: 100,
                          background: orange,
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 8px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          ...fontPoppins,
                        }}
                      >
                        + Add Payment
                      </button>
                      <button
                        type="button"
                        data-ocid={`payment_report.secondary_button.${idx + 1}`}
                        onClick={() => generatePDFReport(r)}
                        style={{
                          background: "#E3F2FD",
                          color: "#1565C0",
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          ...fontPoppins,
                        }}
                      >
                        <FileText size={13} /> PDF
                      </button>
                      {pending > 0 && (
                        <button
                          type="button"
                          data-ocid={`payment_report.button.${idx + 1}`}
                          onClick={() => sendWhatsAppReminder(r)}
                          style={{
                            background: "#E8F5E9",
                            color: "#2E7D32",
                            border: "none",
                            borderRadius: 8,
                            padding: "7px 10px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            ...fontPoppins,
                          }}
                        >
                          <MessageCircle size={13} /> WA
                        </button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            data-ocid={`payment_report.delete_button.${idx + 1}`}
                            style={{
                              background: "#FFEBEE",
                              color: red,
                              border: "none",
                              borderRadius: 8,
                              padding: "7px 10px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              ...fontPoppins,
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Record delete karein?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {r.workerName} ka record permanently delete ho
                              jaayega.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="payment_report.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="payment_report.confirm_button"
                              onClick={() => {
                                deleteWorkPaymentRecord(r.id);
                                loadRecords();
                                toast.success("Record delete ho gaya");
                              }}
                              style={{ background: red }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* PAYMENT HISTORY TOGGLE */}
                    <button
                      type="button"
                      data-ocid={`payment_report.toggle.${idx + 1}`}
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        background: "none",
                        border: "1px solid #EEE",
                        borderRadius: 8,
                        padding: "6px",
                        fontSize: 12,
                        color: "#757575",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        ...fontPoppins,
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      {isExpanded
                        ? "Payment History Chhupayein"
                        : "▼ View Payment History"}
                    </button>

                    {/* EXPANDED HISTORY */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: 10,
                          background: "#F9F9F9",
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#666",
                            marginBottom: 6,
                            margin: "0 0 6px",
                          }}
                        >
                          Payment History:
                        </p>
                        {r.payments.length === 0 ? (
                          <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
                            Koi payment nahi mili abhi tak
                          </p>
                        ) : (
                          r.payments.map((p) => (
                            <div
                              key={p.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "5px 0",
                                borderBottom: "1px solid #EEE",
                              }}
                            >
                              <span style={{ fontSize: 11, color: "#555" }}>
                                {p.date}
                                {p.note ? ` — ${p.note}` : ""}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: green,
                                }}
                              >
                                ₹{p.amount}
                              </span>
                            </div>
                          ))
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 6,
                            paddingTop: 6,
                            borderTop: "2px solid #DDD",
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700 }}>
                            Total Paid:
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: green,
                            }}
                          >
                            ₹{paid}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD PAYMENT DIALOG ── */}
      <Dialog
        open={addPayment.open}
        onOpenChange={(o) => setAddPayment((p) => ({ ...p, open: o }))}
      >
        <DialogContent data-ocid="payment_report.dialog" style={fontPoppins}>
          <DialogHeader>
            <DialogTitle>💳 Payment Add Karein</DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 4,
            }}
          >
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>Date *</Label>
              <Input
                data-ocid="payment_report.input"
                type="date"
                value={addPayment.date}
                onChange={(e) =>
                  setAddPayment((p) => ({ ...p, date: e.target.value }))
                }
                style={{ marginTop: 4, ...fontPoppins }}
              />
            </div>
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>
                Amount (₹) *
              </Label>
              <Input
                data-ocid="payment_report.input"
                type="number"
                placeholder="Jaise: 5000"
                value={addPayment.amount}
                onChange={(e) =>
                  setAddPayment((p) => ({ ...p, amount: e.target.value }))
                }
                style={{ marginTop: 4, ...fontPoppins }}
              />
            </div>
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>
                Note (optional)
              </Label>
              <Input
                data-ocid="payment_report.input"
                placeholder="Jaise: Advance, Final payment..."
                value={addPayment.note}
                onChange={(e) =>
                  setAddPayment((p) => ({ ...p, note: e.target.value }))
                }
                style={{ marginTop: 4, ...fontPoppins }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                data-ocid="payment_report.cancel_button"
                variant="outline"
                onClick={() => setAddPayment((p) => ({ ...p, open: false }))}
                style={{ flex: 1, ...fontPoppins }}
              >
                Cancel
              </Button>
              <Button
                data-ocid="payment_report.submit_button"
                onClick={handleAddPayment}
                style={{
                  flex: 1,
                  background: orange,
                  color: "white",
                  ...fontPoppins,
                }}
              >
                ✅ Add Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ADD RECORD DIALOG ── */}
      <Dialog
        open={addRecord.open}
        onOpenChange={(o) => setAddRecord((p) => ({ ...p, open: o }))}
      >
        <DialogContent data-ocid="payment_report.modal" style={fontPoppins}>
          <DialogHeader>
            <DialogTitle>➕ Naya Worker Record</DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 4,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>
                Worker Name *
              </Label>
              <Input
                data-ocid="payment_report.input"
                placeholder="Jaise: Ramesh Kumar"
                value={addRecord.workerName}
                onChange={(e) =>
                  setAddRecord((p) => ({ ...p, workerName: e.target.value }))
                }
                style={{ marginTop: 4, ...fontPoppins }}
              />
            </div>
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>
                Mobile (optional)
              </Label>
              <Input
                data-ocid="payment_report.input"
                type="tel"
                placeholder="Jaise: 9876543210"
                value={addRecord.workerMobile}
                onChange={(e) =>
                  setAddRecord((p) => ({ ...p, workerMobile: e.target.value }))
                }
                style={{ marginTop: 4, ...fontPoppins }}
              />
            </div>
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>
                Work Type *
              </Label>
              <Select
                value={addRecord.workType}
                onValueChange={(v) =>
                  setAddRecord((p) => ({ ...p, workType: v }))
                }
              >
                <SelectTrigger
                  data-ocid="payment_report.select"
                  style={{ marginTop: 4, ...fontPoppins }}
                >
                  <SelectValue placeholder="Work type chunein" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_WORK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div>
                <Label style={{ fontSize: 13, fontWeight: 600 }}>
                  Start Date *
                </Label>
                <Input
                  data-ocid="payment_report.input"
                  type="date"
                  value={addRecord.startDate}
                  onChange={(e) =>
                    setAddRecord((p) => ({ ...p, startDate: e.target.value }))
                  }
                  style={{ marginTop: 4, ...fontPoppins }}
                />
              </div>
              <div>
                <Label style={{ fontSize: 13, fontWeight: 600 }}>
                  End Date *
                </Label>
                <Input
                  data-ocid="payment_report.input"
                  type="date"
                  value={addRecord.endDate}
                  onChange={(e) =>
                    setAddRecord((p) => ({ ...p, endDate: e.target.value }))
                  }
                  style={{ marginTop: 4, ...fontPoppins }}
                />
              </div>
            </div>
            {liveDays !== null && (
              <div
                style={{
                  background: "#FFF3E0",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: orange,
                }}
              >
                📅 Total Days: {liveDays} days
              </div>
            )}
            <div>
              <Label style={{ fontSize: 13, fontWeight: 600 }}>
                Total Amount (₹) *
              </Label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontWeight: 700,
                    color: "#757575",
                  }}
                >
                  ₹
                </span>
                <Input
                  data-ocid="payment_report.input"
                  type="number"
                  placeholder="Jaise: 25000"
                  value={addRecord.totalAmount}
                  onChange={(e) =>
                    setAddRecord((p) => ({ ...p, totalAmount: e.target.value }))
                  }
                  style={{ paddingLeft: 28, ...fontPoppins }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
              <Button
                data-ocid="payment_report.cancel_button"
                variant="outline"
                onClick={() => setAddRecord((p) => ({ ...p, open: false }))}
                style={{ flex: 1, ...fontPoppins }}
              >
                Cancel
              </Button>
              <Button
                data-ocid="payment_report.submit_button"
                onClick={handleAddRecord}
                style={{
                  flex: 1,
                  background: orange,
                  color: "white",
                  ...fontPoppins,
                }}
              >
                ✅ Save Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── FOOTER ── */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 0 8px",
          fontSize: 11,
          color: "#BDBDBD",
        }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          style={{ color: "#BDBDBD" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
