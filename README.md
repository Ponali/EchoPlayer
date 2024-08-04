# EchoPlayer
EchoPlayer is a "quine game engine", a tool for generating code that outputs its own code, but at the same time, plays a game or anything else for you. When it generates a quine game, the generated code is not limited to a specified javascript runtime: it has support for both the Node.JS terminal and modern browsers.
## Parameters
To run EchoPlayer, make sure Node.js is installed and run `node index.js [parameters]`

Add the input file by adding `-i` or `--input` then the input file path.
You can specify whever to minify the output code or not by adding `-m` or `--minify`.
You can specify whever to run the final code directly after generating the code by adding `-r` or `--run` and then adding either `node` or `browser`.
You can specify what to name the output file by adding `-o` or `--output` then add the output file path after.
## Examples
There exists an "examples" folder full of sample javascript files to showcase what EchoPlayer can do:
- `test.js`: Does not have a specific use case other than using every API function and testing 24-bit color.