const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
    
    // Table Utilisateurs
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`, (err) => {
      if(!err) {
        // Création d'un admin par défaut si la table est vide
        db.get("SELECT * FROM users WHERE email = 'admin@100digital.com'", async (err, row) => {
          if (!row) {
            const hash = await bcrypt.hash('admin123', 10);
            db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", ['admin@100digital.com', hash, 'admin']);
            console.log("Compte admin par défaut créé (admin@100digital.com / admin123)");
          }
        });
      }
    });

    // Table Cartes (pour Services ou Réalisations)
    db.run(`CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT,
      title TEXT,
      description TEXT,
      badge TEXT,
      image_url TEXT,
      video_url TEXT
    )`);

    // Table Posts (Actualités ou autres)
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      date TEXT
    )`);
  }
});

module.exports = db;
