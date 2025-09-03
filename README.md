# JavaScript Interpreter
A JavaScript interpreter written in TypeScript using PEG.js for parsing and executing JavaScript code. This project allows you to run JavaScript code in a controlled environment, making it a useful educational tool for learning how interpreters work.

## Features
- Parse and execute JavaScript code
- Modular TypeScript architecture for easy expansion
- Includes unit tests using Jest
- Safe environment for running scripts

## Installation
Clone the repository:
git clone https://github.com/azoulgami/JavaScript-interpreter.git
cd JavaScript-interpreter

Install dependencies:
npm install

## Usage
Edit the entry point (src/main.ts) to test your JavaScript code. Run the interpreter:
npm start

## Running Tests
Run tests using Jest:
npm test

## Hosting on the Web
Yes, you can host this interpreter as a web app so users can run JavaScript code in their browser. Steps:
1. Compile TypeScript - Convert your TypeScript files into a single JavaScript bundle using tsc, Vite, or Webpack.
2. Create a front-end interface - Make an index.html file with a <textarea> for inputting JavaScript code, a <button> to execute the code, and a <div> to display output.
3. Deploy online
   - GitHub Pages: Push your compiled JS and index.html to the repository and enable Pages.
   - Vercel or Netlify: Connect your GitHub repo and deploy; both host static front-end apps for free.
   - CodeSandbox or StackBlitz: Import your repository and it runs instantly in the browser.

## Contributing
Contributions are welcome! Fork the repo, make your changes, and submit a pull request.

## License
MIT License
