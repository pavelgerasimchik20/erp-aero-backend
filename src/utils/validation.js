import { object, string } from "joi";

const authValidation = {
  signup: object({
    email: string().email().optional(),
    phone: string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    password: string().min(6).max(100).required(),
  }).or("email", "phone"),

  signin: object({
    id: string().required().messages({
      "string.empty": "ID is required",
      "any.required": "ID is required",
    }),
    password: string().required(),
  }),

  refreshToken: object({
    refreshToken: string().required(),
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

export default {
  authValidation,
  validate,
};
