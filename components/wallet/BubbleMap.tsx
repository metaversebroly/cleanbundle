'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Wallet } from '@/types';
import { getScore } from '@/lib/utils/scoring';
import { WalletConnection } from '@/lib/analysis/patternDetector';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BubbleMapProps {
  wallets: Wallet[];
  connections: WalletConnection[];
  onRemoveWallet: (walletId: number) => void;
}

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  walletId: number;
  address: string;
  score: number;
  radius: number;
  role?: string;
  funding?: string;
}

interface BubbleLink extends d3.SimulationLinkDatum<BubbleNode> {
  amount: number;
  signature: string;
}

export function BubbleMap({ wallets, connections, onRemoveWallet }: BubbleMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedWallet, setSelectedWallet] = useState<{
    id: number;
    address: string;
    score: number;
    position: { x: number; y: number };
  } | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data?: {
      address: string;
      score: number;
      role?: string;
      funding?: string;
    };
  }>({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || wallets.length === 0) return;

    const width = 1200;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main group
    const g = svg.append('g');

    // Create nodes from wallets
    const nodes: BubbleNode[] = wallets
      .filter(w => w.data)
      .map(w => ({
        id: w.address,
        walletId: w.id,
        address: w.address,
        score: getScore(w),
        radius: Math.max(20, Math.min(50, getScore(w) / 2)), // Size based on score
        role: w.role?.role,
        funding: w.funding?.source,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200
      }));

    // Create links from connections
    const links: BubbleLink[] = connections.map(conn => ({
      source: conn.from,
      target: conn.to,
      amount: conn.amount,
      signature: conn.signature
    }));

    // Color scale based on score
    const getColor = (score: number) => {
      if (score >= 90) return '#10b981'; // Green
      if (score >= 70) return '#3b82f6'; // Blue
      if (score >= 50) return '#f59e0b'; // Yellow
      return '#ef4444'; // Red
    };

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<BubbleNode, BubbleLink>(links)
        .id(d => d.id)
        .distance(150)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<BubbleNode>().radius(d => d.radius + 10));

    // Draw connection lines
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', d => Math.max(2, Math.min(6, d.amount / 2)))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '5,5')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', d => Math.max(3, Math.min(8, d.amount / 2)));
        
        // Show tooltip
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          data: {
            address: `${d.amount.toFixed(2)} SOL transferred`,
            score: 0,
            role: `TX: ${(d.signature as string).slice(0, 8)}...`,
            funding: 'Click to view on Solscan'
          }
        });
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.max(2, Math.min(6, d.amount / 2)));
        
        setTooltip({ visible: false, x: 0, y: 0 });
      })
      .on('click', function(event, d) {
        window.open(`https://solscan.io/tx/${d.signature}`, '_blank');
      });

    // Draw bubbles
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 0) // Start at 0 for entrance animation
      .attr('fill', d => getColor(d.score))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.2)
          .style('filter', 'drop-shadow(0 0 10px currentColor)');
        
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          data: {
            address: `${d.address.slice(0, 4)}...${d.address.slice(-4)}`,
            score: d.score,
            role: d.role,
            funding: d.funding
          }
        });
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius)
          .style('filter', 'none');
        
        setTooltip({ visible: false, x: 0, y: 0 });
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setSelectedWallet({
            id: d.walletId,
            address: d.address,
            score: d.score,
            position: {
              x: rect.left + (d.x || 0),
              y: rect.top + (d.y || 0)
            }
          });
        }
      });

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => `#${d.walletId}`);

    // Entrance animation
    node
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('r', d => d.radius);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as BubbleNode).x || 0)
        .attr('y1', d => (d.source as BubbleNode).y || 0)
        .attr('x2', d => (d.target as BubbleNode).x || 0)
        .attr('y2', d => (d.target as BubbleNode).y || 0);

      node
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);

      labels
        .attr('x', d => d.x || 0)
        .attr('y', d => d.y || 0);
    });

    // Drag behavior
    const drag = d3.drag<SVGCircleElement, BubbleNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [wallets, connections]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full h-auto bg-black/20 rounded-xl border border-white/10"
      />

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip.visible && tooltip.data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10
            }}
          >
            <p className="text-sm font-mono text-white mb-1">{tooltip.data.address}</p>
            {tooltip.data.score > 0 && (
              <p className="text-xs text-gray-400">Score: {tooltip.data.score}</p>
            )}
            {tooltip.data.role && (
              <p className="text-xs text-gray-400">Role: {tooltip.data.role}</p>
            )}
            {tooltip.data.funding && (
              <p className="text-xs text-gray-400">Funding: {tooltip.data.funding}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Card */}
      <AnimatePresence>
        {selectedWallet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl"
            style={{
              left: selectedWallet.position.x + 20,
              top: selectedWallet.position.y - 80
            }}
          >
            <button
              onClick={() => setSelectedWallet(null)}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <p className="text-sm font-mono text-white/80 mb-1">
              {selectedWallet.address.slice(0, 8)}...{selectedWallet.address.slice(-8)}
            </p>
            <p className="text-2xl font-bold text-white mb-3">
              Score: {selectedWallet.score}
            </p>
            <Button
              onClick={() => {
                onRemoveWallet(selectedWallet.id);
                setSelectedWallet(null);
              }}
              variant="ghost"
              size="sm"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30"
            >
              <X className="w-4 h-4 mr-2" />
              Remove from Bundle
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-400">90-100 (Perfect)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">70-89 (Good)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-gray-400">50-69 (Average)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-gray-400">&lt;50 (Poor)</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-0.5 bg-red-500" style={{ strokeDasharray: '5,5' }}></div>
          <span className="text-gray-400">SOL Transfer</span>
        </div>
      </div>
    </div>
  );
}
