// deno-lint-ignore-file 

// 1.global context stack that will be used to keep track of any running Reactions or Derivations.
/**
 * Not related Exmp Using Arrays as Stacks :: 
 * 
 * const stack = [];
 * stack.push(1); // Add to top: [1]
 * stack.push(2); // Add to top: [1, 2]
 * console.log(stack.pop()); // Remove from top: 2, stack is now [1]
 * console.log(stack.pop()); // Remove from top: 1, stack is now [] 
 * 
 * Context ::
 * 
 *  The context array is a global stack used to track the currently executing Reaction (created by createEffect) or Derivation (created by createMemo).
 *  It keeps track of which effect or memo is currently running so that any Signal read during its execution can register it as a dependency.
 */

// 2. each Signal has its own subscriptions list. 
/**
 * Every Signal created by createSignal maintains its own Set of subscriptions,
 * which are the reactions or derivations that depend on it. When a signal’s value changes,
 * it notifies all subscribed reactions/derivations to re-execute.
 */
const context = [];

// These 2 things serve as the whole basis of automatic dependency tracking
/**
 *  The combination of the global context stack (Comment 1) and the per-signal subscriptions list (Comment 2) enables "automatic dependency tracking".
 *  This means the system automatically figures out which signals a reaction or derivation depends on without the developer explicitly declaring dependencies.
 */

//  A Reaction or Derivation on execution pushes itself onto the context stack.
/**
 *  When a reaction (created by createEffect) or derivation (created by createMemo) runs,
 *  it adds itself to the global context stack to indicate it’s the currently active computation.
 * 
 *  This allows signals to know which reaction/derivation depends on them during execution.
 */ 

//  It will be added to the subscriptions list of any Signal read during that execution.
/**
 * While a reaction or derivation is executing (and is on the context stack),
 * any signal it reads will add it to its subscriptions set.
 * 
 * This links the signal to the reaction/derivation, so the signal knows to notify it when its value changes.
 */

function subscribe(running, subscriptions) {
  subscriptions.add(running);
  running.dependencies.add(subscriptions);
}

export function createSignal(initialValue) {
  const subscriptions = new Set(); // set sendiri
  let value = initialValue

  const read = () => {
    const running = context[context.length - 1];
    if (running) subscribe(running, subscriptions);
    return value;
  };

  const write = (nextValue) => {
    value = nextValue;

    for (const sub of [...subscriptions]) {
      sub.execute();
    }
  };
  return [read, write];
}

function cleanup(running) {
  for (const dep of running.dependencies) {
    dep.delete(running);
  }
  running.dependencies.clear();
}



export function createEffect(fn) {
  const execute = () => {
    cleanup(running);
    context.push(running); // Push the running effect onto the stack
    try {
      fn();
    } finally {
      context.pop();  // Pop it off when done
    }
  };

  const running = {
    execute,
    dependencies: new Set()
  };

  execute();
}

export function createMemo(fn) {
  const [s, set] = createSignal();
  createEffect(() => set(fn()));
  return s;
}


///------------------------------

// console.log("1. Create Signal");
const [count, setCount] = createSignal(0); // Creates a signal with value 0

// console.log("2. Create Reaction");
createEffect(() => console.log("The count is", count())); // Creates an effect that logs the count

// console.log("3. Set count to 5");
setCount(5); // Updates count to 5, triggers the effect to log "The count is 5"

// console.log("4. Set count to 10");
setCount(10); // Updates count to 10, triggers the effect to log "The count is 10"