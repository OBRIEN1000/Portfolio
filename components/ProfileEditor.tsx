import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { Save, X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface ProfileEditorProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Profile>(profile);
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    if (formData.avatarUrl && formData.avatarUrl.startsWith('data:')) {
        setAvatarMode('upload');
    }
  }, []);

  const handleChange = (field: keyof Profile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert("Warning: Large images may fill up browser storage quickly.");
        }
        try {
            const base64 = await fileToBase64(file);
            handleChange('avatarUrl', base64);
        } catch (err) {
            alert("Error processing file");
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-white">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-xl sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white">Edit Profile Info</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
            <input 
              type="text" 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
            <input 
              type="text" 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Short Bio</label>
            <textarea 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 h-24 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </div>

          {/* Avatar Upload Section */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <ImageIcon size={16} /> Profile Avatar
                </label>
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button 
                        onClick={() => setAvatarMode('url')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${avatarMode === 'url' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Link
                    </button>
                    <button 
                         onClick={() => setAvatarMode('upload')}
                         className={`px-3 py-1 text-xs rounded-md transition-all ${avatarMode === 'upload' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Upload
                    </button>
                </div>
            </div>

            {avatarMode === 'url' ? (
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon size={14} className="text-gray-500" />
                    </div>
                    <input 
                        type="text" 
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-9 pr-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600"
                        value={formData.avatarUrl && !formData.avatarUrl.startsWith('data:') ? formData.avatarUrl : ''}
                        onChange={(e) => handleChange('avatarUrl', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-md p-4 bg-gray-900 hover:bg-gray-800 transition-colors text-center group">
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" className="cursor-pointer flex flex-col items-center gap-2 w-full h-full">
                        <Upload size={20} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm text-gray-400 font-medium group-hover:text-gray-200">Click to upload avatar</span>
                    </label>
                    {formData.avatarUrl && formData.avatarUrl.startsWith('data:') && (
                        <div className="mt-3 flex justify-center">
                            <img src={formData.avatarUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                        </div>
                    )}
                </div>
            )}
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
             <label className="block text-sm font-medium text-gray-300 mb-1">Footer Copyright Text</label>
             <input 
               type="text" 
               className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               value={formData.footerText || ''}
               onChange={(e) => handleChange('footerText', e.target.value)}
               placeholder="© 2024 Name. All rights reserved."
             />
          </div>

          <div className="pt-4 border-t border-gray-800">
             <h3 className="text-sm font-bold text-gray-200 mb-3">Contact & Social</h3>
             <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input 
                    type="email" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Twitter URL</label>
                    <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.twitterUrl || ''}
                    onChange={(e) => handleChange('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
                    <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">GitHub URL</label>
                    <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.githubUrl || ''}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/..."
                    />
                </div>
             </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900 rounded-b-xl sticky bottom-0 z-10">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button 
                onClick={() => onSave(formData)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
                <Save size={16} /> Save Profile
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;