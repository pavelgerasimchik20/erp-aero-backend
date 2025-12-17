import Joi from "joi";

const authValidation = {
  signup: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    password: Joi.string().min(6).max(100).required(),
  }).or("email", "phone"),

  signin: Joi.object({
    id: Joi.string().required().messages({
      "string.empty": "ID is required",
      "any.required": "ID is required",
    }),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid input data",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    next();
  };
}

export { authValidation, validate };

export default {
  authValidation,
  validate,
};
