export * from "./repository.js";
export type CmpFrame = {
  v: 1;
  id: string;
  type: "request" | "result" | "error";
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: string; message: string };
};
export type KnowledgeKind = "fact" | "decision" | "episode" | "instruction" | "evidence";
export type KnowledgeRecord = {
  id: string;
  kind: KnowledgeKind;
  content: string;
  sourceRefs: string[];
  status: "proposed" | "approved" | "superseded" | "disputed";
  updatedAt: string;
  authorId: string;
};
export type Change = { op: "put"; record: KnowledgeRecord } | { op: "delete"; id: string };
export type ContextCommit = {
  id: string; parents: string[]; branch: string; authorId: string;
  message: string; createdAt: string; changes: Change[];
};
