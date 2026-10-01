export const PIPELINE_STEPS = [
  { key: "logement", label: "Logement" },
  { key: "dossier", label: "Dossier locataire" },
  { key: "credit", label: "Enquête de crédit" },
  { key: "bail", label: "Signature du bail" },
  { key: "suivi", label: "Suivi de location" },
] as const;

export type PipelineKey = (typeof PIPELINE_STEPS)[number]["key"];
export type StepState = "done" | "current" | "todo" | "blocked";

export function markClass(state: string) {
  if (state === "done") return "mark mark-done";
  if (state === "current") return "mark mark-now";
  if (state === "blocked") return "mark mark-blocked";
  return "mark mark-wait";
}

type PipelineInput = {
  application?: {
    id: string;
    status: string;
    steps?: { stepKey: string; isComplete: boolean }[];
    consents?: { type: string }[];
    creditCheck?: { status: string } | null;
    lease?: { id: string; status: string } | null;
    payments?: { status: string }[];
  } | null;
};

export function buildPipeline(input: PipelineInput) {
  const app = input.application ?? null;
  const creditStatus = app?.creditCheck?.status;
  const leaseStatus = app?.lease?.status;

  const dossier: StepState = !app
    ? "todo"
    : app.status === "REJECTED"
      ? "blocked"
      : app.status === "SUBMITTED" || app.status === "ACCEPTED"
        ? "done"
        : "current";

  const credit: StepState =
    creditStatus === "FAILED"
      ? "blocked"
      : creditStatus === "CLEAR" || creditStatus === "CONCERN"
        ? "done"
        : dossier === "done"
          ? "current"
          : "todo";

  const creditReviewed = creditStatus === "CLEAR" || creditStatus === "CONCERN";
  const bail: StepState =
    leaseStatus === "FINALIZED"
      ? "done"
      : leaseStatus || app?.status === "ACCEPTED" || creditReviewed
        ? "current"
        : "todo";

  const suivi: StepState = leaseStatus === "FINALIZED" ? "current" : "todo";

  const states: Record<PipelineKey, StepState> = {
    logement: "done",
    dossier,
    credit,
    bail,
    suivi,
  };

  const current =
    PIPELINE_STEPS.find((step) => states[step.key] === "current")?.key ??
    PIPELINE_STEPS.find((step) => states[step.key] === "todo")?.key ??
    "suivi";

  return {
    current,
    steps: PIPELINE_STEPS.map((step) => ({
      ...step,
      state: states[step.key],
    })),
  };
}
