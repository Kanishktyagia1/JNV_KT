const examContainer = document.getElementById("examContainer");


// Load exams from LocalStorage
let exams = JSON.parse(localStorage.getItem("jnv_exams")) || [];


// Display all exams
function displayExams() {

    examContainer.innerHTML = "";

    if (exams.length === 0) {

        examContainer.innerHTML = `
            <div class="empty">
                <h3>📭 No Exams Found</h3>
                <p>Abhi tak koi exam create nahi hua.</p>
            </div>
        `;

        return;
    }


    // Latest exam first
    const sortedExams = [...exams].reverse();


    sortedExams.forEach(function(exam) {

        const studentCount =
            exam.students && Array.isArray(exam.students)
                ? exam.students.length
                : Number(exam.studentCount || 0);


        const subjects =
            Array.isArray(exam.subjects)
                ? exam.subjects.join(", ")
                : "No subjects";


        const card = document.createElement("div");

        card.className = "exam-card";


        card.innerHTML = `

            <h3>
                📝 ${escapeHtml(exam.examName || "Unnamed Exam")}
            </h3>

            <div class="exam-info">

                <div>
                    <strong>Academic Year:</strong>
                    ${escapeHtml(exam.examYear || "-")}
                </div>

                <div>
                    <strong>Class:</strong>
                    ${escapeHtml(exam.className || "-")}
                </div>

                <div>
                    <strong>Section:</strong>
                    ${escapeHtml(exam.section || "-")}
                </div>

                <div>
                    <strong>Subjects:</strong>
                    ${escapeHtml(subjects)}
                </div>

                <div>
                    <strong>Max Marks:</strong>
                    ${escapeHtml(String(exam.maxMarks || "-"))}
                </div>

                <div>
                    <strong>Students:</strong>
                    ${studentCount}
                </div>

                <div>
                    <strong>Created:</strong>
                    ${escapeHtml(exam.createdAt || "-")}
                </div>

            </div>


            <div class="buttons">

                <button
                    class="btn result-btn"
                    onclick="openResultFile('${escapeJs(String(exam.id))}')"
                >
                    📊 Open Result File
                </button>


                <button
                    class="btn delete-btn"
                    onclick="deleteExam('${escapeJs(String(exam.id))}')"
                >
                    🗑️ Delete
                </button>

            </div>
        `;


        examContainer.appendChild(card);

    });
}



// Open Result File
function openResultFile(examId) {

    if (!examId) {
        alert("Exam ID nahi mila.");
        return;
    }


    window.location.href =
        "result-file.html?id=" + encodeURIComponent(examId);
}



// Create New Exam
function createNewExam() {

    window.location.href = "create-exam.html";

}



// Delete Exam
function deleteExam(examId) {

    const exam = exams.find(function(item) {
        return String(item.id) === String(examId);
    });


    if (!exam) {
        alert("Exam nahi mila.");
        return;
    }


    const confirmDelete = confirm(
        `Kya tum "${exam.examName}" ko delete karna chahte ho?`
    );


    if (!confirmDelete) {
        return;
    }


    // Remove exam
    exams = exams.filter(function(item) {
        return String(item.id) !== String(examId);
    });


    // Save updated exams
    localStorage.setItem(
        "jnv_exams",
        JSON.stringify(exams)
    );


    // Remove related assignments
    let assignments =
        JSON.parse(
            localStorage.getItem("jnv_teacher_assignments")
        ) || [];


    assignments = assignments.filter(function(item) {
        return String(item.examId) !== String(examId);
    });


    localStorage.setItem(
        "jnv_teacher_assignments",
        JSON.stringify(assignments)
    );


    // Remove related results
    let results =
        JSON.parse(
            localStorage.getItem("jnv_results")
        );


    if (results) {

        // Old object format
        if (!Array.isArray(results)) {

            delete results[examId];

            localStorage.setItem(
                "jnv_results",
                JSON.stringify(results)
            );

        }

        // New array format
        else {

            results = results.filter(function(result) {
                return String(result.examId) !== String(examId);
            });

            localStorage.setItem(
                "jnv_results",
                JSON.stringify(results)
            );
        }
    }


    displayExams();

}



// Prevent HTML injection
function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



// Escape value used inside onclick
function escapeJs(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}



// Start
displayExams();