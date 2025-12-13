import React, { useState } from 'react';
import { ViewMode, Profile } from '../types';
import { BookOpen, PenTool, Layout as LayoutIcon, Lock, Unlock, Twitter, Linkedin, Github, Mail, Edit2, ShieldCheck, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: Profile;
  onEditProfile?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  viewMode, 
  setViewMode, 
  activeTab, 
  setActiveTab,
  profile,
  onEditProfile
}) => {
  const [isHoveringFooter, setIsHoveringFooter] = useState(false);
  
  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const navItems = [
    { id: 'articles', label: 'Newsletter', icon: <BookOpen size={18} /> },
    { id: 'papers', label: 'Publications', icon: <LayoutIcon size={18} /> },
    { id: 'journal', label: 'Lab Journal', icon: <PenTool size={18} /> },
  ];

  const handleBackdoorClick = () => {
    if (viewMode === ViewMode.ADMIN) {
        setViewMode(ViewMode.PUBLIC);
    } else {
        setIsLoginOpen(true);
        setLoginError('');
        setUsername('');
        setCode('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ProfessorObrien' && code === '9978342003Ka') {
        setViewMode(ViewMode.ADMIN);
        setIsLoginOpen(false);
    } else {
        setLoginError('ACCESS DENIED: Invalid Identity or Code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-[#fdfdfd]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('articles')}>
               <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center rounded-full font-serif font-bold text-xl overflow-hidden">
                 {profile.avatarUrl ? (
                   <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                 ) : (
                   profile.name.charAt(0)
                 )}
               </div>
               <div>
                  <h1 className="font-bold text-lg leading-tight">{profile.name}</h1>
                  <p className="text-xs text-gray-500 font-medium tracking-wide">RESEARCH & THOUGHTS</p>
               </div>
            </div>
            
            {viewMode === ViewMode.ADMIN && onEditProfile && (
              <button 
                onClick={onEditProfile}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit Profile Information"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          <nav className="flex items-center gap-1 sm:gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium
                  ${activeTab === item.id 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Admin Indicator */}
      {viewMode === ViewMode.ADMIN && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-center text-xs text-red-800 font-mono tracking-wider">
          /// BACKDOOR ACCESS ENABLED /// EDIT MODE ACTIVE
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </div>
      </main>

      {/* Footer / Backdoor Trigger */}
      <footer 
        className="border-t border-gray-100 py-12 mt-12 bg-white"
        onMouseEnter={() => setIsHoveringFooter(true)}
        onMouseLeave={() => setIsHoveringFooter(false)}
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {profile.twitterUrl && (
                <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="Twitter">
                    <Twitter size={18} />
                </a>
            )}
            {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="LinkedIn">
                    <Linkedin size={18} />
                </a>
            )}
            {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="GitHub">
                    <Github size={18} />
                </a>
            )}
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <a href={`mailto:${profile.email}`} className="hover:text-gray-900 transition-colors" title="Contact Email">
                <Mail size={18} />
            </a>
            
            {/* The "Backdoor" Toggle */}
            <button
              onClick={handleBackdoorClick}
              className={`p-2 rounded-full transition-all duration-500 ${isHoveringFooter || viewMode === ViewMode.ADMIN ? 'opacity-100' : 'opacity-0'}`}
              title={viewMode === ViewMode.PUBLIC ? "Enter Backdoor" : "Exit Backdoor"}
            >
              {viewMode === ViewMode.PUBLIC ? <Lock size={14} /> : <Unlock size={14} className="text-red-500" />}
            </button>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-sm rounded-xl shadow-2xl p-8 relative">
                <button 
                    onClick={() => setIsLoginOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-blue-500 mb-3 border border-gray-700">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-white font-bold text-lg">System Access</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Identity"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                            autoFocus
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Access Code"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                        />
                    </div>
                    
                    {loginError && (
                        <div className="text-red-500 text-xs font-bold text-center bg-red-900/20 py-2 rounded border border-red-900/50">
                            {loginError}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Layout;