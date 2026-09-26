const examContainer = document.getElementById("examContainer");
const schoolId = localStorage.getItem("jnv_school_id");

let exams = [];

// ===============================
// LOAD EXAMS
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

    try {

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
                school_id
            `)
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        exams = data || [];

        // Load extra information
        await Promise.all(
            exams.map(async function (exam) {

                exam.classInfo = null;
                exam.subjects = [];
                exam.actualStudentCount = 0;

                // CLASS
                if (exam.class_id) {

                    const { data: classData } = await db
                        .from("classes")
                        .select("id, class_name, section")
                        .eq("id", exam.class_id)
                        .maybeSingle();

                    exam.classInfo = classData;
                }

                // SUBJECTS
                const { data: subjects } = await db
                    .from("exam_subjects")
                    .select("subject_name")
                    .eq("exam_id", exam.id)
                    .order("subject_name");

                exam.subjects = subjects || [];

                // STUDENTS
                const { count } = await db
                    .from("exam_students")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq("exam_id", exam.id);

                exam.actualStudentCount = Number(count || 0);

            })
        );

        displayExams();

    } catch (error) {

        console.error("loadExams error:", error);

        examContainer.innerHTML = `
            <div class="empty">
                <h3>❌ Exams Load Nahi Hue</h3>
                <p>${escapeHtml(error.message || "Unknown error")}</p>
            </div>
        `;
    }
}


// ===============================
// DISPLAY EXAMS
// ===============================

function displayExams() {

    examContainer.innerHTML = "";

    if (!exams.length) {

        examContainer.innerHTML = `
            <div class="empty">
                <h3>📭 No Exams Found</h3>
                <p>Abhi tak koi exam create nahi hua.</p>
            </div>
        `;

        return;
    }

    exams.forEach(function (exam) {

        const classData = exam.classInfo || {};

        const subjects = exam.subjects.length
            ? exam.subjects
                .map(function (subject) {
                    return subject.subject_name;
                })
                .join(", ")
            : "No subjects";

        const createdDate = exam.created_at
            ? new Date(exam.created_at).toLocaleString()
            : "-";

        const card = document.createElement("div");

        card.className = "exam-card";

        card.innerHTML = `

            <h3>
                📝 ${escapeHtml(
                    exam.exam_name || "Unnamed Exam"
                )}
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
                    ${escapeHtml(
                        String(exam.max_marks ?? "-")
                    )}
                </div>

                <div>
                    <strong>Students:</strong>
                    ${exam.actualStudentCount}
                </div>

                <div>
                    <strong>Created:</strong>
                    ${escapeHtml(createdDate)}
                </div>

            </div>

            <div class="buttons">

                <button
                    class="btn result-btn"
                    onclick="openResultFile('${escapeJs(
                        exam.id
                    )}')"
                >
                    📊 Open Result File
                </button>

                <button
                    class="btn delete-btn"
                    onclick="deleteExam('${escapeJs(
                        exam.id
                    )}')"
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
        "result-file.html?id=" +
        encodeURIComponent(examId);
}


// ===============================
// CREATE NEW EXAM
// ===============================

function createNewExam() {

    window.location.href =
        "create-exam.html";
}


// ===============================
// DELETE EXAM
// ===============================

async function deleteExam(examId) {

    const exam = exams.find(function (item) {
        return String(item.id) === String(examId);
    });

    if (!exam) {
        alert("Exam nahi mila.");
        return;
    }

    const confirmDelete = confirm(
        `Kya tum "${exam.exam_name}" ko delete karna chahte ho?\n\n` +
        `Is exam ke students, subjects aur saved marks bhi delete honge.`
    );

    if (!confirmDelete) {
        return;
    }

    try {

        // 1. DELETE RESULTS
        const { error: resultsError } = await db
            .from("results")
            .delete()
            .eq("exam_id", examId);

        if (resultsError) {
            throw new Error(
                "Saved marks delete nahi hue: " +
                resultsError.message
            );
        }


        // 2. DELETE EXAM STUDENTS
        const { error: studentsError } = await db
            .from("exam_students")
            .delete()
            .eq("exam_id", examId);

        if (studentsError) {
            throw new Error(
                "Exam students delete nahi hue: " +
                studentsError.message
            );
        }


        // 3. DELETE SUBJECTS
        const { error: subjectsError } = await db
            .from("exam_subjects")
            .delete()
            .eq("exam_id", examId);

        if (subjectsError) {
            throw new Error(
                "Exam subjects delete nahi hue: " +
                subjectsError.message
            );
        }


        // 4. DELETE EXAM
        const { error: examError } = await db
            .from("exams")
            .delete()
            .eq("id", examId)
            .eq("school_id", schoolId);

        if (examError) {
            throw new Error(
                "Exam delete nahi hua: " +
                examError.message
            );
        }


        alert(
            "Exam successfully delete ho gaya. ✅"
        );

        await loadExams();

    } catch (error) {

        console.error(
            "deleteExam error:",
            error
        );

        alert(
            "Exam delete nahi hua.\n\n" +
            (error.message || "Unknown error")
        );
    }
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
// JS ESCAPE
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