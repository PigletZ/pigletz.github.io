import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, join, sep } from 'node:path';
import { build, root } from './generate.mjs';
await build();
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
 try {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const target = resolve(root, '.' + pathname);
  if ((target !== root && !target.startsWith(root + sep)) || pathname.split('/').some(part => part.startsWith('.'))) {response.writeHead(403).end('Forbidden');return;}
  const info = await stat(target);
  const file = info.isDirectory() ? join(target, 'index.html') : target;
  response.writeHead(200, {'Content-Type': mime[extname(file)] || 'application/octet-stream'}).end(await readFile(file));
 } catch {
  response.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'}).end(await readFile(join(root, '404.html')));
 }
}).listen(port, '127.0.0.1', () => console.log('Blog preview: http://127.0.0.1:' + port + '\nAfter editing content or templates, run npm run build and refresh.'));
