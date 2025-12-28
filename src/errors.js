/**
 * MasalaScript Error Classes
 * Custom error types with Hinglish-style error messages
 */

// Base error class for all MasalaScript errors
export class MasalaError extends Error {
    constructor(message, line = null, column = null, type = 'Error') {
        super(message);
        this.name = 'MasalaError';
        this.line = line;
        this.column = column;
        this.type = type;
    }

    toString() {
        let location = '';
        if (this.line !== null) {
            location = ` (Line ${this.line}`;
            if (this.column !== null) {
                location += `, Column ${this.column}`;
            }
            location += ')';
        }
        return `${this.type}${location}: ${this.message}`;
    }
}

// Lexer errors - tokenization problems
export class LexerError extends MasalaError {
    constructor(message, line, column) {
        super(message, line, column, 'Galti ho gayi! Lexer Error');
        this.name = 'LexerError';
    }
}

// Parser errors - syntax problems
export class ParserError extends MasalaError {
    constructor(message, line, column) {
        super(message, line, column, 'Arrey bhai! Parser Error');
        this.name = 'ParserError';
    }
}

// Semantic errors - meaning/validation problems
export class SemanticError extends MasalaError {
    constructor(message, line, column) {
        super(message, line, column, 'Kya kar rahe ho! Semantic Error');
        this.name = 'SemanticError';
    }
}

// Runtime errors - execution problems
export class RuntimeError extends MasalaError {
    constructor(message, line = null) {
        super(message, line, null, 'Dhoom machale! Runtime Error');
        this.name = 'RuntimeError';
    }
}

// Error messages in Hinglish style
export const ErrorMessages = {
    // Lexer errors
    UNEXPECTED_CHARACTER: (char) => `Yeh character kya hai bhai? '${char}' samajh nahi aaya`,
    UNTERMINATED_STRING: () => `String khatam nahi hui - closing quote lagao!`,
    INVALID_NUMBER: (num) => `Yeh number galat hai: '${num}'`,

    // Parser errors
    EXPECTED_ACTION: () => `Program start karo 'Chal bhai suru kar' se - yeh toh basic hai!`,
    EXPECTED_PAISA_VASOOL: () => `Program end karo 'bas khatam karo' se - ending toh chahiye!`,
    EXPECTED_IDENTIFIER: () => `Yahan variable ka naam chahiye`,
    EXPECTED_EXPRESSION: () => `Yahan koi expression chahiye`,
    EXPECTED_LPAREN: () => `'(' lagana bhool gaye kya?`,
    EXPECTED_RPAREN: () => `')' lagana bhool gaye kya?`,
    EXPECTED_LBRACE: () => `'{' lagana bhool gaye kya?`,
    EXPECTED_RBRACE: () => `'}' lagana bhool gaye kya?`,
    EXPECTED_EQUALS: () => `'=' lagana bhool gaye kya?`,
    UNEXPECTED_TOKEN: (token) => `Yeh token yahan nahi aana chahiye: '${token}'`,
    INVALID_ASSIGNMENT_TARGET: () => `Assignment ka target galat hai - sirf variables mein assign kar sakte ho`,

    // Semantic errors
    UNDEFINED_VARIABLE: (name) => `Variable '${name}' define nahi hua hai - pehle 'maan lo' karo`,
    UNDEFINED_FUNCTION: (name) => `Function '${name}' define nahi hua hai`,
    ALREADY_DEFINED: (name) => `'${name}' toh pehle se define hai - duplicate mat karo!`,
    WRONG_ARG_COUNT: (name, expected, got) =>
        `Function '${name}' ko ${expected} arguments chahiye, tumne ${got} diye`,
    RETURN_OUTSIDE_FUNCTION: () => `'dialogue wapas do' sirf function ke andar use karo`,

    // Runtime errors
    DIVISION_BY_ZERO: () => `Zero se divide? Yeh toh impossible hai bhai!`,
    NOT_A_FUNCTION: (name) => `'${name}' function nahi hai - call mat karo`,
    NOT_A_NUMBER: (op) => `'${op}' operation ke liye numbers chahiye`,
    TYPE_ERROR: (expected, got) => `${expected} chahiye tha, ${got} mil gaya`,
    INVALID_OPERAND: (op) => `'${op}' ke saath yeh operands use nahi kar sakte`,
};

// Format error with source code context
export function formatErrorWithContext(error, sourceCode, contextLines = 2) {
    const lines = sourceCode.split('\n');
    let output = error.toString() + '\n\n';

    if (error.line !== null && error.line <= lines.length) {
        const startLine = Math.max(1, error.line - contextLines);
        const endLine = Math.min(lines.length, error.line + contextLines);

        for (let i = startLine; i <= endLine; i++) {
            const lineNum = String(i).padStart(4, ' ');
            const marker = i === error.line ? ' >> ' : '    ';
            output += `${lineNum}${marker}${lines[i - 1]}\n`;

            // Add column pointer
            if (i === error.line && error.column !== null) {
                const pointer = ' '.repeat(4 + 4 + error.column - 1) + '^';
                output += pointer + '\n';
            }
        }
    }

    return output;
}
