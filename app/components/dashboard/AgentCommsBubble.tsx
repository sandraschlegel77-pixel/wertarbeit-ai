import { useEffect, useState } from "react";
import { C } from "./theme";

interface AgentCommsBubbleProps {
  fromDept: number;
  toDept: number;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  message?: string;
}

const DEPT_NAMES: Record<number, string> = {
  1: "Workflow",
  2: "Content",
  3: "Code",
  4: "Support",
  5: "Legal/IP",
  6: "Finance",
  7: "Growth",
  8: "BI",
  9: "Product",
  10: "Procurement",
};

export function AgentCommsBubble({ fromDept, toDept, fromPos, toPos, message }: AgentCommsBubbleProps) {
  const [visible, setVisible] = useState(true);
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;

  // Auto-hide after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      <defs>
        <filter id="bubbleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Verbindungslinie mit Puls */}
      <line
        x1={fromPos.x}
        y1={fromPos.y}
        x2={toPos.x}
        y2={toPos.y}
        stroke="#2DD4BF"
        strokeWidth="2"
        strokeOpacity="0.7"
        strokeDasharray="8,6"
        filter="url(#bubbleGlow)"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-28"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </line>

      {/* Blase in der Mitte */}
      <g
        transform={`translate(${midX}, ${midY - 40})`}
        style={{ filter: "url(#bubbleGlow)" }}
      >
        <ellipse
          rx="80"
          ry="28"
          fill="rgba(16, 22, 33, 0.95)"
          stroke="#D4AF37"
          strokeWidth="2"
          opacity="0.95"
        />
        <text
          x="0"
          y="-6"
          textAnchor="middle"
          fill="#D4AF37"
          fontWeight="800"
          fontSize="10"
          letterSpacing="0.3"
        >
          {DEPT_NAMES[fromDept] || fromDept} → {DEPT_NAMES[toDept] || toDept}
        </text>
        <text
          x="0"
          y="10"
          textAnchor="middle"
          fill="#2DD4BF"
          fontWeight="700"
          fontSize="9"
        >
          {message || "SYNC"}
        </text>
      </g>

      {/* Pulsierende Punkte an den Enden */}
      <circle
        cx={fromPos.x}
        cy={fromPos.y}
        r="5"
        fill="#2DD4BF"
        opacity="0.9"
      >
        <animate
          attributeName="r"
          values="5;7;5"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.9;0.4;0.9"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={toPos.x}
        cy={toPos.y}
        r="5"
        fill="#2DD4BF"
        opacity="0.9"
      >
        <animate
          attributeName="r"
          values="5;7;5"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.9;0.4;0.9"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}