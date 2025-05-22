// Global context stack to track running reactions or derivations
type ReactiveContext = Effect | MemoComputation;
const context: ReactiveContext[] = [];

// Interface for a reactive computation (effect or memo)
interface ReactiveComputation {
	execute: () => void;
	dependencies: Set<Set<ReactiveComputation>>;
}

// Interface for a Signal
interface Signal<T> {
	read: () => T;
	write: (value: T) => void;
}

// Interface for an Effect
interface Effect extends ReactiveComputation {
	// No additional properties for now, but extensible
}

// Interface for a Memo's internal computation
interface MemoComputation extends ReactiveComputation {
	// No additional properties for now, but extensible
}

// Subscribe a running computation to a signal's subscriptions
function subscribe(
	running: ReactiveContext,
	subscriptions: Set<ReactiveComputation>,
): void {
	subscriptions.add(running);
	running.dependencies.add(subscriptions);
}

// Create a Signal with automatic dependency tracking
export function createSignal<T>(
	initialValue: T,
): [() => T, (value: T) => void] {
	const subscriptions = new Set<ReactiveComputation>();
	let value: T = initialValue;

	const read = (): T => {
		const running = context[context.length - 1];
		if (running) {
			subscribe(running, subscriptions);
		}
		return value;
	};

	const write = (nextValue: T): void => {
		value = nextValue;
		// Create a copy to avoid mutation during iteration
		for (const sub of [...subscriptions]) {
			sub.execute();
		}
	};

	return [read, write];
}

// Clean up dependencies for a running computation
function cleanup(running: ReactiveComputation): void {
	for (const dep of running.dependencies) {
		dep.delete(running);
	}
	running.dependencies.clear();
}

// Create an Effect that re-runs when its dependencies change
export function createEffect(fn: () => void): void {
	const execute = (): void => {
		cleanup(running);
		context.push(running);
		try {
			fn();
		} finally {
			context.pop();
		}
	};

	const running: Effect = {
		execute,
		dependencies: new Set<Set<ReactiveComputation>>(),
	};

	execute();
}

// Create a Memo that caches a computed value and updates when dependencies change
export function createMemo<T>(fn: () => T): () => T {
	const [read, set] = createSignal<T>(fn()); // Initialize with fn() result
	createEffect(() => set(fn()));
	return read;
}
