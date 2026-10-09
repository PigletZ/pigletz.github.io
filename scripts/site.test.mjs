import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, plain } from './generate.mjs';
const posts = JSON.parse(await readFile(resolve(root,'content/posts.json'),'utf8'));
const routeFiles = ['index.html','404.html','about/index.html','search/index.html','archives/index.html',...posts.map(p => p.url.slice(1)+'index.html')];
for (const c of new Set(posts.map(p=>p.category))) routeFiles.push('categories/'+c+'/index.html');
for (const t of new Set(posts.flatMap(p=>p.tags))) routeFiles.push('tags/'+t+'/index.html');
for (const y of new Set(posts.map(p=>p.date.slice(0,4)))) routeFiles.push('archives/'+y+'/index.html');
for (const m of new Set(posts.map(p=>p.date.slice(0,7)))) routeFiles.push('archives/'+m.replace('-','/')+'/index.html');
test('all original article and taxonomy routes remain usable', async () => {
 for (const file of routeFiles) {const html=await readFile(resolve(root,file),'utf8');assert.match(html, /<html lang="zh-CN">/);assert.match(html, /<main id="main"/);assert.doesNotMatch(html, /jquery|fancybox|fonts.googleapis|maximum-scale|github.com\/PigletZ\/2020/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);}
});
test('every local page link and asset resolves, including heading anchors', async () => {
 for (const file of routeFiles) {
  const html=await readFile(resolve(root,file),'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
   const value=match[1].replaceAll('&amp;','&');if (/^(https?:|data:|mailto:)/.test(value)) continue;
   const [pathname,fragment]=value.split('#');
   const dest=pathname ? resolve(root,'.'+decodeURIComponent(pathname)) : resolve(root,file);
   const page=pathname.endsWith('/') ? resolve(dest,'index.html') : dest;
   await access(page);
   if (fragment && page.endsWith('.html')) {const target=await readFile(page,'utf8');assert.ok(target.includes('id="'+decodeURIComponent(fragment)+'"'),file+' -> '+value);}
  }
 }
});
test('article text, code blocks, embedded images and legacy anchors are preserved', async () => {
 for (const post of posts) {
  const source=await readFile(resolve(root,'content',post.file),'utf8');const page=await readFile(resolve(root,'.'+post.url,'index.html'),'utf8');
  const images=[...source.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m=>m[1]);for(const image of images)assert.ok(page.includes(image));
  for (const m of source.matchAll(/\bid="([^"]+)"/g))assert.ok(page.includes('id="'+m[1]+'"'),post.title+' '+m[1]);
  const codes=[...source.matchAll(/<td class="code"><pre>([\s\S]*?)<\/pre>/g)].map(m=>plain(m[1]));const rendered=[...page.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(m=>plain(m[1]));assert.deepEqual(rendered,codes,post.title);
  const renderedBody=page.split('<article class="prose">')[1].split('<div class="article-end">')[0].replace(/<p class="historical-note">[\s\S]*?<\/p>/,'').replace(/<div class="code-toolbar">[\s\S]*?<\/div>/g,'');
  const sourceBody=source.replace(/<td class="gutter">[\s\S]*?<\/td>/g,'');
  assert.equal(plain(renderedBody),plain(sourceBody),post.title+' full body');
  assert.ok(page.includes(post.date));assert.ok(page.includes(post.title));
 }
});
test('full-text index, metadata, RSS and sitemap describe the actual site', async () => {
 const index=JSON.parse(await readFile(resolve(root,'assets/search-index.json'),'utf8'));assert.equal(index.length,posts.length);assert.ok(index.some(p=>p.text.includes('monmaptool')));assert.ok(index.some(p=>p.text.includes('obj_location_info')));
 const feed=await readFile(resolve(root,'atom.xml'),'utf8');const sitemap=await readFile(resolve(root,'sitemap.xml'),'utf8');assert.equal((feed.match(/<entry>/g)||[]).length,posts.length);
 for(const p of posts){const canonical='https://pigletz.github.io'+encodeURI(p.url);assert.ok(feed.includes(canonical));assert.ok(sitemap.includes(canonical));}
 await access(resolve(root,'.nojekyll'));await access(resolve(root,'assets/favicon.svg'));
});
