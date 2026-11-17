import {readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve('dist'),pages=['index.html','matchs.html','club.html','collection.html','studio.html','tribune.html'];
let references=0;
for(const page of pages){
  const html=await readFile(resolve(root,page),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(ids.length!==new Set(ids).size)throw new Error(`${page}: duplicate element ID`);
  if((html.match(/<h1\b/g)||[]).length!==1)throw new Error(`${page}: expected one primary heading`);
  for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|data:|mailto:|tel:)/.test(href))continue;
    const [path,anchor]=href.split('#'),filename=path.split('?')[0]||page;
    await access(resolve(dirname(resolve(root,page)),filename));references++;
    if(anchor&&(!path||filename===page)&&!ids.includes(anchor))throw new Error(`${page}: missing #${anchor}`);
  }
}
console.log(`Checked ${pages.length} pages: primary headings, unique IDs, ${references} local references.`);
