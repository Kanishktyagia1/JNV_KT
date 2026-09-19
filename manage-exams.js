const examContainer = document.getElementById("examContainer");

const schoolId = localStorage.getItem("jnv_school_id");

let exams = [];


// ===============================
// LOAD EXAMS FROM SUPABASE
// ===============================

async function loadExams() {

    if (!schoolId) {
        examContainer.innerHTML = `
            <div class="empty">
                <h3>⚠️ School Account Not Found</h3>
                <p>Please login again.</p>
            </div>
        `;
        return;
    }

    examContainer.innerHTML = `
        <div class="empty">
            <h3>⏳ Loading Exams...</h3>
        </div>
    `;


    const { data, error } = await db
        .from("exams")
        .select(`
            id,
            exam_name,
            exam_year,
            max_marks,
            student_count,
            created_at,
            class_id,
            classes (
                class_name,
                section
            ),
            exam_subjects (
                subject_name
            )
        `)
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });


    if (error) {
        console.error(error);

        examContainer.innerHTML = `
            <div class="empty">
                <h3>❌ Exams Load Nahi Hue</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        return;
    }


    exams = data || [];

    displayExams();
}



// ===============================
// DISPLAY EXAMS
// ===============================

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


    exams.forEach(function(exam) {

        const classData = exam.classes || {};


        const subjects =
            Array.isArray(exam.exam_subjects)
                ? exam.exam_subjects
                    .map(function(subject) {
                        return subject.subject_name;
                    })
                    .join(", ")
                : "No subjects";


        const studentCount =
            Number(exam.student_count || 0);


        const createdDate =
            exam.created_at
                ? new Date(exam.created_at).toLocaleString()
                : "-";


        const card = document.createElement("div");

        card.className = "exam-card";


        card.innerHTML = `

            <h3>
                📝 ${escapeHtml(exam.exam_name || "Unnamed Exam")}
            </h3>

            <div class="exam-info">

                <div>
                    <strong>Academic Year:</strong>
                    ${escapeHtml(exam.exam_year || "-")}
                </div>

                <div>
                    <strong>Class:</strong>
                    ${escapeHtml(classData.class_name || "-")}
                </div>

                <div>
                    <strong>Section:</strong>
                    ${escapeHtml(classData.section || "-")}
                </div>

                <div>
                    <strong>Subjects:</strong>
                    ${escapeHtml(subjects)}
                </div>

                <div>
                    <strong>Max Marks:</strong>
                    ${escapeHtml(String(exam.max_marks || "-"))}
                </div>

                <div>
                    <strong>Students:</strong>
                    ${studentCount}
                </div>

                <div>
                    <strong>Created:</strong>
                    ${escapeHtml(createdDate)}
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



// ===============================
// OPEN RESULT FILE
// ===============================

function openResultFile(examId) {

    if (!examId) {
        alert("Exam ID nahi mila.");
        return;
    }


    window.location.href =
        "result-file.html?id=" + encodeURIComponent(examId);
}



// ===============================
// CREATE NEW EXAM
// ===============================

function createNewExam() {

    window.location.href = "create-exam.html";

}



// ===============================
// DELETE EXAM
// ===============================

async function deleteExam(examId) {

    const exam = exams.find(function(item) {
        return String(item.id) === String(examId);
    });


    if (!exam) {
        alert("Exam nahi mila.");
        return;
    }


    const confirmDelete = confirm(
        `Kya tum "${exam.exam_name}" ko delete karna chahte ho?`
    );


    if (!confirmDelete) {
        return;
    }


    // Delete exam students first
    const { error: studentsError } = await db
        .from("exam_students")
        .delete()
        .eq("exam_id", examId);


    if (studentsError) {
        console.error(studentsError);
        alert("Exam students delete nahi hue.");
        return;
    }


    // Delete exam subjects
    const { error: subjectsError } = await db
        .from("exam_subjects")
        .delete()
        .eq("exam_id", examId);


    if (subjectsError) {
        console.error(subjectsError);
        alert("Exam subjects delete nahi hue.");
        return;
    }


    // Delete exam
    const { error: examError } = await db
        .from("exams")
        .delete()
        .eq("id", examId)
        .eq("school_id", schoolId);


    if (examError) {
        console.error(examError);
        alert("Exam delete nahi hua.");
        return;
    }


    alert("Exam successfully delete ho gaya. ✅");


    // Reload exams
    loadExams();

}



// ===============================
// HTML ESCAPE
// ===============================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



// ===============================
// JAVASCRIPT ESCAPE
// ===============================

function escapeJs(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}



// ===============================
// START
// ===============================

loadExams();