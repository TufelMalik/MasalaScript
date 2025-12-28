/**
 * MasalaScript - Main Compiler Class
 * Orchestrates lexer, parser, analyzer, and interpreter
 */

import { Lexer, tokenize } from './lexer.js';
import { Parser, parse } from './parser.js';
import { Analyzer, analyze } from './analyzer.js';
import { Interpreter, execute } from './interpreter.js';
import { MasalaError, formatErrorWithContext } from './errors.js';
import { printAST } from './ast.js';

/**
 * Main MasalaScript compiler/interpreter class
 */
export class MasalaScript {
    constructor(options = {}) {
        this.options = {
            debug: false,           // Print debug info
            showTokens: false,      // Print token stream
            showAST: false,         // Print AST
            skipAnalysis: false,    // Skip semantic analysis
            ...options
        };

        this.lexer = null;
        this.parser = null;
        this.analyzer = new Analyzer();
        this.interpreter = new Interpreter();

        // Store compilation artifacts
        this.tokens = [];
        this.ast = null;
        this.output = [];
        this.errors = [];
    }

    /**
     * Run MasalaScript source code
     * @param {string} source - The source code
     * @returns {Object} Result object with output and any errors
     */
    run(source) {
        this.tokens = [];
        this.ast = null;
        this.output = [];
        this.errors = [];

        try {
            // Step 1: Tokenize
            if (this.options.debug) {
                console.log('🌶️ Tokenizing...');
            }
            this.lexer = new Lexer(source);
            this.tokens = this.lexer.tokenize();

            if (this.options.showTokens) {
                console.log('\n📝 Tokens:');
                this.tokens.forEach(t => console.log('  ', t.toString()));
            }

            // Step 2: Parse
            if (this.options.debug) {
                console.log('🌶️ Parsing...');
            }
            this.parser = new Parser(this.tokens);
            this.ast = this.parser.parse();

            if (this.options.showAST) {
                console.log('\n🌳 AST:');
                console.log(printAST(this.ast));
            }

            // Step 3: Semantic Analysis
            if (!this.options.skipAnalysis) {
                if (this.options.debug) {
                    console.log('🌶️ Analyzing...');
                }
                this.analyzer.analyze(this.ast);
            }

            // Step 4: Execute
            if (this.options.debug) {
                console.log('🌶️ Executing...\n');
            }
            this.output = this.interpreter.execute(this.ast);

            return {
                success: true,
                output: this.output,
                tokens: this.tokens,
                ast: this.ast
            };

        } catch (error) {
            this.errors.push(error);

            let errorMessage;
            if (error instanceof MasalaError) {
                errorMessage = formatErrorWithContext(error, source);
            } else {
                errorMessage = `Unexpected Error: ${error.message}`;
                if (this.options.debug) {
                    console.error(error.stack);
                }
            }

            return {
                success: false,
                error: errorMessage,
                errorObject: error,
                tokens: this.tokens,
                ast: this.ast
            };
        }
    }

    /**
     * Compile source code (tokenize + parse + analyze)
     * @param {string} source - The source code
     * @returns {Object} Compilation result
     */
    compile(source) {
        this.tokens = [];
        this.ast = null;
        this.errors = [];

        try {
            // Tokenize
            this.lexer = new Lexer(source);
            this.tokens = this.lexer.tokenize();

            // Parse
            this.parser = new Parser(this.tokens);
            this.ast = this.parser.parse();

            // Analyze
            this.analyzer.analyze(this.ast);

            return {
                success: true,
                tokens: this.tokens,
                ast: this.ast
            };

        } catch (error) {
            this.errors.push(error);

            let errorMessage;
            if (error instanceof MasalaError) {
                errorMessage = formatErrorWithContext(error, source);
            } else {
                errorMessage = `Unexpected Error: ${error.message}`;
            }

            return {
                success: false,
                error: errorMessage,
                errorObject: error,
                tokens: this.tokens,
                ast: this.ast
            };
        }
    }

    /**
     * Execute a pre-compiled AST
     * @param {Object} ast - The program AST
     * @returns {Object} Execution result
     */
    executeAST(ast) {
        try {
            this.output = this.interpreter.execute(ast);
            return {
                success: true,
                output: this.output
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                errorObject: error
            };
        }
    }

    /**
     * Get the version string
     */
    static get version() {
        return '1.0.0';
    }

    /**
     * Get language info
     */
    static get info() {
        return {
            name: 'MasalaScript',
            version: MasalaScript.version,
            fileExtension: '.ms',
            description: 'A Hinglish-inspired programming language'
        };
    }
}

// Export convenience functions
export { tokenize, parse, analyze, execute };

// Export error classes
export { MasalaError, formatErrorWithContext } from './errors.js';

// Export AST utilities
export { printAST, NodeType } from './ast.js';

// Export token types
export { TokenType } from './tokens.js';

// Default export
export default MasalaScript;
