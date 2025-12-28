/**
 * MasalaScript Test Suite
 * Comprehensive tests for all compiler components
 */

import { MasalaScript } from '../src/masalascript.js';

// Test counter
let passed = 0;
let failed = 0;
const errors = [];

// Test utilities
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✅ ${name}`);
    } catch (error) {
        failed++;
        errors.push({ name, error });
        console.log(`  ❌ ${name}`);
        console.log(`     Error: ${error.message}`);
    }
}

function assertEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message}\n     Expected: ${JSON.stringify(expected)}\n     Actual: ${JSON.stringify(actual)}`);
    }
}

function assertTrue(condition, message = 'Expected true') {
    if (!condition) {
        throw new Error(message);
    }
}

function assertFalse(condition, message = 'Expected false') {
    if (condition) {
        throw new Error(message);
    }
}

function expectError(fn, errorType = null) {
    try {
        fn();
        throw new Error('Expected an error but none was thrown');
    } catch (error) {
        if (errorType && !error.message.includes(errorType)) {
            throw new Error(`Expected error containing "${errorType}" but got: ${error.message}`);
        }
    }
}

// Create compiler instance
const masala = new MasalaScript();

function runCode(code) {
    return masala.run(code);
}

// ==================== TEST SUITES ====================

console.log('\n🌶️  MasalaScript Test Suite\n');

// ---------- Basic Program Structure ----------
console.log('\n📦 Program Structure Tests:');

test('Empty program', () => {
    const result = runCode('action!\npaisa vasool');
    assertTrue(result.success, 'Should compile successfully');
    assertEqual(result.output, []);
});

test('Missing action! throws error', () => {
    const result = runCode('paisa vasool');
    assertFalse(result.success);
    assertTrue(result.error.includes('action!'));
});

test('Missing paisa vasool throws error', () => {
    const result = runCode('action!\nmaan lo x = 5');
    assertFalse(result.success);
    assertTrue(result.error.includes('paisa vasool'));
});

// ---------- Variables ----------
console.log('\n📝 Variable Tests:');

test('Number variable declaration', () => {
    const result = runCode(`
        action!
        maan lo x = 42
        ek baat bataun: x
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['42']);
});

test('String variable declaration', () => {
    const result = runCode(`
        action!
        maan lo name = "Aman"
        ek baat bataun: name
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Aman']);
});

test('Boolean true (sach)', () => {
    const result = runCode(`
        action!
        maan lo flag = sach
        ek baat bataun: flag
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Boolean false (galat)', () => {
    const result = runCode(`
        action!
        maan lo flag = galat
        ek baat bataun: flag
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['galat']);
});

test('Null (khaali)', () => {
    const result = runCode(`
        action!
        maan lo empty = khaali
        ek baat bataun: empty
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['khaali']);
});

test('Variable assignment', () => {
    const result = runCode(`
        action!
        maan lo x = 10
        x = 20
        ek baat bataun: x
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['20']);
});

test('Undefined variable throws error', () => {
    const result = runCode(`
        action!
        ek baat bataun: undefined_var
        paisa vasool
    `);
    assertFalse(result.success);
    assertTrue(result.error.includes('undefined_var'));
});

// ---------- Arithmetic Operations ----------
console.log('\n➕ Arithmetic Tests:');

test('Addition', () => {
    const result = runCode(`
        action!
        ek baat bataun: 10 + 5
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['15']);
});

test('Subtraction', () => {
    const result = runCode(`
        action!
        ek baat bataun: 10 - 3
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['7']);
});

test('Multiplication', () => {
    const result = runCode(`
        action!
        ek baat bataun: 6 * 7
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['42']);
});

test('Division', () => {
    const result = runCode(`
        action!
        ek baat bataun: 20 / 4
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['5']);
});

test('Modulo', () => {
    const result = runCode(`
        action!
        ek baat bataun: 17 % 5
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['2']);
});

test('Division by zero throws error', () => {
    const result = runCode(`
        action!
        ek baat bataun: 10 / 0
        paisa vasool
    `);
    assertFalse(result.success);
    assertTrue(result.error.includes('Zero'));
});

test('Operator precedence', () => {
    const result = runCode(`
        action!
        ek baat bataun: 2 + 3 * 4
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['14']);
});

test('Parentheses grouping', () => {
    const result = runCode(`
        action!
        ek baat bataun: (2 + 3) * 4
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['20']);
});

test('Unary minus', () => {
    const result = runCode(`
        action!
        maan lo x = 5
        ek baat bataun: -x
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['-5']);
});

test('Floating point arithmetic', () => {
    const result = runCode(`
        action!
        ek baat bataun: 3.14 * 2
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['6.28']);
});

// ---------- Comparison Operations ----------
console.log('\n⚖️ Comparison Tests:');

test('Less than', () => {
    const result = runCode(`
        action!
        ek baat bataun: 5 < 10
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Greater than', () => {
    const result = runCode(`
        action!
        ek baat bataun: 10 > 5
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Less than or equal', () => {
    const result = runCode(`
        action!
        ek baat bataun: 5 <= 5
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Greater than or equal', () => {
    const result = runCode(`
        action!
        ek baat bataun: 10 >= 10
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Equality', () => {
    const result = runCode(`
        action!
        ek baat bataun: 5 == 5
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Inequality', () => {
    const result = runCode(`
        action!
        ek baat bataun: 5 != 10
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

// ---------- Logical Operations ----------
console.log('\n🔀 Logical Tests:');

test('Logical AND (true && true)', () => {
    const result = runCode(`
        action!
        ek baat bataun: sach && sach
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Logical AND (true && false)', () => {
    const result = runCode(`
        action!
        ek baat bataun: sach && galat
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['galat']);
});

test('Logical OR (true || false)', () => {
    const result = runCode(`
        action!
        ek baat bataun: sach || galat
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['sach']);
});

test('Logical NOT', () => {
    const result = runCode(`
        action!
        ek baat bataun: !sach
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['galat']);
});

// ---------- String Operations ----------
console.log('\n📜 String Tests:');

test('String concatenation with +', () => {
    const result = runCode(`
        action!
        ek baat bataun: "Hello" + " " + "World"
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Hello World']);
});

test('String and number concatenation', () => {
    const result = runCode(`
        action!
        ek baat bataun: "Count: " + 42
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Count: 42']);
});

test('Escape sequences in strings', () => {
    const result = runCode(`
        action!
        ek baat bataun: "Line1\\nLine2"
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Line1\nLine2']);
});

// ---------- Conditionals ----------
console.log('\n🔀 Conditional Tests:');

test('Simple if (true condition)', () => {
    const result = runCode(`
        action!
        agar kismat rahi (sach) {
            ek baat bataun: "yes"
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['yes']);
});

test('Simple if (false condition)', () => {
    const result = runCode(`
        action!
        agar kismat rahi (galat) {
            ek baat bataun: "yes"
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, []);
});

test('If-else', () => {
    const result = runCode(`
        action!
        agar kismat rahi (galat) {
            ek baat bataun: "if"
        } warna {
            ek baat bataun: "else"
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['else']);
});

test('If-else-if-else chain', () => {
    const result = runCode(`
        action!
        maan lo score = 75
        agar kismat rahi (score >= 90) {
            ek baat bataun: "A"
        } nahi to (score >= 80) {
            ek baat bataun: "B"
        } nahi to (score >= 70) {
            ek baat bataun: "C"
        } warna {
            ek baat bataun: "F"
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['C']);
});

// ---------- Loops ----------
console.log('\n🔄 Loop Tests:');

test('While loop', () => {
    const result = runCode(`
        action!
        maan lo i = 1
        jab tak hai jaan (i <= 3) {
            ek baat bataun: i
            i = i + 1
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['1', '2', '3']);
});

test('While loop with condition', () => {
    const result = runCode(`
        action!
        maan lo sum = 0
        maan lo i = 1
        jab tak hai jaan (i <= 5) {
            sum = sum + i
            i = i + 1
        }
        ek baat bataun: sum
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['15']);
});

test('Nested loops', () => {
    const result = runCode(`
        action!
        maan lo outer = 1
        jab tak hai jaan (outer <= 2) {
            maan lo inner = 1
            jab tak hai jaan (inner <= 2) {
                ek baat bataun: outer * inner
                inner = inner + 1
            }
            outer = outer + 1
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['1', '2', '2', '4']);
});

// ---------- Functions ----------
console.log('\n⚡ Function Tests:');

test('Simple function', () => {
    const result = runCode(`
        action!
        climax sayHello() {
            ek baat bataun: "Hello"
        }
        sayHello()
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Hello']);
});

test('Function with parameters', () => {
    const result = runCode(`
        action!
        climax greet(name) {
            ek baat bataun: "Hello", name
        }
        greet("Aman")
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Hello Aman']);
});

test('Function with return value', () => {
    const result = runCode(`
        action!
        climax add(a, b) {
            dialogue wapas do a + b
        }
        maan lo result = add(5, 3)
        ek baat bataun: result
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['8']);
});

test('Recursive function (factorial)', () => {
    const result = runCode(`
        action!
        climax factorial(n) {
            agar kismat rahi (n <= 1) {
                dialogue wapas do 1
            }
            dialogue wapas do n * factorial(n - 1)
        }
        ek baat bataun: factorial(5)
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['120']);
});

test('Function scope isolation', () => {
    const result = runCode(`
        action!
        maan lo x = 10
        climax changeX() {
            maan lo x = 999
            ek baat bataun: x
        }
        changeX()
        ek baat bataun: x
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['999', '10']);
});

test('Function parameter shadowing', () => {
    const result = runCode(`
        action!
        maan lo x = 10
        climax test(x) {
            ek baat bataun: x
        }
        test(20)
        ek baat bataun: x
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['20', '10']);
});

test('Undefined function throws error', () => {
    const result = runCode(`
        action!
        callUndefined()
        paisa vasool
    `);
    assertFalse(result.success);
    assertTrue(result.error.includes('callUndefined'));
});

test('Wrong argument count throws error', () => {
    const result = runCode(`
        action!
        climax add(a, b) {
            dialogue wapas do a + b
        }
        add(1)
        paisa vasool
    `);
    assertFalse(result.success);
    assertTrue(result.error.includes('argument'));
});

test('Return outside function throws error', () => {
    const result = runCode(`
        action!
        dialogue wapas do 5
        paisa vasool
    `);
    assertFalse(result.success);
    assertTrue(result.error.includes('function'));
});

// ---------- Print Statement ----------
console.log('\n📢 Print Tests:');

test('Print multiple values', () => {
    const result = runCode(`
        action!
        ek baat bataun: "Name:", "Aman", "Age:", 25
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['Name: Aman Age: 25']);
});

test('Print expressions', () => {
    const result = runCode(`
        action!
        ek baat bataun: 2 + 2, "equals", 4
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['4 equals 4']);
});

// ---------- Comments ----------
console.log('\n💬 Comment Tests:');

test('Single line comments', () => {
    const result = runCode(`
        action!
        // This is a comment
        maan lo x = 10 // Another comment
        ek baat bataun: x
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['10']);
});

// ---------- Complex Programs ----------
console.log('\n🎯 Integration Tests:');

test('Fibonacci sequence', () => {
    const result = runCode(`
        action!
        maan lo a = 0
        maan lo b = 1
        maan lo i = 0
        jab tak hai jaan (i < 8) {
            ek baat bataun: a
            maan lo temp = a + b
            a = b
            b = temp
            i = i + 1
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, ['0', '1', '1', '2', '3', '5', '8', '13']);
});

test('FizzBuzz variant', () => {
    const result = runCode(`
        action!
        maan lo i = 1
        jab tak hai jaan (i <= 15) {
            agar kismat rahi (i % 15 == 0) {
                ek baat bataun: "FizzBuzz"
            } nahi to (i % 3 == 0) {
                ek baat bataun: "Fizz"
            } nahi to (i % 5 == 0) {
                ek baat bataun: "Buzz"
            } warna {
                ek baat bataun: i
            }
            i = i + 1
        }
        paisa vasool
    `);
    assertTrue(result.success);
    assertEqual(result.output, [
        '1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8',
        'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'
    ]);
});

// ==================== SUMMARY ====================

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
    console.log('❌ Failed tests:');
    for (const { name, error } of errors) {
        console.log(`\n  - ${name}`);
        console.log(`    ${error.message}`);
    }
    process.exit(1);
} else {
    console.log('✅ All tests passed! Paisa vasool! 🌶️\n');
    process.exit(0);
}
