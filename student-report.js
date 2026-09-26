// ===============================
// STUDENT REPORT - SUPABASE
// ===============================

const searchButton =
    document.getElementById("searchStudent");

const rollNumberInput =
    document.getElementById("rollNumber");

const studentReport =
    document.getElementById("studentReport");


searchButton.addEventListener(
    "click",
    findStudent
);


async function findStudent() {

    const rollNumber =
        rollNumberInput.value.trim();


    if (rollNumber === "") {

        alert("Please enter Roll Number.");

        return;
    }


    studentReport.innerHTML = `
        <div class="report-card">
            <p>Searching result...</p>
        </div>
    `;


    // ===============================
    // FIND STUDENT
    // ===============================

    const {
        data: examStudents,
        error: studentError
    } = await db
        .from("exam_students")
        .select(`
            id,
            exam_id,
            roll_number_snapshot,
            student_name_snapshot
        `)
        .eq("roll_number_snapshot", rollNumber);


    if (studentError) {

        console.error(
            "Student search error:",
            studentError
        );

        studentReport.innerHTML = `
            <div class="report-card">
                <p>Student search nahi ho paaya.</p>
            </div>
        `;

        return;
    }


    if (
        !examStudents ||
        examStudents.length === 0
    ) {

        studentReport.innerHTML = `
            <div class="report-card">
                <p>Student nahi mila.</p>
            </div>
        `;

        return;
    }


    let reportsHTML = "";


    // ===============================
    // CHECK EACH EXAM
    // ===============================

    for (const student of examStudents) {

        // -------------------------------
        // LOAD EXAM
        // -------------------------------

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
                published
            `)
            .eq("id", student.exam_id)
            .eq("published", true)
            .maybeSingle();


        if (examError) {

            console.error(
                "Exam loading error:",
                examError
            );

            continue;
        }


        // Only published exams
        if (!exam) {
            continue;
        }


        // -------------------------------
        // LOAD CLASS
        // -------------------------------

        const {
            data: classData
        } = await db
            .from("classes")
            .select(`
                class_name,
                section
            `)
            .eq("id", exam.class_id)
            .maybeSingle();


        // -------------------------------
        // LOAD SUBJECTS
        // -------------------------------

        const {
            data: subjects,
            error: subjectError
        } = await db
            .from("exam_subjects")
            .select(`
                subject_name,
                max_marks
            `)
            .eq("exam_id", exam.id);


        if (subjectError) {

            console.error(
                "Subject loading error:",
                subjectError
            );

            continue;
        }


        // -------------------------------
        // LOAD MARKS
        // -------------------------------

        const {
            data: results,
            error: resultError
        } = await db
            .from("results")
            .select(`
                subject,
                marks
            `)
            .eq("exam_id", exam.id)
            .eq("exam_student_id", student.id);


        if (resultError) {

            console.error(
                "Result loading error:",
                resultError
            );

            continue;
        }


        // -------------------------------
        // MARKS MAP
        // -------------------------------

        const marksMap = {};

        (results || []).forEach(
            function (result) {

                marksMap[
                    result.subject
                ] = Number(result.marks);

            }
        );


        // -------------------------------
        // CALCULATE
        // -------------------------------

        let totalMarks = 0;
        let totalMaxMarks = 0;
        let failed = false;


        let subjectsHTML = "";


        (subjects || []).forEach(
            function (subject) {

                const marks =
                    marksMap[
                        subject.subject_name
                    ];


                const maxMarks =
                    Number(subject.max_marks);


                totalMaxMarks +=
                    maxMarks;


                if (
                    marks === undefined ||
                    marks === null
                ) {

                    subjectsHTML += `
                        <tr>
                            <td>
                                ${subject.subject_name}
                            </td>

                            <td>
                                -
                            </td>

                            <td>
                                ${maxMarks}
                            </td>
                        </tr>
                    `;

                    failed = true;

                    return;
                }


                totalMarks += marks;


                // Pass criteria
                if (marks < 33) {
                    failed = true;
                }


                subjectsHTML += `
                    <tr>
                        <td>
                            ${subject.subject_name}
                        </td>

                        <td>
                            ${marks}
                        </td>

                        <td>
                            ${maxMarks}
                        </td>
                    </tr>
                `;

            }
        );


        const percentage =
            totalMaxMarks > 0
                ? (
                    totalMarks /
                    totalMaxMarks *
                    100
                ).toFixed(2)
                : "0.00";


        const result =
            failed
                ? "FAIL"
                : "PASS";


        // -------------------------------
        // CREATE REPORT
        // -------------------------------

        reportsHTML += `

            <div class="report-card">

                <h1>
                    STUDENT REPORT CARD
                </h1>


                <h2>
                    ${student.student_name_snapshot}
                </h2>


                <p>
                    <strong>Roll Number:</strong>
                    ${student.roll_number_snapshot}
                </p>


                <p>
                    <strong>Class:</strong>
                    ${classData
                        ? `${classData.class_name || ""} ${classData.section || ""}`
                        : "-"
                    }
                </p>


                <p>
                    <strong>Exam:</strong>
                    ${exam.exam_name}
                </p>


                <p>
                    <strong>Session:</strong>
                    ${exam.exam_year}
                </p>


                <hr>


                <table style="
                    width:100%;
                    border-collapse:collapse;
                    margin-top:15px;
                ">

                    <thead>

                        <tr>

                            <th style="
                                text-align:left;
                                padding:10px;
                                border-bottom:1px solid #cbd5e1;
                            ">
                                Subject
                            </th>

                            <th style="
                                text-align:left;
                                padding:10px;
                                border-bottom:1px solid #cbd5e1;
                            ">
                                Marks
                            </th>

                            <th style="
                                text-align:left;
                                padding:10px;
                                border-bottom:1px solid #cbd5e1;
                            ">
                                Max Marks
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${subjectsHTML}

                    </tbody>

                </table>


                <hr>


                <p>
                    <strong>Total Marks:</strong>
                    ${totalMarks} / ${totalMaxMarks}
                </p>


                <p>
                    <strong>Percentage:</strong>
                    ${percentage}%
                </p>


                <p>
                    <strong>Result:</strong>
                    ${result}
                </p>


                <button
                    class="print-btn"
                    onclick="window.print()"
                >
                    🖨️ Print Report
                </button>

            </div>

        `;
    }


    // ===============================
    // SHOW RESULT
    // ===============================

    if (reportsHTML === "") {

        studentReport.innerHTML = `
            <div class="report-card">
                <p>
                    No published result found for this Roll Number.
                </p>
            </div>
        `;

        return;
    }


    studentReport.innerHTML =
        reportsHTML;
}