const { data } = await db.auth.getSession();

if (!data.session) {
    window.location.replace("login.html");
}
