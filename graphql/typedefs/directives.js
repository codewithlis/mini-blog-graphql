const { gql } = require("graphql-tag");

module.exports = gql`
  directive @isAuth on FIELD_DEFINITION
  directive @hasRole(role: Role!) on FIELD_DEFINITION
`;
