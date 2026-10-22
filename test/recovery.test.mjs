import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isCollectionInRoot,discoverCollections,chooseCollection,storageGet,storageSet} from '../collection-recovery.mjs';
const root='https://pod.example/parent/',owner=root+'profile/card#me',folder=root+'family-art-11111111-1111-4111-8111-111111111111/';
test('only direct UUID artwork folders inside the discovered Pod qualify',()=>{
 assert(isCollectionInRoot(folder,root));
 for(const url of [root+'notes/',folder+'nested/',root+'family-art-fake/',folder+'?x=1',root+'../family-art-11111111-1111-4111-8111-111111111111/','https://other.example/'+folder.split('/').at(-2)+'/'])assert(!isCollectionInRoot(url,root));
});
test('storage loss recovers a sole collection; multiple collections require a choice',()=>{
 assert.equal(chooseCollection([folder],null),folder);assert.equal(chooseCollection([folder,'other'],null),null);assert.equal(chooseCollection([folder],'https://foreign.example/'),folder);assert.equal(chooseCollection([],folder),null);
});
test('disabled browser storage is nonfatal',()=>{const storage={getItem(){throw Error()},setItem(){throw Error()}};assert.equal(storageGet(storage,'x'),null);assert.doesNotThrow(()=>storageSet(storage,'x','y'));});
function api({broad=false,foreign=false,failure=false}={}){return {
 async getSolidDataset(){if(failure)throw Error('offline');return {};},getThing:()=>({}),getUrlAll:(thing,p)=>p.endsWith('contains')?[folder,root+'notes/']:broad?['public']:[],
 async getResourceInfoWithAcl(){return {};},getResourceAcl:()=>({}),getAgentResourceAccess:()=>({control:!foreign}),getAgentDefaultAccessAll:()=>({[owner]:{control:true}}),getAgentResourceAccessAll:()=>({[owner]:{control:true}}),getThingAll:()=>[{}]
};}
test('read-only Pod discovery recovers a private owner-controlled legacy collection',async()=>assert.deepEqual(await discoverCollections([root],owner,()=>{},api()),[folder]));
test('recovery refuses public or non-owner-controlled collections',async()=>{for(const config of [{broad:true},{foreign:true}])assert.deepEqual(await discoverCollections([root],owner,()=>{},api(config)),[]);});
test('listing errors fail closed instead of presenting a falsely empty Pod',async()=>await assert.rejects(discoverCollections([root],owner,()=>{},api({failure:true})),/offline/));
