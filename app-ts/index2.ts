// example: deps-extractor.ts
import * as ts from 'typescript';
import * as path from 'path';
import * as fs   from 'fs';

function collectDeps(rootPath: string, isRoot: boolean, deps: Dependency[]) {

  const src = fs.readFileSync(path.join(rootPath), 'utf-8');
  const sf = ts.createSourceFile(rootPath, src, ts.ScriptTarget.ES2020, true);

  let dependency: Dependency = {
    fullPath: rootPath,
    FileName: path.basename(rootPath),
    isRoot: isRoot,
    Imports: []
  };

  sf.forEachChild(node => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;
      const resolvedPath = path.resolve(path.dirname(rootPath), importPath);
      if (fs.existsSync(resolvedPath)) {
        dependency.Imports.push({
          fullPath: resolvedPath,
          FileName: path.basename(resolvedPath)
        });
        collectDeps(resolvedPath, false, deps);
        return;
      }
      const resolvedPathTs = path.resolve(path.dirname(rootPath), importPath + '.ts');
      if (fs.existsSync(resolvedPathTs)) {
        dependency.Imports.push({
          fullPath: resolvedPathTs,
          FileName: path.basename(resolvedPathTs)
        });
        collectDeps(resolvedPathTs, false, deps);
        return;
      }
      const resolvedPathTsx = path.resolve(path.dirname(rootPath), importPath + '.tsx');
      if (fs.existsSync(resolvedPathTsx)) {
        dependency.Imports.push({
          fullPath: resolvedPathTsx,
          FileName: path.basename(resolvedPathTsx)
        });
        collectDeps(resolvedPathTsx, false, deps);
        return;
      }
    }
  });
  if(deps.filter(dependency => dependency.fullPath === rootPath).length === 0){
    deps.push(dependency);
  }
}

interface Dependency {
  fullPath: string;
  FileName: string;
  isRoot: boolean;
  Imports: {    
    fullPath: string;
    FileName: string;
  }[];
}

let deps: Dependency[] = [];

const rootPath = path.resolve('./../target_app/src');
const rootFile = path.join(rootPath, 'main.tsx');
collectDeps(rootFile, true, deps);

deps.forEach(dep => {
  dep.fullPath = dep.fullPath.replace(rootPath, '');
  dep.Imports.forEach(importDep => {
    importDep.fullPath = importDep.fullPath.replace(rootPath, '');
  });
});

console.log('Dependencies:', deps);
fs.writeFileSync('./../graph-view/deps.json', JSON.stringify(deps, null, 2));