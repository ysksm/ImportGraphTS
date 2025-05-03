import { Handle, Position } from "@xyflow/react";

// Simple component that accepts the props we need
const CustomFolderNode = (props: any) => {
  const { data, width = 150, height = 50 } = props;
  return (
    <div style={{ 
        padding: 0, 
        margin: 0,
        border: '1px solid #555', 
        borderRadius: 10, 
        backgroundColor: '#F5A742', 
        color: '#111',
        width: width || 150,
        height: height || 50,
        display: 'flex',
        alignItems: 'top',
        justifyContent: 'center',
        fontWeight: 'bold',
        opacity: 0.5,
        zIndex: 10,
      }}>
      {data?.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const CustomNode = (props: any) => {
  const { data, width = 150, height = 50 } = props;
  return (
    <div style={{ 
        padding: 0, 
        margin: 0,
        border: '1px solid #555', 
        borderRadius: 10, 
        backgroundColor: '#3178C6', 
        color: '#fff',
        width: width || 150,
        height: height || 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        zIndex: 100,
      }}>
      {data?.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
export { CustomFolderNode };
