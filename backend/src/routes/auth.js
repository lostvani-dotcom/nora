const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const upload = require("../upload");
const { sendVerificationEmail } = require("../mailer");

const router = express.Router();

const publicUserSelect = {
  id: true,
  username: true,
  name: true,
  bio: true,
  avatar: true,
  createdAt: true,
};

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// Verificação por email desligada por padrão; para exigir, defina
// REQUIRE_EMAIL_VERIFICATION=true no ambiente (e configure o envio de email).
const VERIFICATION_ENABLED = process.env.REQUIRE_EMAIL_VERIFICATION === "true";

async function issueVerificationCode(user) {
  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyCode: code, verifyCodeExpires: expires },
  });
  await sendVerificationEmail(user.email, code);
}

router.post("/register", async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Usuário, email e senha são obrigatórios." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return res.status(400).json({ error: "Usuário deve conter apenas letras, números, pontos e underline." });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return res.status(409).json({ error: "Usuário ou email já cadastrado." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      name: name || username,
      emailVerified: !VERIFICATION_ENABLED,
    },
  });

  if (VERIFICATION_ENABLED) {
    await issueVerificationCode(user);
    return res.status(201).json({
      needsVerification: true,
      email: user.email,
      message: "Conta criada. Enviamos um código de verificação para o seu email.",
    });
  }

  const publicUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: publicUserSelect,
  });
  const token = signToken(user.id);
  res.status(201).json({ user: publicUser, token });
});

router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Informe email e código." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  if (user.emailVerified) {
    const token = signToken(user.id);
    const { password: _pw, verifyCode: _vc, verifyCodeExpires: _ve, email: _em, ...publicUser } = user;
    return res.json({ user: publicUser, token });
  }

  if (!user.verifyCode || user.verifyCode !== String(code).trim()) {
    return res.status(400).json({ error: "Código incorreto." });
  }
  if (user.verifyCodeExpires && user.verifyCodeExpires < new Date()) {
    return res.status(400).json({ error: "Código expirado. Solicite um novo." });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyCode: null, verifyCodeExpires: null },
    select: publicUserSelect,
  });

  const token = signToken(updated.id);
  res.json({ user: updated, token });
});

router.post("/resend", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Informe o email." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  if (user.emailVerified) {
    return res.status(400).json({ error: "Esta conta já está verificada. Faça login." });
  }

  await issueVerificationCode(user);
  res.json({ message: "Novo código enviado para o seu email." });
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Informe usuário/email e senha." });
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });
  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  if (VERIFICATION_ENABLED && !user.emailVerified) {
    await issueVerificationCode(user);
    return res.status(403).json({
      needsVerification: true,
      email: user.email,
      error: "Conta não verificada. Enviamos um novo código para o seu email.",
    });
  }

  const { password: _pw, verifyCode: _vc, verifyCodeExpires: _ve, ...publicUser } = user;
  const token = signToken(user.id);
  res.json({ user: publicUser, token });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: publicUserSelect,
  });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  res.json({ user });
});

router.put("/me", requireAuth, upload.single("avatar"), async (req, res) => {
  const { name, bio } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (req.file) data.avatar = `/uploads/${req.file.filename}`;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
    select: publicUserSelect,
  });
  res.json({ user });
});

module.exports = router;
