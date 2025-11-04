/**
 * Wraps a function so that it can only be executed once.
 * After the first call, the original function reference is cleared.
 *
 * @param fn - The function to be executed only once.
 * @returns A new function that will call `fn` only the first time it's invoked.
 */
export function once<T extends Event>(fn: (event: T) => void) {
	return function (this: unknown, event: T) {
		if (fn) fn.call(this, event);
		fn = null as any;
	};
}

/**
 * Wraps a function so that `event.preventDefault()` is called
 * before executing the wrapped function.
 *
 * @param fn - The function to execute after preventing the default event behavior.
 * @returns A new function that first calls `preventDefault()` and then executes `fn`.
 */
export function preventDefault<T extends Event>(fn: (event: T) => void) {
	return function (this: unknown, event: T) {
		event.preventDefault();
		fn.call(this, event);
	};
}
