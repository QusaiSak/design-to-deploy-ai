import React, { useState, useRef, useEffect } from 'react';

interface SplitPaneProps {
  split?: 'vertical' | 'horizontal';
  defaultSizes?: number[];
  minSizes?: number[];
  children: React.ReactNode[];
  className?: string;
}

export function SplitPane({
  split = 'vertical',
  defaultSizes = [50, 50],
  minSizes = [0, 0],
  children,
  className = '',
}: SplitPaneProps) {
  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startSizes = useRef<number[]>([...sizes]);

  const isVertical = split === 'vertical';
  const totalSize = 100; // Using percentages

  // Handle mouse down on the divider
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSizes.current = [...sizes];
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerSize = isVertical ? containerRect.width : containerRect.height;
    
    const delta = isVertical
      ? e.clientX - startPos.current.x
      : e.clientY - startPos.current.y;
    
    const deltaPercent = (delta / containerSize) * 100;
    
    // Calculate new sizes
    const newSizes = [...startSizes.current];
    newSizes[0] += deltaPercent;
    newSizes[1] -= deltaPercent;
    
    // Apply min sizes
    if (newSizes[0] < minSizes[0]) {
      const diff = minSizes[0] - newSizes[0];
      newSizes[0] = minSizes[0];
      newSizes[1] -= diff;
    }
    
    if (newSizes[1] < minSizes[1]) {
      const diff = minSizes[1] - newSizes[1];
      newSizes[1] = minSizes[1];
      newSizes[0] -= diff;
    }
    
    setSizes(newSizes);
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex ${isVertical ? 'flex-row' : 'flex-col'} w-full h-full ${className}`}
    >
      <div
        className={`overflow-auto ${isVertical ? 'h-full' : 'w-full'}`}
        style={{ 
          [isVertical ? 'width' : 'height']: `${sizes[0]}%`,
          minWidth: isVertical ? `${minSizes[0]}%` : undefined,
          minHeight: !isVertical ? `${minSizes[0]}%` : undefined,
        }}
      >
        {children[0]}
      </div>
      
      <div
        ref={dividerRef}
        className={`
          flex-shrink-0 
          ${isVertical ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'} 
          bg-gray-700 hover:bg-blue-500 transition-colors
        `}
        onMouseDown={handleMouseDown}
      />
      
      <div
        className={`overflow-auto ${isVertical ? 'h-full' : 'w-full'}`}
        style={{ 
          [isVertical ? 'width' : 'height']: `${sizes[1]}%`,
          minWidth: isVertical ? `${minSizes[1]}%` : undefined,
          minHeight: !isVertical ? `${minSizes[1]}%` : undefined,
        }}
      >
        {children[1]}
      </div>
    </div>
  );
} 