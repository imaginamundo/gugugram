import { useFormState } from "react-hook-form";

export default function useFormErrors(control: any) {
  const { errors } = useFormState({ control });

  const fieldError = (fieldName: string) => {
    const hasError = !!errors[fieldName];

    const errorProps = {
      error: errors[fieldName]?.message ?? "Erro erro não tratado :(",
      "aria-invalid": hasError,
    };

    return hasError ? errorProps : {};
  };

  return fieldError;
}
