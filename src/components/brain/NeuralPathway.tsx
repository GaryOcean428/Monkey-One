import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NeuralEvent {
  id: string;
  from: string;
  to: string;
  type: string;
  timestamp: string;
}

interface NeuralPathwayProps {
  activity: NeuralEvent[];
}

export function NeuralPathway({ activity }: NeuralPathwayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw neural pathways
    activity.forEach((event, index) => {
      drawPathway(ctx, event, index, activity.length);
    });
  }, [activity]);

  const drawPathway = (
    ctx: CanvasRenderingContext2D,
    event: NeuralEvent,
    index: number,
    total: number
  ) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Calculate positions
    const startX = width * 0.1;
    const endX = width * 0.9;
    const y = height * ((index + 1) / (total + 1));

    // Draw pathway
    ctx.beginPath();
    ctx.moveTo(startX, y);
    
    // Create curve
    const controlX1 = width * 0.4;
    const controlX2 = width * 0.6;
    ctx.bezierCurveTo(controlX1, y, controlX2, y, endX, y);

    // Style based on event type
    ctx.strokeStyle = getEventColor(event.type);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add pulse effect
    drawPulse(ctx, startX, y, endX, y, event.type);
  };

  const drawPulse = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    type: string
  ) => {
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    const color = getEventColor(type);
    
    gradient.addColorStop(0, `${color}00`);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, `${color}00`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'learning':
        return '#3B82F6'; // blue
      case 'memory':
        return '#8B5CF6'; // purple
      case 'emotion':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {activity.map((event, index) => (
        <motion.div
          key={event.id}
          className="absolute left-0 top-0"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          style={{
            backgroundColor: getEventColor(event.type),
            width: '8px',
            height: '8px',
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
}