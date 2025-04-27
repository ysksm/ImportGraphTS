// src/GraphView.tsx
import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  type Node,
  type Edge,
  type FitViewOptions,
  type DefaultEdgeOptions,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import depsData from '../deps.json';

interface Deps {
  fullPath: string;
  FileName: string;
  isRoot: boolean;
  imports: {
    fullPath: string;
    FileName: string;
  }[];
}

function normalizePath(from: string, rel: string) {
  const base = from.replace(/\/[^/]+$/, '');
  const full = `${base}/${rel}`;
  const parts = full.split('/').filter(p => p !== '.');
  const stack: string[] = [];
  for (const p of parts) {
    if (p === '..') stack.pop();
    else stack.push(p);
  }
  return stack.join('/');
}

const CustomNode = ({ data }: { data: { label: string } }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, backgroundColor: '#fff', color: '#333' }}>''
      {data.label}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const GraphView: React.FC = () => {
  const dependenciesList = depsData;

  console.log('Dependencies:', dependenciesList);

  // テキストを表示するためのノードとエッジを生成
  const initialNodes: Node[] = dependenciesList.map((item) => ({
    id: item.fullPath,
    type: 'custom',
    data: { label: item.FileName },
    position: { x: Math.random() * 600, y: Math.random() * 400 },
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

  const fitViewOptions: FitViewOptions = { padding: 0.2 };
  const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  console.log('Initial Nodes:', nodes);
  return (
    <>
      <h1>Dependency Graph</h1>
      <p>Click and drag to pan, scroll to zoom.</p>
      <p>Click on a node to see its dependencies.</p>
      <div style={{ width: '100%', height: '80vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </>
  );
};

export default GraphView;
