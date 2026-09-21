import {
  ListingPipeline,
  PipelineStage,
  PipelineStageId,
  PipelineStepStatus,
} from "@/lib/pipeline/types";

const STAGE_ORDER: PipelineStageId[] = [
  "published",
  "leads",
  "application",
  "lease",
  "renting",
];

interface PipelineInput {
  listingId: string;
  listingStatus: string;
  marketplaceUrl: string | null;
  syndicationPublished: number;
  pendingVisits: number;
  totalVisits: number;
  appointments: number;
  messageThreads: number;
  applicationsSubmitted: number;
  applicationsAccepted: number;
  leaseId: string | null;
  leaseStatus: string | null;
  rentManagementId: string | null;
}

function stageIndex(stage: PipelineStageId): number {
  return STAGE_ORDER.indexOf(stage);
}

function resolveCurrentStage(input: PipelineInput): PipelineStageId {
  if (input.leaseStatus === "FINALIZED" && input.rentManagementId) {
    return "renting";
  }
  if (input.leaseId) return "lease";
  if (input.applicationsAccepted > 0) return "lease";
  if (input.applicationsSubmitted > 0) return "application";
  if (
    input.pendingVisits > 0 ||
    input.totalVisits > 0 ||
    input.appointments > 0 ||
    input.messageThreads > 0
  ) {
    return "leads";
  }
  return "published";
}

function stepStatus(
  stageId: PipelineStageId,
  current: PipelineStageId
): PipelineStepStatus {
  const stageIdx = stageIndex(stageId);
  const currentIdx = stageIndex(current);
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "active";
  return "pending";
}

export function computeListingPipeline(input: PipelineInput): ListingPipeline {
  const currentStage = resolveCurrentStage(input);
  const publishedCount =
    input.syndicationPublished + (input.marketplaceUrl ? 1 : 0);
  const leadsCount =
    input.pendingVisits + input.appointments + input.messageThreads;

  const stages: PipelineStage[] = [
    {
      id: "published",
      labelKey: "pipeline.stages.published",
      count: Math.max(publishedCount, input.listingStatus === "active" ? 1 : 0),
      status: stepStatus("published", currentStage),
      href: `/landlord/publish/${input.listingId}`,
    },
    {
      id: "leads",
      labelKey: "pipeline.stages.leads",
      count: leadsCount,
      status: stepStatus("leads", currentStage),
      href: `/landlord/visits`,
    },
    {
      id: "application",
      labelKey: "pipeline.stages.application",
      count: input.applicationsSubmitted + input.applicationsAccepted,
      status: stepStatus("application", currentStage),
      href: `/landlord/applications`,
    },
    {
      id: "lease",
      labelKey: "pipeline.stages.lease",
      count: input.leaseId ? 1 : input.applicationsAccepted,
      status: stepStatus("lease", currentStage),
      href: input.leaseId
        ? `/landlord/leases/${input.leaseId}`
        : `/landlord/leases`,
    },
    {
      id: "renting",
      labelKey: "pipeline.stages.renting",
      count: input.leaseStatus === "FINALIZED" ? 1 : 0,
      status: stepStatus("renting", currentStage),
      href: input.rentManagementId
        ? `/landlord/rent-management/${input.rentManagementId}`
        : `/landlord/rent-management`,
    },
  ];

  return {
    listingId: input.listingId,
    currentStage,
    stages,
  };
}
