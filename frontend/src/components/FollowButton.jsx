import { useState } from "react";
import { api } from "../api/client";

export default function FollowButton({ userId, initialFollowing, onChange }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (following) {
        await api.unfollow(userId);
        setFollowing(false);
        onChange && onChange(false);
      } else {
        await api.follow(userId);
        setFollowing(true);
        onChange && onChange(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`follow-btn ${following ? "following" : ""}`}
      onClick={toggle}
      disabled={busy}
    >
      {following ? "Seguindo" : "Seguir"}
    </button>
  );
}
