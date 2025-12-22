
import React, { useState } from 'react';
import { IndustryNode } from '../types';
import { ChevronRight, ChevronDown, CheckSquare, Square, Settings, Factory } from 'lucide-react';
import { expandIndustryNode } from '../services/geminiService';

interface Props {
  nodes: IndustryNode[];
  onToggleSelect: (id: string) => void;
  onAddSubIndustry: (parentId: string, newNodes: IndustryNode[]) => void;
}

const TreeNode: React.FC<{ 
  node: IndustryNode; 
  onToggleSelect: (id: string) => void;
  onAddSubIndustry: (parentId: string, nodes: IndustryNode[]) => void;
  depth: number;
}> = ({ node, onToggleSelect, onAddSubIndustry, depth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.children || node.children.length === 0) {
        setIsLoading(true);
        setIsOpen(true);
        const newNodes = await expandIndustryNode(node.label);
        const uniqueNodes = newNodes.map((n, idx) => ({
            ...n,
            id: `${node.id}-child-${idx}-${Date.now()}`,
            selected: node.selected
        }));
        onAddSubIndustry(node.id, uniqueNodes);
        setIsLoading(false);
    } else {
        setIsOpen(!isOpen);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-2 px-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all ${depth > 0 ? 'ml-4' : ''}`}
        onClick={() => onToggleSelect(node.id)}
      >
        <button 
          onClick={handleExpand}
          className="p-1 mr-2 opacity-30 hover:opacity-100 transition-all"
        >
          {isLoading ? (
             <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            (node.children && node.children.length > 0) || isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </button>
        
        <div className={`mr-3 ${node.selected ? 'text-blue-500' : 'opacity-20'}`}>
          {node.selected ? <CheckSquare size={16} /> : <Square size={16} />}
        </div>
        
        <div className="flex items-center gap-2">
            {node.type === 'process' ? <Settings size={12} className="text-orange-500 opacity-70" /> : <Factory size={12} className="opacity-30" />}
            <span className={`text-xs font-medium ${node.selected ? 'text-blue-500 font-bold' : 'opacity-60'}`}>
            {node.label}
            </span>
        </div>
      </div>

      {isOpen && node.children && (
        <div className="mt-1 space-y-1">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onToggleSelect={onToggleSelect} onAddSubIndustry={onAddSubIndustry} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const IndustryTree: React.FC<Props> = ({ nodes, onToggleSelect, onAddSubIndustry }) => {
  return (
    <div className="space-y-1 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Процессы и отрасли</h3>
      </div>
      <div className="space-y-0.5">
        {nodes.map(node => (
            <TreeNode key={node.id} node={node} onToggleSelect={onToggleSelect} onAddSubIndustry={onAddSubIndustry} depth={0} />
        ))}
      </div>
    </div>
  );
};
