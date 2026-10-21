import {build} from 'esbuild';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await build({entryPoints:['parents-app.mjs'],bundle:true,format:'esm',target:'es2022',outfile:'dist/app.js',minify:true});
await mkdir('dist/community',{recursive:true});
await copyFile('parents.html','dist/index.html');await copyFile('parents.html','dist/community/index.html');
await writeFile('dist/_headers',`/*\n  Cache-Control: no-store\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; connect-src https: http://localhost:* http://127.0.0.1:*; frame-ancestors 'none'; base-uri 'none'; form-action 'none'\n`);
console.log('Static pilot built in dist/. No deployment performed.');
