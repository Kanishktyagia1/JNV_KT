const examSelect = document.getElementById("examSelect");

const SUPABASE_URL =
    "https://pzvnavadhgqfceaypjqb.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6HEYEQUPZ9aho1jcY1sLoQ_50aRqNsV";

const testDb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


async function loadExams() {

    examSelect.innerHTML =
        `<option value="">Loading exams...</option>`;

    const { data, error } = await testDb
        .from("exams")
        .select("id, exam_name");

    if (error) {

        alert(
            "ERROR:\n" +
            error.message
        );

        console.error(error);

        return;
    }

    console.log(data);

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


loadExams();