async function fetchWithTimeout(
	resource: RequestInfo | URL,
	options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
	const { timeout = 3000, ...fetchOptions } = options;

	try {
		return await fetch(resource, {
			...fetchOptions,
			signal: AbortSignal.timeout(timeout),
		});
	} catch (error: unknown) {
		if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
			console.warn(`Request to ${resource.toString()} timed out after ${timeout}ms.`);
		}
		throw error;
	}
}

type RequestInterceptor = (
	resource: RequestInfo | URL,
	options: RequestInit & { timeout?: number },
) => RequestInit & { timeout?: number };

type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export const interceptors = {
	request: {
		use: (fn: RequestInterceptor) => requestInterceptors.push(fn),
	},
	response: {
		use: (fn: ResponseInterceptor) => responseInterceptors.push(fn),
	},
};

export default async function request<T>(
	resource: RequestInfo | URL,
	options: RequestInit & { timeout?: number } = {},
): Promise<[T, null] | [null, Error]> {
	try {
		const finalOptions = requestInterceptors.reduce(
			(opts, interceptor) => interceptor(resource, opts),
			options,
		);

		const response = await fetchWithTimeout(resource, finalOptions);

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
		}

		const finalResponse = await responseInterceptors.reduce<Promise<Response>>(
			async (res, interceptor) => interceptor(await res),
			Promise.resolve(response),
		);

		const data = (await finalResponse.json()) as T;
		return [data, null];
	} catch (error: unknown) {
		return [
			null,
			error instanceof Error ? error : new Error("An unexpected non-error value was thrown"),
		];
	}
}
