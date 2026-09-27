const { data } = await db.auth.getSession();

if (!data.session) {
    window.location.replace("login.html");
} else {
    const role = localStorage.getItem("jnv_user_role");

    const page = window.location.pathname;

    // Admin pages
    const adminPages = [
        "main-dashboard.html",
        "create-exam.html",
        "manage-exams.html",
        "teachers.html",
        "teacher-assignment.html"
    ];

    // Teacher pages
    const teacherPages = [
        "teacher-dashboard.html",
        "teacher-result.html"
    ];

    const currentPage = page.split("/").pop();

    // Teacher trying to open Admin page
    if (role === "teacher" && adminPages.includes(currentPage)) {
        window.location.replace("teacher-dashboard.html");
    }

    // Admin trying to open Teacher page
    if (role === "admin" && teacherPages.includes(currentPage)) {
        window.location.replace("main-dashboard.html");
    }
}