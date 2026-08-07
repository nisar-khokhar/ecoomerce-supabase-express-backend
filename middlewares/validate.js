const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = validatedData.body ?? req.body;
    req.params = validatedData.params ?? req.params;
    req.query = validatedData.query ?? req.query;

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.issues ?? [],
    });
  }
};

module.exports = validate;
