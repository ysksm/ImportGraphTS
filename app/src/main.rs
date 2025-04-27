use std::path::{Path, PathBuf};

const ROOT_PATH: &str = "../target_app/";

fn normalize_path(path: &str) -> PathBuf {
    let path = Path::new(path);
    path.components()
        .filter(|component| component != &std::path::Component::ParentDir) // `..`を除外
        .collect::<PathBuf>()
}

fn get_source_path(parent_path: &str, path: &str) -> String {
    let path = path.split(" from ").collect::<Vec<&str>>()[1];
    let path = path.replace("'", "").replace("\"", "").replace(";", "");

    let source_path = format!("{}/{}", parent_path, path);
    normalize_path(&source_path).to_str().unwrap().to_string()
}

fn get_typescript_files(path: &Path) -> Vec<PathBuf> {
    let mut paths: Vec<PathBuf> = Vec::new();
    let pattern1 = format!("{}/**/*.ts", path.to_str().unwrap());
    let pattern2 = format!("{}/**/*.tsx", path.to_str().unwrap());
    let paths1 = glob::glob(&pattern1).unwrap();
    let paths2 = glob::glob(&pattern2).unwrap();
    paths.extend(paths1.filter_map(Result::ok));
    paths.extend(paths2.filter_map(Result::ok));

    paths.into_iter().filter(|path| !path.to_str().unwrap().to_string().contains("/node_modules")).collect()
    
}

struct FileRelationship {
    file_path: String,
    source_path: String,
}

fn get_relationship_list() -> Vec<FileRelationship> {
    let mut relationship_list: Vec<FileRelationship> = Vec::new();
    let paths = get_typescript_files(Path::new(ROOT_PATH));
    for path in paths {
        let parent_path = path.parent().unwrap().to_str().unwrap();
        let file_path = path.to_str().unwrap();
    
        let contents = std::fs::read_to_string(&path).unwrap();
        let lines: Vec<String> = contents
            .lines()
            .filter(|line| !line.starts_with("//"))
            .filter(|line| line.contains(" from "))
            .map(|line| line.to_string())
            .map(|line| get_source_path(&parent_path, &line))
            .collect();
    
        for line in lines {
            let relation_ship = FileRelationship {
                file_path: file_path.to_string().replace(ROOT_PATH, ""),
                source_path: line.replace(ROOT_PATH, ""),
            };
            relationship_list.push(relation_ship);
        }
    }
    relationship_list
}


fn main() {
    let relationship_list = get_relationship_list();
    for relationship in relationship_list {
        println!("{} -> {}", relationship.file_path, relationship.source_path);
    }
    println!("Done!");
}