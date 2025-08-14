const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const app = express();

// =======================
// 1. Schema
// =======================
const typeDefs = gql`
  enum Role {
    ADMIN
    AUTHOR
    READER
  }

  enum PostCategory {
    TECHNOLOGY
    LIFESTYLE
    EDUCATION
  }

  interface Content {
    id: ID!
    createdAt: String!
    updatedAt: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    posts: [Post]
  }

  type Post implements Content {
    id: ID!
    createdAt: String!
    updatedAt: String
    title: String!
    body: String!
    category: PostCategory!
    author: User!
    comments: [Comment]
  }

  type Comment implements Content {
    id: ID!
    createdAt: String!
    updatedAt: String
    text: String!
    author: User!
    post: Post!
  }

  # Input Types for cleaner mutations
  input CreateUserInput {
    name: String!
    email: String!
    role: Role!
  }

  input CreatePostInput {
    title: String!
    body: String!
    category: PostCategory!
    authorId: ID!
  }

  input CreateCommentInput {
    text: String!
    authorId: ID!
    postId: ID!
  }

  type Query {
    getUsers: [User]
    getUserById(id: ID!): User
    getPosts(category: PostCategory): [Post]
    getPostById(id: ID!): Post
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    createPost(input: CreatePostInput!): Post
    createComment(input: CreateCommentInput!): Comment
  }
`;

// =======================
// 2. Sample In-Memory Data
// =======================
let users = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "AUTHOR" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "READER" },
];

let posts = [
  {
    id: "1",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    title: "GraphQL Basics",
    body: "This is an intro to GraphQL",
    category: "TECHNOLOGY",
    authorId: "1",
  },
];

let comments = [
  {
    id: "1",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    text: "Great article!",
    authorId: "2",
    postId: "1",
  },
];

// =======================
// 3. Resolvers
// =======================
const resolvers = {
  Query: {
    getUsers: () => users,
    getUserById: (_, { id }) => users.find((u) => u.id === id),
    getPosts: (_, { category }) => {
      return category
        ? posts.filter((p) => p.category === category)
        : posts;
    },
    getPostById: (_, { id }) => posts.find((p) => p.id === id),
  },

  Mutation: {
    createUser: (_, { input }) => {
      const newUser = { id: String(users.length + 1), ...input };
      users.push(newUser);
      return newUser;
    },

    createPost: (_, { input }) => {
      const newPost = {
        id: String(posts.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: null,
        ...input,
      };
      posts.push(newPost);
      return newPost;
    },

    createComment: (_, { input }) => {
      const newComment = {
        id: String(comments.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: null,
        ...input,
      };
      comments.push(newComment);
      return newComment;
    },
  },

  // Interface resolver
  Content: {
    __resolveType(obj) {
      if (obj.title) return "Post";
      if (obj.text) return "Comment";
      return null;
    },
  },

  // Relationship resolvers
  User: {
    posts: (parent) => posts.filter((p) => p.authorId === parent.id),
  },
  Post: {
    author: (parent) => users.find((u) => u.id === parent.authorId),
    comments: (parent) => comments.filter((c) => c.postId === parent.id),
  },
  Comment: {
    author: (parent) => users.find((u) => u.id === parent.authorId),
    post: (parent) => posts.find((p) => p.id === parent.postId),
  },
};

// =======================
// 4. Start Server
// =======================
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();
