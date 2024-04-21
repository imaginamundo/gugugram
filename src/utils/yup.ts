import * as yup from "yup";

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
