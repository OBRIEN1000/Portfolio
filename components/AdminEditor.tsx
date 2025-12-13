import React, { useState, useEffect } from 'react';
import { improveWriting, generateIdeas } from '../services/geminiService';
import { Sparkles, Save, X, Lightbulb, Upload, Link as LinkIcon, Image as ImageIcon, FileText, Video } from 'lucide-react';

interface AdminEditorProps {
  type: 'article' | 'paper';
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

// Helper: Convert File to Base64 Data URI
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Internal Component: Media Input (Switch between Link and Upload)
const MediaInput = ({ 
    label, 
    value, 
    onChange, 
    accept, 
    icon: Icon 
}: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    accept?: string, 
    icon?: any 
}) => {
    const [mode, setMode] = useState<'url' | 'upload'>('url');
    
    // Detect if current value is likely a Data URI to set initial mode
    useEffect(() => {
        if (value && value.startsWith('data:')) {
            setMode('upload');
        }
    }, [value]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple size check (warn if > 4MB due to localStorage limits)
            if (file.size > 4 * 1024 * 1024) {
                alert("Warning: This file is large (>4MB). It might fill up your browser storage.");
            }
            try {
                const base64 = await fileToBase64(file);
                onChange(base64);
            } catch (err) {
                console.error(err);
                alert("Error processing file.");
            }
        }
    };

    return (
        <div className="mb-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-gray-400" />} {label}
                </label>
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button 
                        onClick={() => setMode('url')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${mode === 'url' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Link
                    </button>
                    <button 
                         onClick={() => setMode('upload')}
                         className={`px-3 py-1 text-xs rounded-md transition-all ${mode === 'upload' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Upload
                    </button>
                </div>
            </div>
            
            {mode === 'url' ? (
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon size={14} className="text-gray-500" />
                    </div>
                    <input 
                        type="text" 
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-9 pr-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600"
                        placeholder={`https://example.com/...`}
                        value={value && !value.startsWith('data:') ? value : ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-md p-4 bg-gray-900 hover:bg-gray-800 transition-colors text-center group">
                    <input 
                        type="file" 
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden" 
                        id={`file-upload-${label}`}
                    />
                    <label htmlFor={`file-upload-${label}`} className="cursor-pointer flex flex-col items-center gap-2 w-full h-full">
                        <Upload size={20} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm text-gray-400 font-medium group-hover:text-gray-200">Click to upload file</span>
                    </label>
                    {value && value.startsWith('data:') && (
                        <div className="mt-2 text-xs text-green-400 font-medium bg-green-900/30 px-2 py-1 rounded border border-green-800 inline-block">
                            ✓ File attached
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const AdminEditor: React.FC<AdminEditorProps> = ({ type, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isAiImproving, setIsAiImproving] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string>('');

  useEffect(() => {
    const updates: any = {};
    if (!formData.date) updates.date = new Date().toISOString().split('T')[0];
    if (!formData.id) updates.id = Date.now().toString();
    
    // Ensure basic fields exist to prevent undefined access later
    if (Object.keys(updates).length > 0) {
        setFormData((prev: any) => ({ ...prev, ...updates }));
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImproveContent = async () => {
    const textToImprove = type === 'article' ? formData.content : formData.abstract;
    if (!textToImprove) return;
    
    setIsAiImproving(true);
    const improved = await improveWriting(textToImprove);
    handleChange(type === 'article' ? 'content' : 'abstract', improved);
    setIsAiImproving(false);
  };

  const handleGenerateIdeas = async () => {
      setIsAiImproving(true);
      // Safe access to first tag
      let firstTag = 'Research';
      if (Array.isArray(formData.tags) && formData.tags.length > 0) {
        firstTag = formData.tags[0];
      } else if (typeof formData.tags === 'string' && formData.tags.length > 0) {
        firstTag = formData.tags.split(',')[0];
      }
      
      const ideas = await generateIdeas(firstTag);
      setGeneratedIdeas(ideas);
      setIsAiImproving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-xl sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white">
            {initialData ? 'Edit' : 'New'} {type === 'article' ? 'Article' : 'Paper'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* Fields specific to Papers */}
          {type === 'paper' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Journal/Conference</label>
                    <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.journal || ''}
                    onChange={(e) => handleChange('journal', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                    <input 
                    type="number" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.year || new Date().getFullYear()}
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Authors (comma separated)</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={Array.isArray(formData.authors) ? formData.authors.join(', ') : formData.authors || ''}
                  onChange={(e) => handleChange('authors', e.target.value.split(',').map((s: string) => s.trim()))}
                />
              </div>
            </>
          )}

          {/* Content / Abstract */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">
                    {type === 'article' ? 'Content (Markdown supported)' : 'Abstract'}
                </label>
                <div className="flex gap-2">
                    {type === 'article' && (
                         <button 
                         onClick={handleGenerateIdeas}
                         className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300"
                         >
                             <Lightbulb size={12} /> Inspire Me
                         </button>
                    )}
                    <button 
                        onClick={handleImproveContent}
                        disabled={isAiImproving}
                        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                        <Sparkles size={12} /> {isAiImproving ? 'Polishing...' : 'AI Polish'}
                    </button>
                </div>
            </div>
            
            {generatedIdeas && (
                <div className="mb-2 p-3 bg-purple-900/20 text-purple-200 text-xs rounded border border-purple-800 whitespace-pre-line">
                    <strong>Suggestions:</strong>
                    {generatedIdeas}
                </div>
            )}

            <textarea 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 h-64 font-mono text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              value={type === 'article' ? (formData.content || '') : (formData.abstract || '')}
              onChange={(e) => handleChange(type === 'article' ? 'content' : 'abstract', e.target.value)}
            />
          </div>

          {/* Type Selector for Articles */}
          {type === 'article' && (
            <div>
               <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
               <div className="flex gap-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="radio" 
                     name="postType" 
                     checked={formData.type === 'newsletter' || !formData.type}
                     onChange={() => handleChange('type', 'newsletter')}
                     className="accent-blue-500"
                   />
                   <span className="text-sm text-gray-300">Newsletter</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="radio" 
                     name="postType" 
                     checked={formData.type === 'journal'}
                     onChange={() => handleChange('type', 'journal')}
                     className="accent-blue-500"
                   />
                   <span className="text-sm text-gray-300">Journal Entry</span>
                 </label>
               </div>
            </div>
          )}

          {/* Media Inputs with Upload Support */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            {type === 'article' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MediaInput 
                        label="Image" 
                        value={formData.imageUrl} 
                        onChange={(val) => handleChange('imageUrl', val)} 
                        accept="image/*"
                        icon={ImageIcon}
                    />
                    <MediaInput 
                        label="Video" 
                        value={formData.videoUrl} 
                        onChange={(val) => handleChange('videoUrl', val)} 
                        accept="video/*"
                        icon={Video}
                    />
                </div>
            ) : (
                <MediaInput 
                    label="PDF Document" 
                    value={formData.pdfUrl} 
                    onChange={(val) => handleChange('pdfUrl', val)} 
                    accept="application/pdf"
                    icon={FileText}
                />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
            <input 
              type="text" 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
              onChange={(e) => handleChange('tags', e.target.value.split(',').map((s: string) => s.trim()))}
            />
          </div>

        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900 rounded-b-xl sticky bottom-0 z-10">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button 
                onClick={() => onSave(formData)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
                <Save size={16} /> Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;