import { Node, Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import depsData from '../deps.json';

export interface LayoutedNodes {
    nodes: Node[];
    edges: Edge[];
}

const getLayoutedNodes = (): LayoutedNodes => {
    const dependenciesList = depsData;

  console.log('Dependencies:', dependenciesList);

  // テキストを表示するためのノードとエッジを生成
  const initialNodes: Node[] = dependenciesList.map((item) => ({
    id: item.fullPath,
    type: 'custom',
    data: { 
      label: item.FileName, 
      deps: item.Imports },
    position: {x: 0, y: 0},

  }));

  console.log('Initial Nodes:', initialNodes);

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

  console.log('Initial Edges:', initialEdges);

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

  console.log('Dagre Graph:', g);

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