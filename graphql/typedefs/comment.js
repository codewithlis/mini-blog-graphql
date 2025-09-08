// graphql/typedefs/comment.js
const { gql } = require("graphql-tag");

module.exports = gql`
  type Comment {
    id: ID!
    author: User!
    post: Post!
    text: String!
    createdAt: String!
    updatedAt: String
  }

  input CreateCommentInput {
    authorId: ID!
    postId: ID!
    text: String!
  }

  extend type Mutation {
    createComment(input: CreateCommentInput!): Comment @isAuth
  }
`;
