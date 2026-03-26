import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory high scores store
  let highScores = [
    { initials: "SYS", score: 500 },
    { initials: "NEO", score: 400 },
    { initials: "HCK", score: 300 },
    { initials: "BOT", score: 200 },
    { initials: "UNK", score: 100 },
  ];

  // API Routes
  app.get("/api/scores", (req, res) => {
    res.json(highScores);
  });

  app.post("/api/scores", (req, res) => {
    const { initials, score } = req.body;
    if (initials && typeof score === 'number') {
      highScores.push({ initials: initials.substring(0, 3).toUpperCase(), score });
      highScores.sort((a, b) => b.score - a.score);
      highScores = highScores.slice(0, 5); // Keep top 5
      res.json({ success: true, highScores });
    } else {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
