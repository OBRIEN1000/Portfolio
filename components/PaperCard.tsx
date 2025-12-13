import React, { useState } from 'react';
import { Paper, ViewMode } from '../types';
import { summarizeText } from '../services/geminiService';
import { FileText, Sparkles, Download, Edit, Trash } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  viewMode: ViewMode;
  onEdit: (paper: Paper) => void;
  onDelete: (id: string) => void;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, viewMode, onEdit, onDelete }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    const result = await summarizeText(paper.abstract);
    setSummary(result);
    setLoadingSummary(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
            <span>{paper.year}</span>
            <span>•</span>
            <span>{paper.journal}</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 leading-tight">
            {paper.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 italic">
            {paper.authors?.join(', ') || ''}
          </p>
        </div>
        {viewMode === ViewMode.ADMIN && (
            <div className="flex gap-2">
                <button onClick={() => onEdit(paper)} className="p-2 text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                <button onClick={() => onDelete(paper.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash size={16} /></button>
            </div>
        )}
      </div>

      <div className="text-gray-700 leading-relaxed text-sm mb-4 font-serif">
        {paper.abstract}
      </div>

      {summary && (
        <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
            <h4 className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase mb-1">
                <Sparkles size={12} /> AI Summary (ELI5)
            </h4>
            <p className="text-sm text-blue-900">{summary}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 border-t border-gray-100 pt-4">
        {paper.pdfUrl && (
            <a 
                href={paper.pdfUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-black transition-all px-4 py-2 rounded-md border border-gray-200"
            >
                <Download size={16} />
                Download PDF
            </a>
        )}
        
        <button 
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50 ml-2"
        >
            <Sparkles size={16} />
            {loadingSummary ? 'Thinking...' : 'Explain to me'}
        </button>

        <div className="flex-grow"></div>
        <div className="flex gap-2">
            {paper.tags?.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    #{tag}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PaperCard;