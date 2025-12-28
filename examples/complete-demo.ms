// Complete feature demo in MasalaScript
// Shows all language features in one program

Chal bhai suru kar

ek baat bataun: "╔═══════════════════════════════════════╗"
ek baat bataun: "║    MasalaScript Complete Demo 🌶️     ║"
ek baat bataun: "╚═══════════════════════════════════════╝"

// ==================== VARIABLES ====================
ek baat bataun: ""
ek baat bataun: "=== 1. Variables ==="

maan lo name = "Aman"
maan lo age = 25
maan lo pi = 3.14159
maan lo isStudent = sach
maan lo noValue = khaali

ek baat bataun: "Name:", name
ek baat bataun: "Age:", age
ek baat bataun: "Pi:", pi
ek baat bataun: "Is Student:", isStudent
ek baat bataun: "No Value:", noValue

// ==================== ARITHMETIC ====================
ek baat bataun: ""
ek baat bataun: "=== 2. Arithmetic Operations ==="

maan lo a = 20
maan lo b = 6
ek baat bataun: a, "+", b, "=", a + b
ek baat bataun: a, "-", b, "=", a - b
ek baat bataun: a, "*", b, "=", a * b
ek baat bataun: a, "/", b, "=", a / b
ek baat bataun: a, "%", b, "=", a % b

// ==================== COMPARISONS ====================
ek baat bataun: ""
ek baat bataun: "=== 3. Comparisons ==="

ek baat bataun: "10 > 5:", 10 > 5
ek baat bataun: "10 < 5:", 10 < 5
ek baat bataun: "10 >= 10:", 10 >= 10
ek baat bataun: "10 == 10:", 10 == 10
ek baat bataun: "10 != 5:", 10 != 5

// ==================== LOGICAL OPERATORS ====================
ek baat bataun: ""
ek baat bataun: "=== 4. Logical Operators ==="

ek baat bataun: "sach && sach:", sach && sach
ek baat bataun: "sach && galat:", sach && galat
ek baat bataun: "sach || galat:", sach || galat
ek baat bataun: "!sach:", !sach

// ==================== CONDITIONALS ====================
ek baat bataun: ""
ek baat bataun: "=== 5. Conditionals ==="

maan lo score = 85

agar kismat rahi (score >= 90) {
    ek baat bataun: "Excellent!"
} nahi to (score >= 75) {
    ek baat bataun: "Good job!"
} nahi to (score >= 50) {
    ek baat bataun: "Keep trying!"
} warna {
    ek baat bataun: "Study more!"
}

// ==================== LOOPS ====================
ek baat bataun: ""
ek baat bataun: "=== 6. Loops ==="

maan lo counter = 1
jab tak hai jaan (counter <= 5) {
    ek baat bataun: "Counter:", counter
    counter = counter + 1
}

// ==================== BREAK STATEMENT ====================
ek baat bataun: ""
ek baat bataun: "=== 7. Break Statement ==="

maan lo breakDemo = 1
jab tak hai jaan (sach) {
    ek baat bataun: "Loop iteration:", breakDemo
    agar kismat rahi (breakDemo >= 3) {
        ek baat bataun: "Breaking out!"
        me bahar ja raha hu
    }
    breakDemo = breakDemo + 1
}

// ==================== FUNCTIONS ====================
ek baat bataun: ""
ek baat bataun: "=== 8. Functions ==="

climax greet(personName) {
    ek baat bataun: "Namaste,", personName, "!"
}

climax add(x, y) {
    dialogue wapas do x + y
}

climax multiply(x, y) {
    dialogue wapas do x * y
}

climax power(base, exp) {
    maan lo result = 1
    maan lo i = 0
    jab tak hai jaan (i < exp) {
        result = result * base
        i = i + 1
    }
    dialogue wapas do result
}

greet("Priya")
greet("Rahul")

ek baat bataun: "add(10, 5) =", add(10, 5)
ek baat bataun: "multiply(4, 7) =", multiply(4, 7)
ek baat bataun: "power(2, 8) =", power(2, 8)

// ==================== STRING CONCATENATION ====================
ek baat bataun: ""
ek baat bataun: "=== 9. String Concatenation ==="

maan lo firstName = "Masala"
maan lo lastName = "Script"
maan lo fullName = firstName + lastName
ek baat bataun: "Full name:", fullName

// ==================== RECURSION ====================
ek baat bataun: ""
ek baat bataun: "=== 10. Recursion ==="

climax factorial(n) {
    agar kismat rahi (n <= 1) {
        dialogue wapas do 1
    }
    dialogue wapas do n * factorial(n - 1)
}

ek baat bataun: "5! =", factorial(5)
ek baat bataun: "7! =", factorial(7)

// ==================== FINALE ====================
ek baat bataun: ""
ek baat bataun: "╔═══════════════════════════════════════╗"
ek baat bataun: "║         Demo Complete! 🎉             ║"
ek baat bataun: "╚═══════════════════════════════════════╝"

bas khatam karo
