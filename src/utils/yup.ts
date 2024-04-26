import * as yup from "yup";
import { ValidationError } from "yup";

// From Zod
const emailRegex =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;

yup.addMethod(yup.string, "email", function (message) {
  return this.matches(emailRegex, {
    name: "email",
    message,
    excludeEmptyString: true,
  });
});

export default yup;

export const getValidationErrors = (err: ValidationError) => {
  const validationErrors: ValidationErrorsObject = {};

  err.inner.forEach((error) => {
    if (error.path) {
      validationErrors[error.path] = { message: error.message };
    }
  });

  return validationErrors;
};

export type ValidationErrorsObject = {
  [key: string]: {
    message: string;
  };
};
