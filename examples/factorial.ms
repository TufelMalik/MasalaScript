// Factorial using recursion in MasalaScript
// Demonstrates functions and recursive calls

Chal bhai suru kar

ek baat bataun: "=== Factorial Calculator ==="

// Define factorial function
climax factorial(n) {
    agar kismat rahi (n <= 1) {
        dialogue wapas do 1
    }
    dialogue wapas do n * factorial(n - 1)
}

// Calculate factorials for numbers 1-10
maan lo i = 1
jab tak hai jaan (i <= 10) {
    maan lo result = factorial(i)
    ek baat bataun: i, "! =", result
    i = i + 1
}

ek baat bataun: "Factorial calculation complete!"

bas khatam karo
