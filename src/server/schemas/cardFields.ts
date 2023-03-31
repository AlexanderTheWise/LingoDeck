import { Joi } from "express-validation";

const cardFields = {
  body: Joi.object({
    front: Joi.string().max(40).required(),
    back: Joi.string().max(40).required(),
  }).unknown(),
};

export default cardFields;
