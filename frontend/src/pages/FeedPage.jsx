import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import PostCard from "../components/PostCard";

export default function FeedPage() {
  const [scope, setScope] = useState("all");
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .getFeed(scope)
      .then((data) => setPosts(data.posts))
      .catch((err) => setError(err.message));
  }, [scope]);

  useEffect(() => {
    setPosts(null);
    load();
  }, [load]);

  return (
    <div className="feed-page">
      <div className="feed-tabs">
        <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
          Para você
        </button>
        <button
          className={scope === "following" ? "active" : ""}
          onClick={() => setScope("following")}
        >
          Seguindo
        </button>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {posts === null && !error && <p className="feed-empty">Carregando...</p>}

      {posts && posts.length === 0 && (
        <div className="feed-empty">
          <p>Nenhuma publicação por aqui ainda.</p>
          <Link to="/create">Criar a primeira publicação</Link>
        </div>
      )}

      {posts &&
        posts.map((post) => <PostCard key={post.id} post={post} onChange={load} />)}
    </div>
  );
}
