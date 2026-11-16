import test from "node:test";
import assert from "node:assert/strict";
import {cmpTransportPath} from "./index.js";

test("CMP versioned repository transport path is not a Git URL",()=>{
 assert.equal(cmpTransportPath("caleb-mau/repo-first"),"/caleb-mau/repo-first.cmp");
 for(const name of ["bad","owner/../x","owner/.","owner/..","owner/x/extra","/repo"]){
  assert.throws(()=>cmpTransportPath(name));
 }
});
