import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL, setApiUrl } from "../api/client";
import { SettingsIcon } from "../components/Icons";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/");
    } catch (err) {
      if (err.needsVerification) {
        navigate("/verify", { state: { email: err.email, message: err.message } });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleConfigureServer() {
    const url = window.prompt(
      "Endereço do servidor (ex: https://nora.onrender.com)",
      API_URL || "https://"
    );
    if (url !== null) setApiUrl(url);
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-logo">Nora</h1>
        {!API_URL && (
          <p className="auth-error">
            Nenhum servidor configurado. Toque em "Configurar servidor" abaixo.
          </p>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Usuário ou email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
      <div className="auth-box auth-switch">
        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </div>
      <button className="link-btn server-config-btn" onClick={handleConfigureServer}>
        <SettingsIcon size={14} /> Configurar servidor
      </button>
    </div>
  );
}
