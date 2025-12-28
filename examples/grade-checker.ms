// Grade Checker in MasalaScript
// Demonstrates conditionals with multiple branches

Chal bhai suru kar

ek baat bataun: "=== Student Grade Checker ==="

// Define the grade checker function
climax checkGrade(name, score) {
    ek baat bataun: ""
    ek baat bataun: "Student:", name
    ek baat bataun: "Score:", score
    
    agar kismat rahi (score >= 90) {
        ek baat bataun: "Grade: A - Outstanding! 🌟"
        dialogue wapas do "A"
    } nahi to (score >= 80) {
        ek baat bataun: "Grade: B - Great work! 👍"
        dialogue wapas do "B"
    } nahi to (score >= 70) {
        ek baat bataun: "Grade: C - Good effort! 💪"
        dialogue wapas do "C"
    } nahi to (score >= 60) {
        ek baat bataun: "Grade: D - You can do better! 📚"
        dialogue wapas do "D"
    } warna {
        ek baat bataun: "Grade: F - Keep trying! 🔥"
        dialogue wapas do "F"
    }
}

// Check grades for multiple students
maan lo grade1 = checkGrade("Aman", 95)
maan lo grade2 = checkGrade("Priya", 82)
maan lo grade3 = checkGrade("Rahul", 73)
maan lo grade4 = checkGrade("Sneha", 65)
maan lo grade5 = checkGrade("Vijay", 45)

ek baat bataun: ""
ek baat bataun: "=== Summary ==="
ek baat bataun: "All grades checked!"

bas khatam karo
