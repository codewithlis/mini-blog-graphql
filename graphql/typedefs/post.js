// graphql/typedefs/post.js
const { gql } = require("graphql-tag");

module.exports = gql`
  enum PostCategory {
    TECHNOLOGY
    LIFESTYLE
    EDUCATION
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    author: User
    comments: [Comment]
    postCategory: PostCategory!
    createdAt: String!
    updatedAt: String
  }

   # Cursor-based pagination types
  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }


  input CreatePostInput {
    title: String!
    body: String!
    authorId: ID!
    category: PostCategory!
  }

  extend type Query {
       # Offset-based pagination
    getPosts(
      category: PostCategory
      search: String
      limit: Int = 10
      offset: Int = 0
    ): [Post]

    # Cursor-based pagination
    getPostsConnection(
      category: PostCategory
      search: String
      first: Int = 5
      after: String
    ): PostConnection

    getPostById(id: ID!): Post
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post @hasRole(role: AUTHOR)
  }
`;
