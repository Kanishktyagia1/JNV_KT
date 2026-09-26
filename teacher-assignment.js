const examSelect = document.getElementById("examSelect");
const subjectCard = document.getElementById("subjectCard");
const subjectList = document.getElementById("subjectList");

const teacherCard = document.getElementById("teacherCard");
const teacherList = document.getElementById("teacherList");

const selectedSubject = document.getElementById("selectedSubject");
const assignTeachers = document.getElementById("assignTeachers");

const assignmentList = document.getElementById("assignmentList");

let selectedExam = null;
let currentSubject = "";


// =====================================
// LOAD EXAMS
// =====================================

async function loadExams() {

    examSelect.innerHTML =
        `<option value="">-- Select Exam --</option>`;

    const schoolId =
        localStorage.getItem("jnv_school_id");

    // Temporary fallback for your current school
    const currentSchoolId =
        schoolId || "5db2de69-1100-4d34-acf5-5f64546cd1f3";


    const { data: exams, error } = await db
        .from("exams")
        .select("id, exam_name")
        .eq("school_id", currentSchoolId)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error("Exam loading error:", error);

        examSelect.innerHTML =
            `<option value="">Exam load failed</option>`;

        alert(
            "Exam load failed:\n" +
            error.message
        );

        return;
    }


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


        if (!examId) {

            selectedExam = null;

            assignmentList.innerHTML =
                `<p class="message">
                    Select an exam to see assignments.
                </p>`;

            return;
        }


        selectedExam = {
            id: examId
        };


        await loadSubjects();
        await loadAssignments();
    }
);


// =====================================
// LOAD SUBJECTS
// =====================================

async function loadSubjects() {

    subjectList.innerHTML = "";


    const { data: subjects, error } = await db
        .from("exam_subjects")
        .select("*")
        .eq("exam_id", selectedExam.id);


    if (error) {

        console.error("Subject loading error:", error);

        subjectList.innerHTML =
            `<p class="message">
                Subjects load nahi ho paaye.
            </p>`;

        subjectCard.style.display = "block";

        return;
    }


    if (!subjects || subjects.length === 0) {

        subjectList.innerHTML =
            `<p class="message">
                No subjects found in this exam.
            </p>`;

        subjectCard.style.display = "block";

        return;
    }


    subjects.forEach(function (subject) {

        /*
         * Your exam_subjects table may use
         * different column names.
         *
         * We try common possibilities.
         */

        const subjectName =
            subject.subject ||
            subject.subject_name ||
            subject.name;


        if (!subjectName) return;


        const button =
            document.createElement("button");


        button.className = "subject-btn";

        button.textContent = subjectName;


        button.addEventListener(
            "click",
            async function () {

                document
                    .querySelectorAll(".subject-btn")
                    .forEach(function (btn) {

                        btn.classList.remove("active");

                    });


                button.classList.add("active");


                currentSubject =
                    subjectName;


                selectedSubject.textContent =
                    subjectName;


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

    teacherList.innerHTML = "";


    const schoolId =
        localStorage.getItem("jnv_school_id");

    const currentSchoolId =
        schoolId || "5db2de69-1100-4d34-acf5-5f64546cd1f3";


    const { data: teachers, error } = await db
        .from("teachers")
        .select(
            "id, teacher_name, teacher_id, assigned_subject"
        )
        .eq("school_id", currentSchoolId)
        .order("teacher_name");


    if (error) {

        console.error("Teacher loading error:", error);

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


    const matchingTeachers =
        teachers.filter(function (teacher) {

            return (
                String(
                    teacher.assigned_subject || ""
                )
                .trim()
                .toLowerCase()
                ===
                String(currentSubject)
                .trim()
                .toLowerCase()
            );

        });


    if (matchingTeachers.length === 0) {

        teacherList.innerHTML =
            `<p class="message">
                Is subject ke liye koi teacher assigned nahi hai.
            </p>`;

        teacherCard.style.display = "block";

        return;
    }


    matchingTeachers.forEach(function (teacher) {

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
                        Teacher ID: ${teacher.teacher_id}
                    </span>

                </div>

            </label>

        `;
    });


    teacherCard.style.display = "block";
}


// =====================================
// ASSIGN TEACHERS
// =====================================

assignTeachers.addEventListener(
    "click",
    async function () {

        if (!selectedExam || !currentSubject) {

            alert(
                "Please select Exam and Subject first."
            );

            return;
        }


        const checkboxes =
            document.querySelectorAll(
                ".teacher-checkbox:checked"
            );


        if (checkboxes.length === 0) {

            alert(
                "Please select at least one teacher."
            );

            return;
        }


        let added = 0;
        let alreadyAssigned = 0;


        for (const checkbox of checkboxes) {

            const teacherId =
                checkbox.value;


            const { data: existing } =
                await db
                    .from("teacher_assignments")
                    .select("id")
                    .eq(
                        "exam_id",
                        selectedExam.id
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


            if (existing) {

                alreadyAssigned++;

                continue;
            }


            const { error } =
                await db
                    .from("teacher_assignments")
                    .insert({

                        exam_id:
                            selectedExam.id,

                        teacher_id:
                            teacherId,

                        subject:
                            currentSubject

                    });


            if (error) {

                console.error(
                    "Assignment save error:",
                    error
                );

                alert(
                    "Assignment save failed:\n" +
                    error.message
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

        } else if (alreadyAssigned > 0) {

            alert(
                "Selected teachers are already assigned."
            );
        }


        document
            .querySelectorAll(".teacher-checkbox")
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


    const { data: assignments, error } =
        await db
            .from("teacher_assignments")
            .select(
                "id, teacher_id, subject"
            )
            .eq(
                "exam_id",
                selectedExam.id
            )
            .order("created_at");


    if (error) {

        console.error(
            "Assignment loading error:",
            error
        );

        assignmentList.innerHTML =
            `<p class="message">
                Assignments load nahi ho paaye.
            </p>`;

        return;
    }


    if (!assignments || assignments.length === 0) {

        assignmentList.innerHTML =
            `<p class="message">
                No teachers assigned for this exam yet.
            </p>`;

        return;
    }


    const teacherIds =
        [
            ...new Set(
                assignments.map(function (item) {

                    return item.teacher_id;

                })
            )
        ];


    const { data: teachers } =
        await db
            .from("teachers")
            .select(
                "id, teacher_name, teacher_id"
            )
            .in("id", teacherIds);


    assignmentList.innerHTML = "";


    assignments.forEach(function (assignment) {

        const teacher =
            (teachers || []).find(function (t) {

                return String(t.id) ===
                    String(assignment.teacher_id);

            });


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
                    Teacher: ${teacherName}
                </p>

                <p>
                    Teacher ID: ${teacherId}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteAssignment('${assignment.id}')"
                >
                    🗑️ Remove Assignment
                </button>

            </div>

        `;
    });
}


// =====================================
// DELETE ASSIGNMENT
// =====================================

async function deleteAssignment(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to remove this assignment?"
        );


    if (!confirmDelete) return;


    const { error } =
        await db
            .from("teacher_assignments")
            .delete()
            .eq("id", id);


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
// START
// =====================================

loadExams();