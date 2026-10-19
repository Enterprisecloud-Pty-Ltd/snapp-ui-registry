import fs from 'node:fs/promises';
import path from 'node:path';

async function filesBelow(root, relative) {
  const files = [];
  for (const entry of await fs.readdir(path.join(root, relative), {withFileTypes:true})) {
    const child = relative + '/' + entry.name;
    if (entry.isDirectory()) files.push(...await filesBelow(root, child));
    else files.push(child);
  }
  return files;
}
const moduleKey = file => file.replace(/\.(?:tsx?|jsx?)$/, '');
const installTarget = target => target.replace(/^@ui\//, 'src/components/ui/').replace(/^@components\//, 'src/components/').replace(/^@lib\//, 'src/lib/').replace(/^@hooks\//, 'src/hooks/');
const itemTitle = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');

export async function completeComponentCatalog(root, registry, externalDependencies) {
  const claimed = new Set(registry.items.flatMap(item => (item.files ?? []).map(file => file.path)));
  const supplemental = [];
  for (const file of await filesBelow(root, 'registry/radix-nova/components')) {
    if (!/\.tsx?$/.test(file) || claimed.has(file)) continue;
    const name = path.basename(file).replace(/\.tsx?$/, '');
    const itemName = 'snapp-' + name.replace(/\./g, '-');
    if (registry.items.some(item => item.name === itemName)) throw new Error('Ambiguous component item ' + itemName);
    const contents = await fs.readFile(path.join(root, file), 'utf8');
    const item = {name:itemName,type:'registry:component',title:itemTitle(name),description:'Shared SNAPP component-library building block: ' + itemTitle(name) + '.',dependencies:externalDependencies(contents),registryDependencies:['@snapp/snapp-theme','@snapp/snapp-utils'],files:[{path:file,type:'registry:component',target:'@components/snapp/' + file.slice('registry/radix-nova/components/'.length)}]};
    registry.items.push(item);
    supplemental.push(itemName);
  }
  const assetRoot = path.join(root, 'registry/radix-nova/assets');
  try {
    for (const group of await fs.readdir(assetRoot, {withFileTypes:true})) {
      if (!group.isDirectory()) continue;
      const files = await filesBelow(root, 'registry/radix-nova/assets/' + group.name);
      if (files.some(file => !file.endsWith('.svg'))) throw new Error('Binary assets need an explicit distribution encoder.');
      registry.items.push({name:'snapp-figma-' + group.name + '-assets',type:'registry:component',title:'SNAPP ' + itemTitle(group.name) + ' Assets',description:'Unmodified SVG assets from the SNAPP Figma component library.',files:files.map(file => ({path:file,type:'registry:file',target:'src/assets/snapp/' + file.slice('registry/radix-nova/assets/'.length)}))});
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const owners = new Map();
  for (const item of registry.items) for (const file of item.files ?? []) owners.set(moduleKey(installTarget(file.target)), item.name);
  for (const item of registry.items) {
    const dependencies = new Set(item.registryDependencies ?? []);
    for (const file of item.files ?? []) {
      if (!/\.tsx?$/.test(file.path)) continue;
      const content = await fs.readFile(path.join(root, file.path), 'utf8');
      for (const match of content.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
        const specifier = match[1];
        if (!specifier.startsWith('@/') && !specifier.startsWith('.')) continue;
        const target = specifier.startsWith('@/') ? 'src/' + specifier.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(installTarget(file.target)), specifier));
        const owner = owners.get(moduleKey(target));
        if (!owner) throw new Error(item.name + ' imports an unregistered source: ' + specifier);
        if (owner !== item.name) dependencies.add('@snapp/' + owner);
      }
    }
    item.registryDependencies = [...dependencies].sort();
  }
  const marker = 'registry/radix-nova/components/foundation/component-library.ts';
  await fs.writeFile(path.join(root, marker), 'export const SNAPP_COMPONENT_LIBRARY = { fileKey: "YUYB5jtCxUwT8OefeLP9f7", revision: "2026-10-19" } as const;\n');
  const existing = registry.items.find(item => item.name === 'snapp-component-library');
  const library = {name:'snapp-component-library',type:'registry:component',title:'SNAPP Component Library',description:'Complete SNAPP Figma component-library installation with its shared primitives, theme and assets.',registryDependencies:[...new Set(['@snapp/snapp-ui-foundation',...registry.items.filter(item => item.files?.some(file => file.path.startsWith('registry/radix-nova/components/'))).map(item => '@snapp/' + item.name)])].filter(name => name !== '@snapp/snapp-component-library').sort(),files:[{path:marker,type:'registry:component',target:'@components/snapp/foundation/component-library.ts'}]};
  if (existing) Object.assign(existing, library); else registry.items.push(library);
  console.log('Registered full component/asset dependency graph (' + registry.items.length + ' items).');
}
