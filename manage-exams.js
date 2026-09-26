const examContainer = document.getElementById("examContainer");
const schoolId = localStorage.getItem("jnv_school_id");

let exams = [];

async function loadExams() {
    examContainer.innerHTML = `
        <div class="empty">
            <h3>⏳ Loading Exams...</h3>
        </div>
    `;

    try {
        if (!schoolId) {
            throw new Error("School ID nahi mila. Please login again.");
        }

        // 1. Exams
        const { data, error } = await db
            .from("exams")
            .select("*")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        exams = data || [];

        // 2. Har exam ki class + subjects separately load karo
        for (const exam of exams) {

            // Class
            if (exam.class_id) {
                const { data: classData, error: classError } = await db
                    .from("classes")
                    .select("class_name, section")
                    .eq("id", exam.class_id)
                    .maybeSingle();

                if (classError) {
                    console.error("Class error:", classError);
                }

                exam.classData = classData || {};
            } else {
                exam.classData = {};
            }

            // Subjects
            const { data: subjectData, error: subjectError } = await db
                .from("exam_subjects")
                .select("subject_name")
                .eq("exam_id", exam.id);

            if (subjectError) {
                console.error("Subject error:", subjectError);
            }

            exam.subjects = subjectData || [];
        }

        displayExams();

    } catch (error) {
        console.error("MANAGE EXAMS ERROR:", error);

        examContainer.innerHTML = `
            <div class="empty">
                <h3>❌ Exams Load Nahi Hue</h3>
                <p>${escapeHtml(error.message || String(error))}</p>
            </div>
        `;
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