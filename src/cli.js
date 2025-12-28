#!/usr/bin/env node

/**
 * MasalaScript CLI
 * Command-line interface for running .ms files
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { MasalaScript } from './masalascript.js';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

/**
 * Print colored output
 */
function print(color, text) {
    console.log(`${color}${text}${colors.reset}`);
}

/**
 * Print the banner
 */
function printBanner() {
    print(colors.cyan, `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🌶️  MasalaScript v${MasalaScript.version}                               ║
║       A Hinglish-inspired programming language               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

/**
 * Print usage information
 */
function printUsage() {
    console.log(`
${colors.bright}Usage:${colors.reset}
  masalascript <file.ms> [options]
  node cli.js <file.ms> [options]

${colors.bright}Options:${colors.reset}
  --help, -h        Show this help message
  --version, -v     Show version number
  --debug, -d       Enable debug mode (show tokens and AST)
  --tokens          Show token stream
  --ast             Show Abstract Syntax Tree

${colors.bright}Examples:${colors.reset}
  masalascript hello.ms
  masalascript examples/factorial.ms --debug
  node src/cli.js examples/grade-checker.ms

${colors.bright}File Extension:${colors.reset}
  MasalaScript files use the .ms extension

${colors.bright}Quick Start:${colors.reset}
  Create a file 'hello.ms' with:
    action!
    ek baat bataun: "Namaste, duniya!"
    paisa vasool

  Then run:
    masalascript hello.ms
`);
}

/**
 * Print version
 */
function printVersion() {
    print(colors.green, `MasalaScript v${MasalaScript.version}`);
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
    const options = {
        file: null,
        help: false,
        version: false,
        debug: false,
        showTokens: false,
        showAST: false,
    };

    for (const arg of args) {
        if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else if (arg === '--version' || arg === '-v') {
            options.version = true;
        } else if (arg === '--debug' || arg === '-d') {
            options.debug = true;
            options.showTokens = true;
            options.showAST = true;
        } else if (arg === '--tokens') {
            options.showTokens = true;
        } else if (arg === '--ast') {
            options.showAST = true;
        } else if (!arg.startsWith('-')) {
            options.file = arg;
        }
    }

    return options;
}

/**
 * Run a MasalaScript file
 */
function runFile(filePath, options) {
    // Resolve full path
    const fullPath = resolve(filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
        print(colors.red, `❌ File not found: ${filePath}`);
        process.exit(1);
    }

    // Check file extension
    const ext = extname(fullPath);
    if (ext !== '.ms') {
        print(colors.yellow, `⚠️  Warning: Expected .ms extension, got '${ext}'`);
    }

    // Read file
    let source;
    try {
        source = readFileSync(fullPath, 'utf-8');
    } catch (error) {
        print(colors.red, `❌ Error reading file: ${error.message}`);
        process.exit(1);
    }

    // Create compiler instance
    const masala = new MasalaScript({
        debug: options.debug,
        showTokens: options.showTokens,
        showAST: options.showAST,
    });

    // Run the code
    print(colors.cyan, `🌶️  Running: ${filePath}\n`);

    const result = masala.run(source);

    if (!result.success) {
        print(colors.red, '\n❌ Execution failed:');
        console.log(result.error);
        process.exit(1);
    }

    print(colors.green, '\n✅ Paisa vasool! Program completed successfully.');
}

/**
 * Start REPL mode (interactive)
 */
function startREPL() {
    printBanner();
    print(colors.yellow, 'Interactive mode coming soon! Use file execution for now.\n');
    printUsage();
}

/**
 * Main entry point
 */
function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    // Handle help
    if (options.help) {
        printBanner();
        printUsage();
        process.exit(0);
    }

    // Handle version
    if (options.version) {
        printVersion();
        process.exit(0);
    }

    // Run file or start REPL
    if (options.file) {
        runFile(options.file, options);
    } else {
        startREPL();
    }
}

// Run main
main();
