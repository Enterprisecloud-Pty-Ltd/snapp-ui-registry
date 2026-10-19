import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

// Inspect the installed output, since shadcn transforms only recognized class
// expressions. A source-only Tailwind check cannot catch missed transformations.
export async function checkInstalledPrefix(sourceRoot, prefix = 'ec') {
  const failures = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await walk(file); continue; }
      if (!/\.tsx?$/.test(entry.name)) continue;
      const contents = await fs.readFile(file, 'utf8');
      const ast = ts.createSourceFile(file, contents, ts.ScriptTarget.Latest, true, entry.name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      function visit(node) {
        if (ts.isStringLiteralLike(node) && !(ts.isJsxAttribute(node.parent) && !/classNames?$/i.test(node.parent.name.getText()))) {
          const value = node.text;
          // Class lists cannot contain URLs, prose punctuation or selector APIs.
          if (!value.includes('://') && !/[\n\r]/.test(value)) {
            const tokens = value.trim().split(/\s+/);
            const raw = tokens.filter(token => /^(?:[\w-]+:)*(?:bg|text|font|rounded|leading|gap|size|h|min-h|max-h|w|min-w|max-w|p[trblxy]?|m[trblxy]?|top|right|bottom|left|border|inset-ring|items|justify|whitespace|opacity|appearance)-[\w#\[]/.test(token) && !token.startsWith(prefix + ':'));
            if (raw.length) {
              const line = ast.getLineAndCharacterOfPosition(node.getStart()).line + 1;
              failures.push(`${path.relative(sourceRoot, file).replaceAll('\\', '/')}:${line}: ${raw.join(' ')}`);
            }
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
  }
  await walk(path.join(sourceRoot, 'components'));
  return failures;
}
