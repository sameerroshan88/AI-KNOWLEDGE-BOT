"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto rotation effect
  useEffect(() => {
    if (!autoRotate || expandedId !== null) return;

    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.3) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate, expandedId]);

  // Toggle expanded item
  const handleNodeClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setAutoRotate(false);
  };

  // Close card when clicking outside
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setExpandedId(null);
      setAutoRotate(true);
    }
  };

  // Calculate position of node
  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const item = timelineData.find((i) => i.id === itemId);
    return item ? item.relatedIds : [];
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center"
      style={{ zIndex: 9999, position: "relative", pointerEvents: "auto" }}
      onClick={handleContainerClick}
      onMouseEnter={() => setAutoRotate(false)}
      onMouseLeave={() => {
        if (expandedId === null) {
          setAutoRotate(true);
        }
      }}
    >
      {/* Center pulsing circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
          <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70"></div>
          <div className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50" style={{ animationDelay: "0.5s" }}></div>
          <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
        </div>
        <div className="absolute w-96 h-96 rounded-full border border-white/10"></div>
      </div>

      {/* Orbit container */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
        {/* Nodes */}
        {timelineData.map((item, index) => {
          const position = calculateNodePosition(index, timelineData.length);
          const isExpanded = expandedId === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="absolute">
              {/* Node button container */}
              <div
                className="absolute transition-all duration-700"
                style={{
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                }}
              >
                {/* Pulse ring */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                    opacity: isExpanded ? 1 : position.opacity,
                  }}
                />

                {/* Clickable button */}
                <button
                  onClick={() => handleNodeClick(item.id)}
                  className={`
                    absolute w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300 transform cursor-pointer
                    ${isExpanded ? "bg-white text-black border-white shadow-lg shadow-white/30 scale-150" : "bg-black text-white border-white/40 hover:scale-125"}
                    ${expandedId !== null && expandedId !== item.id ? "opacity-50" : "opacity-100"}
                  `}
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                    zIndex: isExpanded ? 10000 : position.zIndex,
                  }}
                  type="button"
                >
                  <Icon size={16} />
                </button>

                {/* Label */}
                <div
                  className="absolute whitespace-nowrap text-xs font-semibold tracking-wider pointer-events-none transition-all duration-300"
                  style={{
                    top: "calc(100% + 28px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: isExpanded ? "#ffffff" : "rgba(255,255,255,0.7)",
                    fontSize: isExpanded ? "13px" : "12px",
                  }}
                >
                  {item.title}
                </div>

                {/* Expanded detail card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-black/95 backdrop-blur-lg border-white/30 shadow-2xl shadow-white/20 overflow-visible z-50 pointer-events-auto">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-sm text-white">{item.title}</CardTitle>
                        <span className="text-xs font-mono text-white/60">{item.date}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="text-xs text-white/80 space-y-3">
                      <p className="leading-relaxed">{item.content}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
