import { Handle, Position } from "@xyflow/react";

const CustomNode = ({ data }: { data: { label: string } }) => {
    return (
      <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, backgroundColor: '#fff', color: '#333' }}>''
        {data.label}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    );
  };

export default CustomNode;