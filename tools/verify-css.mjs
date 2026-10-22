// Optional real-server check. Uses an existing synthetic local CSS lab only.
// Usage: node tools/verify-css.mjs C:/path/to/solid-family-memory-lab
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createCollection,uploadDrawing,privateAcl} from '../pod-core.mjs';
import {discoverCollections,chooseCollection} from '../collection-recovery.mjs';
import {rememberCollection,readCatalog,catalogUrl} from '../pod-catalog.mjs';
const lab=resolve(process.argv[2]||'../solid-family-memory-lab');
const require=createRequire(pathToFileURL(resolve(lab,'package.json')));
const {Session}=await import(pathToFileURL(require.resolve('@inrupt/solid-client-authn-node')).href);
const seed=JSON.parse(await readFile(resolve(lab,'demo-seed.local.json'),'utf8'));
const base='http://localhost:8771/',sessions=[],checks=[];
async function json(url,options){const r=await fetch(url,options);assert(r.ok,'Local CSS account request failed');return r.json();}
async function login(name){
 const account=seed.find(a=>a.email===name+'@example.invalid');assert(account);
 const start=await json(base+'.account/');const {authorization}=await json(start.controls.password.login,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(account)});
 const headers={authorization:'CSS-Account-Token '+authorization};const {controls}=await json(base+'.account/',{headers});
 const token=await json(controls.account.clientCredentials,{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({name:'parent-trial-local-test',webId:base+name+'/profile/card#me'})});
 const s=new Session({keepAlive:false});await s.login({clientId:token.id,clientSecret:token.secret,oidcIssuer:base});sessions.push(s);return s;
}
async function check(name,fn){await fn();checks.push({name,result:'PASS'});console.log('PASS',name);}
const denied=r=>assert([401,403].includes(r.status));
try{
 const owner=await login('parent'),reader=await login('community'),f=(...a)=>owner.fetch(...a),webId=owner.info.webId;
 const collection=await createCollection(base+'parent/',webId,f);
 const bytes=await readFile(resolve(lab,'samples/family.jpg')),blob=new Blob([bytes],{type:'image/jpeg'});
 const drawing=await uploadDrawing(collection,webId,f,blob),other=await uploadDrawing(collection,webId,f,blob);
 await check('recovery discovers the real private collection without a browser cache',async()=>{const found=await discoverCollections([base+'parent/'],webId,f);assert(found.includes(collection));assert.equal(chooseCollection([collection],null),collection);assert.equal((await owner.fetch(drawing)).status,200);});
 await check('private Pod index restores artwork without any root listing or browser cache',async()=>{await rememberCollection(base+'parent/',collection,webId,f);const saved=await readCatalog(base+'parent/',webId,f);assert(saved.collections.includes(collection));denied(await fetch(catalogUrl(base+'parent/')));denied(await reader.fetch(catalogUrl(base+'parent/')));denied(await fetch(new URL('index.json',catalogUrl(base+'parent/'))));denied(await reader.fetch(new URL('index.json',catalogUrl(base+'parent/'))));await rememberCollection(base+'parent/',collection,webId,f);assert.equal((await readCatalog(base+'parent/',webId,f)).collections.filter(url=>url===collection).length,1);});
 await check('concurrent index updates preserve both folders with conditional writes',async()=>{const a=await createCollection(base+'parent/',webId,f),b=await createCollection(base+'parent/',webId,f);await Promise.all([rememberCollection(base+'parent/',a,webId,f),rememberCollection(base+'parent/',b,webId,f)]);const saved=await readCatalog(base+'parent/',webId,f);assert(saved.collections.includes(a));assert(saved.collections.includes(b));assert(saved.collections.includes(collection));});
 await check('anonymous and unselected identity cannot read a new upload',async()=>{denied(await fetch(drawing));denied(await reader.fetch(drawing));});
 await privateAcl(drawing,webId,f,false,reader.info.webId);
 await check('selected reader receives exact bytes while unselected drawing stays private',async()=>{assert.deepEqual(Buffer.from(await (await reader.fetch(drawing)).arrayBuffer()),bytes);denied(await reader.fetch(other));denied(await fetch(drawing));});
 await check('reader cannot overwrite photo or change its ACL',async()=>{denied(await reader.fetch(drawing,{method:'PUT',headers:{'content-type':'image/jpeg'},body:bytes}));denied(await reader.fetch(drawing+'.acl',{method:'PUT',headers:{'content-type':'text/turtle'},body:''}));});
 await check('failed photo upload is reported without breaking collection recovery',async()=>{const fail=async(url,opts)=>opts?.method==='PUT'&&String(url).endsWith('.jpg')?new Response('',{status:507}):f(url,opts);await assert.rejects(uploadDrawing(collection,webId,fail,blob),/507/);assert((await discoverCollections([base+'parent/'],webId,f)).includes(collection));});
 await privateAcl(drawing,webId,f);
 await check('revocation denies GET and HEAD, preserves owner bytes and recoverability',async()=>{denied(await reader.fetch(drawing));denied(await reader.fetch(drawing,{method:'HEAD'}));assert.deepEqual(Buffer.from(await (await owner.fetch(drawing)).arrayBuffer()),bytes);assert((await discoverCollections([base+'parent/'],webId,f)).includes(collection));});
 await mkdir('evidence',{recursive:true});await writeFile('evidence/trial-css-verification.json',JSON.stringify({time:new Date().toISOString(),scope:'Real local CSS 7.2; synthetic photos; current production core and recovery module; not another hosted provider',checks},null,2));
}finally{await Promise.allSettled(sessions.map(s=>s.logout()));}
