const nodemailer = require("nodemailer");

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

async function sendVerificationEmail(to, code) {
  const subject = "Seu código de verificação — Nora";
  const text = `Seu código de verificação é: ${code}\n\nEle expira em 15 minutos.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #dbdbdb;border-radius:8px">
      <h1 style="font-family:'Brush Script MT',cursive;text-align:center;margin:0 0 16px">Nora</h1>
      <p>Use o código abaixo para verificar sua conta:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;margin:20px 0">${code}</p>
      <p style="color:#8e8e8e;font-size:13px">O código expira em 15 minutos. Se você não criou uma conta, ignore este email.</p>
    </div>`;

  if (!transporter) {
    logCodeFallback(to, code, "SMTP não configurado.");
    return { delivered: false, devCode: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { delivered: true };
  } catch (err) {
    logCodeFallback(to, code, `Falha ao enviar email (${err.message}).`);
    return { delivered: false, error: err.message };
  }
}

module.exports = { sendVerificationEmail };
