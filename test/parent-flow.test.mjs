import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {mountApp} from '../parents-app.mjs';
const html=await readFile(new URL('../parents.html',import.meta.url),'utf8');
const root='https://pod.example/parent/',owner=root+'profile/card#me',folder=root+'family-art-11111111-1111-4111-8111-111111111111/';
function fakeApi({folders=[folder],fail=false}={}){return {
 getPodUrlAll:async()=>[root],getSolidDataset:async url=>{if(fail)throw Error('Failed to fetch');return {url};},getThing:d=>d,
 getUrlAll:(d,p)=>p.endsWith('contains')?(d.url===root?folders:[]):[],getResourceInfoWithAcl:async()=>({}),getResourceAcl:()=>({}),
 getAgentResourceAccess:()=>({read:true,write:true,control:true}),getAgentDefaultAccessAll:()=>({[owner]:{control:true}}),getAgentResourceAccessAll:()=>({[owner]:{control:true}}),getThingAll:()=>[]
};}
async function setup({path='/',logged=true,api=fakeApi(),cached=null}={}){
 const dom=new JSDOM(html,{url:'https://art.example'+path});
 for(const name of ['window','document','location','history','localStorage','sessionStorage'])globalThis[name]=dom.window[name];
 if(cached)localStorage.setItem('family-art:'+owner,cached);
 const session={info:{isLoggedIn:logged,webId:logged?owner:undefined},handleIncomingRedirect:async()=>{},fetch:async()=>new Response('',{status:403}),login:async()=>{throw Error('Failed to fetch');}};
 const app=await mountApp(session,api);return {dom,session,app,$:id=>dom.window.document.getElementById(id)};
}
const settle=()=>new Promise(resolve=>setTimeout(resolve,25));
test('fresh browser recovers existing artwork without creating a folder',async()=>{const t=await setup();try{assert.equal(t.$('collection').textContent,folder);assert(t.$('setup').hidden);assert(!t.$('photo').disabled);assert.equal(localStorage.getItem('family-art:'+owner),folder);}finally{t.app.dispose();t.dom.window.close();}});
test('stale foreign cache is ignored; multiple folders require parent selection',async()=>{const second=folder.replace('11111111-','22222222-');const t=await setup({api:fakeApi({folders:[folder,second]}),cached:'https://foreign.example/'});try{assert(!t.$('recovery').hidden);assert(t.$('photo').disabled);assert(t.$('create').hidden);t.$('recover-options').querySelector('button').click();await settle();assert.equal(t.$('collection').textContent,folder);assert(!t.$('photo').disabled);}finally{t.app.dispose();t.dom.window.close();}});
test('discovery failure prevents duplicate creation and uploads; retry recovers',async()=>{const api=fakeApi({fail:true});const t=await setup({api});try{assert.match(t.$('status').textContent,/Could not reach/);assert(t.$('create').disabled);assert(t.$('photo').disabled);api.getSolidDataset=fakeApi().getSolidDataset;t.$('retry').click();await settle();assert.equal(t.$('collection').textContent,folder);assert(!t.$('photo').disabled);}finally{t.app.dispose();t.dom.window.close();}});
test('first-time empty Pod offers creation but no upload',async()=>{const t=await setup({api:fakeApi({folders:[]})});try{assert(!t.$('create').disabled);assert(t.$('photo').disabled);assert.equal(t.$('root').value,root);}finally{t.app.dispose();t.dom.window.close();}});
test('signed-out recipient cannot open a drawing; provider URL is prefilled',async()=>{const t=await setup({path:'/community',logged:false});try{assert(t.$('view').disabled);assert.equal(t.$('issuer').value,'https://privatedatapod.com/');assert(t.$('parent').hidden);assert(!t.$('community').hidden);t.$('connect').click();await settle();assert.match(t.$('status').textContent,/Could not reach/);assert(!t.$('connect').disabled);assert(t.$('view').disabled);}finally{t.app.dispose();t.dom.window.close();}});
test('invitation survives callback and denied recipient gets an actionable message',async()=>{const t=await setup({path:'/community#art='+encodeURIComponent(folder+'drawing.jpg')});try{assert.equal(t.$('resource').value,folder+'drawing.jpg');t.$('view').click();await settle();assert.match(t.$('status').textContent,/exact WebID/);assert.equal(t.$('shared').children.length,0);assert(!t.$('view').disabled);}finally{t.app.dispose();t.dom.window.close();}});
test('invalid photo reports zero saved and leaves upload ready to retry',async()=>{const t=await setup();try{Object.defineProperty(t.$('photo'),'files',{value:[{type:'application/pdf',size:10}],configurable:true});t.$('photo').dispatchEvent(new window.Event('change'));await settle();assert.match(t.$('status').textContent,/0 of 1 photos saved/);assert(!t.$('photo').disabled);}finally{t.app.dispose();t.dom.window.close();}});
test('provider without a storage declaration offers a verified manual recovery path',async()=>{const api=fakeApi();api.getPodUrlAll=async()=>[];const t=await setup({api});try{assert(!t.$('manual-storage').hidden);assert(t.$('create').disabled);t.$('manual-root').value=root;t.$('retry').click();await settle();assert.equal(t.$('collection').textContent,folder);assert(!t.$('photo').disabled);}finally{t.app.dispose();t.dom.window.close();}});
