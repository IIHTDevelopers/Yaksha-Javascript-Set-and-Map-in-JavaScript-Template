// Creating a Set and adding elements
var fruitsSet = new Set();
fruitsSet.add('apple');
fruitsSet.add('banana');
fruitsSet.add('cherry');
console.log(fruitsSet); // Set { 'apple', 'banana', 'cherry' }

// Removing an element from Set
fruitsSet.delete('banana');
console.log(fruitsSet); // Set { 'apple', 'cherry' }

// Checking if an element exists in Set
console.log(fruitsSet.has('apple')); // true
console.log(fruitsSet.has('banana')); // false

// Creating a Map and adding key-value pairs
var fruitsMap = new Map();
fruitsMap.set('apple', 1);
fruitsMap.set('banana', 2);
fruitsMap.set('cherry', 3);
console.log(fruitsMap); // Map { 'apple' => 1, 'banana' => 2, 'cherry' => 3 }

// Removing a key-value pair from Map
fruitsMap.delete('banana');
console.log(fruitsMap); // Map { 'apple' => 1, 'cherry' => 3 }

// Checking if a key exists in Map
console.log(fruitsMap.has('apple')); // true
console.log(fruitsMap.has('banana')); // false
