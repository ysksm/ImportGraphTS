import { Node, Edge, MarkerType } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import depsData from '../deps.json';

export interface LayoutedNodes {
    nodes: Node[];
    edges: Edge[];
}

interface ImportInfo {
    fullPath: string;
    FileName: string;
}

type NodeDataType  = {
    dataType: 'folder';
    label: string;
    depth: number;
    fileNodes: Node[];
} | {
    dataType: 'file';
    label: string;
    importsList: ImportInfo[];
} 

// フォルダ内にファイルを配置した場合の幅と高さを求める
const getLayoutedNodesWithTotalRect = (nodes: Node[]): { nodes: Node[], width: number; height: number } => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR' });
    g.setDefaultEdgeLabel(() => ({}));  
    nodes.forEach((node) => {
        g.setNode(node.id, { width: 150, height: 100 });
    });

    dagre.layout(g);
    let maxWidth = 150;
    let maxHeight = 100;
    nodes.forEach((node) => {
        const { x, y } = g.node(node.id);
        const width = Number(node.style?.width || 150);
        const height = Number(node.style?.height || 50);
        maxWidth = Math.max(maxWidth, x + width);
        maxHeight = Math.max(maxHeight, y + height);
    });
    
    const fileNodes = nodes.map((node) => {
        const { x, y } = g.node(node.id);
        const width = Number(node.style?.width || 150);
        const height = Number(node.style?.height || 50);   
        return {
            ...node,
            position: {x, y},
            initialHeight: height,
            initialWidth: width,
            type: 'custom',
            width: width,
            height: height,
            data: node.data,
        };
    });
    maxWidth = maxWidth + 75;
    maxHeight = maxHeight + 50;
    return {
        nodes: fileNodes,
        width: maxWidth,
        height: maxHeight,
    };
}

const createFolderPaths = () => {
    const dependenciesList = depsData;
    // フォルダのノードを生成
    const folderPaths =  dependenciesList.map((item) => {
        const path = item.fullPath.replace(item.FileName, '');
        const folderPath = path.length > 1 ? path.substring(0, item.fullPath.lastIndexOf('/')) : path;
        return folderPath
    });

    // 重複を排除
    const uniqueFolderPaths = Array.from(new Set(folderPaths));
    const sortedUniqueFolderPaths = uniqueFolderPaths.sort((a, b) => {
        return a.length - b.length;
    });
    // ディレクト情報を再構成、path、ディレクトリに深さを持たせる
    const structuredFolderPaths = sortedUniqueFolderPaths.map((item) => {
        const depth: Number = item.length === 1 ? 0 : item.split('/').length - 1;
        const folderName = item.split('/').pop() || '';
        return {
            id: item,
            path: item,
            folderName: folderName,
            depth: depth,
        };
    });
    return structuredFolderPaths;
}

const getDirectoryNodes = (): LayoutedNodes => {
    const dependenciesList = depsData;
    const structuredFolderPaths = createFolderPaths();

    // [データ構造作成]フォルダ構造からNodeを生成
    const folderNodes: Node[] = structuredFolderPaths.map((folder) => {
        // カレントフォルダー内のファイルを取得
        const files = dependenciesList.filter((item) => {
            if(folder.path.length === 1) {
                if(item.fullPath.split('/').length === 2) {
                    return true;
                }
                return false;
            }
            // /の数が同じかつ、カレントフォルダーのパスで始まるものを取得
            const folderPath = folder.path.split('/').length;
            const itemPath = item.fullPath.split('/').length - 1;
            if (folderPath !== itemPath) {
                return false;
            }
            return item.fullPath.startsWith(folder.path + '/');
        });
        const fileNodes = files.map((file) => {
            const nodeData: NodeDataType = {
                dataType: 'file',
                label: file.FileName,
                importsList: file.Imports,
            };
            return {
                id: file.fullPath,
                type: 'custom',
                data: nodeData,
                position: {x: 0, y: 0},
            };
        });
        const rect = getLayoutedNodesWithTotalRect(fileNodes);
        return{
            id: folder.path,
            // type: 'custom',
            data: { 
                label: `${folder.folderName} (${files.length})`,
                depth: folder.depth,
                fileNodes: rect.nodes,
            },

            position: {x: 0, y: 0},
            initialHeight: rect.height,
            initialWidth: rect.width,
        }
    });

    // [データ構造作成]フォルダデータからエッジを生成
    let initialEdges: Edge[] = [];    
    folderNodes.forEach((item) => {
        const depth = Number(item.data.depth);
        const children = folderNodes.filter((child) => {
            return child.data.depth === depth + 1 && child.id.startsWith(item.id);
        });
        children.forEach((child) => {
            if(item.id === null || child.id === null) {

                return;
            }
            const edge = {
                id: `${item.id}->${child.id}`,
                source: item.id,
                target: child.id,
                animated: false,
                type: 'folderEdge',
            };
            initialEdges.push(edge);
        }
        );
    });

    // [レアウト]
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 150 });
    g.setDefaultEdgeLabel(() => ({}));  
    folderNodes.forEach((node) => {
        const width = Number(node.initialWidth || 150);
        const height = Number(node.initialHeight || 100);
        g.setNode(node.id, { width: width, height: height });
    });
    initialEdges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });
    dagre.layout(g);

    // [レイアウト]フォルダのノードをレイアウト
    let layoutedFolderNodes: Node[] = folderNodes.map((node) => {
        const { x, y } = g.node(node.id);
        const width = Number(node.initialWidth || 150);
        const height = Number(node.initialHeight || 100);
        return {
            ...node,
            data: node.data,
            position: {x, y},
            initialHeight: height,
            initialWidth: width,
            type: 'customFolder',
            width: width,
            height: height,
        }}
    );

    // [レイアウト]フォルダ内のファイルノードをレイアウト
    layoutedFolderNodes.forEach((node) => {
        // ファイルノードの作成
        const fileNodes: Node[] = node.data.fileNodes as Node[];
        fileNodes.forEach((fileNode) => {
            const width = Number(fileNode.initialWidth || 150);
            const height = Number(fileNode.initialHeight || 100);
            const nodeData: NodeDataType = {
                dataType: 'file',
                label: fileNode.data.label as string,
                importsList: fileNode.data.deps as ImportInfo[],
            }
            const newFileNode: Node = {
                id: fileNode.id,
                parentId: node.id,
                type: 'custom',
                data: nodeData,
                initialHeight: height,
                initialWidth: width,
                style: {
                    width: width,
                    height: height,
                },
                position: {x: fileNode.position.x, y: fileNode.position.y},
            }
            // フォルダノードにファイルノードを追加
            layoutedFolderNodes.push(newFileNode);
            
            const importsList = fileNode.data.importsList as ImportInfo[];
            if(importsList === undefined) {
                console.log('importsList is undefined', fileNode);
                return;
            }
            importsList.forEach((imp) => {
                const edge = {
                    id: `${fileNode.id}->${imp.fullPath}`,
                    source: fileNode.id,
                    target: imp.fullPath,
                    animated: false,
                    type: 'fileEdge',
                    markerEnd:{
                        type: MarkerType.ArrowClosed,
                        width: 10,
                        height: 10,
                    },
                };
                initialEdges.push(edge);
                console.log('edge', edge);
            });
        });
    });
    
    console.log('initialEdges', initialEdges);
    return {
        nodes: layoutedFolderNodes,
        edges: initialEdges,
    };
}

const getLayoutedNodes = (): LayoutedNodes => {
    const dependenciesList = depsData;
    // テキストを表示するためのノードとエッジを生成
    const initialNodes: Node[] = dependenciesList.map((item) => ({
        id: item.fullPath,
        type: 'custom',
        data: { 
        label: item.FileName, 
        deps: item.Imports },
        position: {x: 0, y: 0},
    }));
    let initialEdges: Edge[] = [];
    dependenciesList.forEach((item) => {
        item.Imports.forEach((imp) => {
        initialEdges.push(
            {
            id: `${item.fullPath}->${imp.fullPath}`,
            source: item.fullPath,
            target: imp.fullPath,
            animated: true,
            type: 'custom',
            data: { label: item.FileName },
            },
        );
        });
    });
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR' });
    g.setDefaultEdgeLabel(() => ({}));  
    initialNodes.forEach((node) => {
        g.setNode(node.id, { width: 150, height: 50 });
    });
    initialEdges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    }
    );
    dagre.layout(g);
    const layoutNodes = initialNodes.map((node) => {
        const { x, y } = g.node(node.id);
        return {
        ...node,
        position: {x, y}
        };
    });
    
    return {
        nodes: layoutNodes,
        edges: initialEdges,
    };

}

export default getLayoutedNodes;
export { getDirectoryNodes };