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


// ===============================
// LOAD EXAMS
// ===============================

async function loadExams() {

    const schoolId =
        localStorage.getItem("jnv_school_id");

    if (!schoolId) {
        examSelect.innerHTML =
            `<option value="">School ID not found</option>`;
        return;
    }

    const { data: exams, error } = await db
        .from("exams")
        .select("id, exam_name, class_id")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);

        examSelect.innerHTML =
            `<option value="">Failed to load exams</option>`;

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


// ===============================
// EXAM SELECT
// ===============================

examSelect.addEventListener("change", async function () {

    const examId = this.value;

    subjectCard.style.display = "none";
    teacherCard.style.display = "none";

    currentSubject = "";

    if (examId === "") {
        selectedExam = null;
        showAssignments();
        return;
    }

    selectedExam = {
        id: examId
    };

    await showSubjects();
    await showAssignments();
});


// ===============================
// SHOW SUBJECTS
// ===============================

async function showSubjects() {

    subjectList.innerHTML = "";

    const { data: subjects, error } = await db
        .from("exam_subjects")
        .select("id, subject")
        .eq("exam_id", selectedExam.id);

    if (error) {
        console.error(error);

        subjectList.innerHTML =
            `<p class="message">Subjects load nahi ho paaye.</p>`;

        subjectCard.style.display = "block";
        return;
    }

    if (!subjects || subjects.length === 0) {

        subjectList.innerHTML =
            `<p class="message">No subjects found in this exam.</p>`;

        subjectCard.style.display = "block";
        return;
    }

    subjects.forEach(function (subject) {

        const subjectName = subject.subject;

        const button =
            document.createElement("button");

        button.className = "subject-btn";
        button.textContent = subjectName;

        button.addEventListener("click", async function () {

            document
                .querySelectorAll(".subject-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            currentSubject = subjectName;

            selectedSubject.textContent =
                subjectName;

            await showTeachers();
        });

        subjectList.appendChild(button);
    });

    subjectCard.style.display = "block";
}


// ===============================
// SHOW TEACHERS
// ===============================

async function showTeachers() {

    teacherList.innerHTML = "";

    const schoolId = "5db2de69-1100-4d34-acf5-5f64546cd1f3";

    const { data: teachers, error } = await db
        .from("teachers")
        .select("id, teacher_name, teacher_id, assigned_subject")
        .eq("school_id", schoolId)
        .order("teacher_name");

    if (error) {
        console.error(error);

        teacherList.innerHTML =
            `<p class="message">Teachers load nahi ho paaye.</p>`;

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


    const matchingTeachers = teachers.filter(
        teacher =>
            String(teacher.assigned_subject || "")
                .trim()
                .toLowerCase()
            ===
            String(currentSubject)
                .trim()
                .toLowerCase()
    );


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

                    <strong>${teacher.teacher_name}</strong>

                    <span>
                        Teacher ID: ${teacher.teacher_id}
                    </span>

                </div>

            </label>
        `;
    });


    teacherCard.style.display = "block";
}


// ===============================
// ASSIGN TEACHERS
// ===============================

assignTeachers.addEventListener("click", async function () {

    if (!selectedExam || !currentSubject) {
        alert("Please select Exam and Subject first.");
        return;
    }

    const selectedCheckboxes =
        document.querySelectorAll(
            ".teacher-checkbox:checked"
        );

    if (selectedCheckboxes.length === 0) {
        alert("Please select at least one teacher.");
        return;
    }


    let added = 0;
    let alreadyAssigned = 0;


    for (const checkbox of selectedCheckboxes) {

        const teacherId = checkbox.value;


        const { data: existingAssignment, error: checkError } =
            await db
                .from("teacher_assignments")
                .select("id")
                .eq("exam_id", selectedExam.id)
                .eq("teacher_id", teacherId)
                .eq("subject", currentSubject)
                .maybeSingle();


        if (checkError) {
            console.error(checkError);
            continue;
        }


        if (existingAssignment) {
            alreadyAssigned++;
            continue;
        }


        const { error } = await db
            .from("teacher_assignments")
            .insert({
                exam_id: selectedExam.id,
                teacher_id: teacherId,
                subject: currentSubject
            });


        if (error) {
            console.error(error);
            continue;
        }

        added++;
    }


    if (added === 0 && alreadyAssigned > 0) {

        alert("Selected teachers are already assigned.");

    } else if (added > 0) {

        alert(
            added +
            " teacher assignment(s) saved successfully!"
        );

    }


    await showAssignments();


    document
        .querySelectorAll(".teacher-checkbox")
        .forEach(box => box.checked = false);
});


// ===============================
// SHOW CURRENT ASSIGNMENTS
// ===============================

async function showAssignments() {

    if (!selectedExam) {

        assignmentList.innerHTML =
            `<p class="message">
                Select an exam to see assignments.
            </p>`;

        return;
    }


    const { data: assignments, error } = await db
        .from("teacher_assignments")
        .select("id, teacher_id, subject")
        .eq("exam_id", selectedExam.id)
        .order("created_at");


    if (error) {

        console.error(error);

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


    // Get teacher details

    const teacherIds =
        [...new Set(assignments.map(a => a.teacher_id))];


    const { data: teachers, error: teacherError } =
        await db
            .from("teachers")
            .select("id, teacher_name, teacher_id")
            .in("id", teacherIds);


    if (teacherError) {
        console.error(teacherError);
    }


    assignmentList.innerHTML = "";


    assignments.forEach(function (assignment) {

        const teacher =
            (teachers || []).find(
                t =>
                    String(t.id)
                    ===
                    String(assignment.teacher_id)
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


// ===============================
// DELETE ASSIGNMENT
// ===============================

async function deleteAssignment(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to remove this assignment?"
        );

    if (!confirmDelete) {
        return;
    }


    const { error } = await db
        .from("teacher_assignments")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "Assignment delete failed: "
            + error.message
        );

        return;
    }


    await showAssignments();
}


// ===============================
// INITIAL LOAD
// ===============================

loadExams();