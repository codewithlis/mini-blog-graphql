// graphql/resolvers/comment.js
const Comment = require("../../models/Comment");
const User = require("../../models/User");
const Post = require("../../models/Post");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { createCommentSchema, validate } = require("../utils/validations");
const { requireAuth } = require("../utils/auth");
module.exports = {
  Mutation: {
    createComment: async (_, args, ctx) => {

      const me= requireAuth(ctx)
      try {
        await validate(createCommentSchema, args);
        const [author, post] = await Promise.all([
          User.findById(args.input.authorId),
          Post.findById(args.input.postId),
        ]);
        if (!author) throw new NotFoundError("Author not found");
        if (!post) throw new NotFoundError("Post not found");

        const comment = new Comment({
          ...args.input,
          author: args.input.authorId,
          post: args.input.postId,
        });
        return await comment.save();
      } catch (e) {
        if (e.name === "ValidationError") {
          throw new ValidationError("Invalid comment input", e.details);
        }
        throw e;
      }
    },
  },
Comment: {
  author: (parent, _, { loaders }) => loaders.userLoader.load(parent.author),
  post: (parent, _, { loaders }) => loaders.postLoader.load(parent.post),
},

};
