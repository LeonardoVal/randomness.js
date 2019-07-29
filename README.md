# @creatartis/randomness.js

Pseudo-random number generation functions and utilities for everything that 
Javascript's own `Math.random()` falls short of covering, which is a lot. 

It includes:

+ The class `Randomness` with useful methods like `randomInt`, `choice`, 
`shuffle`, etc.

+ Pseudo-random number generators based on the simple 
[_linear congruential_ algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator) 
algorithm, and the more complex
[_Mersenne twister_ algorithm](http://en.wikipedia.org/wiki/Mersenne_twister#Pseudocode).
Both generators can be seeded properly. 

## License

Open source under an [MIT license](LICENSE.md) (see LICENSE.md).