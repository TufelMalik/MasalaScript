/**
 * MasalaScript Browser Bundle
 * Self-contained version for browser usage
 */

(function (global) {
    'use strict';

    // ==================== ERRORS ====================

    class MasalaError extends Error {
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

    class LexerError extends MasalaError {
        constructor(message, line, column) {
            super(message, line, column, 'Galti ho gayi! Lexer Error');
            this.name = 'LexerError';
        }
    }

    class ParserError extends MasalaError {
        constructor(message, line, column) {
            super(message, line, column, 'Arrey bhai! Parser Error');
            this.name = 'ParserError';
        }
    }

    class SemanticError extends MasalaError {
        constructor(message, line, column) {
            super(message, line, column, 'Kya kar rahe ho! Semantic Error');
            this.name = 'SemanticError';
        }
    }

    class RuntimeError extends MasalaError {
        constructor(message, line = null) {
            super(message, line, null, 'Dhoom machale! Runtime Error');
            this.name = 'RuntimeError';
        }
    }

    const ErrorMessages = {
        UNEXPECTED_CHARACTER: (char) => `Yeh character kya hai bhai? '${char}' samajh nahi aaya`,
        UNTERMINATED_STRING: () => `String khatam nahi hui - closing quote lagao!`,
        INVALID_NUMBER: (num) => `Yeh number galat hai: '${num}'`,
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
        INVALID_ASSIGNMENT_TARGET: () => `Assignment ka target galat hai`,
        UNDEFINED_VARIABLE: (name) => `Variable '${name}' define nahi hua hai - pehle 'maan lo' karo`,
        UNDEFINED_FUNCTION: (name) => `Function '${name}' define nahi hua hai`,
        ALREADY_DEFINED: (name) => `'${name}' toh pehle se define hai - duplicate mat karo!`,
        WRONG_ARG_COUNT: (name, expected, got) => `Function '${name}' ko ${expected} arguments chahiye, tumne ${got} diye`,
        RETURN_OUTSIDE_FUNCTION: () => `'dialogue wapas do' sirf function ke andar use karo`,
        BREAK_OUTSIDE_LOOP: () => `'me bahar ja raha hu' sirf loop ke andar use karo`,
        DIVISION_BY_ZERO: () => `Zero se divide? Yeh toh impossible hai bhai!`,
        NOT_A_FUNCTION: (name) => `'${name}' function nahi hai`,
        NOT_A_NUMBER: (op) => `'${op}' operation ke liye numbers chahiye`,
        INVALID_OPERAND: (op) => `'${op}' ke saath yeh operands use nahi kar sakte`,
    };

    // ==================== TOKENS ====================

    const TokenType = {
        ACTION: 'ACTION',
        PAISA_VASOOL: 'PAISA_VASOOL',
        MAAN_LO: 'MAAN_LO',
        AGAR_KISMAT_RAHI: 'AGAR_KISMAT_RAHI',
        NAHI_TO: 'NAHI_TO',
        WARNA: 'WARNA',
        JAB_TAK_HAI_JAAN: 'JAB_TAK_HAI_JAAN',
        BREAK: 'BREAK',
        CLIMAX: 'CLIMAX',
        DIALOGUE_WAPAS_DO: 'DIALOGUE_WAPAS_DO',
        EK_BAAT_BATAUN: 'EK_BAAT_BATAUN',
        NUMBER: 'NUMBER',
        STRING: 'STRING',
        SACH: 'SACH',
        GALAT: 'GALAT',
        KHAALI: 'KHAALI',
        IDENTIFIER: 'IDENTIFIER',
        PLUS: 'PLUS',
        MINUS: 'MINUS',
        STAR: 'STAR',
        SLASH: 'SLASH',
        PERCENT: 'PERCENT',
        EQUAL_EQUAL: 'EQUAL_EQUAL',
        BANG_EQUAL: 'BANG_EQUAL',
        LESS: 'LESS',
        GREATER: 'GREATER',
        LESS_EQUAL: 'LESS_EQUAL',
        GREATER_EQUAL: 'GREATER_EQUAL',
        AND: 'AND',
        OR: 'OR',
        BANG: 'BANG',
        EQUAL: 'EQUAL',
        LPAREN: 'LPAREN',
        RPAREN: 'RPAREN',
        LBRACE: 'LBRACE',
        RBRACE: 'RBRACE',
        COMMA: 'COMMA',
        COLON: 'COLON',
        EOF: 'EOF',
    };

    const Keywords = {
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

    const SingleCharTokens = {
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

    class Token {
        constructor(type, lexeme, literal, line, column) {
            this.type = type;
            this.lexeme = lexeme;
            this.literal = literal;
            this.line = line;
            this.column = column;
        }
    }

    // ==================== LEXER ====================

    class Lexer {
        constructor(source) {
            this.source = source;
            this.tokens = [];
            this.start = 0;
            this.current = 0;
            this.line = 1;
            this.column = 1;
            this.startColumn = 1;
        }

        tokenize() {
            while (!this.isAtEnd()) {
                this.start = this.current;
                this.startColumn = this.column;
                this.scanToken();
            }
            this.tokens.push(new Token(TokenType.EOF, '', null, this.line, this.column));
            return this.tokens;
        }

        scanToken() {
            if (this.skipWhitespaceAndComments()) return;
            if (this.matchKeyword()) return;

            const char = this.advance();

            if (SingleCharTokens[char]) {
                this.addToken(SingleCharTokens[char]);
                return;
            }

            switch (char) {
                case '=':
                    this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                    return;
                case '!':
                    this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                    return;
                case '<':
                    this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                    return;
                case '>':
                    this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                    return;
                case '&':
                    if (this.match('&')) { this.addToken(TokenType.AND); return; }
                    throw new LexerError(ErrorMessages.UNEXPECTED_CHARACTER(char), this.line, this.startColumn);
                case '|':
                    if (this.match('|')) { this.addToken(TokenType.OR); return; }
                    throw new LexerError(ErrorMessages.UNEXPECTED_CHARACTER(char), this.line, this.startColumn);
            }

            if (char === '"') { this.string(); return; }
            if (this.isDigit(char)) { this.number(); return; }
            if (this.isAlpha(char)) { this.identifier(); return; }

            throw new LexerError(ErrorMessages.UNEXPECTED_CHARACTER(char), this.line, this.startColumn);
        }

        skipWhitespaceAndComments() {
            const startPos = this.current;
            while (!this.isAtEnd()) {
                const char = this.peek();
                switch (char) {
                    case ' ': case '\t': case '\r': this.advance(); break;
                    case '\n': this.line++; this.column = 0; this.advance(); break;
                    case '/':
                        if (this.peekNext() === '/') {
                            while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
                        } else {
                            return this.current !== startPos;
                        }
                        break;
                    default: return this.current !== startPos;
                }
            }
            return this.current !== startPos;
        }

        matchKeyword() {
            const sortedKeywords = Object.keys(Keywords).sort((a, b) => b.length - a.length);
            for (const keyword of sortedKeywords) {
                const remaining = this.source.slice(this.current);
                if (remaining.toLowerCase().startsWith(keyword.toLowerCase())) {
                    const endPos = this.current + keyword.length;
                    const nextChar = this.source[endPos];
                    const endsWithSpecial = /[!:]$/.test(keyword);
                    if (endsWithSpecial || !nextChar || !this.isAlphaNumeric(nextChar)) {
                        for (let i = 0; i < keyword.length; i++) this.advance();
                        this.addToken(Keywords[keyword]);
                        return true;
                    }
                }
            }
            return false;
        }

        string() {
            const startLine = this.line;
            const startCol = this.startColumn;
            while (this.peek() !== '"' && !this.isAtEnd()) {
                if (this.peek() === '\n') { this.line++; this.column = 0; }
                if (this.peek() === '\\' && this.peekNext()) this.advance();
                this.advance();
            }
            if (this.isAtEnd()) throw new LexerError(ErrorMessages.UNTERMINATED_STRING(), startLine, startCol);
            this.advance();
            let value = this.source.slice(this.start + 1, this.current - 1);
            value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            this.addToken(TokenType.STRING, value);
        }

        number() {
            while (this.isDigit(this.peek())) this.advance();
            if (this.peek() === '.' && this.isDigit(this.peekNext())) {
                this.advance();
                while (this.isDigit(this.peek())) this.advance();
            }
            const value = parseFloat(this.source.slice(this.start, this.current));
            this.addToken(TokenType.NUMBER, value);
        }

        identifier() {
            while (this.isAlphaNumeric(this.peek())) this.advance();
            const text = this.source.slice(this.start, this.current);
            const tokenType = Keywords[text.toLowerCase()] || TokenType.IDENTIFIER;
            this.addToken(tokenType, tokenType === TokenType.IDENTIFIER ? text : null);
        }

        isAtEnd() { return this.current >= this.source.length; }
        advance() { const char = this.source[this.current]; this.current++; this.column++; return char; }
        peek() { return this.isAtEnd() ? '\0' : this.source[this.current]; }
        peekNext() { return this.current + 1 >= this.source.length ? '\0' : this.source[this.current + 1]; }
        match(expected) { if (this.isAtEnd() || this.source[this.current] !== expected) return false; this.current++; this.column++; return true; }
        isDigit(char) { return char >= '0' && char <= '9'; }
        isAlpha(char) { return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_'; }
        isAlphaNumeric(char) { return this.isAlpha(char) || this.isDigit(char); }
        addToken(type, literal = null) { this.tokens.push(new Token(type, this.source.slice(this.start, this.current), literal, this.line, this.startColumn)); }
    }

    // ==================== AST ====================

    const NodeType = {
        PROGRAM: 'Program',
        VARIABLE_DECLARATION: 'VariableDeclaration',
        ASSIGNMENT: 'Assignment',
        PRINT_STATEMENT: 'PrintStatement',
        IF_STATEMENT: 'IfStatement',
        WHILE_STATEMENT: 'WhileStatement',
        BREAK_STATEMENT: 'BreakStatement',
        FUNCTION_DECLARATION: 'FunctionDeclaration',
        RETURN_STATEMENT: 'ReturnStatement',
        EXPRESSION_STATEMENT: 'ExpressionStatement',
        BLOCK: 'Block',
        BINARY_EXPRESSION: 'BinaryExpression',
        UNARY_EXPRESSION: 'UnaryExpression',
        CALL_EXPRESSION: 'CallExpression',
        LITERAL: 'Literal',
        IDENTIFIER: 'Identifier',
        GROUPING: 'Grouping',
    };

    const AST = {
        Program: (body) => ({ type: NodeType.PROGRAM, body }),
        VariableDeclaration: (name, value, line) => ({ type: NodeType.VARIABLE_DECLARATION, name, value, line }),
        Assignment: (name, value, line) => ({ type: NodeType.ASSIGNMENT, name, value, line }),
        PrintStatement: (expressions, line) => ({ type: NodeType.PRINT_STATEMENT, expressions, line }),
        IfStatement: (conditions, consequents, alternate, line) => ({ type: NodeType.IF_STATEMENT, conditions, consequents, alternate, line }),
        WhileStatement: (condition, body, line) => ({ type: NodeType.WHILE_STATEMENT, condition, body, line }),
        BreakStatement: (line) => ({ type: NodeType.BREAK_STATEMENT, line }),
        FunctionDeclaration: (name, params, body, line) => ({ type: NodeType.FUNCTION_DECLARATION, name, params, body, line }),
        ReturnStatement: (value, line) => ({ type: NodeType.RETURN_STATEMENT, value, line }),
        ExpressionStatement: (expression, line) => ({ type: NodeType.EXPRESSION_STATEMENT, expression, line }),
        Block: (statements) => ({ type: NodeType.BLOCK, statements }),
        BinaryExpression: (operator, left, right, line) => ({ type: NodeType.BINARY_EXPRESSION, operator, left, right, line }),
        UnaryExpression: (operator, operand, line) => ({ type: NodeType.UNARY_EXPRESSION, operator, operand, line }),
        CallExpression: (callee, args, line) => ({ type: NodeType.CALL_EXPRESSION, callee, arguments: args, line }),
        Literal: (value, line) => ({ type: NodeType.LITERAL, value, line }),
        Identifier: (name, line) => ({ type: NodeType.IDENTIFIER, name, line }),
        Grouping: (expression, line) => ({ type: NodeType.GROUPING, expression, line }),
    };

    // ==================== PARSER ====================

    class Parser {
        constructor(tokens) {
            this.tokens = tokens;
            this.current = 0;
        }

        parse() { return this.program(); }

        program() {
            if (!this.check(TokenType.ACTION)) throw new ParserError(ErrorMessages.EXPECTED_ACTION(), this.peek().line, this.peek().column);
            this.advance();
            const statements = [];
            while (!this.check(TokenType.PAISA_VASOOL) && !this.isAtEnd()) {
                statements.push(this.declaration());
            }
            if (!this.check(TokenType.PAISA_VASOOL)) throw new ParserError(ErrorMessages.EXPECTED_PAISA_VASOOL(), this.peek().line, this.peek().column);
            this.advance();
            return AST.Program(statements);
        }

        declaration() {
            if (this.check(TokenType.CLIMAX)) return this.functionDeclaration();
            if (this.check(TokenType.MAAN_LO)) return this.variableDeclaration();
            return this.statement();
        }

        functionDeclaration() {
            const line = this.peek().line;
            this.advance();
            if (!this.check(TokenType.IDENTIFIER)) throw new ParserError(ErrorMessages.EXPECTED_IDENTIFIER(), this.peek().line, this.peek().column);
            const name = this.advance().lexeme;
            this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
            const params = [];
            if (!this.check(TokenType.RPAREN)) {
                do {
                    if (!this.check(TokenType.IDENTIFIER)) throw new ParserError(ErrorMessages.EXPECTED_IDENTIFIER(), this.peek().line, this.peek().column);
                    params.push(this.advance().lexeme);
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
            this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
            const body = this.block();
            return AST.FunctionDeclaration(name, params, body, line);
        }

        variableDeclaration() {
            const line = this.peek().line;
            this.advance();
            if (!this.check(TokenType.IDENTIFIER)) throw new ParserError(ErrorMessages.EXPECTED_IDENTIFIER(), this.peek().line, this.peek().column);
            const name = this.advance().lexeme;
            this.consume(TokenType.EQUAL, ErrorMessages.EXPECTED_EQUALS());
            const value = this.expression();
            return AST.VariableDeclaration(name, value, line);
        }

        statement() {
            if (this.check(TokenType.AGAR_KISMAT_RAHI)) return this.ifStatement();
            if (this.check(TokenType.JAB_TAK_HAI_JAAN)) return this.whileStatement();
            if (this.check(TokenType.BREAK)) return this.breakStatement();
            if (this.check(TokenType.DIALOGUE_WAPAS_DO)) return this.returnStatement();
            if (this.check(TokenType.EK_BAAT_BATAUN)) return this.printStatement();
            if (this.check(TokenType.LBRACE)) { this.advance(); return this.block(); }
            return this.expressionStatement();
        }

        ifStatement() {
            const line = this.peek().line;
            const conditions = [], consequents = [];
            let alternate = null;
            this.advance();
            this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
            conditions.push(this.expression());
            this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
            this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
            consequents.push(this.block());
            while (this.check(TokenType.NAHI_TO)) {
                this.advance();
                this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
                conditions.push(this.expression());
                this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
                this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
                consequents.push(this.block());
            }
            if (this.check(TokenType.WARNA)) {
                this.advance();
                this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
                alternate = this.block();
            }
            return AST.IfStatement(conditions, consequents, alternate, line);
        }

        whileStatement() {
            const line = this.peek().line;
            this.advance();
            this.consume(TokenType.LPAREN, ErrorMessages.EXPECTED_LPAREN());
            const condition = this.expression();
            this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
            this.consume(TokenType.LBRACE, ErrorMessages.EXPECTED_LBRACE());
            const body = this.block();
            return AST.WhileStatement(condition, body, line);
        }

        breakStatement() {
            const line = this.peek().line;
            this.advance();
            return AST.BreakStatement(line);
        }

        returnStatement() {
            const line = this.peek().line;
            this.advance();
            let value = null;
            if (!this.check(TokenType.RBRACE) && !this.check(TokenType.PAISA_VASOOL) && !this.isAtEnd()) {
                value = this.expression();
            }
            return AST.ReturnStatement(value, line);
        }

        printStatement() {
            const line = this.peek().line;
            this.advance();
            const expressions = [this.expression()];
            while (this.match(TokenType.COMMA)) expressions.push(this.expression());
            return AST.PrintStatement(expressions, line);
        }

        block() {
            const statements = [];
            while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) statements.push(this.declaration());
            this.consume(TokenType.RBRACE, ErrorMessages.EXPECTED_RBRACE());
            return AST.Block(statements);
        }

        expressionStatement() {
            const line = this.peek().line;
            return AST.ExpressionStatement(this.expression(), line);
        }

        expression() { return this.assignment(); }

        assignment() {
            const expr = this.logicOr();
            if (this.match(TokenType.EQUAL)) {
                const value = this.assignment();
                if (expr.type === NodeType.IDENTIFIER) return AST.Assignment(expr.name, value, expr.line);
                throw new ParserError(ErrorMessages.INVALID_ASSIGNMENT_TARGET(), this.previous().line, this.previous().column);
            }
            return expr;
        }

        logicOr() {
            let expr = this.logicAnd();
            while (this.match(TokenType.OR)) {
                expr = AST.BinaryExpression(this.previous().lexeme, expr, this.logicAnd(), this.previous().line);
            }
            return expr;
        }

        logicAnd() {
            let expr = this.equality();
            while (this.match(TokenType.AND)) {
                expr = AST.BinaryExpression(this.previous().lexeme, expr, this.equality(), this.previous().line);
            }
            return expr;
        }

        equality() {
            let expr = this.comparison();
            while (this.match(TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
                expr = AST.BinaryExpression(this.previous().lexeme, expr, this.comparison(), this.previous().line);
            }
            return expr;
        }

        comparison() {
            let expr = this.term();
            while (this.match(TokenType.LESS, TokenType.GREATER, TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL)) {
                expr = AST.BinaryExpression(this.previous().lexeme, expr, this.term(), this.previous().line);
            }
            return expr;
        }

        term() {
            let expr = this.factor();
            while (this.match(TokenType.PLUS, TokenType.MINUS)) {
                expr = AST.BinaryExpression(this.previous().lexeme, expr, this.factor(), this.previous().line);
            }
            return expr;
        }

        factor() {
            let expr = this.unary();
            while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
                expr = AST.BinaryExpression(this.previous().lexeme, expr, this.unary(), this.previous().line);
            }
            return expr;
        }

        unary() {
            if (this.match(TokenType.BANG, TokenType.MINUS)) {
                return AST.UnaryExpression(this.previous().lexeme, this.unary(), this.previous().line);
            }
            return this.call();
        }

        call() {
            let expr = this.primary();
            while (this.match(TokenType.LPAREN)) {
                const args = [];
                if (!this.check(TokenType.RPAREN)) {
                    do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
                }
                const paren = this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
                expr = AST.CallExpression(expr.name || '<expr>', args, paren.line);
            }
            return expr;
        }

        primary() {
            const line = this.peek().line;
            if (this.match(TokenType.SACH)) return AST.Literal(true, line);
            if (this.match(TokenType.GALAT)) return AST.Literal(false, line);
            if (this.match(TokenType.KHAALI)) return AST.Literal(null, line);
            if (this.match(TokenType.NUMBER)) return AST.Literal(this.previous().literal, line);
            if (this.match(TokenType.STRING)) return AST.Literal(this.previous().literal, line);
            if (this.match(TokenType.IDENTIFIER)) return AST.Identifier(this.previous().lexeme, line);
            if (this.match(TokenType.LPAREN)) {
                const expr = this.expression();
                this.consume(TokenType.RPAREN, ErrorMessages.EXPECTED_RPAREN());
                return AST.Grouping(expr, line);
            }
            throw new ParserError(ErrorMessages.EXPECTED_EXPRESSION(), this.peek().line, this.peek().column);
        }

        isAtEnd() { return this.peek().type === TokenType.EOF; }
        peek() { return this.tokens[this.current]; }
        previous() { return this.tokens[this.current - 1]; }
        advance() { if (!this.isAtEnd()) this.current++; return this.previous(); }
        check(type) { return !this.isAtEnd() && this.peek().type === type; }
        match(...types) { for (const type of types) { if (this.check(type)) { this.advance(); return true; } } return false; }
        consume(type, errorMessage) { if (this.check(type)) return this.advance(); throw new ParserError(errorMessage, this.peek().line, this.peek().column); }
    }

    // ==================== ANALYZER ====================

    class Analyzer {
        constructor() {
            this.scopes = [new Map()];
            this.functions = new Map();
            this.currentFunction = null;
            this.loopDepth = 0;
        }

        analyze(ast) {
            this.scopes = [new Map()];
            this.functions = new Map();
            this.currentFunction = null;
            this.loopDepth = 0;
            for (const stmt of ast.body) {
                if (stmt.type === NodeType.FUNCTION_DECLARATION) {
                    if (this.functions.has(stmt.name)) throw new SemanticError(ErrorMessages.ALREADY_DEFINED(stmt.name), stmt.line, null);
                    this.functions.set(stmt.name, { params: stmt.params, paramCount: stmt.params.length, line: stmt.line });
                    this.scopes[0].set(stmt.name, { type: 'function', line: stmt.line });
                }
            }
            for (const stmt of ast.body) this.visitStatement(stmt);
            return ast;
        }

        visitStatement(node) {
            switch (node.type) {
                case NodeType.VARIABLE_DECLARATION:
                    this.visitExpression(node.value);
                    this.scopes[this.scopes.length - 1].set(node.name, { type: 'variable', line: node.line });
                    break;
                case NodeType.ASSIGNMENT:
                    if (!this.lookupVariable(node.name)) throw new SemanticError(ErrorMessages.UNDEFINED_VARIABLE(node.name), node.line, null);
                    this.visitExpression(node.value);
                    break;
                case NodeType.PRINT_STATEMENT:
                    for (const expr of node.expressions) this.visitExpression(expr);
                    break;
                case NodeType.IF_STATEMENT:
                    for (const cond of node.conditions) this.visitExpression(cond);
                    for (const cons of node.consequents) { this.scopes.push(new Map()); for (const s of cons.statements) this.visitStatement(s); this.scopes.pop(); }
                    if (node.alternate) { this.scopes.push(new Map()); for (const s of node.alternate.statements) this.visitStatement(s); this.scopes.pop(); }
                    break;
                case NodeType.WHILE_STATEMENT:
                    this.visitExpression(node.condition);
                    this.loopDepth++;
                    this.scopes.push(new Map());
                    for (const s of node.body.statements) this.visitStatement(s);
                    this.scopes.pop();
                    this.loopDepth--;
                    break;
                case NodeType.BREAK_STATEMENT:
                    if (this.loopDepth === 0) throw new SemanticError(ErrorMessages.BREAK_OUTSIDE_LOOP(), node.line, null);
                    break;
                case NodeType.FUNCTION_DECLARATION:
                    const prev = this.currentFunction;
                    this.currentFunction = node.name;
                    this.scopes.push(new Map());
                    for (const param of node.params) this.scopes[this.scopes.length - 1].set(param, { type: 'parameter', line: node.line });
                    for (const s of node.body.statements) this.visitStatement(s);
                    this.scopes.pop();
                    this.currentFunction = prev;
                    break;
                case NodeType.RETURN_STATEMENT:
                    if (this.currentFunction === null) throw new SemanticError(ErrorMessages.RETURN_OUTSIDE_FUNCTION(), node.line, null);
                    if (node.value) this.visitExpression(node.value);
                    break;
                case NodeType.EXPRESSION_STATEMENT:
                    this.visitExpression(node.expression);
                    break;
                case NodeType.BLOCK:
                    this.scopes.push(new Map());
                    for (const s of node.statements) this.visitStatement(s);
                    this.scopes.pop();
                    break;
            }
        }

        visitExpression(node) {
            if (!node) return;
            switch (node.type) {
                case NodeType.BINARY_EXPRESSION:
                    this.visitExpression(node.left);
                    this.visitExpression(node.right);
                    break;
                case NodeType.UNARY_EXPRESSION:
                    this.visitExpression(node.operand);
                    break;
                case NodeType.CALL_EXPRESSION:
                    const funcInfo = this.functions.get(node.callee);
                    if (!funcInfo && !this.lookupVariable(node.callee)) throw new SemanticError(ErrorMessages.UNDEFINED_FUNCTION(node.callee), node.line, null);
                    if (funcInfo && node.arguments.length !== funcInfo.paramCount) throw new SemanticError(ErrorMessages.WRONG_ARG_COUNT(node.callee, funcInfo.paramCount, node.arguments.length), node.line, null);
                    for (const arg of node.arguments) this.visitExpression(arg);
                    break;
                case NodeType.IDENTIFIER:
                    if (!this.lookupVariable(node.name) && !this.functions.has(node.name)) throw new SemanticError(ErrorMessages.UNDEFINED_VARIABLE(node.name), node.line, null);
                    break;
                case NodeType.GROUPING:
                    this.visitExpression(node.expression);
                    break;
                case NodeType.ASSIGNMENT:
                    if (!this.lookupVariable(node.name)) throw new SemanticError(ErrorMessages.UNDEFINED_VARIABLE(node.name), node.line, null);
                    this.visitExpression(node.value);
                    break;
            }
        }

        lookupVariable(name) {
            for (let i = this.scopes.length - 1; i >= 0; i--) {
                if (this.scopes[i].has(name)) return this.scopes[i].get(name);
            }
            return null;
        }
    }

    // ==================== INTERPRETER ====================

    class Environment {
        constructor(parent = null) { this.values = new Map(); this.parent = parent; }
        define(name, value) { this.values.set(name, value); }
        get(name, line = null) {
            if (this.values.has(name)) return this.values.get(name);
            if (this.parent) return this.parent.get(name, line);
            throw new RuntimeError(ErrorMessages.UNDEFINED_VARIABLE(name), line);
        }
        assign(name, value, line = null) {
            if (this.values.has(name)) { this.values.set(name, value); return; }
            if (this.parent) { this.parent.assign(name, value, line); return; }
            throw new RuntimeError(ErrorMessages.UNDEFINED_VARIABLE(name), line);
        }
    }

    class MasalaFunction {
        constructor(declaration, closure) { this.declaration = declaration; this.closure = closure; }
        call(interpreter, args) {
            const environment = new Environment(this.closure);
            for (let i = 0; i < this.declaration.params.length; i++) {
                environment.define(this.declaration.params[i], args[i] !== undefined ? args[i] : null);
            }
            try { interpreter.executeBlock(this.declaration.body, environment); }
            catch (returnValue) { if (returnValue instanceof ReturnValue) return returnValue.value; throw returnValue; }
            return null;
        }
    }

    class ReturnValue { constructor(value) { this.value = value; } }
    class BreakException { constructor() { } }

    class Interpreter {
        constructor() { this.globals = new Environment(); this.environment = this.globals; this.output = []; }

        execute(ast) {
            this.output = [];
            this.environment = this.globals;
            for (const stmt of ast.body) this.executeStatement(stmt);
            return this.output;
        }

        executeStatement(node) {
            switch (node.type) {
                case NodeType.VARIABLE_DECLARATION:
                    this.environment.define(node.name, this.evaluate(node.value));
                    break;
                case NodeType.ASSIGNMENT:
                    this.environment.assign(node.name, this.evaluate(node.value), node.line);
                    break;
                case NodeType.PRINT_STATEMENT:
                    const values = node.expressions.map(expr => this.evaluate(expr));
                    this.output.push(values.map(v => this.stringify(v)).join(' '));
                    break;
                case NodeType.IF_STATEMENT:
                    for (let i = 0; i < node.conditions.length; i++) {
                        if (this.isTruthy(this.evaluate(node.conditions[i]))) {
                            this.executeBlock(node.consequents[i], new Environment(this.environment));
                            return;
                        }
                    }
                    if (node.alternate) this.executeBlock(node.alternate, new Environment(this.environment));
                    break;
                case NodeType.WHILE_STATEMENT:
                    let iterations = 0;
                    try {
                        while (this.isTruthy(this.evaluate(node.condition))) {
                            if (++iterations > 100000) throw new RuntimeError('Loop limit exceeded!', node.line);
                            this.executeBlock(node.body, new Environment(this.environment));
                        }
                    } catch (e) {
                        if (!(e instanceof BreakException)) throw e;
                    }
                    break;
                case NodeType.BREAK_STATEMENT:
                    throw new BreakException();
                case NodeType.FUNCTION_DECLARATION:
                    this.environment.define(node.name, new MasalaFunction(node, this.environment));
                    break;
                case NodeType.RETURN_STATEMENT:
                    throw new ReturnValue(node.value ? this.evaluate(node.value) : null);
                case NodeType.EXPRESSION_STATEMENT:
                    this.evaluate(node.expression);
                    break;
                case NodeType.BLOCK:
                    this.executeBlock(node, new Environment(this.environment));
                    break;
            }
        }

        executeBlock(node, environment) {
            const previous = this.environment;
            try { this.environment = environment; for (const stmt of node.statements) this.executeStatement(stmt); }
            finally { this.environment = previous; }
        }

        evaluate(node) {
            if (!node) return null;
            switch (node.type) {
                case NodeType.LITERAL: return node.value;
                case NodeType.IDENTIFIER: return this.environment.get(node.name, node.line);
                case NodeType.GROUPING: return this.evaluate(node.expression);
                case NodeType.UNARY_EXPRESSION:
                    const operand = this.evaluate(node.operand);
                    if (node.operator === '-') return -operand;
                    if (node.operator === '!') return !this.isTruthy(operand);
                    break;
                case NodeType.BINARY_EXPRESSION:
                    const left = this.evaluate(node.left);
                    const right = this.evaluate(node.right);
                    switch (node.operator) {
                        case '+': return (typeof left === 'string' || typeof right === 'string') ? this.stringify(left) + this.stringify(right) : left + right;
                        case '-': return left - right;
                        case '*': return left * right;
                        case '/': if (right === 0) throw new RuntimeError(ErrorMessages.DIVISION_BY_ZERO(), node.line); return left / right;
                        case '%': if (right === 0) throw new RuntimeError(ErrorMessages.DIVISION_BY_ZERO(), node.line); return left % right;
                        case '<': return left < right;
                        case '>': return left > right;
                        case '<=': return left <= right;
                        case '>=': return left >= right;
                        case '==': return left === right;
                        case '!=': return left !== right;
                        case '&&': return this.isTruthy(left) && this.isTruthy(right);
                        case '||': return this.isTruthy(left) || this.isTruthy(right);
                    }
                    break;
                case NodeType.CALL_EXPRESSION:
                    const callee = this.environment.get(node.callee, node.line);
                    const args = node.arguments.map(arg => this.evaluate(arg));
                    if (!(callee instanceof MasalaFunction)) throw new RuntimeError(ErrorMessages.NOT_A_FUNCTION(node.callee), node.line);
                    return callee.call(this, args);
                case NodeType.ASSIGNMENT:
                    const value = this.evaluate(node.value);
                    this.environment.assign(node.name, value, node.line);
                    return value;
            }
        }

        isTruthy(value) { if (value === null) return false; if (typeof value === 'boolean') return value; return true; }
        stringify(value) {
            if (value === null) return 'khaali';
            if (value === true) return 'sach';
            if (value === false) return 'galat';
            if (value instanceof MasalaFunction) return `<function ${value.declaration.name}>`;
            return String(value);
        }
    }

    // ==================== MASALASCRIPT CLASS ====================

    class MasalaScript {
        constructor() {
            this.analyzer = new Analyzer();
            this.interpreter = new Interpreter();
        }

        run(source) {
            try {
                const lexer = new Lexer(source);
                const tokens = lexer.tokenize();
                const parser = new Parser(tokens);
                const ast = parser.parse();
                this.analyzer.analyze(ast);
                const output = this.interpreter.execute(ast);
                return { success: true, output: output };
            } catch (error) {
                return { success: false, error: error.toString() };
            }
        }

        static get version() { return '1.0.0'; }
    }

    // Export to global scope
    global.MasalaScript = MasalaScript;

})(typeof window !== 'undefined' ? window : global);
