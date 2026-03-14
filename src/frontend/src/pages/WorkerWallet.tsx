import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type WalletTransaction,
  type WithdrawalRecord,
  addWalletTransaction,
  generateTxnId,
  getMyExtendedProfile,
  getWalletBalance,
  getWalletTransactions,
  getWithdrawals,
  saveWithdrawalRecord,
} from "../lib/constants";

export function WorkerWallet() {
  const navigate = useNavigate();
  const myProfile = getMyExtendedProfile();
  const mobile = myProfile?.mobile ?? "";

  const [balance, setBalance] = useState(() => getWalletBalance(mobile));
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() =>
    getWalletTransactions(mobile).sort((a, b) => b.createdAt - a.createdAt),
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() =>
    getWithdrawals(mobile),
  );

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "upi">("upi");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  function refresh() {
    setBalance(getWalletBalance(mobile));
    setTransactions(
      getWalletTransactions(mobile).sort((a, b) => b.createdAt - a.createdAt),
    );
    setWithdrawals(getWithdrawals(mobile));
  }

  function handleWithdraw() {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error("Valid amount daalo");
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (withdrawMethod === "bank") {
      if (!accountNumber.trim()) {
        toast.error("Account number daalo");
        return;
      }
      if (!ifsc.trim()) {
        toast.error("IFSC code daalo");
        return;
      }
    } else {
      if (!upiId.includes("@")) {
        toast.error("Valid UPI ID daalo");
        return;
      }
    }

    const id = generateTxnId();
    const rec: WithdrawalRecord = {
      id,
      mobile,
      method: withdrawMethod,
      accountNumber: withdrawMethod === "bank" ? accountNumber : undefined,
      ifsc: withdrawMethod === "bank" ? ifsc : undefined,
      upiId: withdrawMethod === "upi" ? upiId : undefined,
      amount: amt,
      status: "pending",
      createdAt: Date.now(),
    };
    saveWithdrawalRecord(rec);
    addWalletTransaction({
      id,
      mobile,
      type: "debit",
      amount: amt,
      description: `Withdrawal - ${withdrawMethod === "upi" ? upiId : accountNumber}`,
      createdAt: Date.now(),
    });
    setWithdrawAmount("");
    setAccountNumber("");
    setIfsc("");
    setUpiId("");
    refresh();
    toast.success("Withdrawal request submit ho gayi! ✅");
  }

  if (!mobile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-3">👤</p>
          <p className="font-bold text-xl">Login Required</p>
          <p className="text-sm text-gray-500 mt-1">
            Wallet dekhne ke liye profile banao
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate({ to: "/create-profile" })}
          >
            Profile Banao
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="wallet.page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#072654] text-white px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 -ml-2"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Wallet className="w-5 h-5" />
        <span className="font-bold text-base">Worker Wallet</span>
      </header>

      {/* Balance Card */}
      <div className="bg-[#072654] pb-6 px-4">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center">
          <p className="text-white/70 text-sm">Available Balance</p>
          <p className="text-4xl font-black text-white mt-1">₹{balance}</p>
          <p className="text-white/60 text-xs mt-1">{myProfile?.mobile}</p>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="transactions">
          <TabsList className="w-full grid grid-cols-2 h-11">
            <TabsTrigger
              data-ocid="wallet.transactions_tab"
              value="transactions"
              className="font-bold"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              data-ocid="wallet.withdraw_tab"
              value="withdraw"
              className="font-bold"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-3 mt-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📊</p>
                <p className="font-bold text-gray-600">Koi transaction nahi</p>
                <p className="text-xs text-gray-400 mt-1">
                  Booking complete hone par earnings yahaan ayengi
                </p>
              </div>
            ) : (
              transactions.map((t, i) => (
                <div
                  key={t.id}
                  data-ocid={`wallet.item.${i + 1}`}
                  className="bg-white rounded-2xl border p-3 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.type === "credit" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {t.type === "credit" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {t.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-black text-sm ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "credit" ? "+" : "-"}₹{t.amount}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        t.type === "credit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="space-y-4 mt-3">
            <div className="bg-white rounded-2xl border p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Withdraw Amount (Max ₹{balance})
                </Label>
                <Input
                  data-ocid="wallet.amount_input"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) =>
                    setWithdrawAmount(e.target.value.replace(/\D/g, ""))
                  }
                  className="h-12"
                  inputMode="numeric"
                />
              </div>

              {/* Method Toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(["upi", "bank"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`h-10 rounded-xl border-2 text-xs font-bold transition-all ${
                      withdrawMethod === m
                        ? "border-[#072654] bg-blue-50 text-[#072654]"
                        : "border-gray-200 text-gray-600"
                    }`}
                    onClick={() => setWithdrawMethod(m)}
                  >
                    {m === "upi" ? "📱 UPI" : "🏦 Bank Account"}
                  </button>
                ))}
              </div>

              {withdrawMethod === "upi" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">UPI ID</Label>
                  <Input
                    data-ocid="wallet.upi_input"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-12"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Account Number</Label>
                    <Input
                      data-ocid="wallet.bank_account_input"
                      placeholder="Bank account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">IFSC Code</Label>
                    <Input
                      data-ocid="wallet.ifsc_input"
                      placeholder="e.g. SBIN0001234"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              <Button
                data-ocid="wallet.withdraw_button"
                className="w-full h-12 bg-[#072654] text-white font-bold rounded-2xl"
                onClick={handleWithdraw}
              >
                Withdraw Karo
              </Button>
            </div>

            {/* Withdrawal History */}
            {withdrawals.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Withdrawal History
                </p>
                {withdrawals.map((w, i) => (
                  <div
                    key={w.id}
                    data-ocid={`wallet.item.${i + 1}`}
                    className="bg-white rounded-xl border p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        ₹{w.amount}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {w.method === "upi" ? w.upiId : w.accountNumber} ·{" "}
                        {new Date(w.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        w.status === "processed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {w.status === "processed" ? "✅ Processed" : "⏳ Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default WorkerWallet;
