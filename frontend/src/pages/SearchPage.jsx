import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Avatar from "../components/Avatar";
import { SearchIcon } from "../components/Icons";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api
        .searchUsers(q)
        .then((data) => setResults(data.users))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-bar">
        <span className="search-icon">
          <SearchIcon size={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar usuários..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery("")} aria-label="Limpar">
            ✕
          </button>
        )}
      </div>

      {loading && <p className="feed-empty">Pesquisando...</p>}

      {!loading && results && results.length === 0 && (
        <p className="feed-empty">Nenhum usuário encontrado para "{query.trim()}".</p>
      )}

      {!loading && results && results.length > 0 && (
        <ul className="search-results">
          {results.map((user) => (
            <li key={user.id}>
              <Link to={`/${user.username}`} className="search-result">
                <Avatar src={user.avatar} name={user.name || user.username} size={44} />
                <div className="search-result-info">
                  <strong>{user.username}</strong>
                  <span>{user.name}</span>
                  <small>
                    {user._count.followers} seguidor{user._count.followers !== 1 ? "es" : ""} ·{" "}
                    {user._count.posts} publicaç{user._count.posts !== 1 ? "ões" : "ão"}
                  </small>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!results && !loading && (
        <p className="feed-empty">Digite um nome ou @usuário para pesquisar.</p>
      )}
    </div>
  );
}
