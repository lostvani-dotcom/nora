import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import { timeAgo } from "../utils/timeAgo";
import Avatar from "./Avatar";
import { HeartIcon, CommentIcon } from "./Icons";

export default function PostCard({ post, onChange }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(false);
  const burstTimer = useRef(null);

  async function setLike(target) {
    if (busy || target === isLiked) return;
    setBusy(true);
    setIsLiked(target);
    setLikeCount((c) => (target ? c + 1 : c - 1));
    try {
      const result = target ? await api.likePost(post.id) : await api.unlikePost(post.id);
      setIsLiked(result.isLiked);
      setLikeCount(result.count);
    } catch (err) {
      setIsLiked(!target);
      setLikeCount((c) => (target ? c - 1 : c + 1));
    } finally {
      setBusy(false);
    }
  }

  function handleDoubleTap() {
    setBurst(true);
    clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBurst(false), 900);
    setLike(true);
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
          <Avatar src={post.author.avatar} name={post.author.name || post.author.username} size={34} />
          <div className="post-author-text">
            <strong>{post.author.username}</strong>
          </div>
        </Link>
        <span className="post-time">{timeAgo(post.createdAt)}</span>
      </div>

      <div className="post-image-wrap" onDoubleClick={handleDoubleTap}>
        <img className="post-image" src={fileUrl(post.image)} alt={post.caption || "post"} loading="lazy" />
        {burst && (
          <span className="heart-burst">
            <HeartIcon size={90} filled />
          </span>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`icon-btn like-btn ${isLiked ? "liked" : ""}`}
          onClick={() => setLike(!isLiked)}
          aria-label="Curtir"
        >
          <HeartIcon size={26} filled={isLiked} />
        </button>
        <Link to={`/post/${post.id}`} className="icon-btn" aria-label="Comentar">
          <CommentIcon size={26} />
        </Link>
      </div>

      <div className="post-body">
        <div className="post-likes">
          {likeCount} curtida{likeCount !== 1 ? "s" : ""}
        </div>

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
            Ver {commentCount === 1 ? "o comentário" : `os ${commentCount} comentários`}
          </Link>
        )}
      </div>

      <form className="post-comment-form" onSubmit={submitComment}>
        <input
          type="text"
          placeholder="Adicione um comentário..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        {commentText.trim() && <button type="submit">Publicar</button>}
      </form>
    </article>
  );
}
