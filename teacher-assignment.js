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

function loadExams() {

    const exams =
        JSON.parse(localStorage.getItem("jnv_exams")) || [];

    examSelect.innerHTML =
        `<option value="">-- Select Exam --</option>`;

    if (exams.length === 0) {
        examSelect.innerHTML +=
            `<option value="">No exams created yet</option>`;
        return;
    }

    exams.forEach(function (exam) {

        examSelect.innerHTML += `
            <option value="${exam.id}">
                ${exam.examName} - ${exam.className} ${exam.section}
            </option>
        `;
    });
}


// ===============================
// EXAM SELECT
// ===============================

examSelect.addEventListener("change", function () {

    const examId = this.value;

    subjectCard.style.display = "none";
    teacherCard.style.display = "none";

    currentSubject = "";

    if (examId === "") {
        selectedExam = null;
        return;
    }

    const exams =
        JSON.parse(localStorage.getItem("jnv_exams")) || [];

    selectedExam = exams.find(
        exam => String(exam.id) === String(examId)
    );

    if (!selectedExam) {
        return;
    }

    showSubjects();
    showAssignments();
});


// ===============================
// SHOW SUBJECTS
// ===============================

function showSubjects() {

    subjectList.innerHTML = "";

    if (!selectedExam.subjects ||
        selectedExam.subjects.length === 0) {

        subjectList.innerHTML =
            `<p class="message">No subjects found in this exam.</p>`;

        subjectCard.style.display = "block";
        return;
    }

    selectedExam.subjects.forEach(function (subject) {

        // Supports both:
        // "Physics"
        // { name: "Physics" }

        const subjectName =
            typeof subject === "string"
                ? subject
                : subject.name;

        const button =
            document.createElement("button");

        button.className = "subject-btn";
        button.textContent = subjectName;

        button.addEventListener("click", function () {

            document
                .querySelectorAll(".subject-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            currentSubject = subjectName;

            selectedSubject.textContent =
                subjectName;

            showTeachers();
        });

        subjectList.appendChild(button);
    });

    subjectCard.style.display = "block";
}


// ===============================
// SHOW TEACHERS
// ===============================

function showTeachers() {

    const teachers =
        JSON.parse(localStorage.getItem("jnv_teachers")) || [];

    teacherList.innerHTML = "";

    if (teachers.length === 0) {

        teacherList.innerHTML =
            `<p class="message">
                No teachers found. Add teachers first.
            </p>`;

        teacherCard.style.display = "block";
        return;
    }


    // Show teachers whose assigned subject
    // matches the selected subject.

    const matchingTeachers = teachers.filter(
        teacher =>
            String(teacher.subject).trim().toLowerCase()
            ===
            String(currentSubject).trim().toLowerCase()
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

                    <strong>${teacher.name}</strong>

                    <span>
                        Teacher ID: ${teacher.id}
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

assignTeachers.addEventListener("click", function () {

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


    const assignments =
        JSON.parse(
            localStorage.getItem("jnv_teacher_assignments")
        ) || [];


    let added = 0;


    selectedCheckboxes.forEach(function (checkbox) {

        const teacherId = checkbox.value;


        // Same teacher + same exam + same subject
        // cannot be assigned twice.

        const alreadyAssigned =
            assignments.some(assignment =>
                String(assignment.teacherId) === String(teacherId) &&
                String(assignment.examId) === String(selectedExam.id) &&
                String(assignment.subject).toLowerCase() ===
                String(currentSubject).toLowerCase()
            );


        if (!alreadyAssigned) {

            assignments.push({

                id: Date.now() + Math.random(),

                teacherId: teacherId,

                examId: selectedExam.id,

                subject: currentSubject

            });

            added++;
        }
    });


    localStorage.setItem(
        "jnv_teacher_assignments",
        JSON.stringify(assignments)
    );


    if (added === 0) {
        alert("Selected teachers are already assigned.");
    } else {
        alert(
            added +
            " teacher assignment(s) saved successfully!"
        );
    }


    showAssignments();

    // Uncheck boxes
    document
        .querySelectorAll(".teacher-checkbox")
        .forEach(box => box.checked = false);
});


// ===============================
// SHOW CURRENT ASSIGNMENTS
// ===============================

function showAssignments() {

    if (!selectedExam) {
        assignmentList.innerHTML =
            `<p class="message">
                Select an exam to see assignments.
            </p>`;
        return;
    }


    const assignments =
        JSON.parse(
            localStorage.getItem("jnv_teacher_assignments")
        ) || [];

    const teachers =
        JSON.parse(localStorage.getItem("jnv_teachers"))
        || [];


    const examAssignments =
        assignments.filter(
            assignment =>
                String(assignment.examId)
                ===
                String(selectedExam.id)
        );


    if (examAssignments.length === 0) {

        assignmentList.innerHTML =
            `<p class="message">
                No teachers assigned for this exam yet.
            </p>`;

        return;
    }


    assignmentList.innerHTML = "";


    examAssignments.forEach(function (assignment) {

        const teacher =
            teachers.find(
                t =>
                    String(t.id)
                    ===
                    String(assignment.teacherId)
            );


        const teacherName =
            teacher
                ? teacher.name
                : "Unknown Teacher";


        assignmentList.innerHTML += `

            <div class="assignment-item">

                <strong>
                    ${assignment.subject}
                </strong>

                <p>
                    Teacher: ${teacherName}
                </p>

                <p>
                    Teacher ID: ${assignment.teacherId}
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

function deleteAssignment(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to remove this assignment?"
        );

    if (!confirmDelete) {
        return;
    }


    let assignments =
        JSON.parse(
            localStorage.getItem("jnv_teacher_assignments")
        ) || [];


    assignments =
        assignments.filter(
            assignment =>
                String(assignment.id) !== String(id)
        );


    localStorage.setItem(
        "jnv_teacher_assignments",
        JSON.stringify(assignments)
    );


    showAssignments();
}


// ===============================
// INITIAL LOAD
// ===============================

loadExams();