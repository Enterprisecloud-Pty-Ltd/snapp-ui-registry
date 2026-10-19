import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['primitives', 'semantic', 'typography'];
const sources = await Promise.all(names.map(async name => ({
  name,
  source: JSON.parse(await fs.readFile(path.join(root, 'docs/figma-library', name + '-source.json'), 'utf8')),
})));
const variables = new Map(sources.flatMap(({source}) => source.variables.map(v => [v.id, {...v, collection: source.collection}])));
function resolve(variable, seen = new Set()) {
  if (!variable || seen.has(variable.id)) throw new Error('Missing or cyclic Figma variable.');
  seen.add(variable.id);
  const value = variable.valuesByMode[variable.collection.defaultModeId];
  return value?.type === 'VARIABLE_ALIAS' ? resolve(variables.get(value.id), seen) : value;
}
function tokenParts(name, kind) {
  const parts = name.split('/');
  // Retain installed semantic radius class names while recording the real Figma name.
  if (kind === 'semantic' && parts[0] === 'corner radius') {
    parts[0] = 'radius';
    parts[1] = parts[1].replace(/^corner-radius-/, 'radius-');
  }
  return parts;
}
function assign(document, parts, token) {
  let node = document;
  for (const part of parts.slice(0, -1)) node = node[part] ??= {};
  node[parts.at(-1)] = token;
}
for (const {name, source} of sources) {
  const destination = path.join(root, 'registry/radix-nova/tokens', name + '.tokens.json');
  // Preserve compatibility-only aliases absent from this library; live names win.
  const document = JSON.parse(await fs.readFile(destination, 'utf8'));
  for (const v of source.variables) {
    const variable = variables.get(v.id);
    const resolved = resolve(variable);
    const extensions = {'com.figma.variableId': v.id, 'com.figma.variableName': v.name, 'com.figma.scopes': v.scopes};
    const raw = v.valuesByMode[source.collection.defaultModeId];
    if (raw?.type === 'VARIABLE_ALIAS') {
      const target = variables.get(raw.id);
      extensions['com.figma.aliasData'] = {targetVariableId: target.id, targetVariableName: target.name, targetVariableSetId: target.collection.id, targetVariableSetName: target.collection.name};
    }
    const value = v.type === 'COLOR' ? {
      colorSpace: 'srgb', components: [resolved.r, resolved.g, resolved.b], alpha: resolved.a ?? 1,
      hex: '#' + [resolved.r, resolved.g, resolved.b].map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase(),
    } : resolved;
    assign(document, tokenParts(v.name, name), {$type: {COLOR:'color', FLOAT:'number', STRING:'string'}[v.type], $value: value, $extensions: extensions});
  }
  document.$extensions = {...document.$extensions, 'snapp.source': {fileKey: 'YUYB5jtCxUwT8OefeLP9f7', collection: source.collection.name, observedOn: '2026-10-19'}};
  await fs.writeFile(destination, JSON.stringify(document, null, 2) + '\n');
  console.log('Imported ' + source.variables.length + ' live ' + name + ' variables.');
}
