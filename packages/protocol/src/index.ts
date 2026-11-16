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

// CMP repository transport v1 is JSON context transport, not Git packfiles.
export type CmpTransportManifest = {
  protocol:"cmp"; transportVersion:1; repository:string; defaultBranch:string;
  head:string; capabilities:{refs:boolean;snapshot:boolean;commit:boolean};
  links:{refs:string;snapshot:string};
};
export type CmpTransportRefs = {repository:string;branches:Record<string,string>};
export type CmpTransportSnapshot = {
  repository:string;ref:string;head:string;records:KnowledgeRecord[];
};
export function cmpTransportPath(repository:string):string{
 const parts=repository.split("/");
 if(parts.length!==2||parts.some(part=>part.length===0||part.length>100
  ||part==="."||part===".."||!/^[A-Za-z0-9_.-]+$/.test(part)))
  throw new Error("CMP repository must have owner/name format");
 return "/"+encodeURIComponent(parts[0]!)+"/"+encodeURIComponent(parts[1]!)+".cmp";
}
