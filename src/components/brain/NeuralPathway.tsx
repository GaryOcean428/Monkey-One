import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Filter, RefreshCw, SortAsc, SortDesc } from 'lucide-react';

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
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw neural pathways
    const filteredActivity = filterRegion
      ? activity.filter(event => event.from === filterRegion || event.to === filterRegion)
      : activity;

    const sortedActivity = filteredActivity.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.timestamp.localeCompare(b.timestamp);
      } else {
        return b.timestamp.localeCompare(a.timestamp);
      }
    });

    sortedActivity.forEach((event, index) => {
      drawPathway(ctx, event, index, sortedActivity.length);
    });
  }, [activity, filterRegion, sortOrder]);

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
      <div className="flex justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Pathways
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFilterRegion(filterRegion ? null : 'region')}>
          <Filter className="w-4 h-4 mr-2" />
          {filterRegion ? 'Clear Filter' : 'Filter by Region'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          Sort by Value
        </Button>
      </div>
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
