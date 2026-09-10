// ===============================
// ADD CLASSES
// ===============================

const addClass =
    document.getElementById("addClass");

const classList =
    document.getElementById("classList");


// ===============================
// ADD CLASS
// ===============================

addClass.addEventListener(
    "click",
    function () {

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


        let classes =
            JSON.parse(
                localStorage.getItem(
                    "jnv_classes"
                )
            ) || [];


        const alreadyExists =
            classes.some(function (item) {

                return (
                    String(item.className) ===
                    String(className)
                    &&
                    String(item.section)
                        .toLowerCase() ===
                    String(section)
                        .toLowerCase()
                );

            });


        if (alreadyExists) {

            alert(
                "This Class + Section already exists."
            );

            return;
        }


        classes.push({

            id: Date.now(),

            className:
                className,

            section:
                section,

            students:
                []

        });


        localStorage.setItem(
            "jnv_classes",
            JSON.stringify(classes)
        );


        document.getElementById(
            "className"
        ).value = "";

        document.getElementById(
            "section"
        ).value = "";


        showClasses();

    }
);


// ===============================
// SHOW CLASSES
// ===============================

function showClasses() {

    const classes =
        JSON.parse(
            localStorage.getItem(
                "jnv_classes"
            )
        ) || [];


    if (classes.length === 0) {

        classList.innerHTML = `
            <p class="empty">
                No classes added yet.
            </p>
        `;

        return;
    }


    classList.innerHTML = "";


    classes.forEach(
        function (classData, classIndex) {

            const students =
                Array.isArray(
                    classData.students
                )
                    ? classData.students
                    : [];


            classList.innerHTML += `

                <div class="class-card">

                    <div class="class-header">

                        <div>

                            <div class="class-title">

                                Class ${classData.className}
                                -
                                Section ${classData.section}

                            </div>

                            <div class="student-count">

                                ${students.length}
                                Student(s)

                            </div>

                        </div>


                        <div class="class-actions">

                            <button
                                class="open-btn"
                                onclick="toggleSheet(${classIndex})">

                                📊 Open Sheet

                            </button>


                            <button
                                class="delete-btn"
                                onclick="deleteClass(${classIndex})">

                                🗑️ Delete

                            </button>

                        </div>

                    </div>


                    <div
                        class="sheet"
                        id="sheet-${classIndex}">

                        <div class="sheet-toolbar">

                            <strong>
                                Student List
                            </strong>

                            <div>

                                <button
                                    class="primary-btn"
                                    onclick="addRow(${classIndex})">

                                    ➕ Add Row

                                </button>

                                <button
                                    class="primary-btn"
                                    onclick="saveStudents(${classIndex})">

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
                                    id="student-table-${classIndex}">

                                    ${createRows(
                                        students,
                                        classIndex
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}


// ===============================
// CREATE TABLE ROWS
// ===============================

function createRows(
    students,
    classIndex
) {

    let rows = "";


    if (students.length === 0) {

        return createEmptyRow(
            classIndex,
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
                            value="${student.rollNumber || ""}"
                            placeholder="Roll No.">

                    </td>

                    <td class="name">

                        <input
                            type="text"
                            class="name-input"
                            value="${student.studentName || ""}"
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
    classIndex,
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

function toggleSheet(index) {

    const sheet =
        document.getElementById(
            `sheet-${index}`
        );


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

function addRow(classIndex) {

    const tableBody =
        document.getElementById(
            `student-table-${classIndex}`
        );


    const rowCount =
        tableBody.querySelectorAll(
            "tr"
        ).length;


    tableBody.insertAdjacentHTML(
        "beforeend",
        createEmptyRow(
            classIndex,
            rowCount + 1
        )
    );

}


// ===============================
// DELETE ROW
// ===============================

function deleteRow(button) {

    const row =
        button.closest("tr");


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

function saveStudents(classIndex) {

    let classes =
        JSON.parse(
            localStorage.getItem(
                "jnv_classes"
            )
        ) || [];


    const classData =
        classes[classIndex];


    const tableBody =
        document.getElementById(
            `student-table-${classIndex}`
        );


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


        // Completely empty row
        // is ignored

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

            id:
                Date.now() +
                Math.random(),

            rollNumber:
                rollNumber,

            studentName:
                studentName

        });

    }


    // ===============================
    // CHECK DUPLICATE ROLL NUMBERS
    // ===============================

    const rollNumbers =
        students.map(
            function (student) {

                return String(
                    student.rollNumber
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
    // SORT BY ROLL NUMBER
    // ===============================

    students.sort(
        function (a, b) {

            return (
                Number(a.rollNumber) -
                Number(b.rollNumber)
            );

        }
    );


    classData.students =
        students;


    classes[classIndex] =
        classData;


    localStorage.setItem(
        "jnv_classes",
        JSON.stringify(classes)
    );


    alert(
        "Student list successfully saved! ✅"
    );


    showClasses();


    // Re-open sheet

    setTimeout(
        function () {

            toggleSheet(classIndex);

        },
        50
    );

}


// ===============================
// DELETE CLASS
// ===============================

function deleteClass(index) {

    const confirmDelete =
        confirm(
            "Are you sure? This will delete the class and its student list."
        );


    if (!confirmDelete) {
        return;
    }


    let classes =
        JSON.parse(
            localStorage.getItem(
                "jnv_classes"
            )
        ) || [];


    classes.splice(
        index,
        1
    );


    localStorage.setItem(
        "jnv_classes",
        JSON.stringify(classes)
    );


    showClasses();

}


// ===============================
// INITIAL LOAD
// ===============================

showClasses();