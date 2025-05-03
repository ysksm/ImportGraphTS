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
      const importPath = node.moduleSpecifier.text.replaceAll('@/', './');
      const resolvedPath = path.resolve(path.dirname(rootPath), importPath);
      const resolvedPathIndex = path.resolve(path.dirname(rootPath), importPath, 'index.ts');
      const resolvedPathIndexTsx = path.resolve(path.dirname(rootPath), importPath, 'index.tsx');
      const resolvedPathTs = path.resolve(path.dirname(rootPath), importPath + '.ts');
      const resolvedPathTsx = path.resolve(path.dirname(rootPath), importPath + '.tsx');
      const importFilePath = fs.existsSync(resolvedPathTsx) ? resolvedPathTsx : 
        fs.existsSync(resolvedPathTs) ? resolvedPathTs : 
        fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile() ? resolvedPath : 
        fs.existsSync(resolvedPathIndex) ? resolvedPathIndex : resolvedPathIndexTsx;

      console.log('Importing:', importPath, 'from', rootPath);
      if (fs.existsSync(importFilePath)) {
        dependency.Imports.push({
          fullPath: importFilePath,
          FileName: path.basename(importFilePath)
        });
        collectDeps(importFilePath, false, deps);
        return;
      }
    }
    if(ts.isExportDeclaration(node)){
      const exportPath = node.moduleSpecifier?.getText().replaceAll('@/', './').replace(/['"]/g, '');
      if( exportPath === undefined){
        return;
      }
      console.log('Exporting:', exportPath, 'from', rootPath);
      const resolvedPath = path.resolve(path.dirname(rootPath), exportPath);
      const resolvedPathIndex = path.resolve(path.dirname(rootPath), exportPath, 'index.ts');
      const resolvedPathIndexTsx = path.resolve(path.dirname(rootPath), exportPath, 'index.tsx');
      const resolvedPathTs = path.resolve(path.dirname(rootPath), exportPath + '.ts');
      const resolvedPathTsx = path.resolve(path.dirname(rootPath), exportPath + '.tsx');
      const importFilePath = fs.existsSync(resolvedPathTsx) ? resolvedPathTsx : 
        fs.existsSync(resolvedPathTs) ? resolvedPathTs : 
        fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile() ? resolvedPath : 
        fs.existsSync(resolvedPathIndex) ? resolvedPathIndex : resolvedPathIndexTsx;

      console.log('Importing:', exportPath, 'from', rootPath);
      if (fs.existsSync(importFilePath)) {
        dependency.Imports.push({
          fullPath: importFilePath,
          FileName: path.basename(importFilePath)
        });
        collectDeps(importFilePath, false, deps);
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