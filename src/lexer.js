/**
 * MasalaScript Lexer (Tokenizer)
 * Converts source code into a stream of tokens
 */

import { Token, TokenType, Keywords, SingleCharTokens } from './tokens.js';
import { LexerError, ErrorMessages } from './errors.js';

export class Lexer {
    constructor(source) {
        this.source = source;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.column = 1;
        this.startColumn = 1;
    }

    /**
     * Tokenize the entire source code
     * @returns {Token[]} Array of tokens
     */
    tokenize() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.startColumn = this.column;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, '', null, this.line, this.column));
        return this.tokens;
    }

    /**
     * Scan a single token
     */
    scanToken() {
        // Skip whitespace and comments
        if (this.skipWhitespaceAndComments()) {
            return;
        }

        // Try to match multi-word keywords first
        if (this.matchKeyword()) {
            return;
        }

        const char = this.advance();

        // Single character tokens
        if (SingleCharTokens[char]) {
            this.addToken(SingleCharTokens[char]);
            return;
        }

        // Two-character operators
        switch (char) {
            case '=':
                if (this.match('=')) {
                    this.addToken(TokenType.EQUAL_EQUAL);
                } else {
                    this.addToken(TokenType.EQUAL);
                }
                return;
            case '!':
                if (this.match('=')) {
                    this.addToken(TokenType.BANG_EQUAL);
                } else {
                    this.addToken(TokenType.BANG);
                }
                return;
            case '<':
                if (this.match('=')) {
                    this.addToken(TokenType.LESS_EQUAL);
                } else {
                    this.addToken(TokenType.LESS);
                }
                return;
            case '>':
                if (this.match('=')) {
                    this.addToken(TokenType.GREATER_EQUAL);
                } else {
                    this.addToken(TokenType.GREATER);
                }
                return;
            case '&':
                if (this.match('&')) {
                    this.addToken(TokenType.AND);
                } else {
                    throw new LexerError(
                        ErrorMessages.UNEXPECTED_CHARACTER(char),
                        this.line,
                        this.startColumn
                    );
                }
                return;
            case '|':
                if (this.match('|')) {
                    this.addToken(TokenType.OR);
                } else {
                    throw new LexerError(
                        ErrorMessages.UNEXPECTED_CHARACTER(char),
                        this.line,
                        this.startColumn
                    );
                }
                return;
        }

        // String literals
        if (char === '"') {
            this.string();
            return;
        }

        // Number literals
        if (this.isDigit(char)) {
            this.number();
            return;
        }

        // Identifiers
        if (this.isAlpha(char)) {
            this.identifier();
            return;
        }

        throw new LexerError(
            ErrorMessages.UNEXPECTED_CHARACTER(char),
            this.line,
            this.startColumn
        );
    }

    /**
     * Skip whitespace and comments
     * @returns {boolean} True if something was skipped
     */
    skipWhitespaceAndComments() {
        const startPos = this.current;

        while (!this.isAtEnd()) {
            const char = this.peek();

            switch (char) {
                case ' ':
                case '\t':
                case '\r':
                    this.advance();
                    break;
                case '\n':
                    this.line++;
                    this.column = 0;
                    this.advance();
                    break;
                case '/':
                    if (this.peekNext() === '/') {
                        // Comment - skip until end of line
                        while (this.peek() !== '\n' && !this.isAtEnd()) {
                            this.advance();
                        }
                    } else {
                        return this.current !== startPos;
                    }
                    break;
                default:
                    return this.current !== startPos;
            }
        }

        return this.current !== startPos;
    }

    /**
     * Try to match a multi-word keyword
     * @returns {boolean} True if a keyword was matched
     */
    matchKeyword() {
        // Sort keywords by length (longest first) to match greedily
        const sortedKeywords = Object.keys(Keywords).sort((a, b) => b.length - a.length);

        for (const keyword of sortedKeywords) {
            const remaining = this.source.slice(this.current);

            if (remaining.toLowerCase().startsWith(keyword.toLowerCase())) {
                // Check if it's a complete word (not part of a larger identifier)
                const endPos = this.current + keyword.length;
                const nextChar = this.source[endPos];

                // For keywords ending with special chars like 'action!' or 'ek baat bataun:'
                // we don't need to check for word boundary
                const endsWithSpecial = /[!:]$/.test(keyword);

                if (endsWithSpecial || !nextChar || !this.isAlphaNumeric(nextChar)) {
                    // Consume the keyword
                    for (let i = 0; i < keyword.length; i++) {
                        this.advance();
                    }
                    this.addToken(Keywords[keyword]);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Parse a string literal
     */
    string() {
        const startLine = this.line;
        const startCol = this.startColumn;

        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
                this.column = 0;
            }
            // Handle escape sequences
            if (this.peek() === '\\' && this.peekNext() !== undefined) {
                this.advance(); // skip backslash
            }
            this.advance();
        }

        if (this.isAtEnd()) {
            throw new LexerError(
                ErrorMessages.UNTERMINATED_STRING(),
                startLine,
                startCol
            );
        }

        // Consume closing quote
        this.advance();

        // Extract string value (without quotes)
        let value = this.source.slice(this.start + 1, this.current - 1);

        // Process escape sequences
        value = value
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '\r')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

        this.addToken(TokenType.STRING, value);
    }

    /**
     * Parse a number literal
     */
    number() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        // Look for decimal part
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance(); // consume '.'

            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        const lexeme = this.source.slice(this.start, this.current);
        const value = parseFloat(lexeme);

        if (isNaN(value)) {
            throw new LexerError(
                ErrorMessages.INVALID_NUMBER(lexeme),
                this.line,
                this.startColumn
            );
        }

        this.addToken(TokenType.NUMBER, value);
    }

    /**
     * Parse an identifier
     */
    identifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const text = this.source.slice(this.start, this.current);

        // Check if it's a single-word keyword
        const tokenType = Keywords[text.toLowerCase()] || TokenType.IDENTIFIER;
        this.addToken(tokenType, tokenType === TokenType.IDENTIFIER ? text : null);
    }

    /**
     * Check if at end of source
     */
    isAtEnd() {
        return this.current >= this.source.length;
    }

    /**
     * Advance to next character
     */
    advance() {
        const char = this.source[this.current];
        this.current++;
        this.column++;
        return char;
    }

    /**
     * Peek at current character without consuming
     */
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    /**
     * Peek at next character
     */
    peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    /**
     * Match and consume a character if it matches
     */
    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] !== expected) return false;

        this.current++;
        this.column++;
        return true;
    }

    /**
     * Check if character is a digit
     */
    isDigit(char) {
        return char >= '0' && char <= '9';
    }

    /**
     * Check if character is alphabetic or underscore
     */
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            char === '_';
    }

    /**
     * Check if character is alphanumeric
     */
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }

    /**
     * Add a token to the list
     */
    addToken(type, literal = null) {
        const lexeme = this.source.slice(this.start, this.current);
        this.tokens.push(new Token(type, lexeme, literal, this.line, this.startColumn));
    }
}

/**
 * Convenience function to tokenize source code
 */
export function tokenize(source) {
    const lexer = new Lexer(source);
    return lexer.tokenize();
}
