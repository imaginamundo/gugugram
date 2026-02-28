import { z } from "astro:schema";

export function formDataToObject(formData: FormData): Record<string, any> {
	const obj: Record<string, any> = {};
	for (const [key, value] of formData.entries()) {
		if (obj.hasOwnProperty(key)) {
			if (!Array.isArray(obj[key])) {
				obj[key] = [obj[key]];
			}
			obj[key].push(value);
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
