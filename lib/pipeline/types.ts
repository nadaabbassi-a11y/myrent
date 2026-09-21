export type PipelineStageId =
  | "published"
  | "leads"
  | "application"
  | "lease"
  | "renting";

export type PipelineStepStatus = "completed" | "active" | "pending";

export interface PipelineStage {
  id: PipelineStageId;
  labelKey: string;
  count: number;
  status: PipelineStepStatus;
  href: string;
}

export interface ListingPipeline {
  listingId: string;
  currentStage: PipelineStageId;
  stages: PipelineStage[];
}

export interface PipelineListingSummary {
  id: string;
  title: string;
  city: string;
  area: string | null;
  price: number;
  status: string;
  image: string | null;
  pipeline: ListingPipeline;
}
