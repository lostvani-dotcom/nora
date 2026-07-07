import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/timeAgo";
import Avatar from "../components/Avatar";
import { HeartIcon } from "../components/Icons";

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");

  const load = useCallback(() => {
    api
      .getPost(id)
      .then((data) => setPost(data.post))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleLike() {
    if (!post) return;
    const wasLiked = post.isLiked;
    try {
      const result = wasLiked ? await api.unlikePost(post.id) : await api.likePost(post.id);
      setPost((p) => ({ ...p, isLiked: result.isLiked, _count: { ...p._count, likes: result.count } }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.addComment(post.id, commentText.trim());
      setCommentText("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Excluir esta publicação?")) return;
    try {
      await api.deletePost(post.id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="auth-error">{error}</p>;
  if (!post) return <p className="feed-empty">Carregando...</p>;

  return (
    <div className="post-page">
      <img className="post-page-image" src={fileUrl(post.image)} alt={post.caption || "post"} />

      <div className="post-page-side">
        <div className="post-header">
          <Link to={`/${post.author.username}`} className="post-author">
            <Avatar src={post.author.avatar} name={post.author.name || post.author.username} size={32} />
            <span>{post.author.username}</span>
          </Link>
          {user && user.id === post.author.id && (
            <button className="link-danger" onClick={handleDelete}>
              Excluir
            </button>
          )}
        </div>

        {post.caption && (
          <div className="post-caption">
            <Link to={`/${post.author.username}`} className="post-caption-author">
              {post.author.username}
            </Link>{" "}
            {post.caption}
          </div>
        )}

        <div className="post-page-comments">
          {post.comments.length === 0 && (
            <p className="feed-empty">Nenhum comentário ainda.</p>
          )}
          {post.comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <Avatar src={comment.user.avatar} name={comment.user.name || comment.user.username} size={28} />
              <div>
                <Link to={`/${comment.user.username}`} className="post-caption-author">
                  {comment.user.username}
                </Link>{" "}
                <span>{comment.text}</span>
                <div className="comment-time">{timeAgo(comment.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="post-actions">
          <button
            className={`icon-btn like-btn ${post.isLiked ? "liked" : ""}`}
            onClick={toggleLike}
            aria-label="Curtir"
          >
            <HeartIcon size={26} filled={post.isLiked} />
          </button>
        </div>
        <div className="post-likes">
          {post._count.likes} curtida{post._count.likes !== 1 ? "s" : ""}
        </div>

        <form className="post-comment-form" onSubmit={submitComment}>
          <input
            type="text"
            placeholder="Adicione um comentário..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" disabled={!commentText.trim()}>
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
}
