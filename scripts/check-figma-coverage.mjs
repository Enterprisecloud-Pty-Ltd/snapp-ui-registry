import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'docs/figma-library');
const inventory=JSON.parse(await fs.readFile(path.join(directory,'inventory.json'),'utf8'));
const groups=['forms','navigation','work'];
const audits=await Promise.all(groups.map(async group=>({group,text:await fs.readFile(path.join(directory,group+'-audit.json'),'utf8')})));
const missing=[];
const coverage=[];
for(const node of inventory.nodes.filter(node=>node.type!=='instance')){
  const owners=audits.filter(audit=>audit.text.includes('"'+node.id+'"')).map(audit=>audit.group);
  if(owners.length!==1)missing.push(node.name+' ('+node.id+') has '+owners.length+' audit owners.');
  coverage.push({nodeId:node.id,name:node.name,owners});
}
if(missing.length)throw new Error(missing.join('\n'));
await fs.writeFile(path.join(directory,'coverage.json'),JSON.stringify({fileKey:inventory.fileKey,observedOn:inventory.observedOn,definitions:coverage.length,duplicateInstances:inventory.nodes.filter(node=>node.type==='instance').length,coverage,scope:'Inventory ownership coverage; visual and behavioral verification is a separate gate.'},null,2)+'\n');
console.log('All '+coverage.length+' Figma definitions have exactly one audit owner.');
