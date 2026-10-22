import {safeUrl,privateAcl,solid} from './pod-core.mjs';
import {isCollectionInRoot,isPrivateOwnerCollection} from './collection-recovery.mjs';
export const catalogUrl=root=>new URL('family-art-library-v1/',safeUrl(root)).href;
export async function readCatalog(root,webId,fetcher,api=solid){
 const url=catalogUrl(root),file=new URL('index.json',url).href;
 const response=await fetcher(file,{headers:{Accept:'application/json'},cache:'no-store'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('Could not read private artwork recovery. Check your connection and try again.');
 if(!(response.headers.get('content-type')||'').includes('application/json'))throw Error('The artwork recovery index could not be verified.');
 if(!await isPrivateOwnerCollection(url,webId,fetcher,api))throw Error('Your recovery folder is not private. Ask for help before continuing.');
 const info=await api.getResourceInfoWithAcl(file,{fetch:fetcher});
 if(!api.hasAccessibleAcl(info))throw Error('The recovery index permissions could not be checked.');
 const own=api.getResourceAcl(info);
 if(own&&!await isPrivateOwnerCollection(file,webId,fetcher,api,false))throw Error('Your recovery index is not private. Ask for help before continuing.');
 let data;try{data=await response.json();}catch{throw Error('The saved artwork folder list could not be verified.');}
 if(!data||data.version!==1||data.owner!==webId||!Array.isArray(data.collections)||data.collections.length>100||data.collections.some(value=>!isCollectionInRoot(value,root)))throw Error('The saved artwork folder list could not be verified.');
 return {url:file,etag:response.headers.get('etag'),collections:data.collections};
}
// Writes only a new app-owned private library and its index; never root/profile ACLs.
export async function rememberCollection(root,collection,webId,fetcher){
 if(!isCollectionInRoot(collection,root)||!await isPrivateOwnerCollection(collection,webId,fetcher))throw Error('Only your private artwork folders can be saved for recovery.');
 const library=catalogUrl(root),file=new URL('index.json',library).href,owner=safeUrl(webId);
 const created=await fetcher(library,{method:'PUT',headers:{'Content-Type':'text/turtle','If-None-Match':'*',Link:'<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"'},body:''});
 if(created.ok)await privateAcl(library,owner,fetcher,true);
 else if(![409,412].includes(created.status))throw Error('Could not prepare private artwork recovery. Try again.');
 if(!await isPrivateOwnerCollection(library,owner,fetcher))throw Error('Your recovery folder could not be verified as private. No index was written.');
 let catalog=await readCatalog(root,owner,fetcher);
 for(let attempt=0;attempt<3;attempt++){
  if(catalog?.collections.includes(collection))return;
  if(catalog&&!catalog.etag)throw Error('Your provider did not supply a safe update version for recovery. Your artwork is still in its folder.');
  const collections=[...(catalog?.collections||[]),collection];
  const saved=await fetcher(file,{method:'PUT',headers:{'Content-Type':'application/json',...(catalog?{'If-Match':catalog.etag}:{'If-None-Match':'*'})},body:JSON.stringify({version:1,owner,collections})});
  if(saved.ok){const checked=await readCatalog(root,owner,fetcher);if(!checked?.collections.includes(collection))throw Error('Could not verify artwork recovery.');return;}
  if(saved.status!==412)throw Error('Could not save your artwork folder for recovery. Try again.');
  catalog=await readCatalog(root,owner,fetcher);
 }
 throw Error('Your folder list changed in another tab. Check for saved artwork again.');
}
