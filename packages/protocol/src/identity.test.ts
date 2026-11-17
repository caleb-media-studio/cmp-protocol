import test from "node:test";
import assert from "node:assert/strict";
import {parseCoreRepositoryId,coreRepositoryPathSegment} from "./index.js";
test("Core v1 canonical IDs and single REST path segment",()=>{
 assert.equal(parseCoreRepositoryId("local/project_1"),"project_1");
 assert.equal(coreRepositoryPathSegment("local/project_1"),"local%2Fproject_1");
 for(const value of ["project_1","cloud/project_1","local/a","local/../x",
  "local/%2Fproject","local/project/child","local/.","local/..",
  "local/project.name","LOCAL/project_1","local/project%252Fa","local/project?ref=main"]) {
  assert.throws(()=>parseCoreRepositoryId(value),value);
 }
});
