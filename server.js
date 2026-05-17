require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sert les fichiers statiques (notre frontend)
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_KEY = process.env.SECRET_KEY || 'supersecret_100digital_key';

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Accès refusé' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  next();
}

// ==========================================
// ROUTES AUTHENTIFICATION
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const hash = await bcrypt.hash(password, 10);
    // Par défaut, toute inscription donne le rôle admin pour ce cas spécifique (facilite la gestion)
    db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [email, hash, 'admin'], function(err) {
      if(err) return res.status(400).json({ error: 'Email déjà utilisé' });
      res.json({ success: true, message: 'Compte créé' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Utilisateur introuvable' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ success: true, token, role: user.role });
  });
});

// ==========================================
// ROUTES CONTACT (EMAIL)
// ==========================================
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Configuration Nodemailer (Nécessite un Mot de passe d'Application Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'centpour100digital@gmail.com',
      pass: process.env.EMAIL_PASS || 'VOTRE_MOT_DE_PASSE_APPLICATION'
    }
  });

  const mailOptions = {
    from: email,
    to: 'centpour100digital@gmail.com',
    subject: `[100% Digital] Nouveau message de ${name}`,
    text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  try {
    if (process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log("Email envoyé !");
    } else {
      console.log("⚠️ Simulation d'envoi d'email (Mot de passe non configuré):", mailOptions);
    }
    res.json({ success: true, message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// ==========================================
// ROUTES DASHBOARD (CARDS)
// ==========================================
app.get('/api/cards', (req, res) => {
  db.all("SELECT * FROM cards", [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/cards', authenticateToken, isAdmin, (req, res) => {
  const { page, title, description, badge, image_url, video_url } = req.body;
  db.run(`INSERT INTO cards (page, title, description, badge, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?)`,
    [page, title, description, badge, image_url, video_url], function(err) {
      if(err) return res.status(500).json({error: err.message});
      res.json({ success: true, id: this.lastID });
  });
});

app.delete('/api/cards/:id', authenticateToken, isAdmin, (req, res) => {
  db.run("DELETE FROM cards WHERE id = ?", req.params.id, function(err) {
    if(err) return res.status(500).json({error: err.message});
    res.json({ success: true });
  });
});

// ==========================================
// DEMARRAGE SERVEUR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur Backend démarré sur le port ${PORT}`);
  console.log(`🌐 Accès local : http://localhost:${PORT}`);
});
