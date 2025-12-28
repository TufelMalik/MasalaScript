/**
 * MasalaScript AST Node Types
 * Defines all Abstract Syntax Tree node structures
 */

// AST Node Types
export const NodeType = {
    // Program
    PROGRAM: 'Program',

    // Statements
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

    // Expressions
    BINARY_EXPRESSION: 'BinaryExpression',
    UNARY_EXPRESSION: 'UnaryExpression',
    CALL_EXPRESSION: 'CallExpression',
    LITERAL: 'Literal',
    IDENTIFIER: 'Identifier',
    GROUPING: 'Grouping',
};

// AST Node factory functions
export const AST = {
    /**
     * Create a Program node
     */
    Program(body) {
        return {
            type: NodeType.PROGRAM,
            body
        };
    },

    /**
     * Create a Variable Declaration node
     */
    VariableDeclaration(name, value, line) {
        return {
            type: NodeType.VARIABLE_DECLARATION,
            name,
            value,
            line
        };
    },

    /**
     * Create an Assignment node
     */
    Assignment(name, value, line) {
        return {
            type: NodeType.ASSIGNMENT,
            name,
            value,
            line
        };
    },

    /**
     * Create a Print Statement node
     */
    PrintStatement(expressions, line) {
        return {
            type: NodeType.PRINT_STATEMENT,
            expressions,
            line
        };
    },

    /**
     * Create an If Statement node
     */
    IfStatement(conditions, consequents, alternate, line) {
        return {
            type: NodeType.IF_STATEMENT,
            conditions,      // Array of conditions (for if and else-if)
            consequents,     // Array of blocks (corresponding to conditions)
            alternate,       // Optional else block
            line
        };
    },

    /**
     * Create a While Statement node
     */
    WhileStatement(condition, body, line) {
        return {
            type: NodeType.WHILE_STATEMENT,
            condition,
            body,
            line
        };
    },

    /**
     * Create a Function Declaration node
     */
    FunctionDeclaration(name, params, body, line) {
        return {
            type: NodeType.FUNCTION_DECLARATION,
            name,
            params,
            body,
            line
        };
    },

    /**
     * Create a Return Statement node
     */
    ReturnStatement(value, line) {
        return {
            type: NodeType.RETURN_STATEMENT,
            value,
            line
        };
    },

    /**
     * Create an Expression Statement node
     */
    ExpressionStatement(expression, line) {
        return {
            type: NodeType.EXPRESSION_STATEMENT,
            expression,
            line
        };
    },

    /**
     * Create a Block node
     */
    Block(statements) {
        return {
            type: NodeType.BLOCK,
            statements
        };
    },

    /**
     * Create a Binary Expression node
     */
    BinaryExpression(operator, left, right, line) {
        return {
            type: NodeType.BINARY_EXPRESSION,
            operator,
            left,
            right,
            line
        };
    },

    /**
     * Create a Unary Expression node
     */
    UnaryExpression(operator, operand, line) {
        return {
            type: NodeType.UNARY_EXPRESSION,
            operator,
            operand,
            line
        };
    },

    /**
     * Create a Call Expression node
     */
    CallExpression(callee, args, line) {
        return {
            type: NodeType.CALL_EXPRESSION,
            callee,
            arguments: args,
            line
        };
    },

    /**
     * Create a Literal node
     */
    Literal(value, line) {
        return {
            type: NodeType.LITERAL,
            value,
            line
        };
    },

    /**
     * Create an Identifier node
     */
    Identifier(name, line) {
        return {
            type: NodeType.IDENTIFIER,
            name,
            line
        };
    },

    /**
     * Create a Grouping node (parenthesized expression)
     */
    Grouping(expression, line) {
        return {
            type: NodeType.GROUPING,
            expression,
            line
        };
    }
};

/**
 * Pretty print an AST
 */
export function printAST(node, indent = 0) {
    const pad = '  '.repeat(indent);

    if (node === null || node === undefined) {
        return `${pad}null`;
    }

    if (Array.isArray(node)) {
        return node.map(n => printAST(n, indent)).join('\n');
    }

    switch (node.type) {
        case NodeType.PROGRAM:
            return `${pad}Program:\n${node.body.map(n => printAST(n, indent + 1)).join('\n')}`;

        case NodeType.VARIABLE_DECLARATION:
            return `${pad}VarDecl: ${node.name}\n${printAST(node.value, indent + 1)}`;

        case NodeType.ASSIGNMENT:
            return `${pad}Assign: ${node.name}\n${printAST(node.value, indent + 1)}`;

        case NodeType.PRINT_STATEMENT:
            return `${pad}Print:\n${node.expressions.map(e => printAST(e, indent + 1)).join('\n')}`;

        case NodeType.IF_STATEMENT:
            let result = `${pad}If:\n`;
            for (let i = 0; i < node.conditions.length; i++) {
                result += `${pad}  Condition:\n${printAST(node.conditions[i], indent + 2)}\n`;
                result += `${pad}  Then:\n${printAST(node.consequents[i], indent + 2)}\n`;
            }
            if (node.alternate) {
                result += `${pad}  Else:\n${printAST(node.alternate, indent + 2)}`;
            }
            return result;

        case NodeType.WHILE_STATEMENT:
            return `${pad}While:\n${pad}  Condition:\n${printAST(node.condition, indent + 2)}\n${pad}  Body:\n${printAST(node.body, indent + 2)}`;

        case NodeType.FUNCTION_DECLARATION:
            return `${pad}Function: ${node.name}(${node.params.join(', ')})\n${printAST(node.body, indent + 1)}`;

        case NodeType.RETURN_STATEMENT:
            return `${pad}Return:\n${printAST(node.value, indent + 1)}`;

        case NodeType.EXPRESSION_STATEMENT:
            return `${pad}ExprStmt:\n${printAST(node.expression, indent + 1)}`;

        case NodeType.BLOCK:
            return `${pad}Block:\n${node.statements.map(s => printAST(s, indent + 1)).join('\n')}`;

        case NodeType.BINARY_EXPRESSION:
            return `${pad}BinExpr: ${node.operator}\n${printAST(node.left, indent + 1)}\n${printAST(node.right, indent + 1)}`;

        case NodeType.UNARY_EXPRESSION:
            return `${pad}UnaryExpr: ${node.operator}\n${printAST(node.operand, indent + 1)}`;

        case NodeType.CALL_EXPRESSION:
            return `${pad}Call: ${node.callee}\n${node.arguments.map(a => printAST(a, indent + 1)).join('\n')}`;

        case NodeType.LITERAL:
            return `${pad}Literal: ${JSON.stringify(node.value)}`;

        case NodeType.IDENTIFIER:
            return `${pad}Identifier: ${node.name}`;

        case NodeType.GROUPING:
            return `${pad}Grouping:\n${printAST(node.expression, indent + 1)}`;

        default:
            return `${pad}Unknown: ${JSON.stringify(node)}`;
    }
}
