// graphql/loaders/index.js
const DataLoader = require("dataloader");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");

// Batch users by IDs
const userLoader = () =>
  new DataLoader(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = {};
    users.forEach((u) => (userMap[u.id] = u));
    return userIds.map((id) => userMap[id] || null);
  });

// Batch posts by IDs
const postLoader = () =>
  new DataLoader(async (postIds) => {
    const posts = await Post.find({ _id: { $in: postIds } });
    const postMap = {};
    posts.forEach((p) => (postMap[p.id] = p));
    return postIds.map((id) => postMap[id] || null);
  });

// Batch comments by postId
const commentsByPostLoader = () =>
  new DataLoader(async (postIds) => {
    const comments = await Comment.find({ post: { $in: postIds } });
    const map = {};
    postIds.forEach((id) => (map[id] = []));
    comments.forEach((c) => map[c.post].push(c));
    return postIds.map((id) => map[id]);
  });

// Batch posts by authorId
const postsByAuthorLoader = () =>
  new DataLoader(async (authorIds) => {
    const posts = await Post.find({ author: { $in: authorIds } });
    const map = {};
    authorIds.forEach((id) => (map[id] = []));
    posts.forEach((p) => map[p.author].push(p));
    return authorIds.map((id) => map[id]);
  });

module.exports = {
  userLoader,
  postLoader,
  commentsByPostLoader,
  postsByAuthorLoader,
};
