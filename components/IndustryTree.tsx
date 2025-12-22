import React, { useState } from 'react';
import { IndustryNode } from '../types';
import { ChevronRight, ChevronDown, PlusCircle, CheckSquare, Square, Settings, Factory } from 'lucide-react';
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
        // Ensure unique IDs
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
        className={`flex items-center py-1.5 px-2 hover:bg-slate-100 rounded cursor-pointer transition-colors ${depth > 0 ? 'ml-4 border-l border-slate-200' : ''}`}
        onClick={() => onToggleSelect(node.id)}
      >
        <button 
          onClick={handleExpand}
          className="p-1 mr-1 text-slate-500 hover:text-blue-600 transition-colors"
        >
          {isLoading ? (
             <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            (node.children && node.children.length > 0) || isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </button>
        
        <div className={`mr-2 ${node.selected ? 'text-blue-600' : 'text-slate-400'}`}>
          {node.selected ? <CheckSquare size={18} /> : <Square size={18} />}
        </div>
        
        <div className="flex items-center gap-2">
            {node.type === 'process' ? <Settings size={14} className="text-orange-500" /> : <Factory size={14} className="text-slate-400" />}
            <span className={`text-sm ${node.selected ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
            {node.label}
            </span>
        </div>
        
        <button 
            onClick={(e) => { e.stopPropagation(); handleExpand(e); }}
            className="ml-auto text-xs text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm"
            title="AI: Детализировать"
        >
            <PlusCircle size={14} />
            <span className="hidden group-hover:inline">Расширить</span>
        </button>
      </div>

      {isOpen && node.children && (
        <div className="ml-2 mt-1 space-y-0.5">
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onToggleSelect={onToggleSelect} 
              onAddSubIndustry={onAddSubIndustry}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const IndustryTree: React.FC<Props> = ({ nodes, onToggleSelect, onAddSubIndustry }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Отрасли и Процессы</h3>
        <span className="text-xs text-slate-400">MSP.rf structure</span>
      </div>
      <div className="space-y-1">
        {nodes.map(node => (
            <TreeNode 
            key={node.id} 
            node={node} 
            onToggleSelect={onToggleSelect} 
            onAddSubIndustry={onAddSubIndustry}
            depth={0} 
            />
        ))}
      </div>
    </div>
  );
};