import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import { HomeIcon, SearchIcon, PlusSquareIcon, LogoutIcon } from "./Icons";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return (
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">Nora</Link>
        </div>
      </header>
    );
  }

  const isProfileActive = location.pathname === `/${user.username}`;

  const tabs = (
    <>
      <NavLink to="/" end className="nav-tab" title="Início">
        {({ isActive }) => <HomeIcon filled={isActive} />}
      </NavLink>
      <NavLink to="/search" className="nav-tab" title="Pesquisar">
        {({ isActive }) => <SearchIcon filled={isActive} />}
      </NavLink>
      <NavLink to="/create" className="nav-tab" title="Nova publicação">
        {({ isActive }) => <PlusSquareIcon filled={isActive} />}
      </NavLink>
      <Link
        to={`/${user.username}`}
        className={`nav-tab nav-tab-avatar ${isProfileActive ? "active" : ""}`}
        title="Perfil"
      >
        <Avatar src={user.avatar} name={user.name || user.username} size={26} />
      </Link>
    </>
  );

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">Nora</Link>
          <nav className="navbar-tabs-desktop">{tabs}</nav>
          <button className="nav-tab navbar-logout" onClick={handleLogout} title="Sair">
            <LogoutIcon size={22} />
          </button>
        </div>
      </header>
      <nav className="bottom-nav">{tabs}</nav>
    </>
  );
}
