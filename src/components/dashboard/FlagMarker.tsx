import { Flag } from 'lucide-react';

interface FlagMarkerProps {
  cx: number;
  cy: number;
  onClick: () => void;
}

export default function FlagMarker({ cx, cy, onClick }: FlagMarkerProps) {
  return (
    <g transform={`translate(${cx},${cy - 20})`} className="cursor-pointer">
      <circle
        r={12}
        fill="#3b82f6"
        className="hover:opacity-80 transition-opacity"
        onClick={onClick}
      />
      <foreignObject x="-10" y="-10" width="20" height="20" style={{pointerEvents: 'none'}}>
        <div className="flex items-center justify-center w-full h-full">
          <Flag className="w-3 h-3 text-white" strokeWidth={2.5} />
        </div>
      </foreignObject>
    </g>
  );
}

