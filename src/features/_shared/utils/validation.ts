import { z } from "astro/zod";

export function formDataToObject(
	formData: FormData,
): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
	const obj: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

	for (const [key, value] of formData.entries()) {
		if (key in obj) {
			const currentValue = obj[key];

			if (!Array.isArray(currentValue)) {
				obj[key] = [currentValue, value];
			} else {
				currentValue.push(value);
			}
		} else {
			obj[key] = value;
		}
	}

	return obj;
}

export function parseSchema<T extends z.ZodTypeAny>(input: FormData, schema: T) {
	const fields = formDataToObject(input);
	const validation = schema.safeParse(fields);

	type InferedType = z.infer<T>;

	if (!validation.success) {
		const fieldErrors: Partial<Record<keyof InferedType, string>> = {};

		for (const issue of validation.error.issues) {
			const path = String(issue.path[0]) as keyof InferedType;
			if (path && !fieldErrors[path]) {
				fieldErrors[path] = issue.message;
			}
		}

		return {
			success: false as const,
			fields: fields as Partial<InferedType>,
			fieldErrors,
		};
	}

	return {
		success: true as const,
		fields: validation.data as InferedType,
		fieldErrors: null,
	};
}
