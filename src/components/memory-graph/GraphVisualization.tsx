/**
 * Memory Graph Visualization Component
 *
 * Interactive graph visualization using D3.js and React
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, RotateCcw, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Node, Edge, NodeType } from '../../lib/memory-graph/types'

interface GraphVisualizationProps {
  nodes: Node[]
  edges: Edge[]
  onNodeClick?: (node: Node) => void
  onEdgeClick?: (edge: Edge) => void
  selectedNodeId?: string
  className?: string
}

interface D3Node extends Node {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  vx?: number
  vy?: number
}

interface D3Edge extends Edge {
  source: D3Node
  target: D3Node
}

const NODE_COLORS: Record<NodeType, string> = {
  Service: '#3b82f6',
  Environment: '#10b981',
  Deployment: '#f59e0b',
  Configuration: '#8b5cf6',
  User: '#ef4444',
  Team: '#f97316',
  Project: '#06b6d4',
  Repository: '#84cc16',
  Task: '#6366f1',
  Issue: '#ec4899',
  Incident: '#dc2626',
  Error: '#991b1b',
  Customer: '#14b8a6',
  Feature: '#8b5cf6',
  Permission: '#64748b',
  Document: '#0ea5e9',
  API: '#059669',
  Database: '#7c3aed',
  Secret: '#be123c',
}

const NODE_SIZES: Record<NodeType, number> = {
  Service: 12,
  Environment: 10,
  Deployment: 11,
  Configuration: 8,
  User: 9,
  Team: 10,
  Project: 11,
  Repository: 10,
  Task: 8,
  Issue: 9,
  Incident: 12,
  Error: 10,
  Customer: 9,
  Feature: 9,
  Permission: 7,
  Document: 8,
  API: 10,
  Database: 11,
  Secret: 8,
}

export function GraphVisualization({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  selectedNodeId,
  className = '',
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all')
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })

  // Filter nodes and edges based on search and filter criteria
  const filteredNodes = nodes.filter(node => {
    const matchesSearch =
      !searchTerm ||
      node.properties.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.properties.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || node.type === filterType

    return matchesSearch && matchesType
  })

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
  const filteredEdges = edges.filter(
    edge => filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)
  )

  const resetZoom = useCallback(() => {
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity)
  }, [])

  const zoomIn = useCallback(() => {
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    svg.transition().duration(300).call(zoom.scaleBy, 1.5)
  }, [])

  const zoomOut = useCallback(() => {
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    svg
      .transition()
      .duration(300)
      .call(zoom.scaleBy, 1 / 1.5)
  }, [])

  useEffect(() => {
    if (!svgRef.current || filteredNodes.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = 800
    const height = 600

    // Clear previous content
    svg.selectAll('*').remove()

    // Create container group for zoom/pan
    const container = svg.append('g').attr('class', 'container')

    // Set up zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        container.attr('transform', event.transform)
        setTransform(event.transform)
      })

    svg.call(zoom)

    // Create arrow markers for directed edges
    const defs = svg.append('defs')
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#64748b')

    // Prepare data for D3
    const d3Nodes: D3Node[] = filteredNodes.map(node => ({ ...node }))
    const d3Edges: D3Edge[] = filteredEdges
      .map(edge => ({
        ...edge,
        source: d3Nodes.find(n => n.id === edge.from)!,
        target: d3Nodes.find(n => n.id === edge.to)!,
      }))
      .filter(edge => edge.source && edge.target)

    // Create force simulation
    const simulation = d3
      .forceSimulation<D3Node>(d3Nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Edge>(d3Edges)
          .id(d => d.id)
          .distance(100)
          .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius(d => NODE_SIZES[d.type] + 5)
      )

    // Create edges
    const link = container
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Edges)
      .enter()
      .append('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        onEdgeClick?.(d)
      })
      .on('mouseover', function () {
        d3.select(this).attr('stroke-opacity', 1).attr('stroke-width', 3)
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.6).attr('stroke-width', 2)
      })

    // Create nodes
    const node = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(d3Nodes)
      .enter()
      .append('circle')
      .attr('r', d => NODE_SIZES[d.type])
      .attr('fill', d => NODE_COLORS[d.type])
      .attr('stroke', d => (selectedNodeId === d.id ? '#000' : '#fff'))
      .attr('stroke-width', d => (selectedNodeId === d.id ? 3 : 2))
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGCircleElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        onNodeClick?.(d)
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d)
        d3.select(event.target).attr('r', NODE_SIZES[d.type] * 1.5)
      })
      .on('mouseout', (event, d) => {
        setHoveredNode(null)
        d3.select(event.target).attr('r', NODE_SIZES[d.type])
      })

    // Create labels
    const labels = container
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(d3Nodes)
      .enter()
      .append('text')
      .text(d => d.properties.name || d.properties.key || d.id.split(':')[1] || d.id)
      .attr('font-size', '12px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('fill', '#374151')
      .attr('text-anchor', 'middle')
      .attr('dy', d => NODE_SIZES[d.type] + 15)
      .style('pointer-events', 'none')
      .style('user-select', 'none')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!)

      node.attr('cx', d => d.x!).attr('cy', d => d.y!)

      labels.attr('x', d => d.x!).attr('y', d => d.y!)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [filteredNodes, filteredEdges, selectedNodeId, onNodeClick, onEdgeClick])

  const uniqueNodeTypes = Array.from(new Set(nodes.map(n => n.type))).sort()

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Memory Graph Visualization
            <Badge variant="secondary">
              {filteredNodes.length} nodes, {filteredEdges.length} edges
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <Select
              value={filterType}
              onValueChange={value => setFilterType(value as NodeType | 'all')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueNodeTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: NODE_COLORS[type] }}
                      />
                      {type}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height="600"
            viewBox="0 0 800 600"
            className="rounded-lg border bg-gray-50"
          />

          {hoveredNode && (
            <div className="absolute top-4 left-4 max-w-xs rounded-lg border bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
                />
                <span className="font-semibold">{hoveredNode.type}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>ID:</strong> {hoveredNode.id}
                </div>
                {hoveredNode.properties.name && (
                  <div>
                    <strong>Name:</strong> {hoveredNode.properties.name}
                  </div>
                )}
                {hoveredNode.properties.key && (
                  <div>
                    <strong>Key:</strong> {hoveredNode.properties.key}
                  </div>
                )}
                <div>
                  <strong>Created:</strong>{' '}
                  {new Date(hoveredNode.metadata.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>Source:</strong> {hoveredNode.metadata.source || 'Unknown'}
                </div>
              </div>
            </div>
          )}

          <div className="absolute right-4 bottom-4 rounded-lg border bg-white p-2 shadow-lg">
            <div className="text-muted-foreground text-xs">
              Zoom: {(transform.k * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-semibold">Node Types</h4>
          <div className="grid grid-cols-4 gap-2">
            {uniqueNodeTypes.map(type => (
              <div key={type} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[type] }}
                />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
