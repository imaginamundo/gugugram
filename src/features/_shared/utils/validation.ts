import { z } from "astro:schema";

export function parseSchema<T extends z.ZodTypeAny = z.ZodNever>(
	input: FormData,
	Schema: T,
):
	| { success: true; fields: z.output<T>; fieldErrors: {} }
	| {
			success: false;
			fields: z.output<T>;
			fieldErrors: { [key in keyof z.output<T>]?: string };
	  } {
	const fields = formDataToObject(input);
	const validation = Schema.safeParse(fields);

	if (!validation.success) {
		const fieldErrors: { [K in keyof z.output<T>]?: string } = {};

		for (const issue of validation.error.issues) {
			const path = issue.path[0] as keyof z.output<T>;
			if (path && !fieldErrors[path]) {
				fieldErrors[path] = issue.message;
			}
		}

		return {
			fields,
			fieldErrors,
			success: false,
		};
	}

	return { fields, fieldErrors: {}, success: true };
}

export function formDataToObject(formData: FormData): Record<string, any> {
	const obj: Record<string, any> = {};
	for (const key of formData.keys()) {
		const values = formData.getAll(key);
		obj[key] = values.length > 1 ? values : values[0];
	}
	return obj;
}
