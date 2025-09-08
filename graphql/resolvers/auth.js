const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { signToken } = require("../utils/auth");
const { ValidationError, AppError } = require("../utils/errors");
const { validate, signupSchema, loginSchema } = require("../utils/validations");

module.exports = {
  Mutation: {
    signup: async (_, args) => {
      try {
        await validate(signupSchema, args);
        const { name, email, role, password } = args.input;

        const exists = await User.findOne({ email });
        if (exists) {
          throw new ValidationError("Email already in use", [
            { path: "input.email", message: "Email already in use" },
          ]);
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, role, password: hash });

        const token = signToken(user);
        return { token, user };
      } catch (e) {
        if (e.name === "ValidationError") {
          throw new ValidationError("Invalid signup input", e.details || []);
        }
        throw e;
      }
    },

    login: async (_, args) => {
      try {
        await validate(loginSchema, args);
        const { email, password } = args.input;

        const user = await User.findOne({ email });
        if (!user) {
          throw new ValidationError("Invalid credentials", [
            { path: "input.email", message: "Invalid email or password" },
          ]);
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          throw new ValidationError("Invalid credentials", [
            { path: "input.password", message: "Invalid email or password" },
          ]);
        }

        const token = signToken(user);
        return { token, user };
      } catch (e) {
        if (e.name === "ValidationError") {
          throw new ValidationError("Invalid login input", e.details || []);
        }
        throw new AppError("Login failed");
      }
    },
  },
};
