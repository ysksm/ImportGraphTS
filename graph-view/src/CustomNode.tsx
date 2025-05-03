import { Handle, Position } from "@xyflow/react";

const CustomFolderNode = ( { data, width, height} : { data: { label: string }, width: number, height: number }) => {
  return (
    <div style={{ 
        padding: 0, 
        margin: 0,
        border: '1px solid #555', 
        borderRadius: 10, 
        backgroundColor: '#888', 
        color: '#333',
        width: width,
        height: height,
        opacity: 0.3,
      }}>
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const CustomNode = ( { data, width, height} : { data: { label: string }, width: number, height: number }) => {
  return (
    <div style={{ 
        padding: 0, 
        margin: 0,
        border: '1px solid #555', 
        borderRadius: 10, 
        backgroundColor: '#888', 
        color: '#333',
        width: width,
        height: height,
      }}>
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
export { CustomFolderNode };