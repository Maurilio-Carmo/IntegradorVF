// backend/src/job/job.types.ts

export type JobStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled';

export interface JobStep {
  name:      string;
  label:     string;
  status:    JobStatus;
  processed: number;
  total:     number;
  error?:    string;
}

export interface ImportJobModel {
  id:           string;
  dominio:      string;
  label:        string;
  status:       JobStatus;
  steps:        JobStep[];
  createdAt:    string;
  updatedAt:    string;
  completedAt?: string;
  errorMsg?:    string;
}

export interface SseEvent {
  event: string;
  data:  object;
}

export interface StepDef {
  endpoint: string;
  save:     (data: any[]) => Promise<any> | any;
}

export interface DominioDef {
  label:    string;
  steps:    Pick<JobStep, 'name' | 'label'>[];
  executor: (jobId: string) => Promise<void>;
}
