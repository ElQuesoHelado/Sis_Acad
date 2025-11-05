/**
 * Wraps a function so it can only be executed once.
 *
 * @param fn - The function to be executed only once.
 * @returns A new function that calls `fn` only the first time.
 */
export function once<T extends Event>(fn: (event: T) => void) {
	let hasBeenCalled = false;

	return function (this: unknown, event: T) {
		if (hasBeenCalled) return;
		hasBeenCalled = true;
		fn.call(this, event);
	};
}

/**
 * Wraps a function to call `event.preventDefault()` before execution.
 *
 * @param fn - The function to execute after preventing default.
 * @returns A new function that first calls `preventDefault()` and then `fn`.
 */
export function preventDefault<T extends Event>(fn: (event: T) => void) {
	return function (this: unknown, event: T) {
		event.preventDefault();
		fn.call(this, event);
	};
}
