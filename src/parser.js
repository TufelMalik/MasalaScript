/**
 * MasalaScript Parser
 * Recursive descent parser that builds an AST from tokens
 */

import { TokenType } from './tokens.js';
import { AST, NodeType } from './ast.js';
import { ParserError, ErrorMessages } from './errors.js';

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    /**
     * Parse the token stream into an AST
     * @returns {Object} Program AST node
     */
    parse() {
        return this.program();
    }

    /**
     * Parse a complete program
     * program → "action!" statement* "paisa vasool"
     */
    program() {
        // Expect 'action!' at the start
        if (!this.check(TokenType.ACTION)) {
            throw new ParserError(
                ErrorMessages.EXPECTED_ACTION(),
                this.peek().line,
                this.peek().column
            );
        }
        this.advance(); // consume 'action!'

        const statements = [];

        // Parse statements until 'paisa vasool' or EOF
        while (!this.check(TokenType.PAISA_VASOOL) && !this.isAtEnd()) {
            const stmt = this.declaration();
            if (stmt) {
                statements.push(stmt);
            }
        }

        // Expect 'paisa vasool' at the end
        if (!this.check(TokenType.PAISA_VASOOL)) {
            throw new ParserError(
                ErrorMessages.EXPECTED_PAISA_VASOOL(),
                this.peek().line,
                this.peek().column
            );
        }
        this.advance(); // consume 'paisa vasool'

        return AST.Program(statements);
    }

    /**
     * Parse a declaration (function or statement)
     */
    declaration() {
        try {
            // Function declaration
            if (this.check(TokenType.CLIMAX)) {
                return this.functionDeclaration();
            }

            // Variable declaration
            if (this.check(TokenType.MAAN_LO)) {
                return this.variableDeclaration();
            }

            return this.statement();
        } catch (error) {
            // Synchronize on error
            this.synchronize();
            throw error;
        }
    }

    /**
     * Parse a function declaration
     * funcDecl → "climax" IDENTIFIER "(" params? ")" block
     */
    functionDeclaration() {
        const line = this.peek().line;
        this.advance(); // consume 'climax'

        // Function name
        if (!this.check(TokenType.IDENTIFIER)) {
            throw new ParserError(
                ErrorMessages.EXPECTED_IDENTIFIER(),
                this.peek().line,
                this.peek().column
            );
        }
        const name = this.advance().lexeme;

        // Parameters
        this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());

        const params = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                if (!this.check(TokenType.IDENTIFIER)) {
                    throw new ParserError(
                        ErrorMessages.EXPECTED_IDENTIFIER(),
                        this.peek().line,
                        this.peek().column
                    );
                }
                params.push(this.advance().lexeme);
            } while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());

        // Function body
        this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
        const body = this.block();

        return AST.FunctionDeclaration(name, params, body, line);
    }

    /**
     * Parse a variable declaration
     * varDecl → "maan lo" IDENTIFIER "=" expression
     */
    variableDeclaration() {
        const line = this.peek().line;
        this.advance(); // consume 'maan lo'

        // Variable name
        if (!this.check(TokenType.IDENTIFIER)) {
            throw new ParserError(
                ErrorMessages.EXPECTED_IDENTIFIER(),
                this.peek().line,
                this.peek().column
            );
        }
        const name = this.advance().lexeme;

        // Assignment
        this.consume(TokenType.EQUAL, ErrorMessages.EXPECTED_EQUALS());
        const value = this.expression();

        return AST.VariableDeclaration(name, value, line);
    }

    /**
     * Parse a statement
     */
    statement() {
        // If statement
        if (this.check(TokenType.AGAR_KISMAT_RAHI)) {
            return this.ifStatement();
        }

        // While loop
        if (this.check(TokenType.JAB_TAK_HAI_JAAN)) {
            return this.whileStatement();
        }

        // Return statement
        if (this.check(TokenType.DIALOGUE_WAPAS_DO)) {
            return this.returnStatement();
        }

        // Print statement
        if (this.check(TokenType.EK_BAAT_BATAUN)) {
            return this.printStatement();
        }

        // Block
        if (this.check(TokenType.LBRACE)) {
            this.advance();
            return this.block();
        }

        // Expression statement (including assignments)
        return this.expressionStatement();
    }

    /**
     * Parse an if statement
     * ifStmt → "agar kismat rahi" "(" expression ")" block 
     *          ("nahi to" "(" expression ")" block)*
     *          ("warna" block)?
     */
    ifStatement() {
        const line = this.peek().line;
        const conditions = [];
        const consequents = [];
        let alternate = null;

        // First condition (agar kismat rahi)
        this.advance(); // consume 'agar kismat rahi'
        this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
        conditions.push(this.expression());
        this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
        this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
        consequents.push(this.block());

        // Else-if clauses (nahi to)
        while (this.check(TokenType.NAHI_TO)) {
            this.advance(); // consume 'nahi to'
            this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
            conditions.push(this.expression());
            this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
            this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
            consequents.push(this.block());
        }

        // Else clause (warna)
        if (this.check(TokenType.WARNA)) {
            this.advance(); // consume 'warna'
            this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
            alternate = this.block();
        }

        return AST.IfStatement(conditions, consequents, alternate, line);
    }

    /**
     * Parse a while loop
     * whileStmt → "jab tak hai jaan" "(" expression ")" block
     */
    whileStatement() {
        const line = this.peek().line;
        this.advance(); // consume 'jab tak hai jaan'

        this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
        const condition = this.expression();
        this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
        this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
        const body = this.block();

        return AST.WhileStatement(condition, body, line);
    }

    /**
     * Parse a return statement
     * returnStmt → "dialogue wapas do" expression?
     */
    returnStatement() {
        const line = this.peek().line;
        this.advance(); // consume 'dialogue wapas do'

        let value = null;
        // Check if there's an expression to return
        if (!this.check(TokenType.RBRACE) &&
            !this.check(TokenType.PAISA_VASOOL) &&
            !this.isAtEnd()) {
            value = this.expression();
        }

        return AST.ReturnStatement(value, line);
    }

    /**
     * Parse a print statement
     * printStmt → "ek baat bataun:" expression ("," expression)*
     */
    printStatement() {
        const line = this.peek().line;
        this.advance(); // consume 'ek baat bataun:'

        const expressions = [];
        expressions.push(this.expression());

        while (this.match(TokenType.COMMA)) {
            expressions.push(this.expression());
        }

        return AST.PrintStatement(expressions, line);
    }

    /**
     * Parse a block of statements
     * block → "{" statement* "}"
     */
    block() {
        const statements = [];

        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            const stmt = this.declaration();
            if (stmt) {
                statements.push(stmt);
            }
        }

        this.consume(TokenType.RBRACE, ErrorMessages.EXPECTED_RBRACE());
        return AST.Block(statements);
    }

    /**
     * Parse an expression statement
     */
    expressionStatement() {
        const line = this.peek().line;
        const expr = this.expression();
        return AST.ExpressionStatement(expr, line);
    }

    /**
     * Parse an expression
     * expression → assignment
     */
    expression() {
        return this.assignment();
    }

    /**
     * Parse an assignment
     * assignment → IDENTIFIER "=" assignment | logicOr
     */
    assignment() {
        const expr = this.logicOr();

        if (this.match(TokenType.EQUAL)) {
            const value = this.assignment();

            if (expr.type === NodeType.IDENTIFIER) {
                return AST.Assignment(expr.name, value, expr.line);
            }

            throw new ParserError(
                ErrorMessages.INVALID_ASSIGNMENT_TARGET(),
                this.previous().line,
                this.previous().column
            );
        }

        return expr;
    }

    /**
     * Parse logical OR
     * logicOr → logicAnd ("||" logicAnd)*
     */
    logicOr() {
        let expr = this.logicAnd();

        while (this.match(TokenType.OR)) {
            const operator = this.previous().lexeme;
            const right = this.logicAnd();
            expr = AST.BinaryExpression(operator, expr, right, this.previous().line);
        }

        return expr;
    }

    /**
     * Parse logical AND
     * logicAnd → equality ("&&" equality)*
     */
    logicAnd() {
        let expr = this.equality();

        while (this.match(TokenType.AND)) {
            const operator = this.previous().lexeme;
            const right = this.equality();
            expr = AST.BinaryExpression(operator, expr, right, this.previous().line);
        }

        return expr;
    }

    /**
     * Parse equality
     * equality → comparison (("==" | "!=") comparison)*
     */
    equality() {
        let expr = this.comparison();

        while (this.match(TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
            const operator = this.previous().lexeme;
            const right = this.comparison();
            expr = AST.BinaryExpression(operator, expr, right, this.previous().line);
        }

        return expr;
    }

    /**
     * Parse comparison
     * comparison → term (("<" | ">" | "<=" | ">=") term)*
     */
    comparison() {
        let expr = this.term();

        while (this.match(TokenType.LESS, TokenType.GREATER,
            TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL)) {
            const operator = this.previous().lexeme;
            const right = this.term();
            expr = AST.BinaryExpression(operator, expr, right, this.previous().line);
        }

        return expr;
    }

    /**
     * Parse term (addition/subtraction)
     * term → factor (("+" | "-") factor)*
     */
    term() {
        let expr = this.factor();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().lexeme;
            const right = this.factor();
            expr = AST.BinaryExpression(operator, expr, right, this.previous().line);
        }

        return expr;
    }

    /**
     * Parse factor (multiplication/division/modulo)
     * factor → unary (("*" | "/" | "%") unary)*
     */
    factor() {
        let expr = this.unary();

        while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
            const operator = this.previous().lexeme;
            const right = this.unary();
            expr = AST.BinaryExpression(operator, expr, right, this.previous().line);
        }

        return expr;
    }

    /**
     * Parse unary expressions
     * unary → ("!" | "-") unary | call
     */
    unary() {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous().lexeme;
            const operand = this.unary();
            return AST.UnaryExpression(operator, operand, this.previous().line);
        }

        return this.call();
    }

    /**
     * Parse function calls
     * call → primary ("(" arguments? ")")*
     */
    call() {
        let expr = this.primary();

        while (true) {
            if (this.match(TokenType.LPAREN)) {
                expr = this.finishCall(expr);
            } else {
                break;
            }
        }

        return expr;
    }

    /**
     * Finish parsing a function call
     */
    finishCall(callee) {
        const args = [];

        if (!this.check(TokenType.RPAREN)) {
            do {
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }

        const paren = this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());

        // Get callee name if it's an identifier
        const calleeName = callee.type === NodeType.IDENTIFIER ? callee.name : '<expr>';
        return AST.CallExpression(calleeName, args, paren.line);
    }

    /**
     * Parse primary expressions
     * primary → NUMBER | STRING | "sach" | "galat" | "khaali" 
     *         | IDENTIFIER | "(" expression ")"
     */
    primary() {
        const line = this.peek().line;

        // Boolean true
        if (this.match(TokenType.SACH)) {
            return AST.Literal(true, line);
        }

        // Boolean false
        if (this.match(TokenType.GALAT)) {
            return AST.Literal(false, line);
        }

        // Null
        if (this.match(TokenType.KHAALI)) {
            return AST.Literal(null, line);
        }

        // Number
        if (this.match(TokenType.NUMBER)) {
            return AST.Literal(this.previous().literal, line);
        }

        // String
        if (this.match(TokenType.STRING)) {
            return AST.Literal(this.previous().literal, line);
        }

        // Identifier
        if (this.match(TokenType.IDENTIFIER)) {
            return AST.Identifier(this.previous().lexeme, line);
        }

        // Grouping
        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
            return AST.Grouping(expr, line);
        }

        throw new ParserError(
            ErrorMessages.EXPECTED_EXPRESSION(),
            this.peek().line,
            this.peek().column
        );
    }

    // ==================== Helper Methods ====================

    /**
     * Check if at end of tokens
     */
    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }

    /**
     * Get current token without consuming
     */
    peek() {
        return this.tokens[this.current];
    }

    /**
     * Get previous token
     */
    previous() {
        return this.tokens[this.current - 1];
    }

    /**
     * Advance to next token and return current
     */
    advance() {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    }

    /**
     * Check if current token matches a type
     */
    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    /**
     * Match and consume if current token matches any of the given types
     */
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    /**
     * Consume a token of expected type or throw error
     */
    consume(type, errorMessage) {
        if (this.check(type)) {
            return this.advance();
        }

        throw new ParserError(
            errorMessage,
            this.peek().line,
            this.peek().column
        );
    }

    /**
     * Synchronize parser state after an error
     */
    synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            // Synchronize at statement boundaries
            switch (this.peek().type) {
                case TokenType.MAAN_LO:
                case TokenType.CLIMAX:
                case TokenType.AGAR_KISMAT_RAHI:
                case TokenType.JAB_TAK_HAI_JAAN:
                case TokenType.EK_BAAT_BATAUN:
                case TokenType.DIALOGUE_WAPAS_DO:
                case TokenType.PAISA_VASOOL:
                    return;
            }

            this.advance();
        }
    }
}

/**
 * Convenience function to parse tokens
 */
export function parse(tokens) {
    const parser = new Parser(tokens);
    return parser.parse();
}
