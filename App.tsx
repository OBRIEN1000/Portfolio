import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ArticleCard from './components/ArticleCard';
import PaperCard from './components/PaperCard';
import AdminEditor from './components/AdminEditor';
import ProfileEditor from './components/ProfileEditor';
import { ViewMode, ContentType, Post, Paper, Profile } from './types';
import * as storage from './services/storageService';
import { Plus, Loader2 } from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PUBLIC);
  const [activeTab, setActiveTab] = useState<ContentType>('articles');
  
  // Initial empty states
  const [profile, setProfile] = useState<Profile>({
    name: '', title: '', institution: '', bio: '', avatarUrl: '', email: ''
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  
  const [editingItem, setEditingItem] = useState<{type: 'article' | 'paper', data?: any} | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      await storage.initStorage();
      const [loadedProfile, loadedPosts, loadedPapers] = await Promise.all([
        storage.getProfile(),
        storage.getPosts(),
        storage.getPapers()
      ]);
      
      setProfile(loadedProfile);
      setPosts(loadedPosts);
      setPapers(loadedPapers);
      setLoading(false);
    };
    initData();
  }, []);

  const handleSavePost = async (post: Post) => {
    await storage.savePost(post);
    setPosts(await storage.getPosts());
    setEditingItem(null);
  };

  const handleDeletePost = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this article?")) {
        await storage.deletePost(id);
        setPosts(await storage.getPosts());
    }
  };

  const handleSavePaper = async (paper: Paper) => {
    await storage.savePaper(paper);
    setPapers(await storage.getPapers());
    setEditingItem(null);
  };

  const handleDeletePaper = async (id: string) => {
    if(window.confirm("Delete this paper?")) {
        await storage.deletePaper(id);
        setPapers(await storage.getPapers());
    }
  };

  const handleSaveProfile = async (newProfile: Profile) => {
    await storage.saveProfile(newProfile);
    setProfile(newProfile);
    setIsEditingProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
        <h2 className="text-xl font-serif font-medium text-gray-900">Loading ScholarSpace...</h2>
        <p className="text-sm mt-2">Initializing Local Database</p>
      </div>
    );
  }

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'articles') return p.type === 'newsletter';
    if (activeTab === 'journal') return p.type === 'journal';
    return false;
  });

  return (
    <Layout 
      viewMode={viewMode} 
      setViewMode={setViewMode} 
      activeTab={activeTab} 
      setActiveTab={(t) => setActiveTab(t as ContentType)}
      profile={profile}
      onEditProfile={() => setIsEditingProfile(true)}
    >
      
      {/* Hero Section for Articles Tab */}
      {activeTab === 'articles' && (
        <div className="mb-12 text-center sm:text-left">
           <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Latest Insights</h2>
           <p className="text-gray-600 max-w-2xl text-lg">
             {profile.bio || "A collection of my thoughts on AI, research methodology, and the future of technology."}
           </p>
        </div>
      )}

      {/* Hero Section for Papers Tab */}
      {activeTab === 'papers' && (
        <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Selected Publications</h2>
            <p className="text-gray-600 max-w-2xl text-lg">
                Peer-reviewed research and conference proceedings.
            </p>
        </div>
      )}

      {/* Hero Section for Journal Tab */}
      {activeTab === 'journal' && (
        <div className="mb-12 bg-yellow-50 p-8 rounded-xl border border-yellow-100">
            <h2 className="text-2xl font-serif font-bold text-yellow-900 mb-2">Research Journal</h2>
            <p className="text-yellow-800 opacity-80">
                Raw notes, rough ideas, and progress updates. Less polished, more honest.
            </p>
        </div>
      )}
      
      {/* Content Rendering */}
      <div className="space-y-8">
        {(activeTab === 'articles' || activeTab === 'journal') && (
            <>
                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 text-gray-400 italic">No entries yet.</div>
                )}
                {filteredPosts.map(post => (
                    <ArticleCard 
                        key={post.id} 
                        post={post} 
                        viewMode={viewMode}
                        onEdit={(p) => setEditingItem({ type: 'article', data: p })}
                        onDelete={handleDeletePost}
                    />
                ))}
            </>
        )}

        {activeTab === 'papers' && (
            <>
                {papers.map(paper => (
                    <PaperCard 
                        key={paper.id} 
                        paper={paper} 
                        viewMode={viewMode}
                        onEdit={(p) => setEditingItem({ type: 'paper', data: p })}
                        onDelete={handleDeletePaper}
                    />
                ))}
            </>
        )}
      </div>

      {/* Admin Floating Action Button */}
      {viewMode === ViewMode.ADMIN && (
        <button 
          onClick={() => setEditingItem({ 
              type: activeTab === 'papers' ? 'paper' : 'article',
              data: activeTab === 'journal' ? { type: 'journal' } : { type: 'newsletter' }
          })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
          title="Add New Content"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Editors Modal */}
      {editingItem && (
        <AdminEditor 
            type={editingItem.type} 
            initialData={editingItem.data}
            onCancel={() => setEditingItem(null)}
            onSave={editingItem.type === 'article' ? handleSavePost : handleSavePaper}
        />
      )}

      {/* Profile Editor Modal */}
      {isEditingProfile && (
        <ProfileEditor 
          profile={profile}
          onCancel={() => setIsEditingProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

    </Layout>
  );
};

export default App;