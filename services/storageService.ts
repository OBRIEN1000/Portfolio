import { Post, Paper, Profile } from '../types';
import { get, set, del } from 'idb-keyval';

const API_URL = 'http://localhost:3001/api';
let USE_LOCAL = false;

const KEYS = {
    PROFILE: 'scholar_profile',
    POSTS: 'scholar_posts',
    PAPERS: 'scholar_papers'
};

// --- DEFAULT DATA FOR FALLBACK ---
const DEFAULT_PROFILE: Profile = {
  name: "Dr. Alex V. Mercer",
  title: "Senior Researcher in Cognitive AI",
  institution: "Institute of Advanced Cybernetics",
  bio: "Exploring the intersection of neural networks and human cognition. I write about AI ethics, model interpretability, and the future of work.",
  avatarUrl: "https://picsum.photos/id/1005/400/400",
  email: "alex.mercer@example.ac.edu",
  twitterUrl: "https://twitter.com",
  linkedinUrl: "https://linkedin.com",
  githubUrl: "https://github.com"
};

const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    title: 'The Unreasonable Effectiveness of Sparse Models',
    content: "In recent experiments, we've observed that sparsity isn't just a compression technique—it's a feature extraction mechanism. When we prune 90% of the weights, the remaining connections often align with interpretable semantic features.\n\nHere is a visualization of the attention heads:\n\n![Attention Map](https://picsum.photos/id/1015/800/400)\n\nWe need to rethink how we initialize these networks.",
    date: '2023-10-15',
    tags: ['AI', 'Sparsity', 'Research'],
    type: 'newsletter',
    imageUrl: 'https://picsum.photos/id/1015/800/400'
  },
  {
    id: '2',
    title: 'Lab Notebook: Thursday Night Debugging',
    content: "Spent 4 hours chasing a NaN gradient. Turns out the dataset had a single corrupted image with 0-byte size. Note to self: always valid data loaders with a checksum first.",
    date: '2023-11-02',
    tags: ['Debugging', 'Journal'],
    type: 'journal'
  }
];

const DEFAULT_PAPERS: Paper[] = [
  {
    id: '101',
    title: 'Attention Is Not All You Need: The Case for Recurrence',
    authors: ['A. Mercer', 'J. Doe', 'S. Lee'],
    abstract: 'While Transformer architectures dominate the landscape, we argue that recurrence provides essential inductive biases for temporal reasoning tasks. We introduce R-Transformer, a hybrid model that outperforms GPT-4 on long-horizon planning benchmarks.',
    journal: 'Journal of Machine Learning Research',
    year: 2024,
    tags: ['NLP', 'Architecture'],
    pdfUrl: '#'
  },
  {
    id: '102',
    title: 'Ethical Alignment via Reinforcement Learning from Human Feedback',
    authors: ['A. Mercer', 'K. Smith'],
    abstract: 'We propose a new framework for RLHF that prioritizes minority voices in the alignment process, reducing bias in generative outputs by 40%.',
    journal: 'NeurIPS 2023',
    year: 2023,
    tags: ['Ethics', 'RLHF'],
    pdfUrl: '#'
  }
];

// --- INITIALIZATION ---

export const initStorage = async () => {
  try {
      // Attempt to ping the API with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const res = await fetch(`${API_URL}/profile`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error("API not OK");
      
      console.log("✅ Connected to Node.js Backend");
      USE_LOCAL = false;
  } catch (e) {
      console.warn("⚠️ Backend unreachable. Falling back to Browser Storage (IndexedDB).");
      USE_LOCAL = true;
      
      // Initialize Local Data if Empty
      const p = await get(KEYS.PROFILE);
      if(!p) await set(KEYS.PROFILE, DEFAULT_PROFILE);
      
      const posts = await get(KEYS.POSTS);
      if(!posts) await set(KEYS.POSTS, DEFAULT_POSTS);

      const papers = await get(KEYS.PAPERS);
      if(!papers) await set(KEYS.PAPERS, DEFAULT_PAPERS);
  }
};

// --- PROFILE ---

export const getProfile = async (): Promise<Profile> => {
  if (USE_LOCAL) {
      return (await get(KEYS.PROFILE)) || DEFAULT_PROFILE;
  }
  try {
    const res = await fetch(`${API_URL}/profile`);
    return await res.json();
  } catch(e) { return DEFAULT_PROFILE; }
};

export const saveProfile = async (profile: Profile) => {
  if (USE_LOCAL) {
      await set(KEYS.PROFILE, profile);
      return;
  }
  await fetch(`${API_URL}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
};

// --- POSTS ---

export const getPosts = async (): Promise<Post[]> => {
  if (USE_LOCAL) {
      return (await get(KEYS.POSTS)) || [];
  }
  try {
    const res = await fetch(`${API_URL}/posts`);
    return await res.json();
  } catch(e) { return []; }
};

export const savePost = async (post: Post) => {
  if (USE_LOCAL) {
      const posts = (await get(KEYS.POSTS)) || [];
      const idx = posts.findIndex((p: Post) => p.id === post.id);
      if(idx >= 0) posts[idx] = post;
      else posts.unshift(post);
      await set(KEYS.POSTS, posts);
      return;
  }
  await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
};

export const deletePost = async (id: string) => {
  if (USE_LOCAL) {
      const posts = (await get(KEYS.POSTS)) || [];
      const newPosts = posts.filter((p: Post) => p.id !== id);
      await set(KEYS.POSTS, newPosts);
      return;
  }
  await fetch(`${API_URL}/posts/${id}`, { method: 'DELETE' });
};

// --- PAPERS ---

export const getPapers = async (): Promise<Paper[]> => {
  if (USE_LOCAL) {
      return (await get(KEYS.PAPERS)) || [];
  }
  try {
    const res = await fetch(`${API_URL}/papers`);
    return await res.json();
  } catch(e) { return []; }
};

export const savePaper = async (paper: Paper) => {
  if (USE_LOCAL) {
      const papers = (await get(KEYS.PAPERS)) || [];
      const idx = papers.findIndex((p: Paper) => p.id === paper.id);
      if(idx >= 0) papers[idx] = paper;
      else papers.unshift(paper);
      await set(KEYS.PAPERS, papers);
      return;
  }
  await fetch(`${API_URL}/papers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paper)
  });
};

export const deletePaper = async (id: string) => {
  if (USE_LOCAL) {
      const papers = (await get(KEYS.PAPERS)) || [];
      const newPapers = papers.filter((p: Paper) => p.id !== id);
      await set(KEYS.PAPERS, newPapers);
      return;
  }
  await fetch(`${API_URL}/papers/${id}`, { method: 'DELETE' });
};