require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');
const multer = require('multer');

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const SECRET_KEY = process.env.SECRET_KEY || 'supersecret_100digital_key';

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
    await db.query("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [email, hash, 'admin']);
    res.json({ success: true, message: 'Compte créé' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Utilisateur introuvable' });
    
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ success: true, token, role: user.role });
  } catch(err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==========================================
// ROUTES CONTACT (EMAIL)
// ==========================================
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
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
// ROUTES DASHBOARD (CARDS & UPLOAD)
// ==========================================
app.post('/api/upload', authenticateToken, isAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été reçu' });
  }
  const fileUrl = 'uploads/' + req.file.filename;
  res.json({ success: true, fileUrl });
});

app.get('/api/cards', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cards", []);
    res.json(rows);
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

app.post('/api/cards', authenticateToken, isAdmin, async (req, res) => {
  const { page, title, description, badge, image_url, video_url } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO cards (page, title, description, badge, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [page, title, description, badge, image_url, video_url]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.delete('/api/cards/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM cards WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

// ==========================================
// DEMARRAGE SERVEUR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur Backend démarré sur le port ${PORT}`);
  console.log(`🌐 Accès local : http://localhost:${PORT}`);
});
