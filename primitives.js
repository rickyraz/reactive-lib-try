// deno-lint-ignore-file 

// 1.global context stack that will be used to keep track of any running Reactions or Derivations.
// 2. each Signal has its own subscriptions list. 
const context = [];

// These 2 things serve as the whole basis of automatic dependency tracking

//  A Reaction or Derivation on execution pushes itself onto the context stack. 
//  It will be added to the subscriptions list of any Signal read during that execution.

function subscribe(running, subscriptions) {
  subscriptions.add(running);
  running.dependencies.add(subscriptions);
}

export function createSignal(initialValue) {
  const subscriptions = new Set();
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
    context.push(running);
    try {
      fn();
    } finally {
      context.pop();
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
// const [count, setCount] = createSignal(0);

// console.log("2. Create Reaction");
// createEffect(() => console.log("The count is", count()));

// console.log("3. Set count to 5");
// setCount(5);

// console.log("4. Set count to 10");
// setCount(10);
