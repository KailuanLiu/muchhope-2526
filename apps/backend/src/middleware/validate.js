const { ZodError } = require("zod");

function validate(schema) {
  return function (req, res, next) {
    try {
      // checks if the req.body match the body schema
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // checks if the req.params match params schema
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // checks if the req.query match query schema
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid request",
          details: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
