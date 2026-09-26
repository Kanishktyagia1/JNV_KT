const examSelect = document.getElementById("examSelect");

alert("JS STARTED");

async function testExams() {

    alert("QUERY STARTING");

    const { data, error } = await db
        .from("exams")
        .select("id, exam_name");

    if (error) {

        alert(
            "SUPABASE ERROR:\n" +
            error.message
        );

        return;
    }

    alert(
        "EXAMS FOUND: " +
        data.length
    );

    examSelect.innerHTML =
        `<option value="">-- Select Exam --</option>`;

    data.forEach(function (exam) {

        examSelect.innerHTML += `
            <option value="${exam.id}">
                ${exam.exam_name}
            </option>
        `;

    });
}

testExams();