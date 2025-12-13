import React, { useState } from 'react';
import { Post, ViewMode } from '../types';
import { Edit, Trash, Calendar, Tag, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 

interface ArticleCardProps {
  post: Post;
  viewMode: ViewMode;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, viewMode, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = post.content || '';
  const isLong = content.length > 300;
  
  const toggleRead = () => setIsExpanded(!isExpanded);

  return (
    <article className="mb-12 group">
      <div className="flex flex-col sm:flex-row gap-6">
         {/* Date Sidebar */}
         <div className="sm:w-32 flex-shrink-0 pt-1">
             <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                 <Calendar size={14} />
                 {post.date}
             </div>
             <div className="mt-2 flex flex-wrap gap-1">
                 {post.tags?.map(tag => (
                     <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-100 px-2 py-0.5 rounded-full">
                         {tag}
                     </span>
                 ))}
             </div>
         </div>

         {/* Content */}
         <div className="flex-grow">
            {post.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden shadow-sm aspect-video bg-gray-100">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
            )}
            
            {post.videoUrl && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <Video className="text-red-500" />
                    <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium hover:text-blue-800">
                        Watch Attached Video
                    </a>
                </div>
            )}

            <div className="flex justify-between items-start group-hover:text-blue-600 transition-colors">
                <h2 
                    onClick={toggleRead}
                    className="text-2xl font-serif font-bold text-gray-900 mb-3 cursor-pointer hover:underline"
                >
                    {post.title}
                </h2>
                {viewMode === ViewMode.ADMIN && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(post)} className="text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                        <button onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-red-600"><Trash size={16} /></button>
                    </div>
                )}
            </div>

            <div className="prose prose-gray max-w-none font-serif text-gray-700">
                {isExpanded ? (
                    <ReactMarkdown 
                        components={{
                            img: ({node, ...props}) => <img {...props} className="rounded-lg shadow-sm max-w-full h-auto my-4" />,
                            a: ({node, ...props}) => <a {...props} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" />
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                ) : (
                    <p className="whitespace-pre-wrap">
                        {isLong ? content.substring(0, 300) + '...' : content}
                    </p>
                )}
            </div>
            
            {isLong && (
                <button 
                    onClick={toggleRead}
                    className="mt-4 text-sm font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-all"
                >
                    {isExpanded ? 'Show Less ↑' : 'Read Full Article →'}
                </button>
            )}
         </div>
      </div>
    </article>
  );
};

export default ArticleCard;