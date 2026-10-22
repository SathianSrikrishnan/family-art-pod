import {safeUrl,createCollection,uploadDrawing,privateAcl,solid} from './pod-core.mjs';
import {discoverCollections,chooseCollection,storageGet,storageSet,isCollectionInRoot,isPrivateOwnerCollection} from './collection-recovery.mjs';
import {readCatalog,rememberCollection} from './pod-catalog.mjs';
export async function mountApp(session,api=solid,recovery={readCatalog,rememberCollection}){
const $=id=>document.getElementById(id),fetcher=(...args)=>session.fetch(...args);
const store={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
$('issuer').value=storageGet(store,'family-art:provider')||'https://privatedatapod.com/';
let collection=null,urls=[],busy=false,viewed=null,discoveryReady=false,roots=[];
const gallery=location.pathname.replace(/\/$/,'')==='/community';
const status=message=>{$('status').textContent=message};
async function action(fn){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn()}catch(e){status(e.message==='Failed to fetch'?'Could not reach your Pod. Check your connection, then try again.':e.message||'Something went wrong. Try again.')}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);ready()}}
const key=()=>`family-art:${session.info.webId}`;
function ready(){ $('setup').hidden=!!collection; $('photo').disabled=busy||!collection; $('create').disabled=busy||!discoveryReady; $('view').disabled=busy||!session.info.isLoggedIn; $('upload-hint').textContent=collection?'Only you can see a new photo until you share it.':'Connect your Pod and open your artwork folder first.'; }
async function recover(){
 discoveryReady=false;ready();status('Looking for your artwork in your Pod…');
 roots=await api.getPodUrlAll(session.info.webId,{fetch:fetcher});
 if(!roots.length){$('manual-storage').hidden=false;const supplied=$('manual-root').value.trim();if(supplied){const url=safeUrl(supplied);if(!url.endsWith('/'))throw Error('Your storage address must end with /. Copy it from your Pod account.');roots=[url];}else throw Error('Your provider did not list your storage address. Copy your Pod storage address into the box below, then check again.');}
 $('root').replaceChildren();for(const root of roots){const option=node('option',root);option.value=root;$('root').append(option)}
 let found=[];
 try{
  for(const root of roots){
   let catalog=null,catalogError=null;try{catalog=await recovery.readCatalog(root,session.info.webId,fetcher,api);}catch(e){catalogError=e;}
   if(catalog){for(const candidate of catalog.collections){if(await isPrivateOwnerCollection(candidate,session.info.webId,fetcher,api))found.push(candidate);else throw Error('A saved artwork folder is no longer private. Ask for help before continuing.');}}
   else {try{found.push(...await discoverCollections([root],session.info.webId,fetcher,api));}catch(e){if(e.message.includes('text/html')){throw Object.assign(Error('Your provider uses a profile page instead of a folder list. Restore your existing artwork folder below, or explicitly start a new one.'),{legacy:true});}throw catalogError||e;}}
  }
 }catch(e){if(e.legacy){$('legacy-recovery').hidden=false;$('create').hidden=false;discoveryReady=true;ready();}throw e;}
 $('legacy-recovery').hidden=true;
 collection=chooseCollection(found,storageGet(store,key()));
 $('recover-options').replaceChildren();$('recovery').hidden=!found.length||!!collection;
 for(const [i,url] of found.entries()){const button=node('button',`Open artwork folder ${i+1}`);button.className='secondary';button.onclick=()=>action(async()=>{await recovery.rememberCollection(roots.find(root=>isCollectionInRoot(url,root)),url,session.info.webId,fetcher);collection=url;storageSet(store,key(),url);$('collection').textContent=url;$('recovery').hidden=true;await refresh();status('Your artwork is ready.');});$('recover-options').append(button)}
 discoveryReady=true;$('create').hidden=found.length>0;
 if(collection){await recovery.rememberCollection(roots.find(root=>isCollectionInRoot(collection,root)),collection,session.info.webId,fetcher);storageSet(store,key(),collection);$('collection').textContent=collection;await refresh();status('Your artwork is ready. Add a photo or choose one to share.');}
 else status(found.length?'We found more than one artwork folder. Choose one below.':'Your Pod is connected. Create your private artwork folder to start.');
 ready();
}
function node(tag,text){const el=document.createElement(tag);if(text)el.textContent=text;return el}
function clearImages(){urls.forEach(URL.revokeObjectURL);urls=[]}
async function image(url){const res=await fetcher(safeUrl(url),{cache:'no-store'});if(!res.ok)throw Error([401,403].includes(res.status)?'You cannot open this drawing. Check that the parent shared with your exact WebID. They may have made it private again.':`Your Pod could not load this drawing (${res.status}). Try again.`);const blob=await res.blob();if(!blob.type.startsWith('image/'))throw Error('That resource is not an image.');const img=node('img');img.alt='Artwork shared from a family Pod';img.src=URL.createObjectURL(blob);urls.push(img.src);return img}
async function refresh(){clearImages();$('artworks').replaceChildren();if(!collection)return;
 const dataset=await api.getSolidDataset(collection,{fetch:fetcher});const entries=api.getThing(dataset,collection);const resources=entries?api.getUrlAll(entries,'http://www.w3.org/ns/ldp#contains'):[];
 $('empty').hidden=resources.some(u=>u.startsWith(collection)&&u.endsWith('.jpg'));
 for(const url of resources.filter(u=>u.startsWith(collection)&&u.endsWith('.jpg'))){const card=node('article');card.className='art';card.append(await image(url));const title=node('p','Stored in your Pod');card.append(title);
 const info=await api.getResourceInfoWithAcl(url,{fetch:fetcher});const acl=api.getResourceAcl(info);const readers=acl?Object.entries(api.getAgentResourceAccessAll(acl)).filter(([id,a])=>id!==session.info.webId&&a.read).map(([id])=>id):[];
 const label=node('label','Who would you like to share with?');const input=node('input');input.type='url';input.placeholder='Paste their Solid WebID';input.value=readers[0]||'';const inputId='community-'+crypto.randomUUID();input.id=inputId;label.htmlFor=inputId;const help=node('small',"Ask them to open their Pod account and choose Copy WebID. It is an identity link, not their email. They need a Solid account to view your drawing.");input.setAttribute('aria-describedby',inputId+'-help');help.id=inputId+'-help';const guidance=node('details');guidance.append(node('summary','Where do I find their WebID?'),help);card.append(label,input,guidance,node('small',readers.length?'Shared with: '+readers.join(', '):'Private · only you'));
 const share=node('button','Share drawing');share.onclick=()=>action(async()=>{if(!input.value.trim())throw Error('Paste the recipient’s WebID first. Their Pod account has a Copy WebID button.');const reader=safeUrl(input.value.trim());if(reader===session.info.webId)throw Error('Use the other person’s WebID. You already have access.');await privateAcl(url,session.info.webId,fetcher,false,reader);status('Shared. Copy the invitation link and send it to this person.');await refresh()});
 const revoke=node('button','Make private');revoke.className='secondary';revoke.onclick=()=>action(async()=>{await privateAcl(url,session.info.webId,fetcher);status('Private again. The recipient can no longer open this drawing. Saved copies cannot be recalled.');await refresh()});
 const copy=node('button','Copy invitation link');copy.className='secondary';copy.onclick=()=>action(async()=>{if(!readers.length)throw Error('Share this drawing with someone before copying an invitation.');const link=location.origin+'/community#art='+encodeURIComponent(url);$('invitation').value=link;$('invitation-box').hidden=false;try{await navigator.clipboard.writeText(link);status('Invitation copied. Send it to the person you selected.');}catch{status('Copy the invitation from the box below and send it to the person you selected.');}});card.append(share,revoke,copy);$('artworks').append(card);
 }
}
async function normalize(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose a JPEG, PNG or WebP under 10 MB.');const bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>40000000){bitmap.close();throw Error('Image dimensions are too large. Choose a smaller photo.')}const ratio=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not prepare photo.')),'image/jpeg',.88))}
$('connect').onclick=()=>action(async()=>{const issuer=safeUrl($('issuer').value.trim());storageSet(store,'family-art:provider',issuer);if(location.pathname.replace(/\/$/,'')==='/community'&&$('resource').value)storageSet(sessionStorage,'pending-art',$('resource').value);await session.login({oidcIssuer:issuer,redirectUrl:location.origin+location.pathname,clientName:'Family Art · Solid experiment'});});
$('logout').onclick=()=>action(async()=>{await session.logout();clearImages();location.assign('/')});
$('create').onclick=()=>action(async()=>{collection=await createCollection($('root').value.trim(),session.info.webId,fetcher);await recovery.rememberCollection($('root').value.trim(),collection,session.info.webId,fetcher);storageSet(store,key(),collection);$('collection').textContent=collection;ready();status('Your artwork folder is ready. Choose photos below.');await refresh()});
$('photo').onchange=()=>action(async()=>{const files=[...$('photo').files];let saved=0;try{for(const file of files){const blob=await normalize(file);await uploadDrawing(collection,session.info.webId,fetcher,blob);saved++}status(`${saved} photo${saved===1?'':'s'} saved privately.`);}catch(e){status(`${saved} of ${files.length} photos saved. ${e.message} Choose the remaining photos to retry.`);}finally{$('photo').value='';await refresh()}});
$('restore').onclick=()=>action(async()=>{const candidate=safeUrl($('restore-url').value.trim());const root=roots.find(root=>isCollectionInRoot(candidate,root));if(!root||!await isPrivateOwnerCollection(candidate,session.info.webId,fetcher,api))throw Error('That is not a private artwork folder owned by this account. Copy the folder address from your Pod file browser.');await recovery.rememberCollection(root,candidate,session.info.webId,fetcher);collection=candidate;storageSet(store,key(),collection);$('collection').textContent=collection;$('legacy-recovery').hidden=true;await refresh();status('Your artwork is restored. This Pod now remembers the folder for your next browser.');});
$('retry').onclick=()=>action(recover);
$('copy-webid').onclick=()=>action(async()=>{try{await navigator.clipboard.writeText(session.info.webId);status('Your WebID is copied. Send it to the parent who is sharing with you.');}catch{status('Copy your WebID from the connection details above.');}});
$('view').onclick=()=>action(async()=>{clearImages();$('shared').replaceChildren();viewed=null;const target=safeUrl($('resource').value.trim());$('shared').append(await image(target));viewed=target;status('Your Pod identity has access to this drawing.')});
$('parent').hidden=true;$('community').hidden=!gallery;
if(gallery){$('heading').textContent='A drawing shared with you';$('intro').textContent='Sign in with the account the parent invited.';$('gallery-link').textContent='Your artwork →';$('gallery-link').href='/';const art=new URLSearchParams(location.hash.slice(1)).get('art');$('resource').value=art||storageGet(sessionStorage,'pending-art')||'';try{sessionStorage.removeItem('pending-art');}catch{}}
await action(async()=>{
 await session.handleIncomingRedirect();
 if(location.search.includes('code=')||location.search.includes('error='))history.replaceState(null,'',location.pathname+location.hash);
 const logged=session.info.isLoggedIn;$('login').hidden=logged;$('identity').hidden=!logged;$('webid').textContent=session.info.webId||'';$('parent').hidden=!logged||gallery;
 if(logged&&!gallery)await recover();
 else status(logged?'You’re signed in. Open the drawing below.':'Start by signing in to your Pod below.');
});
window.addEventListener('pagehide',clearImages);

const timer=setInterval(async()=>{if(!viewed||busy)return;try{const r=await fetcher(viewed,{method:'HEAD',cache:'no-store'});if(!r.ok){clearImages();$('shared').replaceChildren();viewed=null;status('The drawing is no longer available to this identity. Access may have been revoked.')}}catch{clearImages();$('shared').replaceChildren();viewed=null;status('Unable to check Pod access. Reopen the drawing to retry.')}},5000);

return {dispose(){clearInterval(timer);clearImages();}};
}
