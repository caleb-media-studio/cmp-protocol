import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
const ajv=new Ajv2020({allErrors:true,strict:true});
addFormats(ajv);
const read=name=>JSON.parse(readFileSync(new URL("../spec/"+name,import.meta.url),"utf8"));
const wire=read("wire.schema.json"),repo=read("repository.schema.json");
const validWire=ajv.compile(wire);
ajv.addSchema(repo);
const validRecord=ajv.getSchema(repo.$id+"#/$defs/record");
const validCommit=ajv.getSchema(repo.$id+"#/$defs/commitRequest");
assert.ok(validRecord&&validCommit,"Core record/commit validators must exist");
const record={id:"policy-001",kind:"decision",content:"# Policy",status:"approved",
 sourceRefs:["manual:docs"],authorId:"owner",updatedAt:"2026-11-16T12:00:00Z"};
assert.ok(validWire({v:1,id:"r1",type:"request",method:"context.list",params:{}}),JSON.stringify(validWire.errors));
assert.equal(validWire({v:1,id:"x",type:"event"}),false);
assert.ok(validRecord(record),JSON.stringify(validRecord.errors));
assert.equal(validRecord({...record,kind:"agent"}),false);
assert.ok(validCommit({branch:"main",expectedHead:"abc",authorId:"owner",
 message:"Initial",changes:[{op:"put",record}]}),JSON.stringify(validCommit.errors));
assert.equal(validCommit({branch:"main",expectedHead:"abc",authorId:"owner",
 message:"Bad",changes:[{op:"put",record:{...record,kind:"session"}}]}),false);
console.log("PASS CMP Core wire and repository schema fixtures");
