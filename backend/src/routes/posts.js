const express = require("express");
const prisma = require("../prisma");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const upload = require("../upload");

const router = express.Router();

const authorSelect = { id: true, username: true, name: true, avatar: true };

async function attachLikeInfo(posts, userId) {
  if (!userId) {
    return posts.map((p) => ({ ...p, isLiked: false }));
  }
  const likes = await prisma.like.findMany({
    where: { userId, postId: { in: posts.map((p) => p.id) } },
    select: { postId: true },
  });
  const likedSet = new Set(likes.map((l) => l.postId));
  return posts.map((p) => ({ ...p, isLiked: likedSet.has(p.id) }));
}

router.get("/", optionalAuth, async (req, res) => {
  const scope = req.query.scope === "following" && req.userId ? "following" : "all";

  let where = {};
  if (scope === "following") {
    const follows = await prisma.follow.findMany({
      where: { followerId: req.userId },
      select: { followingId: true },
    });
    const ids = follows.map((f) => f.followingId);
    ids.push(req.userId);
    where = { authorId: { in: ids } };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: authorSelect },
      _count: { select: { likes: true, comments: true } },
    },
  });

  res.json({ posts: await attachLikeInfo(posts, req.userId) });
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Imagem é obrigatória." });
  }

  const post = await prisma.post.create({
    data: {
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || null,
      authorId: req.userId,
    },
    include: {
      author: { select: authorSelect },
      _count: { select: { likes: true, comments: true } },
    },
  });

  res.status(201).json({ post: { ...post, isLiked: false } });
});

router.get("/:id", optionalAuth, async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: authorSelect },
      _count: { select: { likes: true, comments: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: authorSelect } },
      },
    },
  });

  if (!post) return res.status(404).json({ error: "Post não encontrado." });

  const [withLikeInfo] = await attachLikeInfo([post], req.userId);
  res.json({ post: withLikeInfo });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "Post não encontrado." });
  if (post.authorId !== req.userId) {
    return res.status(403).json({ error: "Você não pode excluir este post." });
  }
  await prisma.post.delete({ where: { id } });
  res.json({ success: true });
});

router.post("/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: "Post não encontrado." });

  await prisma.like.upsert({
    where: { userId_postId: { userId: req.userId, postId } },
    create: { userId: req.userId, postId },
    update: {},
  });

  const count = await prisma.like.count({ where: { postId } });
  res.json({ isLiked: true, count });
});

router.delete("/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  await prisma.like
    .delete({ where: { userId_postId: { userId: req.userId, postId } } })
    .catch(() => null);

  const count = await prisma.like.count({ where: { postId } });
  res.json({ isLiked: false, count });
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Comentário não pode ser vazio." });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: "Post não encontrado." });

  const comment = await prisma.comment.create({
    data: { text: text.trim(), userId: req.userId, postId },
    include: { user: { select: authorSelect } },
  });

  res.status(201).json({ comment });
});

module.exports = router;
