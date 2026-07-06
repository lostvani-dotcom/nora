import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    api
      .getProfile(username)
      .then((res) => {
        setData(res);
        setName(res.user.name || "");
        setBio(res.user.bio || "");
      })
      .catch((err) => setError(err.message));
  }, [username]);

  useEffect(() => {
    setData(null);
    setEditing(false);
    load();
  }, [load]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await api.updateProfile(formData);
      updateUser(res.user);
      setEditing(false);
      setAvatarFile(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <p className="auth-error">{error}</p>;
  if (!data) return <p className="feed-empty">Carregando...</p>;

  const { user, isFollowing, isMe } = data;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <Avatar src={user.avatar} name={user.name || user.username} size={96} />
        </div>

        <div className="profile-info">
          <div className="profile-info-top">
            <h2>{user.username}</h2>
            {isMe ? (
              <button className="follow-btn following" onClick={() => setEditing((v) => !v)}>
                {editing ? "Cancelar" : "Editar perfil"}
              </button>
            ) : (
              <FollowButton userId={user.id} initialFollowing={isFollowing} />
            )}
          </div>

          <div className="profile-stats">
            <span>
              <strong>{user._count.posts}</strong> publicações
            </span>
            <span>
              <strong>{user._count.followers}</strong> seguidores
            </span>
            <span>
              <strong>{user._count.following}</strong> seguindo
            </span>
          </div>

          {!editing && (
            <div className="profile-bio">
              <strong>{user.name}</strong>
              {user.bio && <p>{user.bio}</p>}
            </div>
          )}

          {editing && (
            <form className="profile-edit-form" onSubmit={handleSaveProfile}>
              <button
                type="button"
                className="link-btn"
                onClick={() => fileInputRef.current.click()}
              >
                Alterar foto do perfil
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={(e) => setAvatarFile(e.target.files[0] || null)}
              />
              <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </form>
          )}
        </div>
      </div>

      <hr className="profile-divider" />

      {user.posts.length === 0 ? (
        <p className="feed-empty">Nenhuma publicação ainda.</p>
      ) : (
        <div className="profile-grid">
          {user.posts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id} className="profile-grid-item">
              <img src={fileUrl(post.image)} alt={post.caption || "post"} />
              <div className="profile-grid-overlay">
                <span>❤️ {post._count.likes}</span>
                <span>💬 {post._count.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
