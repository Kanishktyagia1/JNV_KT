const searchButton = document.getElementById("searchStudent");
const rollNumberInput = document.getElementById("rollNumber");
const studentReport = document.getElementById("studentReport");

const exams = JSON.parse(localStorage.getItem("jnv_exams")) || [];

searchButton.addEventListener("click", findStudent);



function findStudent() {

    const rollNumber = rollNumberInput.value.trim();

    if (rollNumber === "") {
        alert("Please enter Roll Number.");
        return;
    }

    const allResults =
        JSON.parse(localStorage.getItem("jnv_results")) || {};

    let reports = [];


    // Saare exams check karo
    for (const examId in allResults) {

        const students = allResults[examId];

        const student = students.find(
            s => String(s.rollNumber).trim() === rollNumber
        );


        if (student) {

            const exam = exams.find(
                e => String(e.id) === String(examId)
            );

            if (exam) {
                reports.push({
                    student: student,
                    exam: exam
                });
            }
        }
    }


    // Student kisi bhi exam mein nahi mila
    if (reports.length === 0) {

        studentReport.innerHTML = `
            <div class="report-card">
                <p>Student nahi mila.</p>
            </div>
        `;

        return;
    }


    // Har exam ka report banao
    let reportsHTML = "";

    reports.forEach((report, index) => {

        const student = report.student;
        const exam = report.exam;

        reportsHTML += `

            <div class="report-card">

                <h1>STUDENT REPORT CARD</h1>

                <h2>${student.studentName}</h2>

                <p>
                    <strong>Roll Number:</strong>
                    ${student.rollNumber}
                </p>

                <p>
                    <strong>Class:</strong>
                    ${exam.className} - ${exam.section}
                </p>

                <p>
                    <strong>Exam:</strong>
                    ${exam.examName}
                </p>

                <p>
                    <strong>Session:</strong>
                    ${exam.examYear}
                </p>

                <hr>

                <p>
                    <strong>Total Marks:</strong>
                    ${student.total}
                </p>

                <p>
                    <strong>Percentage:</strong>
                    ${student.percentage}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${student.result}
                </p>

                <p>
                    <strong>Rank:</strong>
                    ${student.rank}
                </p>

                <button class="print-btn" onclick="window.print()">
                    🖨️ Print Report
                </button>

            </div>

        `;
    });


    studentReport.innerHTML = reportsHTML;
}