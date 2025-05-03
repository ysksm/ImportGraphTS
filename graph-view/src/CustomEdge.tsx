import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
} from '@xyflow/react';

// Custom edge component with enhanced directional indicators
const CustomFileEdge = (props: any) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  } = props;

  // Calculate the path based on the edge type
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate points along the path for multiple directional indicators
  const points = [0.25, 0.5, 0.75]; // Place arrows at 25%, 50%, and 75% along the path
  const indicators = points.map(point => {
    const pointX = sourceX + (targetX - sourceX) * point;
    const pointY = sourceY + (targetY - sourceY) * point;
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
    
    return { x: pointX, y: pointY, angle };
  });
  return (
    <>
      {/* Base edge path with gradient */}
      <svg style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        }}>
        <defs>
          <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3178C6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3178C6" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
      
      <BaseEdge 
        path={edgePath} 
        style={{
          ...style,
          stroke: `url(#gradient-${id})`,
          strokeWidth: 3,
        }} 
        markerEnd={markerEnd} 
      />

      {/* Multiple directional indicators along the path */}
      <EdgeLabelRenderer>
        <>
          {indicators.map((indicator, index) => (
            <div
              key={`${id}-indicator-${index}`}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${indicator.x}px, ${indicator.y}px) rotate(${indicator.angle}deg)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              <div style={{
                width: '16px',
                height: '16px',
                // backgroundColor: '#3178C6',
                clipPath: 'polygon(0% 20%, 100% 50%, 0% 80%)', // Arrow shape
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))',
              }} />
            </div>
          ))}
        </>
      </EdgeLabelRenderer>
    </>
  );
};

// Custom edge for folder connections
const CustomFolderEdge = (props: any) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
  } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <svg style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        opacity: 0.5,
        }}>
        <defs>
          <linearGradient id={`gradient-folder-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5A742" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F5A742" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
      
      <BaseEdge 
        path={edgePath} 
        style={{
          ...style,
          stroke: `url(#gradient-folder-${id})`,
          strokeWidth: 3,
          opacity: 0.5,
        }} 
        markerEnd={markerEnd} 
      />
    </>
  );
};

export default CustomFileEdge;
export { CustomFolderEdge };
