// export const createSignal = (value) => {
// 	const read = () => value;
// 	const write = (nextValue) => (value = nextValue);
// 	return [read, write];
// };

export const createSignal = (initialValue) => {
	let currentValue = initialValue;

	const read = () => currentValue;

	const write = (nextValue) => {
		currentValue = nextValue;
	};

	return [read, write];
};

const [count, setCount] = createSignal(3);
console.log("Initial Read", count());

setCount(90);
console.log("Updated Read", count());

setCount(count() * 2);
console.log("Updated Read", count());
