const examContainer = document.getElementById("examContainer");
const schoolId = localStorage.getItem("jnv_school_id");

let exams = [];

async function loadExam() {
    try {
        if (!examId) {
            throw new Error("URL mein exam ID nahi mili.");
        }

        if (!schoolId) {
            throw new Error("jnv_school_id nahi mila.");
        }

        document.getElementById("examInfo").innerHTML =
            "<b>1/5</b> Exam loading...";

        const { data: examData, error: examError } = await db
            .from("exams")
            .select("*")
            .eq("id", examId)
            .eq("school_id", schoolId)
            .single();

        if (examError) {
            throw new Error("EXAMS QUERY: " + examError.message);
        }

        document.getElementById("examInfo").innerHTML =
            "<b>2/5</b> Exam OK. Loading class...";

        const { data: classData, error: classError } = await db
            .from("classes")
            .select("class_name, section")
            .eq("id", examData.class_id)
            .single();

        if (classError) {
            throw new Error("CLASSES QUERY: " + classError.message);
        }

        document.getElementById("examInfo").innerHTML =
            "<b>3/5</b> Class OK. Loading subjects...";

        const { data: subjectData, error: subjectError } = await db
            .from("exam_subjects")
            .select("id, subject_name, max_marks")
            .eq("exam_id", examId);

        if (subjectError) {
            throw new Error("SUBJECTS QUERY: " + subjectError.message);
        }

        document.getElementById("examInfo").innerHTML =
            "<b>4/5</b> Subjects OK. Loading students...";

        const { data: examStudents, error: studentError } = await db
            .from("exam_students")
            .select("id, student_id, roll_number_snapshot, student_name_snapshot")
            .eq("exam_id", examId);

        if (studentError) {
            throw new Error("EXAM STUDENTS QUERY: " + studentError.message);
        }

        document.getElementById("examInfo").innerHTML = `
            <h2>✅ All queries working</h2>
            <p>Exam: ${examData.exam_name}</p>
            <p>Class: ${classData.class_name} - ${classData.section}</p>
            <p>Subjects: ${subjectData.length}</p>
            <p>Students: ${examStudents.length}</p>
        `;

    } catch (error) {

        console.error("RESULT FILE ERROR:", error);

        document.getElementById("examInfo").innerHTML = `
            <div class="not-found">
                <h2>❌ Exact Error Found</h2>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        document.getElementById("tableBox").innerHTML = "";
    }
}


// ===============================
// DISPLAY
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

        const classData = exam.classData || {};

        const subjects = exam.subjects.length
            ? exam.subjects
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
// OPEN RESULT
// ===============================

function openResultFile(examId) {

    if (!examId) {
        alert("Exam ID nahi mila.");
        return;
    }

    window.location.href =
        "result-file.html?id=" +
        encodeURIComponent(examId);
}


// ===============================
// CREATE EXAM
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

    if (!confirmDelete) return;

    try {

        // Results first
        const { error: resultError } = await db
            .from("results")
            .delete()
            .eq("exam_id", examId);

        if (resultError) {
            console.error(resultError);
            throw new Error("Results delete nahi hue.");
        }

        // Exam students
        const { error: studentError } = await db
            .from("exam_students")
            .delete()
            .eq("exam_id", examId);

        if (studentError) {
            console.error(studentError);
            throw new Error("Exam students delete nahi hue.");
        }

        // Exam subjects
        const { error: subjectError } = await db
            .from("exam_subjects")
            .delete()
            .eq("exam_id", examId);

        if (subjectError) {
            console.error(subjectError);
            throw new Error("Exam subjects delete nahi hue.");
        }

        // Exam
        const { error: examError } = await db
            .from("exams")
            .delete()
            .eq("id", examId)
            .eq("school_id", schoolId);

        if (examError) {
            console.error(examError);
            throw new Error("Exam delete nahi hua.");
        }

        alert("Exam successfully delete ho gaya. ✅");

        loadExams();

    } catch (error) {

        console.error("DELETE ERROR:", error);

        alert(error.message || "Delete failed.");
    }
}


// ===============================
// HELPERS
// ===============================

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJs(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// ===============================
// START
// ===============================

loadExams();