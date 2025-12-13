import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
// Increase limit for Base64 image uploads
app.use(express.json({ limit: '50mb' }));

// Database Initialization
let db;

const DEFAULT_PROFILE = {
  id: 1,
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

const DEFAULT_POSTS = [
  {
    id: '1',
    title: 'The Unreasonable Effectiveness of Sparse Models',
    content: "In recent experiments, we've observed that sparsity isn't just a compression technique—it's a feature extraction mechanism. When we prune 90% of the weights, the remaining connections often align with interpretable semantic features.\n\nHere is a visualization of the attention heads:\n\n![Attention Map](https://picsum.photos/id/1015/800/400)\n\nWe need to rethink how we initialize these networks.",
    date: '2023-10-15',
    tags: JSON.stringify(['AI', 'Sparsity', 'Research']),
    type: 'newsletter',
    imageUrl: 'https://picsum.photos/id/1015/800/400',
    videoUrl: ''
  },
  {
    id: '2',
    title: 'Lab Notebook: Thursday Night Debugging',
    content: "Spent 4 hours chasing a NaN gradient. Turns out the dataset had a single corrupted image with 0-byte size. Note to self: always valid data loaders with a checksum first.",
    date: '2023-11-02',
    tags: JSON.stringify(['Debugging', 'Journal']),
    type: 'journal',
    imageUrl: '',
    videoUrl: ''
  }
];

const DEFAULT_PAPERS = [
  {
    id: '101',
    title: 'Attention Is Not All You Need: The Case for Recurrence',
    authors: JSON.stringify(['A. Mercer', 'J. Doe', 'S. Lee']),
    abstract: 'While Transformer architectures dominate the landscape, we argue that recurrence provides essential inductive biases for temporal reasoning tasks. We introduce R-Transformer, a hybrid model that outperforms GPT-4 on long-horizon planning benchmarks.',
    journal: 'Journal of Machine Learning Research',
    year: 2024,
    tags: JSON.stringify(['NLP', 'Architecture']),
    pdfUrl: '#'
  },
  {
    id: '102',
    title: 'Ethical Alignment via Reinforcement Learning from Human Feedback',
    authors: JSON.stringify(['A. Mercer', 'K. Smith']),
    abstract: 'We propose a new framework for RLHF that prioritizes minority voices in the alignment process, reducing bias in generative outputs by 40%.',
    journal: 'NeurIPS 2023',
    year: 2023,
    tags: JSON.stringify(['Ethics', 'RLHF']),
    pdfUrl: '#'
  }
];

async function initDb() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create Tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      name TEXT,
      title TEXT,
      institution TEXT,
      bio TEXT,
      avatarUrl TEXT,
      email TEXT,
      twitterUrl TEXT,
      linkedinUrl TEXT,
      githubUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      date TEXT,
      tags TEXT,
      imageUrl TEXT,
      videoUrl TEXT,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      title TEXT,
      authors TEXT,
      abstract TEXT,
      journal TEXT,
      year INTEGER,
      pdfUrl TEXT,
      tags TEXT
    );
  `);

  // Seed Data if empty
  const profileCount = await db.get('SELECT count(*) as count FROM profile');
  if (profileCount.count === 0) {
    console.log('Seeding Profile...');
    await db.run(
      `INSERT INTO profile (id, name, title, institution, bio, avatarUrl, email, twitterUrl, linkedinUrl, githubUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(DEFAULT_PROFILE)
    );
  }

  const postsCount = await db.get('SELECT count(*) as count FROM posts');
  if (postsCount.count === 0) {
    console.log('Seeding Posts...');
    for (const post of DEFAULT_POSTS) {
      await db.run(
        `INSERT INTO posts (id, title, content, date, tags, type, imageUrl, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [post.id, post.title, post.content, post.date, post.tags, post.type, post.imageUrl, post.videoUrl]
      );
    }
  }

  const papersCount = await db.get('SELECT count(*) as count FROM papers');
  if (papersCount.count === 0) {
    console.log('Seeding Papers...');
    for (const paper of DEFAULT_PAPERS) {
      await db.run(
        `INSERT INTO papers (id, title, authors, abstract, journal, year, pdfUrl, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paper.id, paper.title, paper.authors, paper.abstract, paper.journal, paper.year, paper.pdfUrl, paper.tags]
      );
    }
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
});

// --- API Routes ---

// Profile
app.get('/api/profile', async (req, res) => {
  const profile = await db.get('SELECT * FROM profile WHERE id = 1');
  res.json(profile);
});

app.post('/api/profile', async (req, res) => {
  const p = req.body;
  await db.run(
    `UPDATE profile SET name=?, title=?, institution=?, bio=?, avatarUrl=?, email=?, twitterUrl=?, linkedinUrl=?, githubUrl=? WHERE id=1`,
    [p.name, p.title, p.institution, p.bio, p.avatarUrl, p.email, p.twitterUrl, p.linkedinUrl, p.githubUrl]
  );
  res.json({ success: true });
});

// Posts
app.get('/api/posts', async (req, res) => {
  const posts = await db.all('SELECT * FROM posts ORDER BY date DESC');
  // Parse tags JSON
  const parsed = posts.map(p => ({ ...p, tags: JSON.parse(p.tags) }));
  res.json(parsed);
});

app.post('/api/posts', async (req, res) => {
  const p = req.body;
  const tags = JSON.stringify(p.tags);
  const exists = await db.get('SELECT id FROM posts WHERE id = ?', [p.id]);
  
  if (exists) {
    await db.run(
      `UPDATE posts SET title=?, content=?, date=?, tags=?, type=?, imageUrl=?, videoUrl=? WHERE id=?`,
      [p.title, p.content, p.date, tags, p.type, p.imageUrl, p.videoUrl, p.id]
    );
  } else {
    await db.run(
      `INSERT INTO posts (id, title, content, date, tags, type, imageUrl, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.title, p.content, p.date, tags, p.type, p.imageUrl, p.videoUrl]
    );
  }
  res.json({ success: true });
});

app.delete('/api/posts/:id', async (req, res) => {
  await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Papers
app.get('/api/papers', async (req, res) => {
  const papers = await db.all('SELECT * FROM papers ORDER BY year DESC');
  const parsed = papers.map(p => ({
    ...p,
    authors: JSON.parse(p.authors),
    tags: JSON.parse(p.tags)
  }));
  res.json(parsed);
});

app.post('/api/papers', async (req, res) => {
  const p = req.body;
  const authors = JSON.stringify(p.authors);
  const tags = JSON.stringify(p.tags);
  const exists = await db.get('SELECT id FROM papers WHERE id = ?', [p.id]);

  if (exists) {
    await db.run(
      `UPDATE papers SET title=?, authors=?, abstract=?, journal=?, year=?, pdfUrl=?, tags=? WHERE id=?`,
      [p.title, authors, p.abstract, p.journal, p.year, p.pdfUrl, tags, p.id]
    );
  } else {
    await db.run(
      `INSERT INTO papers (id, title, authors, abstract, journal, year, pdfUrl, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.title, authors, p.abstract, p.journal, p.year, p.pdfUrl, tags]
    );
  }
  res.json({ success: true });
});

app.delete('/api/papers/:id', async (req, res) => {
  await db.run('DELETE FROM papers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});
