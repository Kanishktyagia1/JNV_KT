// ===============================
// RESULT ANALYSIS
// ===============================

document.addEventListener("DOMContentLoaded", async function () {

    const examSelect =
        document.getElementById("examSelect");

    const resultMessage =
        document.getElementById("resultMessage");

    const loadResult =
        document.getElementById("loadResult");


    // ===============================
    // LOAD EXAMS
    // ===============================

    resultMessage.textContent =
        "Loading exams...";

    const {
        data: exams,
        error
    } = await db
        .from("exams")
        .select(`
            id,
            exam_name,
            exam_year
        `)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Exam loading error:",
            error
        );

        resultMessage.textContent =
            "Exams load nahi ho paaye.";

        return;
    }


    // ===============================
    // NO EXAMS
    // ===============================

    if (!exams || exams.length === 0) {

        examSelect.innerHTML = `
            <option value="">
                No exams found
            </option>
        `;

        resultMessage.textContent =
            "No exams available.";

        return;
    }


    // ===============================
    // SHOW EXAMS
    // ===============================

    examSelect.innerHTML = `
        <option value="">
            Select an exam
        </option>
    `;


    exams.forEach(function (exam) {

        examSelect.innerHTML += `
            <option value="${exam.id}">
                ${exam.exam_name} (${exam.exam_year})
            </option>
        `;

    });


    resultMessage.textContent =
        "Select an exam to continue.";


    // ===============================
    // VIEW RESULTS BUTTON
    // ===============================

    loadResult.addEventListener(
        "click",
        function () {

            const examId =
                examSelect.value;


            if (!examId) {

                resultMessage.textContent =
                    "Please select an exam.";

                return;
            }


            resultMessage.textContent =
                "Exam selected successfully.";

            console.log(
                "Selected exam:",
                examId
            );

        }
    );

});
