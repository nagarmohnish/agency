"use client";

import { useState } from "react";

interface Inputs {
  adSpend: string;
  revenue: string;
  cogs: string;
  shipping: string;
  returns: string;
  agencyFees: string;
}

interface Results {
  roas: number;
  roi: number;
  profit: number;
  totalInvestment: number;
}

const fields: { key: keyof Inputs; label: string; placeholder: string }[] = [
  { key: "adSpend", label: "Monthly Ad Spend", placeholder: "10000" },
  { key: "revenue", label: "Revenue from Ads", placeholder: "50000" },
  { key: "cogs", label: "Cost of Goods Sold", placeholder: "15000" },
  { key: "shipping", label: "Shipping & Fulfillment", placeholder: "3000" },
  { key: "returns", label: "Returns & Refunds", placeholder: "2000" },
  { key: "agencyFees", label: "Agency / Management Fees", placeholder: "2000" },
];

const currencies = [
  { code: "USD", symbol: "$", label: "USD ($)", locale: "en-US" },
  { code: "EUR", symbol: "\u20AC", label: "EUR (\u20AC)", locale: "de-DE" },
  { code: "GBP", symbol: "\u00A3", label: "GBP (\u00A3)", locale: "en-GB" },
  { code: "INR", symbol: "\u20B9", label: "INR (\u20B9)", locale: "en-IN" },
  { code: "AED", symbol: "AED", label: "AED", locale: "ar-AE" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)", locale: "en-AU" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)", locale: "en-CA" },
];

function parse(val: string): number {
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

export default function Calculator() {
  const [inputs, setInputs] = useState<Inputs>({
    adSpend: "",
    revenue: "",
    cogs: "",
    shipping: "",
    returns: "",
    agencyFees: "",
  });
  const [results, setResults] = useState<Results | null>(null);
  const [currencyIdx, setCurrencyIdx] = useState(0);

  const currency = currencies[currencyIdx];

  function formatCurrency(n: number): string {
    return n.toLocaleString(currency.locale, { style: "currency", currency: currency.code, maximumFractionDigits: 0 });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setResults(null);
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const adSpend = parse(inputs.adSpend);
    const revenue = parse(inputs.revenue);
    const cogs = parse(inputs.cogs);
    const shipping = parse(inputs.shipping);
    const returns = parse(inputs.returns);
    const agencyFees = parse(inputs.agencyFees);

    const totalInvestment = adSpend + agencyFees;
    const profit = revenue - cogs - shipping - returns - totalInvestment;
    const roas = adSpend > 0 ? revenue / adSpend : 0;
    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    setResults({ roas, roi, profit, totalInvestment });
  };

  const roiPositive = results ? results.roi >= 0 : true;

  const getInsight = () => {
    if (!results) return null;
    const { roas, roi, profit, totalInvestment } = results;

    if (roi < 0 && roas >= 2) {
      return {
        icon: (
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        color: "text-red-600",
        borderColor: "border-red-500/30",
        bgColor: "bg-red-50",
        text: `Your ROAS looks healthy at ${roas.toFixed(1)}x, but you're actually losing ${formatCurrency(Math.abs(profit))}. Your true ROI is ${roi.toFixed(1)}%. This is exactly why we track ROI, not ROAS.`,
      };
    }
    if (roi >= 0) {
      const returnPerUnit = totalInvestment > 0 ? (profit / totalInvestment + 1).toFixed(2) : "0.00";
      return {
        icon: (
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: "text-emerald-600",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-50",
        text: `Great news — you're profitable! Your ROI of ${roi.toFixed(1)}% means every ${currency.symbol}1 invested returns ${currency.symbol}${returnPerUnit} back.`,
      };
    }
    return {
      icon: (
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-amber-600",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-50",
      text: "Both metrics suggest room for improvement. Let's optimize your campaigns for better profitability.",
    };
  };

  const insight = getInsight();

  return (
    <section id="calculator" className="section relative bg-[var(--color-base)]">
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="badge mb-6 inline-block">
            <span className="dot" />
            Free Tool
          </span>
          <h2 className="text-headline mb-6">
            ROAS vs <span className="text-gradient">ROI</span> Calculator
          </h2>
          <p className="text-body-lg text-[var(--text-secondary)]">
            See the real story behind your ad performance. Enter your numbers
            and discover whether your campaigns are actually profitable.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <form onSubmit={calculate} className="lg:col-span-3">
            <div className="glass-card-glow p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
                  <span className="text-micro text-[var(--accent-green)]">Your Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] hidden sm:inline">Currency</span>
                  <select
                    value={currencyIdx}
                    onChange={(e) => { setCurrencyIdx(Number(e.target.value)); setResults(null); }}
                    className="input-dark text-sm py-1.5 px-3 w-auto cursor-pointer"
                  >
                    {currencies.map((c, i) => (
                      <option key={c.code} value={i}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-8">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={field.key} className="block text-small text-[var(--text-muted)] mb-3">
                      {field.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">{currency.symbol}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        id={field.key}
                        name={field.key}
                        value={inputs[field.key]}
                        onChange={handleChange}
                        className="input-dark pl-8"
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full btn-primary">
                Calculate
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Results */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* ROAS Card */}
            <div className={`glass-card-glow p-8 flex-1 flex flex-col justify-center text-center ${results ? "animate-scale-in" : ""}`}>
              <span className="text-micro text-[var(--text-muted)] mb-2">ROAS</span>
              <span className="text-5xl md:text-6xl font-black text-[var(--text-primary)] mb-2">
                {results ? `${results.roas.toFixed(1)}x` : "—"}
              </span>
              <span className="text-small text-[var(--text-secondary)]">Return on Ad Spend</span>
              {results && (
                <span className="text-xs text-[var(--text-muted)] mt-3">
                  {formatCurrency(parse(inputs.revenue))} &divide; {formatCurrency(parse(inputs.adSpend))}
                </span>
              )}
            </div>

            {/* ROI Card */}
            <div className={`glass-card-glow p-8 flex-1 flex flex-col justify-center text-center ${results ? "animate-scale-in" : ""}`}>
              <span className="text-micro text-[var(--text-muted)] mb-2">ROI</span>
              <span className={`text-5xl md:text-6xl font-black mb-2 ${
                results
                  ? roiPositive
                    ? "text-emerald-600"
                    : "text-red-600"
                  : "text-[var(--text-primary)]"
              }`}>
                {results ? `${results.roi.toFixed(1)}%` : "—"}
              </span>
              <span className="text-small text-[var(--text-secondary)]">Return on Investment</span>
              {results && (
                <span className="text-xs text-[var(--text-muted)] mt-3">
                  Profit: {formatCurrency(results.profit)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Insight Box */}
        {insight && (
          <div className={`mt-8 rounded-[var(--radius-lg)] border ${insight.borderColor} ${insight.bgColor} p-6 animate-scale-in`}>
            <div className="flex items-start gap-4">
              {insight.icon}
              <p className={`text-body ${insight.color}`}>
                {insight.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
