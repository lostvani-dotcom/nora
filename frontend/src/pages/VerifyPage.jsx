import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, saveToken } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.verify(email, code);
      saveToken(data.token);
      updateUser(data.user);
      window.location.hash = "#/";
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      const data = await api.resendCode(email);
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-logo">Nora</h1>
        <p className="auth-subtitle">
          Enviamos um código de 6 dígitos para o seu email. Digite-o abaixo para ativar sua conta.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Código de verificação"
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          {info && <p className="auth-info">{info}</p>}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading || code.length !== 6}>
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>
        <button className="link-btn resend-btn" onClick={handleResend} disabled={!email}>
          Reenviar código
        </button>
      </div>
      <div className="auth-box auth-switch">
        Voltar para o <Link to="/login">login</Link>
      </div>
    </div>
  );
}
