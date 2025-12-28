// Fibonacci sequence in MasalaScript
// Demonstrates loops, break statement, and multiple variable updates

Chal bhai suru kar

ek baat bataun: "=== Fibonacci Sequence ==="

maan lo count = 15
ek baat bataun: "First", count, "Fibonacci numbers:"

maan lo a = 0
maan lo b = 1
maan lo i = 0

jab tak hai jaan (i < count) {
    ek baat bataun: "F(", i, ") =", a
    
    maan lo temp = a + b
    a = b
    b = temp
    
    i = i + 1
}

// Recursive version
climax fib(n) {
    agar kismat rahi (n <= 1) {
        dialogue wapas do n
    }
    dialogue wapas do fib(n - 1) + fib(n - 2)
}

ek baat bataun: ""
ek baat bataun: "Recursive check - F(10) =", fib(10)

// Demo of break statement
ek baat bataun: ""
ek baat bataun: "Breaking at F(5):"
maan lo j = 0
jab tak hai jaan (sach) {
    agar kismat rahi (j >= 5) {
        me bahar ja raha hu
    }
    ek baat bataun: "F(", j, ") = still counting..."
    j = j + 1
}

bas khatam karo
