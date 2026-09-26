const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            teacherName,
            teacherId,
            password,
            assignedSubject,
            schoolId
        } = req.body;


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !teacherName ||
            !teacherId ||
            !password ||
            !assignedSubject ||
            !schoolId
        ) {
            return res.status(400).json({
                error: "All fields are required."
            });
        }


        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters."
            });
        }


        // ==============================
        // CHECK EXISTING TEACHER
        // ==============================

        const {
            data: existingTeacher,
            error: checkError
        } = await supabase
            .from("teachers")
            .select("id")
            .eq("teacher_id", teacherId)
            .eq("school_id", schoolId)
            .maybeSingle();


        if (checkError) {
            throw checkError;
        }


        if (existingTeacher) {
            return res.status(409).json({
                error: "This Teacher ID already exists."
            });
        }


        // ==============================
        // CREATE AUTH EMAIL
        // ==============================

        const authEmail =
            `${teacherId.toLowerCase()}@jnvresultmanager.local`;


        // ==============================
        // CREATE SUPABASE AUTH USER
        // ==============================

        const {
            data: authData,
            error: authError
        } = await supabase.auth.admin.createUser({

            email: authEmail,

            password: password,

            email_confirm: true

        });


        if (authError) {
            throw authError;
        }


        if (!authData.user) {
            throw new Error(
                "Auth user was not created."
            );
        }


        // ==============================
        // SAVE TEACHER RECORD
        // ==============================

        const {
            data: teacher,
            error: teacherError
        } = await supabase
            .from("teachers")
            .insert({

                school_id: schoolId,

                teacher_name: teacherName,

                teacher_id: teacherId,

                assigned_subject: assignedSubject,

                auth_user_id: authData.user.id

            })
            .select()
            .single();


        // ==============================
        // IF DATABASE INSERT FAILS
        // DELETE AUTH USER
        // ==============================

        if (teacherError) {

            await supabase.auth.admin.deleteUser(
                authData.user.id
            );

            throw teacherError;
        }


        // ==============================
        // SUCCESS
        // ==============================

        return res.status(200).json({

            success: true,

            teacher: teacher,

            message:
                "Teacher account created successfully."

        });

    } catch (error) {

        console.error(
            "Create teacher error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error.message ||
                "Internal server error."

        });

    }
};
