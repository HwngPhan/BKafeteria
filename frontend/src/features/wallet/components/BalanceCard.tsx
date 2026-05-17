"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  TrendingUp,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [
  50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000,
];

const BANK = {
  name: "Vietcombank",
  number: "9876543210",
  owner: "BKAFETERIA",
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN");
}

function makeQRUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&color=1e1b4b&bgcolor=ffffff&margin=8`;
}

export function BalanceCard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const transferContent = `NAP TIEN ${user?.studentId || user?.fullName?.toUpperCase().replace(/\s+/g, "") || "BKA"}`;
  const qrData = `${BANK.name}|STK:${BANK.number}|${amount ?? 0}|${transferContent}`;
  const qrUrl = makeQRUrl(qrData);

  const handlePreset = (val: number) => {
    setAmount(val);
    setInputValue(formatVND(val));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setAmount(null);
      setInputValue("");
      return;
    }
    const num = parseInt(raw, 10);
    setAmount(num);
    setInputValue(formatVND(num));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setAmount(null);
    setInputValue("");
  };

  const handleConfirm = () => {
    if (!amount || amount < 10_000) {
      toast.error(t("wallet.min_amount"));
      return;
    }
    toast.success(t("wallet.scanning"));
    handleClose();
  };

  const isAmountValid = !!amount && amount >= 10_000;

  return (
    <>
      {/* ── Balance card ── */}
      <Card className="relative overflow-hidden rounded-[2.5rem] border-none bg-primary text-white shadow-2xl shadow-primary/30">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium opacity-80 flex items-center gap-2">
            <Wallet size={20} />
            {t("wallet.balance")}
          </CardTitle>
          <TrendingUp size={24} className="opacity-50" />
        </CardHeader>

        <CardContent className="relative space-y-8 py-6">
          <div>
            <span className="text-5xl font-black tracking-tight">
              {user?.balance?.toLocaleString() || "0"}
            </span>
            <span className="ml-2 text-2xl font-bold opacity-70">VNĐ</span>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              data-testid="deposit-btn"
              className="flex-1 h-14 rounded-2xl font-bold bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md"
              onClick={() => setOpen(true)}
            >
              <ArrowUpRight className="mr-2 h-5 w-5" />
              {t("wallet.deposit")}
            </Button>
            {/* <Button
              variant="secondary"
              className="flex-1 h-14 rounded-2xl font-bold bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md"
              onClick={() => toast.info(t('wallet.toast_withdraw'))}
            >
              <ArrowDownLeft className="mr-2 h-5 w-5" />
              {t('wallet.withdraw')}
            </Button> */}
          </div>
        </CardContent>
      </Card>

      {/* ── Deposit dialog ── */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl p-0 bg-white w-[calc(100%-1.5rem)] max-w-md mx-auto overflow-hidden flex flex-col max-h-[90dvh]">
          {/* Header gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-700 p-6 text-white shrink-0">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <DialogTitle className="text-xl font-black relative z-10">
              {t("wallet.deposit_title")}
            </DialogTitle>
            <p className="text-sm text-white/70 mt-1 relative z-10">
              {t("wallet.deposit_subtitle")}
            </p>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
            {/* Preset amounts */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {t("wallet.quick_amounts")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    onClick={() => handlePreset(val)}
                    className={cn(
                      "rounded-xl h-10 text-sm font-bold border transition-all",
                      amount === val
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "border-secondary/20 hover:border-primary/30 hover:text-primary",
                    )}
                  >
                    {val >= 1_000_000
                      ? `${val / 1_000_000}tr`
                      : `${val / 1_000}k`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {t("wallet.custom_amount")}
              </p>
              <div className="relative">
                <Input
                  data-testid="amount-input"
                  value={inputValue}
                  onChange={handleInput}
                  placeholder="0"
                  inputMode="numeric"
                  className="rounded-xl h-12 text-right pr-8 text-lg font-black border-secondary/20 focus:border-primary focus-visible:ring-0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
                  đ
                </span>
              </div>
              {amount !== null && amount < 10_000 && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">
                  {t("wallet.min_amount")}
                </p>
              )}
            </div>

            {/* QR + Bank info — visible when amount is valid */}
            {isAmountValid && (
              <>
                <Separator className="bg-secondary/5" />

                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    {t("wallet.bank_info")}
                  </p>

                  <div className="flex gap-4 items-start">
                    {/* QR code */}
                    <div
                      data-testid="qr-code"
                      className="shrink-0 p-2 bg-white border border-secondary/10 rounded-2xl shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt="QR chuyển khoản"
                        width={120}
                        height={120}
                        className="rounded-xl"
                        loading="lazy"
                      />
                    </div>

                    {/* Bank detail rows */}
                    <div className="flex-1 space-y-2.5 min-w-0">
                      {(
                        [
                          {
                            label: t("wallet.bank_name_label"),
                            value: BANK.name,
                            key: "bank",
                          },
                          {
                            label: t("wallet.account_number"),
                            value: BANK.number,
                            key: "acc",
                            copy: true,
                          },
                          {
                            label: t("wallet.account_name"),
                            value: BANK.owner,
                            key: "owner",
                          },
                          {
                            label: t("wallet.transfer_content"),
                            value: transferContent,
                            key: "ref",
                            copy: true,
                          },
                          {
                            label: t("wallet.amount_label"),
                            value: `${formatVND(amount)}đ`,
                            key: "amt",
                          },
                        ] as Array<{
                          label: string;
                          value: string;
                          key: string;
                          copy?: boolean;
                        }>
                      ).map((row) => (
                        <div key={row.key} className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                            {row.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-foreground truncate leading-tight">
                              {row.value}
                            </span>
                            {row.copy && (
                              <button
                                onClick={() => handleCopy(row.value, row.key)}
                                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                aria-label={`Copy ${row.label}`}
                              >
                                {copied === row.key ? (
                                  <CheckCircle2
                                    size={12}
                                    className="text-emerald-500"
                                  />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/70 mt-3 text-center leading-relaxed">
                    {t("wallet.qr_hint")}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="shrink-0 flex gap-3 p-5 sm:p-6 pt-0">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              {t("common.cancel")}
            </Button>
            <Button
              data-testid="confirm-deposit-btn"
              onClick={handleConfirm}
              disabled={!isAmountValid}
              className="flex-[2] h-12 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-40"
            >
              {t("wallet.confirm_deposit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
