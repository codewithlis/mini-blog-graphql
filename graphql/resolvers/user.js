// graphql/resolvers/user.js
const User = require("../../models/User");
const Post = require("../../models/Post");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { createUserSchema, validate } = require("../utils/validations");

module.exports = {
  Query: {
    getUsers: async () => User.find(),
    getUserById: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) throw new NotFoundError("User not found");
      return user;
    },
  },
  Mutation: {
    createUser: async (_, args) => {
      try {
        await validate(createUserSchema, args);
        const user = new User(args.input);
        return await user.save();
      } catch (e) {
        // If came from Yup, normalize to our ValidationError
        if (e.name === "ValidationError") {
          throw new ValidationError("Invalid user input", e.details);
        }
        throw e;
      }
    },
  },
User: {
  posts: (parent, _, { loaders }) => loaders.postsByAuthorLoader.load(parent.id),
},
};
