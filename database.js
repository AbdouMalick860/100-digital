const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

let pool;

async function initDB() {
  try {
    // Connexion à XAMPP par défaut (localhost, root, sans mot de passe)
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: '100digital',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Connecté à la base de données MySQL (XAMPP).');

    // Table Utilisateurs
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      )
    `);

    // Création d'un admin par défaut si la table est vide
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = 'admin@100digital.com'");
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", ['admin@100digital.com', hash, 'admin']);
      console.log("Compte admin par défaut créé (admin@100digital.com / admin123)");
    }

    // Table Cartes
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(50),
        title VARCHAR(255),
        description TEXT,
        badge VARCHAR(100),
        image_url VARCHAR(255),
        video_url VARCHAR(255)
      )
    `);

    // Table Posts
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

  } catch (err) {
    console.error('Erreur de connexion à MySQL. Assurez-vous que XAMPP est lancé et que la base "100digital" existe sur phpMyAdmin.', err.message);
  }
}

initDB();

module.exports = {
  query: async (sql, params) => {
    if (!pool) throw new Error("Base de données non connectée. Lancez XAMPP.");
    return await pool.execute(sql, params);
  }
};
