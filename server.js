import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase limit for Base64 image uploads and huge restores
app.use(express.json({ limit: '50mb' }));

// Database Initialization
let db;

// DATA PERSISTENCE CONFIGURATION
// On Render, you must attach a Disk and mount it (e.g., to /var/lib/data).
// Set the environment variable RENDER_DISK_PATH to that mount point.
const DISK_PATH = process.env.RENDER_DISK_PATH || './data'; // Default to ./data if env not set
const DB_PATH = path.join(DISK_PATH, 'database.sqlite');

// Ensure the directory for the database exists
if (!fs.existsSync(DISK_PATH)) {
    console.log(`Creating database directory at: ${DISK_PATH}`);
    try {
        fs.mkdirSync(DISK_PATH, { recursive: true });
    } catch (err) {
        console.error('Failed to create database directory:', err);
    }
}

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
  githubUrl: "https://github.com",
  footerText: "© 2024 Dr. Alex V. Mercer. All rights reserved."
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
  console.log(`Using Database at: ${DB_PATH}`);
  
  db = await open({
    filename: DB_PATH,
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
      githubUrl TEXT,
      footerText TEXT
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
  
  // Migration: Add footerText column if it doesn't exist (for existing DBs)
  try {
      const columns = await db.all("PRAGMA table_info(profile)");
      const hasFooter = columns.some(c => c.name === 'footerText');
      if (!hasFooter) {
          console.log("Migrating DB: Adding footerText column...");
          await db.exec("ALTER TABLE profile ADD COLUMN footerText TEXT");
      }
  } catch (e) {
      console.error("Migration error:", e);
  }

  // Seed Data if empty
  const profileCount = await db.get('SELECT count(*) as count FROM profile');
  if (profileCount.count === 0) {
    console.log('Seeding Profile...');
    await db.run(
      `INSERT INTO profile (id, name, title, institution, bio, avatarUrl, email, twitterUrl, linkedinUrl, githubUrl, footerText) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        [paper.id, paper.title, authors, p.abstract, p.journal, p.year, p.pdfUrl, tags]
      );
    }
  }
}

initDb().then(() => {
  // Serve static files from the 'dist' directory (Vite build output)
  app.use(express.static(path.join(__dirname, 'dist')));

  // --- API Routes ---

  // --- BACKUP & RESTORE SYSTEM ---
  
  app.get('/api/backup', async (req, res) => {
    try {
      const profile = await db.get('SELECT * FROM profile WHERE id = 1');
      const posts = await db.all('SELECT * FROM posts');
      const papers = await db.all('SELECT * FROM papers');
      
      const backupData = {
        timestamp: new Date().toISOString(),
        profile,
        posts,
        papers
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=scholar-backup.json');
      res.json(backupData);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/restore', async (req, res) => {
    const { profile, posts, papers } = req.body;
    
    if (!profile || !posts || !papers) {
        return res.status(400).json({ error: "Invalid backup file format" });
    }

    try {
        await db.run('BEGIN TRANSACTION');

        // 1. Restore Profile
        await db.run('DELETE FROM profile');
        await db.run(
            `INSERT INTO profile (id, name, title, institution, bio, avatarUrl, email, twitterUrl, linkedinUrl, githubUrl, footerText) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [1, profile.name, profile.title, profile.institution, profile.bio, profile.avatarUrl, profile.email, profile.twitterUrl, profile.linkedinUrl, profile.githubUrl, profile.footerText]
        );

        // 2. Restore Posts
        await db.run('DELETE FROM posts');
        for (const post of posts) {
             await db.run(
                `INSERT INTO posts (id, title, content, date, tags, type, imageUrl, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [post.id, post.title, post.content, post.date, post.tags, post.type, post.imageUrl, post.videoUrl]
            );
        }

        // 3. Restore Papers
        await db.run('DELETE FROM papers');
        for (const paper of papers) {
            await db.run(
                `INSERT INTO papers (id, title, authors, abstract, journal, year, pdfUrl, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [paper.id, paper.title, paper.authors, paper.abstract, paper.journal, paper.year, paper.pdfUrl, paper.tags]
            );
        }

        await db.run('COMMIT');
        res.json({ success: true, message: "Database restored successfully" });
    } catch (e) {
        await db.run('ROLLBACK');
        console.error(e);
        res.status(500).json({ error: e.message });
    }
  });

  // --- STANDARD API ROUTES ---

  // Profile
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await db.get('SELECT * FROM profile WHERE id = 1');
      res.json(profile);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/profile', async (req, res) => {
    const p = req.body;
    try {
      await db.run(
        `UPDATE profile SET name=?, title=?, institution=?, bio=?, avatarUrl=?, email=?, twitterUrl=?, linkedinUrl=?, githubUrl=?, footerText=? WHERE id=1`,
        [p.name, p.title, p.institution, p.bio, p.avatarUrl, p.email, p.twitterUrl, p.linkedinUrl, p.githubUrl, p.footerText]
      );
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Posts
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await db.all('SELECT * FROM posts ORDER BY date DESC');
      const parsed = posts.map(p => ({ ...p, tags: JSON.parse(p.tags) }));
      res.json(parsed);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/posts', async (req, res) => {
    const p = req.body;
    const tags = JSON.stringify(p.tags);
    try {
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
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Papers
  app.get('/api/papers', async (req, res) => {
    try {
      const papers = await db.all('SELECT * FROM papers ORDER BY year DESC');
      const parsed = papers.map(p => ({
        ...p,
        authors: JSON.parse(p.authors),
        tags: JSON.parse(p.tags)
      }));
      res.json(parsed);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/papers', async (req, res) => {
    const p = req.body;
    const authors = JSON.stringify(p.authors);
    const tags = JSON.stringify(p.tags);
    try {
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
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/papers/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM papers WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Fallback for SPA (Must be last)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
});