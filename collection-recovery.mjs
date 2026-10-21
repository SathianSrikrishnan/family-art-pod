import {safeUrl,solid} from './pod-core.mjs';
const contains='http://www.w3.org/ns/ldp#contains';
const pattern=/^family-art-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/$/i;
export function isCollectionInRoot(value,root){
 try{const base=safeUrl(root),url=safeUrl(value);return base.endsWith('/')&&url.startsWith(base)&&pattern.test(url.slice(base.length));}catch{return false;}
}
// Read-only discovery. Never repair an unfamiliar folder's permissions during recovery.
export async function discoverCollections(roots,webId,fetcher,api=solid){
 const found=[];
 for(const root of [...new Set(roots.map(safeUrl))]){
  const listing=await api.getSolidDataset(root,{fetch:fetcher});
  const thing=api.getThing(listing,root);
  const candidates=(thing?api.getUrlAll(thing,contains):[]).filter(url=>isCollectionInRoot(url,root));
  for(const url of candidates){
   const info=await api.getResourceInfoWithAcl(url,{fetch:fetcher});
   const acl=api.getResourceAcl(info);
   if(!acl||!api.getAgentResourceAccess(acl,webId)?.control)continue;
   const defaults=api.getAgentDefaultAccessAll(acl),agents=api.getAgentResourceAccessAll(acl);
   if(!defaults[webId]?.control||Object.keys(defaults).some(id=>id!==webId)||Object.keys(agents).some(id=>id!==webId))continue;
   const broad=api.getThingAll(acl).some(rule=>['agentClass','agentGroup','origin'].some(p=>api.getUrlAll(rule,'http://www.w3.org/ns/auth/acl#'+p).length));
   if(!broad)found.push(url);
  }
 }
 return [...new Set(found)].sort();
}
export function chooseCollection(found,cached){return found.includes(cached)?cached:found.length===1?found[0]:null;}
export function storageGet(storage,key){try{return storage.getItem(key);}catch{return null;}}
export function storageSet(storage,key,value){try{storage.setItem(key,value);}catch{/* Pod discovery remains available without browser storage. */}}
