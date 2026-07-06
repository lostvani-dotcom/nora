import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Nora
        </Link>

        {user && (
          <nav className="navbar-actions">
            <Link to="/" title="Início" className="navbar-icon-btn">
              🏠
            </Link>
            <Link to="/create" title="Nova publicação" className="navbar-icon-btn">
              ➕
            </Link>
            <Link to={`/${user.username}`} className="navbar-profile-link">
              <Avatar src={user.avatar} name={user.name || user.username} size={30} />
            </Link>
            <button className="navbar-icon-btn" onClick={handleLogout} title="Sair">
              ⎋
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
