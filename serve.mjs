import http from 'node:http';
import {readFile} from 'node:fs/promises';
import './build-parents.mjs';
const routes={'/':'dist/index.html','/community':'dist/community/index.html','/community/':'dist/community/index.html','/app.js':'dist/app.js'};
http.createServer(async(req,res)=>{if(!['localhost:8775','127.0.0.1:8775'].includes(req.headers.host)){res.writeHead(403).end();return}const file=routes[new URL(req.url,'http://localhost').pathname];if(req.method!=='GET'||!file){res.writeHead(404).end();return}try{res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await readFile(file))}catch{res.writeHead(500).end('Build unavailable')}}).listen(8775,'127.0.0.1',()=>console.log('Local app: http://localhost:8775'));
