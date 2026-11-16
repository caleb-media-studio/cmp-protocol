import { createHash } from "node:crypto";
import type { Change, ContextCommit, KnowledgeRecord } from "./index.js";

export class ConcurrentHeadError extends Error {}
export class MergeConflictError extends Error {
  constructor(public readonly recordIds: string[]) {
    super("Knowledge merge conflicts: " + recordIds.join(", "));
  }
}
export type Snapshot = Map<string, KnowledgeRecord>;
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export class InMemoryContextRepository {
  private readonly commits = new Map<string, ContextCommit>();
  private readonly snapshots = new Map<string, Snapshot>();
  private readonly branches = new Map<string, string>();

  constructor() {
    const root = this.makeCommit([], "main", "system", "Initialize context repository", []);
    this.commits.set(root.id, root);
    this.snapshots.set(root.id, new Map());
    this.branches.set("main", root.id);
  }

  head(branch = "main"): string {
    const head = this.branches.get(branch);
    if (!head) throw new Error("Unknown branch: " + branch);
    return head;
  }

  listBranches(): Record<string, string> {
    return Object.fromEntries(this.branches);
  }

  createBranch(name: string, from = "main"): string {
    if (!/^[a-zA-Z0-9][\w./-]{0,119}$/.test(name) || name.includes("..")) {
      throw new Error("Invalid branch name");
    }
    if (this.branches.has(name)) throw new Error("Branch already exists: " + name);
    const head = this.resolve(from);
    this.branches.set(name, head);
    return head;
  }

  resolve(ref: string): string {
    const id = this.branches.get(ref) ?? ref;
    if (!this.commits.has(id)) throw new Error("Unknown revision: " + ref);
    return id;
  }

  getCommit(ref: string): ContextCommit {
    const value = this.commits.get(this.resolve(ref));
    if (!value) throw new Error("Commit missing");
    return structuredClone(value);
  }

  snapshot(ref = "main"): Snapshot {
    const value = this.snapshots.get(this.resolve(ref));
    if (!value) throw new Error("Snapshot missing");
    return new Map([...value].map(([key, record]) => [key, structuredClone(record)]));
  }

  commit(args: {
    branch: string; expectedHead: string; authorId: string; message: string; changes: Change[];
  }): ContextCommit {
    return this.applyCommit(args, [this.head(args.branch)]);
  }

  private makeCommit(
    parents: string[], branch: string, authorId: string, message: string, changes: Change[]
  ): ContextCommit {
    const payload = {
      parents, branch, authorId, message, createdAt: new Date().toISOString(),
      changes: structuredClone(changes)
    };
    return { id: hash(payload), ...payload };
  }

  private applyCommit(
    args: { branch: string; expectedHead: string; authorId: string; message: string; changes: Change[] },
    parents: string[]
  ): ContextCommit {
    if (this.head(args.branch) !== args.expectedHead) {
      throw new ConcurrentHeadError("Branch advanced: reload and retry");
    }
    const snapshot = this.snapshot(args.expectedHead);
    for (const change of args.changes) {
      if (change.op === "put") {
        if (!change.record.id || !change.record.content) throw new Error("Invalid record");
        snapshot.set(change.record.id, structuredClone(change.record));
      } else snapshot.delete(change.id);
    }
    const commit = this.makeCommit(parents, args.branch, args.authorId, args.message, args.changes);
    this.commits.set(commit.id, commit);
    this.snapshots.set(commit.id, snapshot);
    this.branches.set(args.branch, commit.id);
    return structuredClone(commit);
  }

  private ancestors(ref: string): string[] {
    const stack = [this.resolve(ref)];
    const seen = new Set<string>();
    const order: string[] = [];
    while (stack.length) {
      const current = stack.shift()!;
      if (seen.has(current)) continue;
      seen.add(current);
      order.push(current);
      stack.push(...this.getCommit(current).parents);
    }
    return order;
  }

  merge(source: string, target: string, authorId: string): ContextCommit {
    const sourceHead = this.head(source);
    const targetHead = this.head(target);
    const targetAncestors = new Set(this.ancestors(targetHead));
    const base = this.ancestors(sourceHead).find((id) => targetAncestors.has(id));
    if (!base) throw new Error("No common ancestor");
    const before = this.snapshot(base);
    const incoming = this.snapshot(sourceHead);
    const current = this.snapshot(targetHead);
    const changes: Change[] = [];
    const conflicts: string[] = [];
    const keys = new Set([...before.keys(), ...incoming.keys(), ...current.keys()]);
    for (const id of keys) {
      const baseline = before.get(id);
      const src = incoming.get(id);
      const dst = current.get(id);
      if (eq(src, baseline) || eq(src, dst)) continue;
      if (!eq(dst, baseline)) { conflicts.push(id); continue; }
      if (src) changes.push({ op: "put", record: src });
      else changes.push({ op: "delete", id });
    }
    if (conflicts.length) throw new MergeConflictError(conflicts);
    return this.applyCommit({
      branch: target, expectedHead: targetHead, authorId,
      message: "Merge " + source + " into " + target, changes
    }, [targetHead, sourceHead]);
  }

  diff(from: string, to: string): Change[] {
    const a = this.snapshot(from);
    const b = this.snapshot(to);
    const out: Change[] = [];
    for (const id of new Set([...a.keys(), ...b.keys()])) {
      if (eq(a.get(id), b.get(id))) continue;
      if (b.has(id)) out.push({ op: "put", record: b.get(id)! });
      else out.push({ op: "delete", id });
    }
    return out;
  }
}
