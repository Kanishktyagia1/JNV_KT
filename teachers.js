const saveTeacher = document.getElementById("saveTeacher");
const teacherList = document.getElementById("teacherList");


saveTeacher.addEventListener("click", function () {

    const teacherName =
        document.getElementById("teacherName").value.trim();

    const teacherId =
        document.getElementById("teacherId").value.trim();

    const teacherPassword =
        document.getElementById("teacherPassword").value;

    const teacherSubject =
        document.getElementById("teacherSubject").value;


    // Check empty fields

    if (
        teacherName === "" ||
        teacherId === "" ||
        teacherPassword === "" ||
        teacherSubject === ""
    ) {

        alert("Please fill all fields.");

        return;
    }


    // Get existing teachers

    const teachers =
        JSON.parse(localStorage.getItem("jnv_teachers")) || [];


    // Check duplicate Teacher ID

    const alreadyExists = teachers.some(
        teacher => teacher.id === teacherId
    );


    if (alreadyExists) {

        alert("This Teacher ID already exists.");

        return;
    }


    // Create teacher object

    const teacher = {

        name: teacherName,

        id: teacherId,

        password: teacherPassword,

        subject: teacherSubject

    };


    // Add teacher

    teachers.push(teacher);


    // Save teachers

    localStorage.setItem(
        "jnv_teachers",
        JSON.stringify(teachers)
    );


    alert("Teacher account saved successfully!");


    // Clear form

    document.getElementById("teacherName").value = "";

    document.getElementById("teacherId").value = "";

    document.getElementById("teacherPassword").value = "";

    document.getElementById("teacherSubject").value = "";


    // Refresh list

    showTeachers();

});


function showTeachers() {

    const teachers =
        JSON.parse(localStorage.getItem("jnv_teachers")) || [];


    if (teachers.length === 0) {

        teacherList.innerHTML =
            `<p class="empty">No teachers added yet.</p>`;

        return;
    }


    teacherList.innerHTML = "";


    teachers.forEach(function (teacher, index) {

        teacherList.innerHTML += `

            <div class="teacher-item">

                <h3>
                    ${teacher.name}
                </h3>

                <p>
                    <strong>Teacher ID:</strong>
                    ${teacher.id}
                </p>

                <p>
                    <strong>Subject:</strong>
                    ${teacher.subject || "Not Assigned"}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteTeacher(${index})"
                >
                    🗑️ Delete
                </button>

            </div>

        `;
    });

}


function deleteTeacher(index) {

    const teachers =
        JSON.parse(localStorage.getItem("jnv_teachers")) || [];


    const confirmDelete =
        confirm("Are you sure you want to delete this teacher?");


    if (!confirmDelete) {
        return;
    }


    teachers.splice(index, 1);


    localStorage.setItem(
        "jnv_teachers",
        JSON.stringify(teachers)
    );


    showTeachers();

}


showTeachers();