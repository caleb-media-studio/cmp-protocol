import test from "node:test";
import assert from "node:assert/strict";
import {
  InMemoryContextRepository, ConcurrentHeadError, MergeConflictError
} from "./repository.js";
import type { KnowledgeRecord } from "./index.js";

const fact = (id: string, content: string): KnowledgeRecord => ({
  id, content, kind: "fact", authorId: "agent-a",
  status: "proposed", sourceRefs: ["git:abc123"], updatedAt: "2026-11-12T00:00:00Z"
});

test("immutable snapshots and historical reads", () => {
  const repo = new InMemoryContextRepository();
  const root = repo.head();
  const change = repo.commit({
    branch: "main", expectedHead: root, authorId: "a", message: "Add",
    changes: [{ op: "put", record: fact("one", "Postgres") }]
  });
  assert.equal(repo.snapshot(root).size, 0);
  assert.equal(repo.snapshot(change.id).get("one")?.content, "Postgres");
  const edited = repo.snapshot(change.id).get("one")!;
  edited.content = "Mutated";
  assert.equal(repo.snapshot(change.id).get("one")?.content, "Postgres");
});

test("compare-and-swap detects concurrent agent writes", () => {
  const repo = new InMemoryContextRepository();
  const oldHead = repo.head();
  repo.commit({branch:"main",expectedHead:oldHead,authorId:"a",message:"A",changes:[]});
  assert.throws(() => repo.commit({
    branch:"main",expectedHead:oldHead,authorId:"b",message:"B",changes:[]
  }), ConcurrentHeadError);
});

test("independent branches merge non-conflicting knowledge", () => {
  const repo = new InMemoryContextRepository();
  repo.createBranch("agent/a");
  repo.createBranch("agent/b");
  repo.commit({ branch:"agent/a", expectedHead:repo.head("agent/a"), authorId:"a",
    message:"A", changes:[{op:"put",record:fact("a","A")}] });
  repo.commit({ branch:"agent/b", expectedHead:repo.head("agent/b"), authorId:"b",
    message:"B", changes:[{op:"put",record:fact("b","B")}] });
  repo.merge("agent/a","main","reviewer");
  repo.merge("agent/b","main","reviewer");
  assert.deepEqual([...repo.snapshot().keys()].sort(),["a","b"]);
});

test("conflicting edits require explicit review", () => {
  const repo = new InMemoryContextRepository();
  const original = repo.head();
  repo.commit({branch:"main",expectedHead:original,authorId:"user",message:"Init",
    changes:[{op:"put",record:fact("state","First")}]});
  repo.createBranch("agent/a");
  repo.createBranch("agent/b");
  for (const [branch,content] of [["agent/a","Second"],["agent/b","Third"]]) {
    repo.commit({branch,expectedHead:repo.head(branch),authorId:"agent",message:"Revise",
      changes:[{op:"put",record:fact("state",content)}]});
  }
  repo.merge("agent/a","main","user");
  assert.throws(() => repo.merge("agent/b","main","user"),MergeConflictError);
});
