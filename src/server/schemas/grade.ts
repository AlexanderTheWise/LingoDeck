import { Joi } from "express-validation";

const grade = {
  body: Joi.object({
    grade: Joi.number().integer().min(0).max(5),
  }),
};

export default grade;
