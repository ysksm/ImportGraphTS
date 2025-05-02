// src/GraphView.tsx
import React, { useCallback } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type FitViewOptions,
  type DefaultEdgeOptions,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import getLayoutedNodes from './layoutedNodes';

const nodeTypes = {
  custom: CustomNode,
};

const GraphView: React.FC = () => {
  
  const layoutedNodes = getLayoutedNodes();
  const fitViewOptions: FitViewOptions = { padding: 0.2 };
  const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };
  const [nodes, _setNodes, onNodesChange] = useNodesState(layoutedNodes.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedNodes.edges);
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
      <div style={{ width: '98vw', height: '80vh' }}>
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
