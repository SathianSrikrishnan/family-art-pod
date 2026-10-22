import {test} from 'node:test';
import assert from 'node:assert/strict';
import {uploadDrawing} from '../pod-core.mjs';
test('ACP/noneditable permissions stop upload before any photo bytes leave the browser',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,method:options?.method,body:options?.body});return new Response('',{status:200,headers:{'content-type':'text/turtle'}});};
 await assert.rejects(uploadDrawing('https://pod.example/family-art-11111111-1111-4111-8111-111111111111/','https://pod.example/profile#me',fetcher,new Blob(['synthetic'],{type:'image/jpeg'})),/WAC/);
 assert(calls.length>0);assert(!calls.some(call=>call.method==='PUT'||call.body instanceof Blob));
});
