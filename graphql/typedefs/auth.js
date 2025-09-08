const { gql } = require('graphql-tag')

module.exports = gql`
    type AuthPayload{
        token: String!
        user: User!
    }

    input SignupInput{
        name: String!
        email: String!
        role: Role!
        password: String!
    }

    input LoginInput{
        email: String!
        password: String!
    }

    input LoginInput{
        email: String!
        password: String!
    }

    extend type Mutation{
        signup(input: SignupInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
    }
`