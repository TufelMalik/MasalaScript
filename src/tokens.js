/**
 * MasalaScript Token Types
 * Defines all tokens used in the language
 */

export const TokenType = {
    // Program boundaries
    ACTION: 'ACTION',                     // Chal bhai suru kar
    PAISA_VASOOL: 'PAISA_VASOOL',         // bas khatam karo

    // Variable declaration
    MAAN_LO: 'MAAN_LO',                   // maan lo

    // Control flow - conditionals
    AGAR_KISMAT_RAHI: 'AGAR_KISMAT_RAHI', // agar kismat rahi
    NAHI_TO: 'NAHI_TO',                   // nahi to
    WARNA: 'WARNA',                       // warna

    // Control flow - loops
    JAB_TAK_HAI_JAAN: 'JAB_TAK_HAI_JAAN', // jab tak hai jaan
    BREAK: 'BREAK',                       // me bahar ja raha hu

    // Functions
    CLIMAX: 'CLIMAX',                     // climax
    DIALOGUE_WAPAS_DO: 'DIALOGUE_WAPAS_DO', // dialogue wapas do

    // I/O
    EK_BAAT_BATAUN: 'EK_BAAT_BATAUN',     // ek baat bataun:

    // Literals
    NUMBER: 'NUMBER',                     // 10, 3.14
    STRING: 'STRING',                     // "hello"
    SACH: 'SACH',                         // true
    GALAT: 'GALAT',                       // false
    KHAALI: 'KHAALI',                     // null

    // Identifier
    IDENTIFIER: 'IDENTIFIER',             // variable/function names

    // Operators - Arithmetic
    PLUS: 'PLUS',                         // +
    MINUS: 'MINUS',                       // -
    STAR: 'STAR',                         // *
    SLASH: 'SLASH',                       // /
    PERCENT: 'PERCENT',                   // %

    // Operators - Comparison
    EQUAL_EQUAL: 'EQUAL_EQUAL',           // ==
    BANG_EQUAL: 'BANG_EQUAL',             // !=
    LESS: 'LESS',                         // <
    GREATER: 'GREATER',                   // >
    LESS_EQUAL: 'LESS_EQUAL',             // <=
    GREATER_EQUAL: 'GREATER_EQUAL',       // >=

    // Operators - Logical
    AND: 'AND',                           // &&
    OR: 'OR',                             // ||
    BANG: 'BANG',                         // !

    // Assignment
    EQUAL: 'EQUAL',                       // =

    // Punctuation
    LPAREN: 'LPAREN',                     // (
    RPAREN: 'RPAREN',                     // )
    LBRACE: 'LBRACE',                     // {
    RBRACE: 'RBRACE',                     // }
    COMMA: 'COMMA',                       // ,
    COLON: 'COLON',                       // :

    // Special
    EOF: 'EOF',                           // End of file
    NEWLINE: 'NEWLINE',                   // Line break (optional, for tracking)
};

// Multi-word keywords mapping (order matters - longer phrases first)
export const Keywords = {
    'Chal bhai suru kar': TokenType.ACTION,
    'bas khatam karo': TokenType.PAISA_VASOOL,
    'maan lo': TokenType.MAAN_LO,
    'agar kismat rahi': TokenType.AGAR_KISMAT_RAHI,
    'nahi to': TokenType.NAHI_TO,
    'warna': TokenType.WARNA,
    'jab tak hai jaan': TokenType.JAB_TAK_HAI_JAAN,
    'me bahar ja raha hu': TokenType.BREAK,
    'climax': TokenType.CLIMAX,
    'dialogue wapas do': TokenType.DIALOGUE_WAPAS_DO,
    'ek baat bataun:': TokenType.EK_BAAT_BATAUN,
    'sach': TokenType.SACH,
    'galat': TokenType.GALAT,
    'khaali': TokenType.KHAALI,
};

// Single character operators
export const SingleCharTokens = {
    '+': TokenType.PLUS,
    '-': TokenType.MINUS,
    '*': TokenType.STAR,
    '/': TokenType.SLASH,
    '%': TokenType.PERCENT,
    '(': TokenType.LPAREN,
    ')': TokenType.RPAREN,
    '{': TokenType.LBRACE,
    '}': TokenType.RBRACE,
    ',': TokenType.COMMA,
    ':': TokenType.COLON,
};

// Token class
export class Token {
    constructor(type, lexeme, literal, line, column) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.column = column;
    }

    toString() {
        return `Token(${this.type}, '${this.lexeme}', ${this.literal}, L${this.line}:C${this.column})`;
    }
}
