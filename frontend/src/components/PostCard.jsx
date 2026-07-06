import { useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import { timeAgo } from "../utils/timeAgo";
import Avatar from "./Avatar";

export default function PostCard({ post, onChange }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      const result = wasLiked ? await api.unlikePost(post.id) : await api.likePost(post.id);
      setIsLiked(result.isLiked);
      setLikeCount(result.count);
    } catch (err) {
      setIsLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.addComment(post.id, commentText.trim());
      setCommentText("");
      setCommentCount((c) => c + 1);
      onChange && onChange();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/${post.author.username}`} className="post-author">
          <Avatar src={post.author.avatar} name={post.author.name || post.author.username} size={32} />
          <span>{post.author.username}</span>
        </Link>
        <span className="post-time">{timeAgo(post.createdAt)}</span>
      </div>

      <Link to={`/post/${post.id}`}>
        <img className="post-image" src={fileUrl(post.image)} alt={post.caption || "post"} />
      </Link>

      <div className="post-actions">
        <button
          className={`icon-btn like-btn ${isLiked ? "liked" : ""}`}
          onClick={toggleLike}
          aria-label="Curtir"
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
        <Link to={`/post/${post.id}`} className="icon-btn" aria-label="Comentar">
          💬
        </Link>
      </div>

      <div className="post-likes">{likeCount} curtida{likeCount !== 1 ? "s" : ""}</div>

      {post.caption && (
        <div className="post-caption">
          <Link to={`/${post.author.username}`} className="post-caption-author">
            {post.author.username}
          </Link>{" "}
          {post.caption}
        </div>
      )}

      {commentCount > 0 && (
        <Link to={`/post/${post.id}`} className="post-comments-link">
          Ver os {commentCount} comentário{commentCount !== 1 ? "s" : ""}
        </Link>
      )}

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
    </article>
  );
}
