// graphql/resolvers/post.js
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const User = require("../../models/User");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { createPostSchema, validate } = require("../utils/validations");
const { requireRole } = require('../utils/auth')
module.exports = {
  Query: {
    // Offset-based
    getPosts: async (_, { category, search, limit, offset }) => {
      const filter = {};
      if (category) filter.category = category;
      if (search) filter.title = { $regex: search, $options: "i" };

      return Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },
      // Cursor-based
    getPostsConnection: async (_, { category, search, first, after }) => {
      const filter = {};
      if (category) filter.category = category;
      if (search) filter.title = { $regex: search, $options: "i" };
      if (after) filter._id = { $lt: after }; // pagination cursor

      const posts = await Post.find(filter)
        .sort({ _id: -1 })
        .limit(first + 1); // fetch one extra to check hasNextPage

      const edges = posts.slice(0, first).map((post) => ({
        cursor: post._id.toString(),
        node: post,
      }));

      const hasNextPage = posts.length > first;
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

      const totalCount = await Post.countDocuments(filter);

      return {
        edges,
        pageInfo: { endCursor, hasNextPage },
        totalCount,
      };
    },

    getPostById: async (_, { id }) => {
      const post = await Post.findById(id);
      if (!post) throw new NotFoundError("Post not found");
      return post;
    },


  // Query: {
  //   getPosts: async(_, { category }) =>
  //     {return category ? Post.find({ category }) : Post.find();},
  //   getPostById: async (_, { id }) => {
  //     const post = await Post.findById(id);
  //     if (!post) throw new NotFoundError("Post not found");
  //     return post;
  //   },
  },
  Mutation: {
    createPost: async (_, args, ctx) => {
      const me = requireRole(ctx, ['AUTHOR','ADMIN'])
      try {
        await validate(createPostSchema, args);
        // ensure author exists
        const authorExists = await User.exists({_id:args.input.authorId});
        if (!authorExists) throw new NotFoundError("Author not found");
        const post = new Post({
          ...args.input,
          author: args.input.authorId,
        });
        return await post.save();
      } catch (e) {
        if (e.name === "ValidationError") {
          throw new ValidationError("Invalid post input", e.details);
        }
        throw e;
      }
    },
  },

  // Field resolvers for Post
  // Post: {
  //   author: (parent) => User.findById(parent.author),
  //   comments: (parent) => Comment.find({ post: parent.id }),
  // },
Post: {
  author: (parent, _, { loaders }) => loaders.userLoader.load(parent.author),
  comments: (parent, _, { loaders }) => loaders.commentsByPostLoader.load(parent.id),
  postCategory: (parent) => parent.category,
},
};
