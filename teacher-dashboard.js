// =====================================
// CHECK LOGIN
// =====================================

const teacherData =
    JSON.parse(localStorage.getItem("jnv_logged_teacher"));

if (!teacherData) {

    window.location.href = "login.html";

} else {

    // ===============================
    // SHOW TEACHER PROFILE
    // ===============================

    document.getElementById("welcomeTeacherName").textContent =
        teacherData.teacher_name;

    document.getElementById("teacherName").textContent =
        teacherData.teacher_name;

    document.getElementById("teacherId").textContent =
        teacherData.teacher_id;

    document.getElementById("teacherSubject").textContent =
        teacherData.assigned_subject;


    // ===============================
    // LOAD ASSIGNMENTS
    // ===============================

    loadAssignments();
}


// =====================================
// LOAD TEACHER ASSIGNMENTS
// =====================================

async function loadAssignments() {

    const assignedContainer =
        document.getElementById("assignedExams");

    assignedContainer.innerHTML =
        `<p>Loading assignments...</p>`;


    const { data: assignments, error } = await db

        .from("teacher_assignments")

        .select(`
            id,
            exam_id,
            teacher_id,
            subject
        `)

        .eq("teacher_id", teacherData.id);


    if (error) {

        console.error(
            "Assignment loading error:",
            error
        );

        assignedContainer.innerHTML = `
            <p>
                Assignments load nahi ho paaye.
            </p>
        `;

        return;
    }


    if (!assignments || assignments.length === 0) {

        assignedContainer.innerHTML = `
            <p>
                No exams have been assigned to you yet.
            </p>
        `;

        return;
    }


    // ===============================
    // LOAD EXAM DETAILS
    // ===============================

    const examIds =
        assignments.map(
            assignment => assignment.exam_id
        );


    const { data: exams, error: examError } =

        await db

            .from("exams")

            .select(`
                id,
                exam_name,
                exam_year,
                class_id
            `)

            .in("id", examIds);


    if (examError) {

        console.error(
            "Exam loading error:",
            examError
        );

        assignedContainer.innerHTML = `
            <p>
                Exam details load nahi ho paaye.
            </p>
        `;

        return;
    }


    // ===============================
    // SHOW EXAMS
    // ===============================

    assignedContainer.innerHTML = "";


    assignments.forEach(function (assignment) {

        const exam =
            exams.find(
                e =>
                    String(e.id) ===
                    String(assignment.exam_id)
            );


        if (!exam) return;


        assignedContainer.innerHTML += `

            <div class="assigned-exam-card">

                <h3>
                    ${exam.exam_name}
                </h3>

                <p class="exam-detail">
                    <strong>Session:</strong>
                    ${exam.exam_year}
                </p>

                <p class="exam-detail">
                    <strong>Subject:</strong>
                    ${assignment.subject}
                </p>

                <button
                    onclick="openAssignedExam(
                        '${exam.id}',
                        '${assignment.subject}'
                    )"
                >
                    📝 Open Result
                </button>

            </div>

        `;
    });
}


// =====================================
// OPEN ASSIGNED EXAM
// =====================================

function openAssignedExam(examId, subject) {

    window.location.href =
        `teacher-result.html?examId=${encodeURIComponent(examId)}&subject=${encodeURIComponent(subject)}`;
}


// =====================================
// LOGOUT
// =====================================

document
    .getElementById("logout")
    .addEventListener("click", async function () {

        await db.auth.signOut();

        localStorage.removeItem("jnv_logged_in");
        localStorage.removeItem("jnv_user_role");
        localStorage.removeItem("jnv_logged_teacher");

        window.location.href = "login.html";
    });