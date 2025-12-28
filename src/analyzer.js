/**
 * MasalaScript Semantic Analyzer
 * Validates program semantics before execution
 */

import { NodeType } from './ast.js';
import { SemanticError, ErrorMessages } from './errors.js';

export class Analyzer {
    constructor() {
        this.scopes = [new Map()]; // Stack of scopes
        this.functions = new Map(); // Function definitions
        this.currentFunction = null; // Track if inside a function
        this.errors = [];
    }

    /**
     * Analyze the AST for semantic errors
     * @param {Object} ast - The program AST
     * @returns {Object} The analyzed AST with any annotations
     */
    analyze(ast) {
        this.errors = [];
        this.scopes = [new Map()];
        this.functions = new Map();
        this.currentFunction = null;

        try {
            this.visitProgram(ast);
        } catch (error) {
            this.errors.push(error);
        }

        if (this.errors.length > 0) {
            throw this.errors[0]; // Throw first error
        }

        return ast;
    }

    /**
     * Visit a program node
     */
    visitProgram(node) {
        // First pass: collect function declarations
        for (const stmt of node.body) {
            if (stmt.type === NodeType.FUNCTION_DECLARATION) {
                this.declareFunction(stmt);
            }
        }

        // Second pass: analyze all statements
        for (const stmt of node.body) {
            this.visitStatement(stmt);
        }
    }

    /**
     * Visit a statement node
     */
    visitStatement(node) {
        switch (node.type) {
            case NodeType.VARIABLE_DECLARATION:
                this.visitVariableDeclaration(node);
                break;
            case NodeType.ASSIGNMENT:
                this.visitAssignment(node);
                break;
            case NodeType.PRINT_STATEMENT:
                this.visitPrintStatement(node);
                break;
            case NodeType.IF_STATEMENT:
                this.visitIfStatement(node);
                break;
            case NodeType.WHILE_STATEMENT:
                this.visitWhileStatement(node);
                break;
            case NodeType.FUNCTION_DECLARATION:
                this.visitFunctionDeclaration(node);
                break;
            case NodeType.RETURN_STATEMENT:
                this.visitReturnStatement(node);
                break;
            case NodeType.EXPRESSION_STATEMENT:
                this.visitExpressionStatement(node);
                break;
            case NodeType.BLOCK:
                this.visitBlock(node, false);
                break;
            default:
                // Unknown statement type - might be an expression
                if (node.type) {
                    this.visitExpression(node);
                }
        }
    }

    /**
     * Visit a variable declaration
     */
    visitVariableDeclaration(node) {
        // Check if already declared in current scope
        const currentScope = this.scopes[this.scopes.length - 1];
        if (currentScope.has(node.name)) {
            throw new SemanticError(
                ErrorMessages.ALREADY_DEFINED(node.name),
                node.line,
                null
            );
        }

        // Analyze the initializer
        this.visitExpression(node.value);

        // Declare the variable
        currentScope.set(node.name, { type: 'variable', line: node.line });
    }

    /**
     * Visit an assignment
     */
    visitAssignment(node) {
        // Check if variable is defined
        if (!this.lookupVariable(node.name)) {
            throw new SemanticError(
                ErrorMessages.UNDEFINED_VARIABLE(node.name),
                node.line,
                null
            );
        }

        // Analyze the value
        this.visitExpression(node.value);
    }

    /**
     * Visit a print statement
     */
    visitPrintStatement(node) {
        for (const expr of node.expressions) {
            this.visitExpression(expr);
        }
    }

    /**
     * Visit an if statement
     */
    visitIfStatement(node) {
        // Check all conditions
        for (const condition of node.conditions) {
            this.visitExpression(condition);
        }

        // Check all consequent blocks
        for (const consequent of node.consequents) {
            this.visitBlock(consequent, true);
        }

        // Check alternate block if present
        if (node.alternate) {
            this.visitBlock(node.alternate, true);
        }
    }

    /**
     * Visit a while statement
     */
    visitWhileStatement(node) {
        this.visitExpression(node.condition);
        this.visitBlock(node.body, true);
    }

    /**
     * Declare a function (first pass)
     */
    declareFunction(node) {
        if (this.functions.has(node.name)) {
            throw new SemanticError(
                ErrorMessages.ALREADY_DEFINED(node.name),
                node.line,
                null
            );
        }

        this.functions.set(node.name, {
            params: node.params,
            paramCount: node.params.length,
            line: node.line
        });

        // Also declare in current scope
        const currentScope = this.scopes[this.scopes.length - 1];
        currentScope.set(node.name, { type: 'function', line: node.line });
    }

    /**
     * Visit a function declaration (second pass)
     */
    visitFunctionDeclaration(node) {
        const previousFunction = this.currentFunction;
        this.currentFunction = node.name;

        // Create new scope for function body
        this.pushScope();

        // Declare parameters in function scope
        for (const param of node.params) {
            const currentScope = this.scopes[this.scopes.length - 1];
            if (currentScope.has(param)) {
                throw new SemanticError(
                    ErrorMessages.ALREADY_DEFINED(param),
                    node.line,
                    null
                );
            }
            currentScope.set(param, { type: 'parameter', line: node.line });
        }

        // Analyze function body
        this.visitBlock(node.body, false);

        this.popScope();
        this.currentFunction = previousFunction;
    }

    /**
     * Visit a return statement
     */
    visitReturnStatement(node) {
        if (this.currentFunction === null) {
            throw new SemanticError(
                ErrorMessages.RETURN_OUTSIDE_FUNCTION(),
                node.line,
                null
            );
        }

        if (node.value) {
            this.visitExpression(node.value);
        }
    }

    /**
     * Visit an expression statement
     */
    visitExpressionStatement(node) {
        this.visitExpression(node.expression);
    }

    /**
     * Visit a block
     */
    visitBlock(node, createNewScope = true) {
        if (createNewScope) {
            this.pushScope();
        }

        for (const stmt of node.statements) {
            this.visitStatement(stmt);
        }

        if (createNewScope) {
            this.popScope();
        }
    }

    /**
     * Visit an expression
     */
    visitExpression(node) {
        if (!node) return;

        switch (node.type) {
            case NodeType.BINARY_EXPRESSION:
                this.visitBinaryExpression(node);
                break;
            case NodeType.UNARY_EXPRESSION:
                this.visitUnaryExpression(node);
                break;
            case NodeType.CALL_EXPRESSION:
                this.visitCallExpression(node);
                break;
            case NodeType.LITERAL:
                // Literals are always valid
                break;
            case NodeType.IDENTIFIER:
                this.visitIdentifier(node);
                break;
            case NodeType.GROUPING:
                this.visitExpression(node.expression);
                break;
            case NodeType.ASSIGNMENT:
                this.visitAssignment(node);
                break;
        }
    }

    /**
     * Visit a binary expression
     */
    visitBinaryExpression(node) {
        this.visitExpression(node.left);
        this.visitExpression(node.right);
    }

    /**
     * Visit a unary expression
     */
    visitUnaryExpression(node) {
        this.visitExpression(node.operand);
    }

    /**
     * Visit a function call
     */
    visitCallExpression(node) {
        // Check if function is defined
        const funcInfo = this.functions.get(node.callee);

        if (!funcInfo) {
            // Check if it's a variable (could be passed function)
            if (!this.lookupVariable(node.callee)) {
                throw new SemanticError(
                    ErrorMessages.UNDEFINED_FUNCTION(node.callee),
                    node.line,
                    null
                );
            }
        } else {
            // Check argument count
            if (node.arguments.length !== funcInfo.paramCount) {
                throw new SemanticError(
                    ErrorMessages.WRONG_ARG_COUNT(
                        node.callee,
                        funcInfo.paramCount,
                        node.arguments.length
                    ),
                    node.line,
                    null
                );
            }
        }

        // Analyze arguments
        for (const arg of node.arguments) {
            this.visitExpression(arg);
        }
    }

    /**
     * Visit an identifier
     */
    visitIdentifier(node) {
        if (!this.lookupVariable(node.name) && !this.functions.has(node.name)) {
            throw new SemanticError(
                ErrorMessages.UNDEFINED_VARIABLE(node.name),
                node.line,
                null
            );
        }
    }

    // ==================== Scope Management ====================

    /**
     * Push a new scope
     */
    pushScope() {
        this.scopes.push(new Map());
    }

    /**
     * Pop the current scope
     */
    popScope() {
        this.scopes.pop();
    }

    /**
     * Look up a variable in all scopes
     */
    lookupVariable(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                return this.scopes[i].get(name);
            }
        }
        return null;
    }
}

/**
 * Convenience function to analyze an AST
 */
export function analyze(ast) {
    const analyzer = new Analyzer();
    return analyzer.analyze(ast);
}
