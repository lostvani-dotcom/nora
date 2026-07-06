const express = require("express");
const prisma = require("../prisma");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/:username", optionalAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          image: true,
          caption: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });

  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  let isFollowing = false;
  if (req.userId) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId, followingId: user.id } },
    });
    isFollowing = !!follow;
  }

  res.json({ user, isFollowing, isMe: req.userId === user.id });
});

router.post("/:id/follow", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.userId) {
    return res.status(400).json({ error: "Você não pode seguir a si mesmo." });
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return res.status(404).json({ error: "Usuário não encontrado." });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: req.userId, followingId: targetId } },
    create: { followerId: req.userId, followingId: targetId },
    update: {},
  });

  res.json({ following: true });
});

router.delete("/:id/follow", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  await prisma.follow
    .delete({
      where: { followerId_followingId: { followerId: req.userId, followingId: targetId } },
    })
    .catch(() => null);

  res.json({ following: false });
});

router.get("/:id/followers", async (req, res) => {
  const targetId = Number(req.params.id);
  const followers = await prisma.follow.findMany({
    where: { followingId: targetId },
    include: { follower: { select: { id: true, username: true, name: true, avatar: true } } },
  });
  res.json({ followers: followers.map((f) => f.follower) });
});

router.get("/:id/following", async (req, res) => {
  const targetId = Number(req.params.id);
  const following = await prisma.follow.findMany({
    where: { followerId: targetId },
    include: { following: { select: { id: true, username: true, name: true, avatar: true } } },
  });
  res.json({ following: following.map((f) => f.following) });
});

module.exports = router;
