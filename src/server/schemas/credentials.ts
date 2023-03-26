import { Joi } from "express-validation";

const credentials = {
  body: Joi.object({
    username: Joi.string().alphanum().min(8).max(24).required(),
    password: Joi.string().alphanum().min(8).max(24).required(),
  }),
};

export default credentials;
