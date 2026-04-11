import { z } from "astro/zod";

export function formDataToObject(
	formData: FormData,
): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
	const obj = Object.create(null) as Record<string, FormDataEntryValue | FormDataEntryValue[]>;

	for (const [key, value] of formData.entries()) {
		if (Object.hasOwn(obj, key)) {
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

	type InferredType = z.infer<T>;

	if (!validation.success) {
		const _root: string[] = [];
		const fieldErrors: Partial<Record<keyof InferredType, string>> = {};

		for (const issue of validation.error.issues) {
			if (issue.path.length === 0) {
				_root.push(issue.message);
			} else {
				const path = String(issue.path[0]) as keyof InferredType;
				if (!fieldErrors[path]) fieldErrors[path] = issue.message;
			}
		}

		return {
			success: false as const,
			fields: fields as Partial<InferredType>,
			fieldErrors: { ...fieldErrors, _root },
		};
	}

	return {
		success: true as const,
		fields: validation.data as InferredType,
		fieldErrors: null,
	};
}
