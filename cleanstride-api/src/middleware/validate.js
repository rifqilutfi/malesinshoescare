/**
 * Zod validation middleware factory.
 * Usage: validate(schema) where schema is a Zod object.
 */
function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = result.error;
      err.name = 'ZodError';
      return next(err);
    }
    req.validated = result.data;
    next();
  };
}

module.exports = validate;
