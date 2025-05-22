import { createEffect, createMemo, createSignal } from "./primitives.js";

console.log("1. Create");
const [firstName, _setFirstName] = createSignal("John");
const [lastName, setLastName] = createSignal("Smith");
const [showFullName, setShowFullName] = createSignal(true);

const displayName = createMemo(() => {
	if (!showFullName()) return firstName();
	return `${firstName()} ${lastName()}`;
});

createEffect(() => console.log("My name is", displayName()));

console.log("2. Set showFullName: false ");
setShowFullName(false);

console.log("3. Change lastName");
setLastName("Legend");
/**
 * No Batching:
 * if you call setFirstName("Jane") and setLastName("Doe") in the same function, the memo and effect may re-run twice instead of once, reducing efficiency.
 */

console.log("4. Set showFullName: true");
setShowFullName(true);

/**
 * No Custom Disposal Methods:
 *
 * Meaning: There’s no explicit way to manually stop or dispose of an effect or memo. The cleanup function only removes dependencies when an effect re-runs, but there’s no API to destroy an effect entirely.
 * Impact: Effects run indefinitely unless their dependencies are removed naturally (e.g., by not reading a signal anymore). This could lead to memory leaks if effects are created dynamically without cleanup.
 * In advanced libraries: Libraries provide APIs like onCleanup (Solid.js) or stop (Svelte) to manually dispose of reactive computations.
 */

// >> our library doesn't have batching, custom disposal methods, or safeguards against infinite recursion, <<

// Hopefully, through this exercise, you now have a better understanding and appreciation of
// --- how auto-tracking in fine-grained reactive libraries work and we have demystified(Mengungkap misteri) some of the magic.
// - The context stack, which tracks the current effect/memo.
// - Signals’ subscriptions sets, which link signals to their dependent effects/memos.
// - The interplay of read and write operations to propagate changes.

// By using the context array as a stack, the system dynamically builds a dependency graph without requiring developers to manually declare dependencies.
