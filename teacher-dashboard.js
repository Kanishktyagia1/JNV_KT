const teacherData =
    JSON.parse(localStorage.getItem("jnv_logged_teacher"));

if (!teacherData) {
    window.location.href = "login.html";
} else {

    document.getElementById("welcomeTeacherName").textContent =
    teacherData.name;

document.getElementById("teacherName").textContent =
    teacherData.name;

    document.getElementById("teacherId").textContent =
        teacherData.id;

    document.getElementById("teacherSubject").textContent =
        teacherData.subject;


    // ===============================
    // LOAD TEACHER ASSIGNMENTS
    // ===============================

    const assignments =
        JSON.parse(
            localStorage.getItem("jnv_teacher_assignments")
        ) || [];

    const exams =
        JSON.parse(
            localStorage.getItem("jnv_exams")
        ) || [];


    // Only this teacher's assignments
    const myAssignments =
        assignments.filter(
            assignment =>
                String(assignment.teacherId).trim()
                ===
                String(teacherData.id).trim()
        );


    // ===============================
    // SHOW ASSIGNED EXAMS
    // ===============================

    const assignedContainer =
        document.getElementById("assignedExams");


    if (!assignedContainer) {

        console.log(
            "assignedExams element not found in teacher-dashboard.html"
        );

    } else if (myAssignments.length === 0) {

        assignedContainer.innerHTML = `
            <p>
                No exams have been assigned to you yet.
            </p>
        `;

    } else {

        assignedContainer.innerHTML = "";

        myAssignments.forEach(function (assignment) {

            const exam =
                exams.find(
                    e =>
                        String(e.id)
                        ===
                        String(assignment.examId)
                );


            if (!exam) {
                return;
            }


            assignedContainer.innerHTML += `

                <div class="assigned-exam-card">

                    <h3>
                        ${exam.examName}
                    </h3>

                    <p>
                        <strong>Class:</strong>
                        ${exam.className} - ${exam.section}
                    </p>

                    <p>
                        <strong>Session:</strong>
                        ${exam.examYear}
                    </p>

                    <p>
                        <strong>Subject:</strong>
                        ${assignment.subject}
                    </p>

                    <button
                        onclick="openAssignedExam('${exam.id}', '${assignment.subject}')"
                    >
                        📝 Open Result
                    </button>

                </div>

            `;
        });
    }
}


// ===============================
// OPEN ASSIGNED EXAM
// ===============================

function openAssignedExam(examId, subject) {

    window.location.href =
        `teacher-result.html?examId=${encodeURIComponent(examId)}&subject=${encodeURIComponent(subject)}`;
}