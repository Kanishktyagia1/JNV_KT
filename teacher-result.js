// ===============================
// TEACHER RESULT ENTRY - SUPABASE
// ===============================

document.addEventListener("DOMContentLoaded", async function () {

    // ===============================
    // GET LOGGED TEACHER
    // ===============================

    let teacherData = null;

    try {
        teacherData = JSON.parse(
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


    // ===============================
    // LOGIN CHECK
    // ===============================

    if (!teacherData) {
        window.location.href = "login.html";
        return;
    }

    if (!examId || !subject) {
        resultMessage.textContent =
            "Invalid exam or subject.";
        return;
    }


    // ===============================
    // LOAD EXAM
    // ===============================

    const {
        data: exam,
        error: examError
    } = await db
        .from("exams")
        .select(`
            id,
            exam_name,
            exam_year,
            class_id,
            max_marks
        `)
        .eq("id", examId)
        .maybeSingle();


    if (examError) {

        console.error(
            "Exam loading error:",
            examError
        );

        resultMessage.textContent =
            "Exam load nahi ho paaya.";

        return;
    }


    if (!exam) {

        resultMessage.textContent =
            "Exam not found.";

        return;
    }


    // ===============================
    // CHECK TEACHER ASSIGNMENT
    // ===============================

    const {
        data: assignment,
        error: assignmentError
    } = await db
        .from("teacher_assignments")
        .select(`
            id,
            exam_id,
            teacher_id,
            subject
        `)
        .eq("exam_id", examId)
        .eq("teacher_id", teacherData.id)
        .eq("subject", subject)
        .maybeSingle();


    if (assignmentError) {

        console.error(
            "Assignment checking error:",
            assignmentError
        );

        resultMessage.textContent =
            "Assignment check nahi ho paaya.";

        return;
    }


    if (!assignment) {

        resultMessage.textContent =
            "You are not assigned to this exam or subject.";

        return;
    }


    // ===============================
    // LOAD CLASS
    // ===============================

    let classText = "";

    const {
        data: classData,
        error: classError
    } = await db
        .from("classes")
        .select(`
            id,
            class_name,
            section
        `)
        .eq("id", exam.class_id)
        .maybeSingle();


    if (!classError && classData) {

        classText =
            `${classData.class_name || ""}`;

        if (classData.section) {
            classText +=
                ` - ${classData.section}`;
        }
    }


    // ===============================
    // LOAD SUBJECT
    // ===============================

    const {
        data: subjectData,
        error: subjectError
    } = await db
        .from("exam_subjects")
        .select(`
            id,
            subject_name,
            max_marks
        `)
        .eq("exam_id", examId)
        .eq("subject_name", subject)
        .maybeSingle();


    if (subjectError) {

        console.error(
            "Subject loading error:",
            subjectError
        );

        resultMessage.textContent =
            "Subject load nahi ho paaya.";

        return;
    }


    if (!subjectData) {

        resultMessage.textContent =
            "Subject nahi mila.";

        return;
    }


    // ===============================
    // MAX MARKS
    // ===============================

    const maxMarks =
        Number(subjectData.max_marks);


    // ===============================
    // SHOW EXAM INFORMATION
    // ===============================

    examName.textContent =
        exam.exam_name || "Exam";

    examClass.textContent =
        classText;

    examSession.textContent =
        exam.exam_year || "";

    subjectName.textContent =
        subject || "";


    // ===============================
    // LOAD EXAM STUDENTS
    // ===============================

    const {
        data: examStudents,
        error: studentsError
    } = await db
        .from("exam_students")
        .select(`
            id,
            roll_number_snapshot,
            student_name_snapshot
        `)
        .eq("exam_id", examId)
        .order("roll_number_snapshot");


    if (studentsError) {

        console.error(
            "Student loading error:",
            studentsError
        );

        resultMessage.textContent =
            "Students load nahi ho paaye.";

        return;
    }


    if (
        !examStudents ||
        examStudents.length === 0
    ) {

        resultMessage.textContent =
            "No students found for this exam.";

        return;
    }


    // ===============================
    // LOAD EXISTING RESULTS
    // ===============================

    const {
        data: existingResults,
        error: resultsError
    } = await db
        .from("results")
        .select(`
            id,
            exam_id,
            exam_student_id,
            subject,
            marks
        `)
        .eq("exam_id", examId)
        .eq("subject", subject);


    if (resultsError) {

        console.error(
            "Results loading error:",
            resultsError
        );

        resultMessage.textContent =
            "Existing marks load nahi ho paaye.";

        return;
    }


    // ===============================
    // CREATE MARKS MAP
    // ===============================

    const marksMap = {};

    (existingResults || []).forEach(
        function (result) {

            marksMap[
                String(result.exam_student_id)
            ] = result.marks;

        }
    );


    // ===============================
    // SHOW TABLE
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

    examStudents.forEach(
        function (student, index) {

            const savedMarks =
                marksMap[String(student.id)];

            const existingMarks =
                savedMarks !== undefined &&
                savedMarks !== null
                    ? savedMarks
                    : "";


            studentRows.innerHTML += `

                <tr>

                    <td>
                        ${student.roll_number_snapshot || ""}
                    </td>

                    <td>
                        ${student.student_name_snapshot || ""}
                    </td>

                    <td>

                        <input
                            type="number"
                            class="marks-input"
                            data-student-id="${student.id}"
                            min="0"
                            max="${maxMarks}"
                            step="0.01"
                            value="${existingMarks}"
                            inputmode="decimal"
                            autocomplete="off"
                        >

                    </td>

                </tr>

            `;
        }
    );


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
                        marks > maxMarks
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
        async function () {

            const inputs =
                document.querySelectorAll(
                    ".marks-input"
                );


            // -------------------------------
            // VALIDATE
            // -------------------------------

            for (const input of inputs) {

                const value =
                    input.value.trim();


                if (value === "") {
                    continue;
                }


                const marks =
                    Number(value);


                if (
                    isNaN(marks) ||
                    marks < 0 ||
                    marks > maxMarks
                ) {

                    alert(
                        `Marks 0 se ${maxMarks} ke beech hone chahiye.`
                    );

                    input.focus();

                    return;
                }

            }


            // -------------------------------
            // CREATE RESULT ROWS
            // -------------------------------

            const resultRows = [];


            inputs.forEach(
                function (input) {

                    const value =
                        input.value.trim();


                    // Empty marks ko database mein
                    // save nahi karenge

                    if (value === "") {
                        return;
                    }


                    resultRows.push({

                        exam_id:
                            examId,

                        exam_student_id:
                            input.dataset.studentId,

                        subject:
                            subject,

                        marks:
                            Number(value)

                    });

                }
            );


            // -------------------------------
            // SAVE TO SUPABASE
            // -------------------------------

            if (resultRows.length === 0) {

                alert(
                    "Please enter at least one student's marks."
                );

                return;
            }


            saveMarks.disabled =
                true;

            saveMarks.textContent =
                "Saving...";


            const {
                error: saveError
            } = await db
                .from("results")
                .upsert(
                    resultRows,
                    {
                        onConflict:
                            "exam_id,exam_student_id,subject"
                    }
                );


            if (saveError) {

                console.error(
                    "Marks save error:",
                    saveError
                );

                alert(
                    "Marks save nahi hue: " +
                    saveError.message
                );

                saveMarks.disabled =
                    false;

                saveMarks.textContent =
                    "Save Marks";

                return;
            }


            // -------------------------------
            // SUCCESS
            // -------------------------------

            alert(
                "Marks successfully saved! ✅"
            );


            saveMarks.disabled =
                false;

            saveMarks.textContent =
                "Save Marks";


            // Reload saved values

            location.reload();

        }
    );

});