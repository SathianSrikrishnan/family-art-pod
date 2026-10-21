import * as solid from '@inrupt/solid-client';
export function safeUrl(value){const u=new URL(value);if(u.username||u.password||!(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname))))throw Error('Use an HTTPS URL (localhost is allowed for testing).');return u.href;}
const ownerAccess={read:true,append:true,write:true,control:true};
export async function privateAcl(url,webId,fetcher,container=false,reader=null){
 const info=await solid.getResourceInfoWithAcl(url,{fetch:fetcher});
 if(!solid.hasAccessibleAcl(info))throw Error('This Pod does not expose editable WAC permissions. No artwork has been uploaded. ACP Pods are not supported yet.');
 let acl=solid.getResourceAcl(info)||solid.createAcl(info);for(const thing of solid.getThingAll(acl))acl=solid.removeThing(acl,thing);acl=solid.setAgentResourceAccess(acl,webId,ownerAccess);
 if(container)acl=solid.setAgentDefaultAccess(acl,webId,ownerAccess);
 if(reader&&reader!==webId)acl=solid.setAgentResourceAccess(acl,safeUrl(reader),{read:true,append:false,write:false,control:false});
 await solid.saveAclFor(info,acl,{fetch:fetcher});
 const check=await solid.getResourceInfoWithAcl(url,{fetch:fetcher});
 const saved=solid.getResourceAcl(check);if(!saved||!solid.getAgentResourceAccess(saved,webId)?.control)throw Error('Could not verify owner control.');
  const defaults=solid.getAgentDefaultAccessAll(saved);if(Object.keys(defaults).some(id=>id!==webId)||(!container&&Object.keys(defaults).length))throw Error('Unexpected inherited access. Upload stopped.');if(container&&!defaults[webId]?.control)throw Error('Could not verify private inheritance.');
 const agents=solid.getAgentResourceAccessAll(saved);const expected=new Set([webId,...(reader&&reader!==webId?[reader]:[])]);
 if(Object.keys(agents).some(id=>!expected.has(id)))throw Error('Unexpected access rule. Upload stopped.');
 for(const thing of solid.getThingAll(saved))for(const predicate of ['agentClass','agentGroup','origin'])if(solid.getUrlAll(thing,'http://www.w3.org/ns/auth/acl#'+predicate).length)throw Error('Unexpected broad permission. Upload stopped.');
 if(reader&&reader!==webId){const access=agents[reader];if(!access?.read||access.write||access.append||access.control)throw Error('Could not verify community read-only access.');}
 return saved;
}
export async function createCollection(root,webId,fetcher){
 const base=safeUrl(root);if(!base.endsWith('/'))throw Error('Pod root must end with /.');
 const url=new URL('family-art-'+crypto.randomUUID()+'/',base).href;
 const res=await fetcher(url,{method:'PUT',headers:{'Content-Type':'text/turtle','If-None-Match':'*',Link:'<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"'},body:''});
 if(!res.ok)throw Error('Could not create collection: '+res.status);
 await privateAcl(url,webId,fetcher,true);return url;
}
export async function uploadDrawing(collection,webId,fetcher,blob){
 // Reassert the dedicated collection's owner-only default before any photo leaves the browser.
 await privateAcl(collection,webId,fetcher,true);
 const url=new URL(crypto.randomUUID()+'.jpg',collection).href;
 const res=await fetcher(url,{method:'PUT',headers:{'Content-Type':'image/jpeg','If-None-Match':'*'},body:blob});
 if(!res.ok)throw Error('Upload failed: '+res.status);
 await privateAcl(url,webId,fetcher);return url;
}
export {solid};


