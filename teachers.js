const saveTeacher = document.getElementById("saveTeacher");
const teacherList = document.getElementById("teacherList");

saveTeacher.addEventListener("click", async function () {

    const teacherName =
        document.getElementById("teacherName").value.trim();

    const teacherId =
        document.getElementById("teacherId").value.trim();

    const teacherPassword =
        document.getElementById("teacherPassword").value;

    const teacherSubject =
        document.getElementById("teacherSubject").value;

    if (
        teacherName === "" ||
        teacherId === "" ||
        teacherPassword === "" ||
        teacherSubject === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    const { data: existingTeacher, error: checkError } = await db
        .from("teachers")
        .select("id")
        .eq("teacher_id", teacherId)
        .maybeSingle();

    if (checkError) {
        alert("Error checking Teacher ID: " + checkError.message);
        return;
    }

    if (existingTeacher) {
        alert("This Teacher ID already exists.");
        return;
    }

    const { error } = await db
        .from("teachers")
        .insert({
            teacher_name: teacherName,
            teacher_id: teacherId,
            password: teacherPassword,
            subject: teacherSubject
        });

    if (error) {
        alert("Teacher save failed: " + error.message);
        console.error(error);
        return;
    }

    alert("Teacher account saved successfully!");

    document.getElementById("teacherName").value = "";
    document.getElementById("teacherId").value = "";
    document.getElementById("teacherPassword").value = "";
    document.getElementById("teacherSubject").value = "";

    showTeachers();
});


async function showTeachers() {

    const { data: teachers, error } = await db
        .from("teachers")
        .select("id, teacher_name, teacher_id, subject")
        .order("teacher_name");

    if (error) {
        console.error("Teachers load error:", error);
        teacherList.innerHTML =
            `<p class="empty">Teachers load nahi ho paaye.</p>`;
        return;
    }

    if (!teachers || teachers.length === 0) {
        teacherList.innerHTML =
            `<p class="empty">No teachers added yet.</p>`;
        return;
    }

    teacherList.innerHTML = "";

    teachers.forEach(function (teacher) {

        teacherList.innerHTML += `

            <div class="teacher-item">

                <h3>
                    ${teacher.teacher_name}
                </h3>

                <p>
                    <strong>Teacher ID:</strong>
                    ${teacher.teacher_id}
                </p>

                <p>
                    <strong>Subject:</strong>
                    ${teacher.subject || "Not Assigned"}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteTeacher('${teacher.id}')"
                >
                    🗑️ Delete
                </button>

            </div>

        `;
    });
}


async function deleteTeacher(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this teacher?");

    if (!confirmDelete) {
        return;
    }

    const { error } = await db
        .from("teachers")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Teacher delete failed: " + error.message);
        return;
    }

    showTeachers();
}


showTeachers();