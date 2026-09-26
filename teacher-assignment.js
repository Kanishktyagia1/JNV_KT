const examSelect = document.getElementById("examSelect");

const subjectCard =
    document.getElementById("subjectCard");

const subjectList =
    document.getElementById("subjectList");

const teacherCard =
    document.getElementById("teacherCard");

const teacherList =
    document.getElementById("teacherList");

const selectedSubject =
    document.getElementById("selectedSubject");

const assignTeachers =
    document.getElementById("assignTeachers");

const assignmentList =
    document.getElementById("assignmentList");


let selectedExam = null;
let currentSubject = "";


// =====================================
// LOAD EXAMS
// =====================================

async function loadExams() {

    examSelect.innerHTML =
        `<option value="">Loading exams...</option>`;


    const { data: exams, error } = await db
        .from("exams")
        .select("id, exam_name")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error("Exam error:", error);

        examSelect.innerHTML =
            `<option value="">Failed to load exams</option>`;

        alert(
            "Exam load failed:\n" +
            error.message
        );

        return;
    }


    examSelect.innerHTML =
        `<option value="">-- Select Exam --</option>`;


    if (!exams || exams.length === 0) {

        examSelect.innerHTML +=
            `<option value="">No exams created yet</option>`;

        return;
    }


    exams.forEach(function (exam) {

        examSelect.innerHTML += `
            <option value="${exam.id}">
                ${exam.exam_name}
            </option>
        `;

    });
}


// =====================================
// EXAM SELECT
// =====================================

examSelect.addEventListener(
    "change",
    async function () {

        const examId = this.value;


        subjectCard.style.display = "none";

        teacherCard.style.display = "none";


        currentSubject = "";


        selectedSubject.textContent = "";


        if (!examId) {

            selectedExam = null;

            assignmentList.innerHTML =
                `<p class="message">
                    Select an exam to see assignments.
                </p>`;

            return;
        }


        selectedExam = examId;


        await loadSubjects();

        await loadAssignments();

    }
);


// =====================================
// LOAD SUBJECTS
// =====================================

async function loadSubjects() {

    subjectList.innerHTML =
        `<p class="message">
            Loading subjects...
        </p>`;


    const { data: subjects, error } = await db
        .from("exam_subjects")
        .select(
            "id, subject_name, max_marks"
        )
        .eq(
            "exam_id",
            selectedExam
        )
        .order("created_at");


    if (error) {

        console.error(
            "Subject error:",
            error
        );

        subjectList.innerHTML =
            `<p class="message">
                Subjects load nahi ho paaye.
            </p>`;

        subjectCard.style.display = "block";

        alert(
            "Subject load failed:\n" +
            error.message
        );

        return;
    }


    subjectList.innerHTML = "";


    if (!subjects || subjects.length === 0) {

        subjectList.innerHTML =
            `<p class="message">
                No subjects found in this exam.
            </p>`;

        subjectCard.style.display = "block";

        return;
    }


    subjects.forEach(function (subject) {

        const button =
            document.createElement("button");


        button.className =
            "subject-btn";


        button.textContent =
            subject.subject_name;


        button.addEventListener(
            "click",
            async function () {


                document
                    .querySelectorAll(
                        ".subject-btn"
                    )
                    .forEach(function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                currentSubject =
                    subject.subject_name;


                selectedSubject.textContent =
                    currentSubject;


                await loadTeachers();

            }
        );


        subjectList.appendChild(button);

    });


    subjectCard.style.display = "block";
}


// =====================================
// LOAD TEACHERS
// =====================================

async function loadTeachers() {

    teacherList.innerHTML =
        `<p class="message">
            Loading teachers...
        </p>`;


    const schoolId =
        localStorage.getItem(
            "jnv_school_id"
        );


    let query =
        db
            .from("teachers")
            .select(
                "id, teacher_name, teacher_id, assigned_subject"
            )
            .order(
                "teacher_name"
            );


    if (schoolId) {

        query =
            query.eq(
                "school_id",
                schoolId
            );

    }


    const {
        data: teachers,
        error
    } = await query;


    if (error) {

        console.error(
            "Teacher error:",
            error
        );

        teacherList.innerHTML =
            `<p class="message">
                Teachers load nahi ho paaye.
            </p>`;

        teacherCard.style.display = "block";

        return;
    }


    if (!teachers || teachers.length === 0) {

        teacherList.innerHTML =
            `<p class="message">
                No teachers found. Add teachers first.
            </p>`;

        teacherCard.style.display = "block";

        return;
    }


    // =================================
    // MATCH SUBJECT
    // =================================

    const matchingTeachers =
        teachers.filter(
            function (teacher) {

                return String(
                    teacher.assigned_subject || ""
                )
                    .trim()
                    .toLowerCase()
                    ===
                    String(
                        currentSubject
                    )
                        .trim()
                        .toLowerCase();

            }
        );


    if (matchingTeachers.length === 0) {

        teacherList.innerHTML =
            `<p class="message">
                Is subject ke liye koi teacher assigned nahi hai.
            </p>`;

        teacherCard.style.display = "block";

        return;
    }


    teacherList.innerHTML = "";


    matchingTeachers.forEach(
        function (teacher) {

            teacherList.innerHTML += `

                <label class="teacher-item">

                    <input
                        type="checkbox"
                        class="teacher-checkbox"
                        value="${teacher.id}"
                    >

                    <div class="teacher-info">

                        <strong>
                            ${teacher.teacher_name}
                        </strong>

                        <span>
                            Teacher ID:
                            ${teacher.teacher_id}
                        </span>

                    </div>

                </label>

            `;

        }
    );


    teacherCard.style.display = "block";
}


// =====================================
// ASSIGN TEACHERS
// =====================================

assignTeachers.addEventListener(
    "click",
    async function () {


        if (
            !selectedExam ||
            !currentSubject
        ) {

            alert(
                "Please select Exam and Subject first."
            );

            return;
        }


        const checkedTeachers =
            document.querySelectorAll(
                ".teacher-checkbox:checked"
            );


        if (checkedTeachers.length === 0) {

            alert(
                "Please select at least one teacher."
            );

            return;
        }


        let added = 0;
        let alreadyAssigned = 0;


        for (
            const checkbox
            of checkedTeachers
        ) {


            const teacherId =
                checkbox.value;


            // =========================
            // CHECK EXISTING ASSIGNMENT
            // =========================

            const {
                data: existing,
                error: checkError
            } = await db
                .from(
                    "teacher_assignments"
                )
                .select("id")
                .eq(
                    "exam_id",
                    selectedExam
                )
                .eq(
                    "teacher_id",
                    teacherId
                )
                .eq(
                    "subject",
                    currentSubject
                )
                .maybeSingle();


            if (checkError) {

                console.error(
                    "Assignment check error:",
                    checkError
                );

                continue;
            }


            if (existing) {

                alreadyAssigned++;

                continue;
            }


            // =========================
            // INSERT ASSIGNMENT
            // =========================

            const {
                error: insertError
            } = await db
                .from(
                    "teacher_assignments"
                )
                .insert({

                    exam_id:
                        selectedExam,

                    teacher_id:
                        teacherId,

                    subject:
                        currentSubject

                });


            if (insertError) {

                console.error(
                    "Assignment insert error:",
                    insertError
                );

                alert(
                    "Assignment save failed:\n" +
                    insertError.message
                );

                continue;
            }


            added++;

        }


        if (added > 0) {

            alert(
                added +
                " teacher assignment(s) saved successfully!"
            );

        }


        if (
            added === 0 &&
            alreadyAssigned > 0
        ) {

            alert(
                "Selected teachers are already assigned."
            );

        }


        // Uncheck

        document
            .querySelectorAll(
                ".teacher-checkbox"
            )
            .forEach(function (box) {

                box.checked = false;

            });


        await loadAssignments();

    }
);


// =====================================
// LOAD CURRENT ASSIGNMENTS
// =====================================

async function loadAssignments() {


    if (!selectedExam) {

        assignmentList.innerHTML =
            `<p class="message">
                Select an exam to see assignments.
            </p>`;

        return;
    }


    const {
        data: assignments,
        error
    } = await db
        .from(
            "teacher_assignments"
        )
        .select(
            "id, teacher_id, subject"
        )
        .eq(
            "exam_id",
            selectedExam
        )
        .order(
            "created_at"
        );


    if (error) {

        console.error(
            "Assignment load error:",
            error
        );

        assignmentList.innerHTML =
            `<p class="message">
                Assignments load nahi ho paaye.
            </p>`;

        return;
    }


    if (
        !assignments ||
        assignments.length === 0
    ) {

        assignmentList.innerHTML =
            `<p class="message">
                No teachers assigned for this exam yet.
            </p>`;

        return;
    }


    // =================================
    // GET TEACHER IDS
    // =================================

    const teacherIds =
        [
            ...new Set(
                assignments.map(
                    function (assignment) {

                        return assignment.teacher_id;

                    }
                )
            )
        ];


    // =================================
    // GET TEACHERS
    // =================================

    const {
        data: teachers,
        error: teacherError
    } = await db
        .from("teachers")
        .select(
            "id, teacher_name, teacher_id"
        )
        .in(
            "id",
            teacherIds
        );


    if (teacherError) {

        console.error(
            "Teacher details error:",
            teacherError
        );

    }


    assignmentList.innerHTML = "";


    // =================================
    // DISPLAY ASSIGNMENTS
    // =================================

    assignments.forEach(
        function (assignment) {


            const teacher =
                (teachers || [])
                    .find(
                        function (teacher) {

                            return String(
                                teacher.id
                            )
                            ===
                            String(
                                assignment.teacher_id
                            );

                        }
                    );


            const teacherName =
                teacher
                    ? teacher.teacher_name
                    : "Unknown Teacher";


            const teacherId =
                teacher
                    ? teacher.teacher_id
                    : assignment.teacher_id;


            assignmentList.innerHTML += `

                <div class="assignment-item">

                    <strong>
                        ${assignment.subject}
                    </strong>

                    <p>
                        Teacher:
                        ${teacherName}
                    </p>

                    <p>
                        Teacher ID:
                        ${teacherId}
                    </p>

                    <button
                        class="delete-btn"
                        onclick="deleteAssignment('${assignment.id}')"
                    >
                        🗑️ Remove Assignment
                    </button>

                </div>

            `;

        }
    );

}


// =====================================
// DELETE ASSIGNMENT
// =====================================

async function deleteAssignment(id) {


    const confirmDelete =
        confirm(
            "Are you sure you want to remove this assignment?"
        );


    if (!confirmDelete) {
        return;
    }


    const {
        error
    } = await db
        .from(
            "teacher_assignments"
        )
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        alert(
            "Assignment delete failed:\n" +
            error.message
        );

        return;
    }


    await loadAssignments();

}


// =====================================
// INITIAL LOAD
// =====================================

loadExams();