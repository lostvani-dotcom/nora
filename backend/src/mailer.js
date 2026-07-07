const nodemailer = require("nodemailer");

// Ordem de preferência:
// 1. BREVO_API_KEY  -> API HTTP da Brevo (porta 443, funciona em qualquer host)
// 2. SMTP_*         -> SMTP tradicional (bloqueado em alguns hosts, ex: Render)
// 3. nenhum         -> código aparece no log do servidor

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port: Number(String(process.env.SMTP_PORT || 587).trim()),
    secure: Number(String(process.env.SMTP_PORT || "").trim()) === 465,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim(),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

function logCodeFallback(to, code, reason) {
  console.log("=====================================================");
  console.log(`[MAILER] ${reason}`);
  console.log(`[MAILER] Código de verificação para ${to}: ${code}`);
  console.log("=====================================================");
}

function parseSender() {
  // aceita "Nora <email@x.com>" ou só "email@x.com"
  const raw = (process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
  const match = raw.match(/^(.*)<([^>]+)>$/);
  if (match) return { name: match[1].trim() || "Nora", email: match[2].trim() };
  return { name: "Nora", email: raw };
}

function buildEmail(code) {
  return {
    subject: "Seu código de verificação — Nora",
    text: `Seu código de verificação é: ${code}\n\nEle expira em 15 minutos.`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #dbdbdb;border-radius:8px">
      <h1 style="font-family:'Brush Script MT',cursive;text-align:center;margin:0 0 16px">Nora</h1>
      <p>Use o código abaixo para verificar sua conta:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;margin:20px 0">${code}</p>
      <p style="color:#8e8e8e;font-size:13px">O código expira em 15 minutos. Se você não criou uma conta, ignore este email.</p>
    </div>`,
  };
}

async function sendViaBrevoApi(to, { subject, text, html }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY.trim(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: parseSender(),
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Brevo API ${res.status}: ${body.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function sendVerificationEmail(to, code) {
  const email = buildEmail(code);

  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevoApi(to, email);
      return { delivered: true, via: "brevo-api" };
    } catch (err) {
      logCodeFallback(to, code, `Falha na API da Brevo (${err.message}).`);
      return { delivered: false, error: err.message };
    }
  }

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      return { delivered: true, via: "smtp" };
    } catch (err) {
      logCodeFallback(to, code, `Falha ao enviar email (${err.message}).`);
      return { delivered: false, error: err.message };
    }
  }

  logCodeFallback(to, code, "Nenhum serviço de email configurado.");
  return { delivered: false, devCode: true };
}

module.exports = { sendVerificationEmail };
