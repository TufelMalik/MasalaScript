/**
 * MasalaScript Interpreter
 * Tree-walking interpreter that executes the AST
 */

import { NodeType } from './ast.js';
import { RuntimeError, ErrorMessages } from './errors.js';

/**
 * Environment class for managing variable scopes
 */
class Environment {
    constructor(parent = null) {
        this.values = new Map();
        this.parent = parent;
    }

    /**
     * Define a new variable
     */
    define(name, value) {
        this.values.set(name, value);
    }

    /**
     * Get a variable value
     */
    get(name, line = null) {
        if (this.values.has(name)) {
            return this.values.get(name);
        }

        if (this.parent) {
            return this.parent.get(name, line);
        }

        throw new RuntimeError(
            ErrorMessages.UNDEFINED_VARIABLE(name),
            line
        );
    }

    /**
     * Assign a value to an existing variable
     */
    assign(name, value, line = null) {
        if (this.values.has(name)) {
            this.values.set(name, value);
            return;
        }

        if (this.parent) {
            this.parent.assign(name, value, line);
            return;
        }

        throw new RuntimeError(
            ErrorMessages.UNDEFINED_VARIABLE(name),
            line
        );
    }
}

/**
 * MasalaFunction class for user-defined functions
 */
class MasalaFunction {
    constructor(declaration, closure) {
        this.declaration = declaration;
        this.closure = closure;
    }

    call(interpreter, args) {
        // Create new environment for function execution
        const environment = new Environment(this.closure);

        // Bind parameters to arguments
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(
                this.declaration.params[i],
                args[i] !== undefined ? args[i] : null
            );
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (returnValue) {
            if (returnValue instanceof ReturnValue) {
                return returnValue.value;
            }
            throw returnValue;
        }

        return null;
    }

    toString() {
        return `<function ${this.declaration.name}>`;
    }
}

/**
 * ReturnValue class for handling function returns
 */
class ReturnValue {
    constructor(value) {
        this.value = value;
    }
}

/**
 * Main Interpreter class
 */
export class Interpreter {
    constructor() {
        this.globals = new Environment();
        this.environment = this.globals;
        this.output = [];
    }

    /**
     * Execute the program AST
     * @param {Object} ast - The program AST
     * @returns {Array} Array of output strings
     */
    execute(ast) {
        this.output = [];
        this.environment = this.globals;

        this.visitProgram(ast);

        return this.output;
    }

    /**
     * Visit a program node
     */
    visitProgram(node) {
        for (const stmt of node.body) {
            this.executeStatement(stmt);
        }
    }

    /**
     * Execute a statement
     */
    executeStatement(node) {
        switch (node.type) {
            case NodeType.VARIABLE_DECLARATION:
                return this.executeVariableDeclaration(node);
            case NodeType.ASSIGNMENT:
                return this.executeAssignment(node);
            case NodeType.PRINT_STATEMENT:
                return this.executePrintStatement(node);
            case NodeType.IF_STATEMENT:
                return this.executeIfStatement(node);
            case NodeType.WHILE_STATEMENT:
                return this.executeWhileStatement(node);
            case NodeType.FUNCTION_DECLARATION:
                return this.executeFunctionDeclaration(node);
            case NodeType.RETURN_STATEMENT:
                return this.executeReturnStatement(node);
            case NodeType.EXPRESSION_STATEMENT:
                return this.executeExpressionStatement(node);
            case NodeType.BLOCK:
                return this.executeBlock(node, new Environment(this.environment));
            default:
                throw new RuntimeError(
                    `Unknown statement type: ${node.type}`,
                    node.line
                );
        }
    }

    /**
     * Execute a variable declaration
     */
    executeVariableDeclaration(node) {
        const value = this.evaluate(node.value);
        this.environment.define(node.name, value);
        return value;
    }

    /**
     * Execute an assignment
     */
    executeAssignment(node) {
        const value = this.evaluate(node.value);
        this.environment.assign(node.name, value, node.line);
        return value;
    }

    /**
     * Execute a print statement
     */
    executePrintStatement(node) {
        const values = node.expressions.map(expr => this.evaluate(expr));
        const output = values.map(v => this.stringify(v)).join(' ');
        this.output.push(output);
        console.log(output);
        return null;
    }

    /**
     * Execute an if statement
     */
    executeIfStatement(node) {
        // Check each condition in order
        for (let i = 0; i < node.conditions.length; i++) {
            if (this.isTruthy(this.evaluate(node.conditions[i]))) {
                return this.executeBlock(
                    node.consequents[i],
                    new Environment(this.environment)
                );
            }
        }

        // Execute else block if present and no condition matched
        if (node.alternate) {
            return this.executeBlock(
                node.alternate,
                new Environment(this.environment)
            );
        }

        return null;
    }

    /**
     * Execute a while statement
     */
    executeWhileStatement(node) {
        let iterations = 0;
        const maxIterations = 100000; // Prevent infinite loops

        while (this.isTruthy(this.evaluate(node.condition))) {
            iterations++;
            if (iterations > maxIterations) {
                throw new RuntimeError(
                    'Loop limit exceeded - possible infinite loop detected!',
                    node.line
                );
            }

            this.executeBlock(node.body, new Environment(this.environment));
        }

        return null;
    }

    /**
     * Execute a function declaration
     */
    executeFunctionDeclaration(node) {
        const func = new MasalaFunction(node, this.environment);
        this.environment.define(node.name, func);
        return func;
    }

    /**
     * Execute a return statement
     */
    executeReturnStatement(node) {
        let value = null;
        if (node.value) {
            value = this.evaluate(node.value);
        }
        throw new ReturnValue(value);
    }

    /**
     * Execute an expression statement
     */
    executeExpressionStatement(node) {
        return this.evaluate(node.expression);
    }

    /**
     * Execute a block of statements
     */
    executeBlock(node, environment) {
        const previous = this.environment;
        try {
            this.environment = environment;

            for (const stmt of node.statements) {
                this.executeStatement(stmt);
            }
        } finally {
            this.environment = previous;
        }

        return null;
    }

    /**
     * Evaluate an expression
     */
    evaluate(node) {
        if (!node) return null;

        switch (node.type) {
            case NodeType.LITERAL:
                return node.value;

            case NodeType.IDENTIFIER:
                return this.environment.get(node.name, node.line);

            case NodeType.GROUPING:
                return this.evaluate(node.expression);

            case NodeType.UNARY_EXPRESSION:
                return this.evaluateUnary(node);

            case NodeType.BINARY_EXPRESSION:
                return this.evaluateBinary(node);

            case NodeType.CALL_EXPRESSION:
                return this.evaluateCall(node);

            case NodeType.ASSIGNMENT:
                return this.executeAssignment(node);

            default:
                throw new RuntimeError(
                    `Unknown expression type: ${node.type}`,
                    node.line
                );
        }
    }

    /**
     * Evaluate a unary expression
     */
    evaluateUnary(node) {
        const operand = this.evaluate(node.operand);

        switch (node.operator) {
            case '-':
                this.checkNumberOperand(node.operator, operand, node.line);
                return -operand;
            case '!':
                return !this.isTruthy(operand);
            default:
                throw new RuntimeError(
                    ErrorMessages.INVALID_OPERAND(node.operator),
                    node.line
                );
        }
    }

    /**
     * Evaluate a binary expression
     */
    evaluateBinary(node) {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        switch (node.operator) {
            // Arithmetic
            case '+':
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                if (typeof left === 'string' || typeof right === 'string') {
                    return this.stringify(left) + this.stringify(right);
                }
                throw new RuntimeError(
                    ErrorMessages.INVALID_OPERAND('+'),
                    node.line
                );

            case '-':
                this.checkNumberOperands(node.operator, left, right, node.line);
                return left - right;

            case '*':
                this.checkNumberOperands(node.operator, left, right, node.line);
                return left * right;

            case '/':
                this.checkNumberOperands(node.operator, left, right, node.line);
                if (right === 0) {
                    throw new RuntimeError(
                        ErrorMessages.DIVISION_BY_ZERO(),
                        node.line
                    );
                }
                return left / right;

            case '%':
                this.checkNumberOperands(node.operator, left, right, node.line);
                if (right === 0) {
                    throw new RuntimeError(
                        ErrorMessages.DIVISION_BY_ZERO(),
                        node.line
                    );
                }
                return left % right;

            // Comparison
            case '<':
                this.checkNumberOperands(node.operator, left, right, node.line);
                return left < right;

            case '>':
                this.checkNumberOperands(node.operator, left, right, node.line);
                return left > right;

            case '<=':
                this.checkNumberOperands(node.operator, left, right, node.line);
                return left <= right;

            case '>=':
                this.checkNumberOperands(node.operator, left, right, node.line);
                return left >= right;

            // Equality
            case '==':
                return this.isEqual(left, right);

            case '!=':
                return !this.isEqual(left, right);

            // Logical
            case '&&':
                return this.isTruthy(left) && this.isTruthy(right);

            case '||':
                return this.isTruthy(left) || this.isTruthy(right);

            default:
                throw new RuntimeError(
                    ErrorMessages.INVALID_OPERAND(node.operator),
                    node.line
                );
        }
    }

    /**
     * Evaluate a function call
     */
    evaluateCall(node) {
        // Get the callee
        let callee;
        try {
            callee = this.environment.get(node.callee, node.line);
        } catch (e) {
            throw new RuntimeError(
                ErrorMessages.UNDEFINED_FUNCTION(node.callee),
                node.line
            );
        }

        // Evaluate arguments
        const args = node.arguments.map(arg => this.evaluate(arg));

        // Check if it's callable
        if (!(callee instanceof MasalaFunction)) {
            throw new RuntimeError(
                ErrorMessages.NOT_A_FUNCTION(node.callee),
                node.line
            );
        }

        // Check argument count
        if (args.length !== callee.declaration.params.length) {
            throw new RuntimeError(
                ErrorMessages.WRONG_ARG_COUNT(
                    node.callee,
                    callee.declaration.params.length,
                    args.length
                ),
                node.line
            );
        }

        return callee.call(this, args);
    }

    // ==================== Helper Methods ====================

    /**
     * Check if a value is truthy
     */
    isTruthy(value) {
        if (value === null) return false;
        if (typeof value === 'boolean') return value;
        return true;
    }

    /**
     * Check if two values are equal
     */
    isEqual(a, b) {
        if (a === null && b === null) return true;
        if (a === null) return false;
        return a === b;
    }

    /**
     * Check that operand is a number
     */
    checkNumberOperand(operator, operand, line) {
        if (typeof operand === 'number') return;
        throw new RuntimeError(
            ErrorMessages.NOT_A_NUMBER(operator),
            line
        );
    }

    /**
     * Check that both operands are numbers
     */
    checkNumberOperands(operator, left, right, line) {
        if (typeof left === 'number' && typeof right === 'number') return;
        throw new RuntimeError(
            ErrorMessages.NOT_A_NUMBER(operator),
            line
        );
    }

    /**
     * Convert value to string for output
     */
    stringify(value) {
        if (value === null) return 'khaali';
        if (value === true) return 'sach';
        if (value === false) return 'galat';
        if (typeof value === 'number') {
            // Handle integer vs float display
            if (Number.isInteger(value)) {
                return value.toString();
            }
            return value.toString();
        }
        if (value instanceof MasalaFunction) {
            return value.toString();
        }
        return String(value);
    }
}

/**
 * Convenience function to execute an AST
 */
export function execute(ast) {
    const interpreter = new Interpreter();
    return interpreter.execute(ast);
}
