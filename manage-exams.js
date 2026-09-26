const examContainer = document.getElementById("examContainer");
const schoolId = localStorage.getItem("jnv_school_id");

async function loadExams() {

    examContainer.innerHTML = `
        <div class="empty">
            <h3>⏳ Testing Supabase...</h3>
        </div>
    `;

    try {

        if (!schoolId) {
            throw new Error("jnv_school_id localStorage mein nahi mila.");
        }

        console.log("School ID:", schoolId);
        console.log("DB:", db);

        const { data, error } = await db
            .from("exams")
            .select("*")
            .eq("school_id", schoolId);

        console.log("EXAMS DATA:", data);
        console.log("EXAMS ERROR:", error);

        if (error) {
            throw error;
        }

        examContainer.innerHTML = `
            <div class="empty">
                <h3>✅ Supabase Working</h3>
                <p>Exams found: ${data.length}</p>
            </div>
        `;

    } catch (error) {

        console.error("TEST ERROR:", error);

        examContainer.innerHTML = `
            <div class="empty">
                <h3>❌ Supabase Test Failed</h3>
                <p>${escapeHtml(error.message || String(error))}</p>
            </div>
        `;
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadExams();