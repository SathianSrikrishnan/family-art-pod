import {writeFile} from 'node:fs/promises';
const headers = [
 ['Cache-Control','no-store'],
 ['Referrer-Policy','no-referrer'],
 ['X-Content-Type-Options','nosniff'],
 ['X-Frame-Options','DENY'],
 ['Permissions-Policy','camera=(), microphone=(), geolocation=()'],
 ['Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; connect-src https:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"]
].map(([key,value])=>({key,value}));
await writeFile('dist/vercel.json',JSON.stringify({version:2,cleanUrls:true,headers:[{source:'/(.*)',headers}]},null,2)+'\n');
