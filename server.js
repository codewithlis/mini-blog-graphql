// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const connectDB = require("./db");

const userTypeDefs = require("./graphql/typedefs/user");
const postTypeDefs = require("./graphql/typedefs/post");
const commentTypeDefs = require("./graphql/typedefs/comment");

const userResolvers = require("./graphql/resolvers/user");
const postResolvers = require("./graphql/resolvers/post");
const commentResolvers = require("./graphql/resolvers/comment");

const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const authTypeDefs = require("./graphql/typedefs/auth")
const authResolvers = require("./graphql/resolvers/auth");
const { getTokenFromReq, verifyToken } = require("./graphql/utils/auth");
// add at the top
const playground = require('graphql-playground-middleware-express').default;

const directivesTypeDefs = require("./graphql/typedefs/directives");
const { authDirectiveTransformer } = require("./graphql/directives/authDirectives");

const { userLoader, postLoader, commentsByPostLoader, postsByAuthorLoader } = require("./graphql/loaders")

// 1) Base root types
const rootSDL = /* GraphQL */ `
  type Query
  type Mutation
`;

// 2) Merge SDL & resolvers
const typeDefs = mergeTypeDefs([
  rootSDL,
  directivesTypeDefs,
  userTypeDefs,
  postTypeDefs,
  commentTypeDefs,
  authTypeDefs
]);
const resolvers = mergeResolvers([
  userResolvers,
  postResolvers,
  commentResolvers,
  authResolvers
]);

// 3) Build executable schema (GraphQL Tools)
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

schema = authDirectiveTransformer(schema);

// Optional: central error formatter (Apollo Server v4)
function formatError(formattedError, error) {
  // Preserve known/intentional codes, hide internals otherwise
  const code = formattedError.extensions?.code || "INTERNAL_SERVER_ERROR";

  // Mask internal messages
  if (code === "INTERNAL_SERVER_ERROR") {
    return {
      message: "Unexpected server error",
      err: error.message,
      locations: formattedError.locations,
      path: formattedError.path,
      extensions: { code },
    };
  }

  // Keep validation details if present
  if (code === "BAD_USER_INPUT" && error?.extensions?.details) {
    return {
      ...formattedError,
      extensions: {
        ...formattedError.extensions,
        details: error.extensions.details, // array: { path, message }
      },
    };
  }

  return formattedError;
}

async function start() {
  await connectDB();

  const app = express();

  app.get('/playground', playground({ endpoint: '/graphql' }));

  const server = new ApolloServer({
    schema,
    // Recommended for AS4 to return 400 on variable coercion issues
    status400ForVariableCoercionErrors: true,
    formatError, // custom formatter
  });
  await server.start();

app.use(
  '/graphql',
  express.json(),
expressMiddleware(server, {
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";
    let user = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        user = verifyToken(token);
      } catch (err) {
        console.log("JWT error:", err.message);
      }
    }

    return {
      user,
      loaders: {
        userLoader: userLoader(),
        postLoader: postLoader(),
        commentsByPostLoader: commentsByPostLoader(),
        postsByAuthorLoader: postsByAuthorLoader(),
      },
    };
  },
})
);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(' Server ready at http://localhost:4000/graphql')
    console.log(' Playground ready at http://localhost:4000/playground')

  });
}

start();
