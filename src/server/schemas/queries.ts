import { Joi } from "express-validation";

const queries = {
  query: Joi.object({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
    language: Joi.string()
      .regex(/^[A-Z][a-zA-Z]*$/)
      .optional(),
  }),
};

export default queries;
