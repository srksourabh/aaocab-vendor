"use client";

import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import { useLanguage } from "@/lib/i18n/context";

type Stage = "phone" | "otp";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function validatePhone(value: string): boolean {
    if (!/^\d{10}$/.test(value)) {
      setPhoneError(t("invalidPhone"));
      return false;
    }
    setPhoneError("");
    return true;
  }

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(raw);
    if (phoneError) setPhoneError("");
  }

  function handleSendOtp() {
    if (!validatePhone(phone)) return;
    setIsLoading(true);
    // Placeholder: in production, call Supabase auth.signInWithOtp
    setTimeout(() => {
      setIsLoading(false);
      setStage("otp");
    }, 800);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const updated = otp.map((d, i) => (i === index ? value : d));
    setOtp(updated);
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  }

  function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) return;
    setIsLoading(true);
    // Placeholder: in production, call Supabase auth.verifyOtp
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/register/profile";
    }, 800);
  }

  const otpComplete = otp.every((d) => d !== "");

  const otpSubtitle = stage === "otp"
    ? `${t("otpSentTo")} +91 ${phone}. ${t("enterOtpBelow")}`
    : t("enterMobileToStart");

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={1} completedSteps={[]} />

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          {t("joinAaoCab")}
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          {otpSubtitle}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {stage === "phone" ? (
            <>
              {/* Phone input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-foreground"
                >
                  {t("mobileNumber")}
                </label>
                <div className="flex overflow-hidden rounded-[40px] border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all duration-200">
                  <span className="flex items-center border-r border-input bg-muted px-4 text-base font-medium text-muted-foreground select-none">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder={t("enterTenDigitNumber")}
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                    aria-invalid={!!phoneError}
                    className="flex-1 bg-transparent px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                {phoneError && (
                  <p id="phone-error" className="text-sm text-destructive">
                    {phoneError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10 || isLoading}
                className="h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? t("sending") : t("sendOtp")}
                {!isLoading && <ArrowRight className="ml-2 size-5" />}
              </Button>
            </>
          ) : (
            <>
              {/* OTP input — 6 separate boxes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t("enterOtp")}
                </label>
                <div className="flex gap-2 sm:gap-3" role="group" aria-label="One-time password">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      aria-label={`OTP digit ${index + 1}`}
                      className="h-14 w-full max-w-[52px] rounded-xl border border-input bg-background text-center text-xl font-semibold text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={!otpComplete || isLoading}
                className="h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? t("verifying") : t("verifyOtp")}
                {!isLoading && <ArrowRight className="ml-2 size-5" />}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStage("phone");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="text-sm text-muted-foreground underline-offset-4 hover:underline cursor-pointer transition-all duration-200"
              >
                {t("changeMobileNumber")}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("alreadyRegistered")}{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              {t("loginInstead")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
