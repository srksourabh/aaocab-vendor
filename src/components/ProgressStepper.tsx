"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

interface ProgressStepperProps {
  currentStep: number;
  completedSteps?: number[];
}

export default function ProgressStepper({
  currentStep,
  completedSteps = [],
}: ProgressStepperProps) {
  const { t } = useLanguage();

  const STEPS = [
    { number: 1, label: t("register") },
    { number: 2, label: t("documents") },
    { number: 3, label: t("vehicles") },
    { number: 4, label: t("drivers") },
    { number: 5, label: t("review") },
  ];

  const currentStepData = STEPS.find((s) => s.number === currentStep);

  return (
    <>
      {/* Mobile view: compact text progress */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          {t("stepLabel")} {currentStep} {t("stepOf")} {STEPS.length}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {currentStepData?.label}
        </p>
      </div>

      {/* Desktop stepper */}
      <div className="hidden md:flex w-full max-w-2xl mx-auto items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isActive = step.number === currentStep;
          const isUpcoming = !isCompleted && !isActive;
          const isLastStep = index === STEPS.length - 1;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                    isCompleted &&
                      "bg-accent text-accent-foreground",
                    isActive &&
                      "bg-primary text-primary-foreground shadow-md",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                  aria-label={`${t("stepLabel")} ${step.number}: ${step.label}${isCompleted ? " (completed)" : isActive ? " (current)" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCompleted && "text-accent",
                    isActive && "text-primary font-semibold",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line — not after last step */}
              {!isLastStep && (
                <div
                  className={cn(
                    "mx-2 mb-5 flex-1 border-t-2 transition-all duration-300",
                    isCompleted ? "border-accent border-solid" : "border-border border-dashed"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
