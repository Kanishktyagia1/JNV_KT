// ===============================
// TEACHER RESULT ENTRY
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // ===============================
    // GET LOGGED TEACHER
    // ===============================

    let teacherData = null;

    try {
        teacherData =
            JSON.parse(
                localStorage.getItem("jnv_logged_teacher")
            );
    } catch (error) {
        teacherData = null;
    }


    // ===============================
    // GET URL PARAMETERS
    // ===============================

    const params =
        new URLSearchParams(window.location.search);

    const examId =
        params.get("examId");

    const subject =
        params.get("subject");


    // ===============================
    // GET HTML ELEMENTS
    // ===============================

    const examName =
        document.getElementById("examName");

    const examClass =
        document.getElementById("examClass");

    const examSession =
        document.getElementById("examSession");

    const subjectName =
        document.getElementById("subjectName");

    const resultMessage =
        document.getElementById("resultMessage");

    const resultTable =
        document.getElementById("resultTable");

    const studentRows =
        document.getElementById("studentRows");

    const saveMarks =
        document.getElementById("saveMarks");


    let currentExam = null;
    let students = [];


    // ===============================
    // LOGIN CHECK
    // ===============================

    if (!teacherData) {

        window.location.href = "login.html";
        return;
    }


    // ===============================
    // LOAD EXAMS
    // ===============================

    let exams = [];

    try {

        exams =
            JSON.parse(
                localStorage.getItem("jnv_exams")
            ) || [];

    } catch (error) {

        exams = [];
    }


    // ===============================
    // FIND EXAM
    // ===============================

    const exam =
        exams.find(function (e) {

            return String(e.id) ===
                String(examId);

        });


    if (!exam) {

        resultMessage.textContent =
            "Exam not found.";

        return;
    }


    currentExam = exam;


    // ===============================
    // LOAD ASSIGNMENTS
    // ===============================

    let assignments = [];

    try {

        assignments =
            JSON.parse(
                localStorage.getItem(
                    "jnv_teacher_assignments"
                )
            ) || [];

    } catch (error) {

        assignments = [];
    }


    // ===============================
    // CHECK ASSIGNMENT
    // ===============================

    const assignment =
        assignments.find(function (a) {

            return (
                String(a.teacherId).trim() ===
                String(teacherData.id).trim()
                &&
                String(a.examId) ===
                String(examId)
                &&
                String(a.subject).trim().toLowerCase() ===
                String(subject).trim().toLowerCase()
            );

        });


    if (!assignment) {

        resultMessage.textContent =
            "You are not assigned to this exam or subject.";

        return;
    }


    // ===============================
    // SHOW EXAM INFORMATION
    // ===============================

    examName.textContent =
        exam.examName || "Exam";

    examClass.textContent =
        `${exam.className || ""} - ${exam.section || ""}`;

    examSession.textContent =
        exam.examYear || "";

    subjectName.textContent =
        subject || "";


    // ===============================
    // FIND SUBJECT INDEX
    // ===============================

    const subjects =
        Array.isArray(exam.subjects)
            ? exam.subjects
            : [];


    const subjectIndex =
        subjects.findIndex(function (item) {

            const name =
                typeof item === "string"
                    ? item
                    : item.name;

            return String(name)
                .trim()
                .toLowerCase() ===
                String(subject)
                .trim()
                .toLowerCase();

        });


    if (subjectIndex === -1) {

        resultMessage.textContent =
            "Subject nahi mila.";

        return;
    }


    // ===============================
    // LOAD RESULT DATA
    // ===============================

    let savedResults = [];

    try {

        savedResults =
            JSON.parse(
                localStorage.getItem("jnv_results")
            ) || [];

    } catch (error) {

        savedResults = [];
    }


    /*
        New format:

        jnv_results = [
            {
                examId: "...",
                students: [...]
            }
        ]

        Old format is also supported.
    */


    if (Array.isArray(savedResults)) {

        const resultData =
            savedResults.find(function (item) {

                return String(item.examId) ===
                    String(exam.id);

            });


        if (
            resultData &&
            Array.isArray(resultData.students)
        ) {

            students =
                resultData.students;
        }

    } else if (
        savedResults &&
        typeof savedResults === "object"
    ) {

        // Support old format

        if (
            Array.isArray(
                savedResults[exam.id]
            )
        ) {

            students =
                savedResults[exam.id];
        }
    }


    // ===============================
    // IF NO STUDENTS
    // ===============================

    if (students.length === 0) {

        resultMessage.textContent =
            "No student result data found for this exam.";

        return;
    }


    // ===============================
    // SHOW RESULT TABLE
    // ===============================

    resultMessage.style.display =
        "none";

    resultTable.style.display =
        "table";

    saveMarks.style.display =
        "inline-block";

    studentRows.innerHTML =
        "";


    // ===============================
    // CREATE STUDENT ROWS
    // ===============================

    students.forEach(function (student, index) {

        let existingMarks = "";


        if (
            Array.isArray(student.marks) &&
            student.marks[subjectIndex] !== undefined &&
            student.marks[subjectIndex] !== ""
        ) {

            existingMarks =
                student.marks[subjectIndex];
        }


        studentRows.innerHTML += `

            <tr>

                <td>
                    ${student.rollNumber || ""}
                </td>

                <td>
                    ${student.studentName || ""}
                </td>

                <td>

                    <input
                        type="number"
                        class="marks-input"
                        data-index="${index}"
                        min="0"
                        max="${Number(exam.maxMarks)}"
                        step="0.01"
                        value="${existingMarks}"
                        inputmode="decimal"
                        autocomplete="off"
                    >

                </td>

            </tr>

        `;
    });


    // ===============================
    // MARKS INPUT VALIDATION
    // ===============================

    document
        .querySelectorAll(".marks-input")
        .forEach(function (input) {

            input.addEventListener(
                "input",
                function () {

                    const value =
                        input.value.trim();

                    if (value === "") {

                        input.style.borderColor =
                            "";

                        return;
                    }


                    const marks =
                        Number(value);


                    if (
                        isNaN(marks) ||
                        marks < 0 ||
                        marks >
                        Number(exam.maxMarks)
                    ) {

                        input.style.borderColor =
                            "#dc2626";

                    } else {

                        input.style.borderColor =
                            "";
                    }

                }
            );

        });


    // ===============================
    // SAVE MARKS
    // ===============================

    saveMarks.addEventListener(
        "click",
        function () {

            // -------------------------------
            // VALIDATE ALL MARKS
            // -------------------------------

            const inputs =
                document.querySelectorAll(
                    ".marks-input"
                );


            for (const input of inputs) {

                const value =
                    input.value.trim();


                // Empty is allowed

                if (value === "") {
                    continue;
                }


                const marks =
                    Number(value);


                if (
                    isNaN(marks) ||
                    marks < 0 ||
                    marks >
                    Number(exam.maxMarks)
                ) {

                    alert(
                        `Marks 0 se ${exam.maxMarks} ke beech hone chahiye.`
                    );

                    input.focus();

                    return;
                }

            }


            // -------------------------------
            // SAVE EACH STUDENT'S MARKS
            // -------------------------------

            inputs.forEach(function (input) {

                const studentIndex =
                    Number(
                        input.dataset.index
                    );


                if (!students[studentIndex]) {
                    return;
                }


                // Create marks array

                if (
                    !Array.isArray(
                        students[studentIndex].marks
                    )
                ) {

                    students[studentIndex].marks =
                        [];
                }


                const value =
                    input.value.trim();


                if (value === "") {

                    students[studentIndex]
                        .marks[subjectIndex] =
                        "";

                } else {

                    students[studentIndex]
                        .marks[subjectIndex] =
                        Number(value);
                }

            });


            // -------------------------------
            // CALCULATE RESULTS
            // -------------------------------

            calculateAllResults(
                students,
                exam
            );


            // -------------------------------
            // CREATE RESULT OBJECT
            // -------------------------------

            let results = [];

            try {

                const stored =
                    JSON.parse(
                        localStorage.getItem(
                            "jnv_results"
                        )
                    );

                if (Array.isArray(stored)) {

                    results = stored;

                }

            } catch (error) {

                results = [];
            }


            const resultIndex =
                results.findIndex(function (item) {

                    return String(item.examId) ===
                        String(exam.id);

                });


            const resultData = {

                examId:
                    exam.id,

                examName:
                    exam.examName,

                examYear:
                    exam.examYear,

                className:
                    exam.className,

                section:
                    exam.section,

                subjects:
                    exam.subjects,

                maxMarks:
                    exam.maxMarks,

                students:
                    students

            };


            if (resultIndex === -1) {

                results.push(
                    resultData
                );

            } else {

                results[resultIndex] =
                    resultData;
            }


            // -------------------------------
            // SAVE TO LOCAL STORAGE
            // -------------------------------

            localStorage.setItem(
                "jnv_results",
                JSON.stringify(results)
            );


            alert(
                "Marks successfully saved! ✅"
            );

        }
    );

});


// ==========================================
// CALCULATE TOTAL / PERCENTAGE / RESULT / RANK
// ==========================================

function calculateAllResults(
    students,
    exam
) {

    const subjects =
        Array.isArray(exam.subjects)
            ? exam.subjects
            : [];


    const maxMarks =
        Number(exam.maxMarks) || 0;


    const maxTotal =
        maxMarks *
        subjects.length;


    // ======================================
    // CALCULATE EACH STUDENT
    // ======================================

    students.forEach(function (student) {

        let total = 0;

        let hasMarks = false;

        let failed = false;


        // Make marks array

        if (
            !Array.isArray(student.marks)
        ) {

            student.marks = [];
        }


        subjects.forEach(
            function (subjectItem, index) {

                const value =
                    student.marks[index];


                if (
                    value !== "" &&
                    value !== null &&
                    value !== undefined &&
                    !isNaN(Number(value))
                ) {

                    const marks =
                        Number(value);


                    hasMarks = true;


                    total += marks;


                    // Normal pass/fail rule

                    if (
                        marks < 33
                    ) {

                        failed = true;
                    }

                }

            }
        );


        // ==================================
        // PERCENTAGE
        // ==================================

        const percentage =
            maxTotal > 0
                ? (total / maxTotal) * 100
                : 0;


        student.total =
            hasMarks
                ? total
                : 0;


        student.percentage =
            hasMarks
                ? percentage.toFixed(2) + "%"
                : "0%";


        student.result =
            hasMarks
                ? (
                    failed
                        ? "Fail"
                        : "Pass"
                )
                : "";

    });


    // ======================================
    // CALCULATE RANK
    // ======================================

    const rankedStudents =
        students
            .filter(function (student) {

                return (
                    student.total > 0
                );

            })
            .sort(function (a, b) {

                return (
                    b.total -
                    a.total
                );

            });


    rankedStudents.forEach(
        function (student, index) {

            student.rank =
                index + 1;

        }
    );


    // Students with no marks

    students.forEach(
        function (student) {

            if (
                !student.total ||
                student.total <= 0
            ) {

                student.rank =
                    "";

            }

        }
    );

}