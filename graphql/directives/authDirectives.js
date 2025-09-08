const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { defaultFieldResolver } = require("graphql");
const { ForbiddenError } = require("../utils/errors");
const { requireAuth, requireRole } = require("../utils/auth");

function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const isAuthDirective = getDirective(schema, fieldConfig, "isAuth")?.[0];
      const hasRoleDirective = getDirective(schema, fieldConfig, "hasRole")?.[0];

      if (isAuthDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          requireAuth(context); // throws if not logged in
          return resolve.call(this, source, args, context, info);
        };
        return fieldConfig;
      }

      if (hasRoleDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        const requiredRole = hasRoleDirective.role;
        fieldConfig.resolve = async function (source, args, context, info) {
          requireRole(context, [requiredRole]);
          return resolve.call(this, source, args, context, info);
        };
        return fieldConfig;
      }
    },
  });
}

module.exports = { authDirectiveTransformer };
