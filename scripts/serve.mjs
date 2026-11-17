import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
  try{
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!path.startsWith(root+'/')){res.writeHead(403);return res.end();}
    const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4174,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4174'));
