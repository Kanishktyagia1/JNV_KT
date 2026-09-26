const saveTeacher = document.getElementById("saveTeacher");
const teacherList = document.getElementById("teacherList");
const teacherSubject = document.getElementById("teacherSubject");
const customSubject = document.getElementById("customSubject");

teacherSubject.addEventListener("change", function () {
    if (this.value === "Custom") {
        customSubject.style.display = "block";
    } else {
        customSubject.style.display = "none";
        customSubject.value = "";
    }
});


saveTeacher.addEventListener("click", async function () {

    const teacherName =
        document.getElementById("teacherName").value.trim();

    const teacherId =
        document.getElementById("teacherId").value.trim();

    const teacherPassword =
        document.getElementById("teacherPassword").value;

    let teacherSubject =
        document.getElementById("teacherSubject").value;

    if (teacherSubject === "Custom") {
        teacherSubject = customSubject.value.trim();
    }

    const schoolId =
        localStorage.getItem("jnv_school_id");


    if (
        teacherName === "" ||
        teacherId === "" ||
        teacherPassword === "" ||
        teacherSubject === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    if (!schoolId) {
        alert("School ID nahi mila.");
        return;
    }


    // 🔐 Create teacher through secure Vercel API
    try {

        const response = await fetch("/api/create-teacher", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                teacherName: teacherName,
                teacherId: teacherId,
                password: teacherPassword,
                assignedSubject: teacherSubject,
                schoolId: schoolId
            })
        });


        const result = await response.json();


        if (!response.ok) {
            alert(
                "Teacher creation failed: " +
                (result.error || "Unknown error")
            );
            return;
        }


        alert("Teacher account created successfully!");


        // Clear form
        document.getElementById("teacherName").value = "";
        document.getElementById("teacherId").value = "";
        document.getElementById("teacherPassword").value = "";
        document.getElementById("teacherSubject").value = "";

        customSubject.style.display = "none";
        customSubject.value = "";


        showTeachers();


    } catch (error) {

        console.error("Create teacher error:", error);

        alert(
            "Server se connection nahi ho paaya. Please try again."
        );
    }

});


async function showTeachers() {

    const schoolId =
        localStorage.getItem("jnv_school_id");

    const { data: teachers, error } = await db
        .from("teachers")
        .select("id, teacher_name, teacher_id, assigned_subject")
        .eq("school_id", schoolId)
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

                <h3>${teacher.teacher_name}</h3>

                <p>
                    <strong>Teacher ID:</strong>
                    ${teacher.teacher_id}
                </p>

                <p>
                    <strong>Subject:</strong>
                    ${teacher.assigned_subject || "Not Assigned"}
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

    if (!confirmDelete) return;


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