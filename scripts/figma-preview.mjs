import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import ts from 'typescript';
import { __unstable__loadDesignSystem } from 'tailwindcss';

const execute = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = process.argv[2];
if (!fixture) throw new Error('Supply the retained clean registry smoke fixture directory.');
const fixtureRoot = path.resolve(fixture);
const marker = JSON.parse(await fs.readFile(path.join(fixtureRoot, 'package.json'), 'utf8'));
if (marker.name !== 'snapp-registry-smoke') throw new Error('Expected a clean registry smoke fixture.');
await fs.mkdir(path.join(fixtureRoot, 'src/figma'), {recursive:true});
const designSystem = await __unstable__loadDesignSystem(
  await fs.readFile(path.join(root,'node_modules/tailwindcss/theme.css'),'utf8') + '\n' +
  await fs.readFile(path.join(root,'registry/radix-nova/theme/snapp-theme.css'),'utf8')
);
function prefixPreview(source) {
  const ast=ts.createSourceFile('preview.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];
  function visit(node) {
    if(ts.isJsxAttribute(node)&&/className$/i.test(node.name.getText(ast))) {
      function classes(child) {
        if(ts.isStringLiteralLike(child)) {
          if(ts.isBinaryExpression(child.parent)&&[ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(child.parent.operatorToken.kind))return;
          const prefixed=child.text.split(/\s+/).map(candidate=>candidate.startsWith('ec:')||!designSystem.candidatesToCss([candidate])[0]?candidate:'ec:'+candidate).join(' ');
          if(prefixed!==child.text)edits.push({start:child.getStart(ast),end:child.getEnd(),text:JSON.stringify(prefixed)});
        } else ts.forEachChild(child,classes);
      }
      if(node.initializer)classes(node.initializer);
      return;
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
  return source;
}
for (const group of ['forms','navigation','work']) {
  const source = await fs.readFile(path.join(root, 'docs/figma-library', group + '-preview.tsx'), 'utf8');
  const prefixed = prefixPreview(source);
  await fs.writeFile(path.join(fixtureRoot, 'src/figma', group + '-preview.tsx'), prefixed);
}
await fs.writeFile(path.join(fixtureRoot, 'src/main.tsx'), [
  'import {createRoot} from "react-dom/client";',
  'import {FormsLibraryPreview} from "./figma/forms-preview";',
  'import {NavigationLibraryPreview} from "./figma/navigation-preview";',
  'import {WorkLibraryPreview} from "./figma/work-preview";',
  'import "./index.css";',
  'const query=new URLSearchParams(location.search); const group=query.get("group")??"forms";',
  'createRoot(document.getElementById("root")!).render(<div className="ec-app" style={{background:"#ccc",minHeight:"100vh",padding:24}}>{group==="navigation"?<NavigationLibraryPreview family={query.get("family")??undefined}/>:group==="work"?<WorkLibraryPreview/>:<FormsLibraryPreview/>}</div>);',
].join('\n'));
try {
  await execute(process.execPath, [path.join(fixtureRoot,'node_modules/typescript/bin/tsc')], {cwd:fixtureRoot,timeout:120000});
  await execute(process.execPath, [path.join(fixtureRoot,'node_modules/vite/bin/vite.js'),'build'], {cwd:fixtureRoot,timeout:120000});
} catch(error) { process.stderr.write(error.stdout??''); process.stderr.write(error.stderr??''); throw error; }
if (process.argv.includes('--build-only')) {
  process.stdout.write('FIGMA_PREVIEW_REBUILT\n');
  process.exit(0);
}
const dist = path.join(fixtureRoot, 'dist');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
const server = createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    const candidate=path.resolve(dist,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if (!candidate.startsWith(dist+path.sep)) {res.writeHead(403);res.end();return;}
    const bytes=await fs.readFile(candidate);
    res.writeHead(200,{'Content-Type':mime[path.extname(candidate)]??'application/octet-stream'});res.end(bytes);
  } catch {res.writeHead(404);res.end();}
});
server.listen(4799,'127.0.0.1',()=>process.stdout.write('FIGMA_PREVIEW=http://127.0.0.1:4799\n'));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
