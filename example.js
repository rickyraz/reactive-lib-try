import { createEffect, createMemo, createSignal } from "./primitives.js";

console.log("1. Create");
const [firstName, _setFirstName] = createSignal("John");
const [lastName, setLastName] = createSignal("Smith");
const [showFullName, setShowFullName] = createSignal(true);

const displayName = createMemo(() => {
  if (!showFullName()) return firstName();
  return `${firstName()} ${lastName()}`
});

createEffect(() => console.log("My name is", displayName()));

console.log("2. Set showFullName: false ");
setShowFullName(false);

console.log("3. Change lastName");
setLastName("Legend");

console.log("4. Set showFullName: true");
setShowFullName(true);

// our library doesn't have batching, custom disposal methods, or safeguards against infinite recursion,

// Hopefully, through this exercise, you now have a better understanding and appreciation of 
// --- how auto-tracking in fine-grained reactive libraries work and we have demystified(Mengungkap misteri) some of the magic.