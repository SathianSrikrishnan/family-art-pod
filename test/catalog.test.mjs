import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCatalog} from '../pod-catalog.mjs';
const root='https://pod.example/',owner=root+'profile/card#me',folder=root+'family-art-11111111-1111-4111-8111-111111111111/';
function api({privateOwner=true}={}){return {hasAccessibleAcl:()=>true,getResourceInfoWithAcl:async()=>({}),getResourceAcl:()=>({}),getAgentResourceAccess:()=>({control:privateOwner}),getAgentDefaultAccessAll:()=>({[owner]:{control:true}}),getAgentResourceAccessAll:()=>({[owner]:{control:true}}),getThingAll:()=>[],getUrlAll:()=>[]};}
const response=(data={version:1,owner,collections:[folder]})=>async()=>new Response(JSON.stringify(data),{headers:{etag:'"version-one"','content-type':'application/json'}});
test('private index recovers folder addresses and the exact update version',async()=>{const saved=await readCatalog(root,owner,response(),api());assert.deepEqual(saved.collections,[folder]);assert.equal(saved.etag,'"version-one"');});
test('index cannot redirect recovery to a foreign Pod or unrelated folder',async()=>{for(const collections of [['https://foreign.example/'+folder.split('/').at(-2)+'/'],[root+'notes/']])await assert.rejects(readCatalog(root,owner,response({version:1,owner,collections}),api()),/verified/);});
test('foreign owner and nonprivate catalog are rejected without writes',async()=>{await assert.rejects(readCatalog(root,owner,response({version:1,owner:'https://foreign.example/#me',collections:[folder]}),api()),/verified/);await assert.rejects(readCatalog(root,owner,response(),api({privateOwner:false})),/private/);});
test('only explicit not-found is treated as a missing catalog',async()=>{assert.equal(await readCatalog(root,owner,async()=>new Response('',{status:404}),api()),null);await assert.rejects(readCatalog(root,owner,async()=>{throw Error('offline')},api()),/offline/);});
