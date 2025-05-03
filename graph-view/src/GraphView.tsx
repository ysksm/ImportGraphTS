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
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { CustomFolderNode } from './CustomNode';
import getLayoutedNodes from './layoutedNodes';
import { getDirectoryNodes } from './layoutedNodes';

const nodeTypes = {
  custom: CustomNode,
  customFolder: CustomFolderNode,
};

const edgeTypes = {

};

const GraphView: React.FC = () => {
  const layoutedNodes = getDirectoryNodes();


  const fitViewOptions: FitViewOptions = { padding: 0.2 };
  const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };
  const [nodes, _setNodes, onNodesChange] = useNodesState(layoutedNodes.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedNodes.edges);
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  return (
    <>
      <div>Dependency Graph</div>
      <div style={{ width: '100vw', height: '95vh', color: '#333', background: '#fff' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          // onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </>
  );
};

export default GraphView;
