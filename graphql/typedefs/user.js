// graphql/typedefs/user.js
const { gql } = require("graphql-tag");

module.exports = gql`
  enum Role {
    AUTHOR
    READER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post]
    role: Role!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: Role!
  }

  extend type Query {
    getUsers: [User]  @hasRole(role: ADMIN)
    getUserById(id: ID!): User @isAuth
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User
  }
`;
