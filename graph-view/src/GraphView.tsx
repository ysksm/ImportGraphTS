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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { CustomFolderNode } from './CustomNode';
import CustomFileEdge, { CustomFolderEdge } from './CustomEdge';
import getLayoutedNodes from './layoutedNodes';
import { getDirectoryNodes } from './layoutedNodes';

const nodeTypes = {
  custom: CustomNode,
  customFolder: CustomFolderNode,
};

const edgeTypes = {
  fileEdge: CustomFileEdge,
  folderEdge: CustomFolderEdge,
};

const GraphView: React.FC = () => {
  const layoutedNodes = getDirectoryNodes();


  const fitViewOptions: FitViewOptions = { padding: 0.2 };
  const defaultEdgeOptions: DefaultEdgeOptions = { 
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3178C6',
    },
  };
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
