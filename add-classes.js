// ===============================
// SUPABASE
// ===============================



// ===============================
// ELEMENTS
// ===============================

const addClass =
    document.getElementById("addClass");

const classList =
    document.getElementById("classList");


// ===============================
// SCHOOL ID
// ===============================

const schoolId =
    localStorage.getItem("jnv_school_id");


// ===============================
// CHECK SUPABASE
// ===============================

if (!db) {

    alert("Supabase connection nahi mila.");

}


// ===============================
// ADD CLASS
// ===============================

addClass.addEventListener(
    "click",
    async function () {

        const className =
            document.getElementById(
                "className"
            ).value;

        const section =
            document.getElementById(
                "section"
            ).value
            .trim()
            .toUpperCase();


        if (
            className === "" ||
            section === ""
        ) {

            alert(
                "Please select class and enter section."
            );

            return;
        }


        if (!schoolId) {

            alert(
                "School ID nahi mili. Please signup/login again."
            );

            return;
        }


        // ===============================
        // CHECK DUPLICATE
        // ===============================

        const {
            data: existingClasses,
            error: checkError
        } = await db
            .from("classes")
            .select("id")
            .eq("school_id", schoolId)
            .eq("class_name", className)
            .eq("section", section);


        if (checkError) {

            console.error(checkError);

            alert(
                "Class check nahi ho paya: " +
                checkError.message
            );

            return;
        }


        if (
            existingClasses &&
            existingClasses.length > 0
        ) {

            alert(
                "This Class + Section already exists."
            );

            return;
        }


        // ===============================
        // INSERT CLASS
        // ===============================

        const {
            data,
            error
        } = await db
            .from("classes")
            .insert([
                {
                    school_id: schoolId,
                    class_name: className,
                    section: section
                }
            ])
            .select()
            .single();


        if (error) {

            console.error(error);

            alert(
                "Class save nahi ho payi: " +
                error.message
            );

            return;
        }


        document.getElementById(
            "className"
        ).value = "";

        document.getElementById(
            "section"
        ).value = "";


        alert(
            "Class successfully added! ✅"
        );


        showClasses();

    }
);


// ===============================
// SHOW CLASSES
// ===============================

async function showClasses() {

    if (!schoolId) {

        classList.innerHTML = `
            <p class="empty">
                School ID nahi mili.
            </p>
        `;

        return;
    }


    const {
        data: classes,
        error
    } = await db
        .from("classes")
        .select("*")
        .eq("school_id", schoolId)
        .order("class_name", {
            ascending: true
        });


    if (error) {

        console.error(error);

        classList.innerHTML = `
            <p class="empty">
                Classes load nahi ho payi.
            </p>
        `;

        return;
    }


    if (
        !classes ||
        classes.length === 0
    ) {

        classList.innerHTML = `
            <p class="empty">
                No classes added yet.
            </p>
        `;

        return;
    }


    classList.innerHTML = "";


    for (
        let classIndex = 0;
        classIndex < classes.length;
        classIndex++
    ) {

        const classData =
            classes[classIndex];


        const {
            data: students
        } = await db
            .from("students")
            .select("*")
            .eq("class_id", classData.id)
            .order("roll_number", {
                ascending: true
            });


        const studentList =
            students || [];


        classList.innerHTML += `

            <div class="class-card">

                <div class="class-header">

                    <div>

                        <div class="class-title">

                            Class ${classData.class_name}
                            -
                            Section ${classData.section}

                        </div>

                        <div class="student-count">

                            ${studentList.length}
                            Student(s)

                        </div>

                    </div>


                    <div class="class-actions">

                        <button
                            class="open-btn"
                            onclick="toggleSheet('${classData.id}')">

                            📊 Open Sheet

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteClass('${classData.id}')">

                            🗑️ Delete

                        </button>

                    </div>

                </div>


                <div
                    class="sheet"
                    id="sheet-${classData.id}">

                    <div class="sheet-toolbar">

                        <strong>
                            Student List
                        </strong>

                        <div>

                            <button
                                class="primary-btn"
                                onclick="addRow('${classData.id}')">

                                ➕ Add Row

                            </button>

                            <button
                                class="primary-btn"
                                onclick="saveStudents('${classData.id}')">

                                💾 Save Students

                            </button>

                        </div>

                    </div>


                    <div class="sheet-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        S. No.
                                    </th>

                                    <th>
                                        Roll No.
                                    </th>

                                    <th>
                                        Student Name
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody
                                id="student-table-${classData.id}">

                                ${createRows(
                                    studentList,
                                    classData.id
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        `;
    }

}


// ===============================
// CREATE TABLE ROWS
// ===============================

function createRows(
    students,
    classId
) {

    let rows = "";


    if (
        !students ||
        students.length === 0
    ) {

        return createEmptyRow(
            classId,
            1
        );
    }


    students.forEach(
        function (student, index) {

            rows += `

                <tr>

                    <td class="sno">
                        ${index + 1}
                    </td>

                    <td class="roll">

                        <input
                            type="number"
                            class="roll-input"
                            value="${student.roll_number || ""}"
                            placeholder="Roll No.">

                    </td>

                    <td class="name">

                        <input
                            type="text"
                            class="name-input"
                            value="${student.student_name || ""}"
                            placeholder="Student Name">

                    </td>

                    <td class="action">

                        <button
                            class="delete-row"
                            onclick="deleteRow(this)">

                            🗑️

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    return rows;
}


// ===============================
// EMPTY ROW
// ===============================

function createEmptyRow(
    classId,
    number
) {

    return `

        <tr>

            <td class="sno">
                ${number}
            </td>

            <td class="roll">

                <input
                    type="number"
                    class="roll-input"
                    placeholder="Roll No.">

            </td>

            <td class="name">

                <input
                    type="text"
                    class="name-input"
                    placeholder="Student Name">

            </td>

            <td class="action">

                <button
                    class="delete-row"
                    onclick="deleteRow(this)">

                    🗑️

                </button>

            </td>

        </tr>

    `;
}


// ===============================
// OPEN / CLOSE SHEET
// ===============================

function toggleSheet(classId) {

    const sheet =
        document.getElementById(
            `sheet-${classId}`
        );


    if (!sheet) {
        return;
    }


    if (
        sheet.style.display ===
        "block"
    ) {

        sheet.style.display =
            "none";

    } else {

        sheet.style.display =
            "block";
    }

}


// ===============================
// ADD NEW ROW
// ===============================

function addRow(classId) {

    const tableBody =
        document.getElementById(
            `student-table-${classId}`
        );


    if (!tableBody) {
        return;
    }


    const rowCount =
        tableBody.querySelectorAll(
            "tr"
        ).length;


    tableBody.insertAdjacentHTML(
        "beforeend",
        createEmptyRow(
            classId,
            rowCount + 1
        )
    );

}


// ===============================
// DELETE ROW FROM SCREEN
// ===============================

function deleteRow(button) {

    const row =
        button.closest("tr");


    if (!row) {
        return;
    }


    row.remove();


    updateSerialNumbers();

}


// ===============================
// UPDATE S. NO.
// ===============================

function updateSerialNumbers() {

    document
        .querySelectorAll(
            "tbody"
        )
        .forEach(function (tbody) {

            const rows =
                tbody.querySelectorAll(
                    "tr"
                );


            rows.forEach(
                function (row, index) {

                    const sno =
                        row.querySelector(
                            ".sno"
                        );


                    if (sno) {

                        sno.textContent =
                            index + 1;

                    }

                }
            );

        });

}


// ===============================
// SAVE STUDENTS
// ===============================

async function saveStudents(classId) {

    const tableBody =
        document.getElementById(
            `student-table-${classId}`
        );


    if (!tableBody) {
        return;
    }


    const rows =
        tableBody.querySelectorAll(
            "tr"
        );


    const students = [];


    for (const row of rows) {

        const rollInput =
            row.querySelector(
                ".roll-input"
            );

        const nameInput =
            row.querySelector(
                ".name-input"
            );


        if (!rollInput || !nameInput) {
            continue;
        }


        const rollNumber =
            rollInput.value.trim();

        const studentName =
            nameInput.value.trim();


        // Empty row ignored

        if (
            rollNumber === "" &&
            studentName === ""
        ) {

            continue;
        }


        if (
            rollNumber === "" ||
            studentName === ""
        ) {

            alert(
                "Har student ke liye Roll No. aur Name dono enter karo."
            );

            return;
        }


        students.push({

            roll_number:
                rollNumber,

            student_name:
                studentName

        });

    }


    // ===============================
    // DUPLICATE ROLL NUMBERS
    // ===============================

    const rollNumbers =
        students.map(
            function (student) {

                return String(
                    student.roll_number
                );

            }
        );


    const uniqueRollNumbers =
        new Set(rollNumbers);


    if (
        uniqueRollNumbers.size !==
        rollNumbers.length
    ) {

        alert(
            "Duplicate Roll Number allowed nahi hai."
        );

        return;
    }


    // ===============================
    // SORT
    // ===============================

    students.sort(
        function (a, b) {

            return (
                Number(a.roll_number) -
                Number(b.roll_number)
            );

        }
    );


    // ===============================
    // DELETE OLD STUDENTS
    // ===============================

    const {
        error: deleteError
    } = await db
        .from("students")
        .delete()
        .eq("class_id", classId);


    if (deleteError) {

        console.error(deleteError);

        alert(
            "Old student data delete nahi ho paya: " +
            deleteError.message
        );

        return;
    }


    // ===============================
    // INSERT NEW STUDENTS
    // ===============================

    if (students.length > 0) {

        const studentsToInsert =
            students.map(
                function (student) {

                    return {

                        class_id:
                            classId,

                        roll_number:
                            student.roll_number,

                        student_name:
                            student.student_name

                    };

                }
            );


        const {
            error: insertError
        } = await db
            .from("students")
            .insert(studentsToInsert);


        if (insertError) {

            console.error(insertError);

            alert(
                "Students save nahi ho paye: " +
                insertError.message
            );

            return;
        }

    }


    alert(
        "Student list successfully saved! ✅"
    );


    await showClasses();


    // Re-open sheet

    setTimeout(
        function () {

            toggleSheet(classId);

        },
        50
    );

}


// ===============================
// DELETE CLASS
// ===============================

async function deleteClass(classId) {

    const confirmDelete =
        confirm(
            "Are you sure? This will delete the class and its student list."
        );


    if (!confirmDelete) {
        return;
    }


    // ===============================
    // DELETE STUDENTS FIRST
    // ===============================

    const {
        error: studentDeleteError
    } = await db
        .from("students")
        .delete()
        .eq("class_id", classId);


    if (studentDeleteError) {

        console.error(studentDeleteError);

        alert(
            "Students delete nahi ho paye: " +
            studentDeleteError.message
        );

        return;
    }


    // ===============================
    // DELETE CLASS
    // ===============================

    const {
        error: classDeleteError
    } = await db
        .from("classes")
        .delete()
        .eq("id", classId);


    if (classDeleteError) {

        console.error(classDeleteError);

        alert(
            "Class delete nahi ho payi: " +
            classDeleteError.message
        );

        return;
    }


    alert(
        "Class successfully deleted! ✅"
    );


    showClasses();

}


// ===============================
// INITIAL LOAD
// ===============================

showClasses();