// example: deps-extractor.ts
import * as ts from 'typescript';
import * as path from 'path';
import * as fs   from 'fs';

function collectDeps(rootDir: string) {
  const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const deps: { [file: string]: string[] } = {};

  files.forEach(file => {
    const src = fs.readFileSync(path.join(rootDir, file), 'utf-8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ES2020, true);
    const imports: string[] = [];
    sf.forEachChild(node => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
      }
    });
    deps[file] = imports;
  });

  fs.writeFileSync('./../output/deps.json', JSON.stringify(deps, null, 2));
}

collectDeps('./../target_app/src');
