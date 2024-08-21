import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import {
  createRefToken,
  createToken,
} from "../config/jwt.js";
let model = initModels(sequelize);

export const getAdminDetails = async () => {
    try {
        // Step 1: Fetch all students
        const students = await model.Student.findAll();

        if (!students.length) {
            return { error: "No students found", data: null };
        }

        // Step 2: Fetch parent details for each student
        const parentIds = students.map(student => student.parent_id);
        const parents = await model.Parent.findAll({
            where: { parent_id: parentIds },
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        // Step 3: Fetch teacher details for each student
        const teacherIds = students.map(student => student.teacher_id).filter(id => id !== null);
        const teachers = await model.Teacher.findAll({
            where: { teacher_id: teacherIds },
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        // Step 4: Combine the results
        const studentDetails = students.map(student => {
            const parent = parents.find(p => p.parent_id === student.parent_id);
            const teacher = teachers.find(t => t.teacher_id === student.teacher_id);

            return {
                student_id: student.student_id,
                student_name: student.name,
                class: student.class,
                avatar: student.avatar,
                feature_vector: student.feature_vector,
                parent: parent ? {
                    parent_id: parent.parent_id,
                    parent_name: parent.user.name,
                    parent_email: parent.user.email,
                    parent_phone_number: parent.user.phone_number,
                    address: parent.address
                } : null,
                teacher: teacher ? {
                    teacher_id: teacher.teacher_id,
                    teacher_name: teacher.user.name,
                    teacher_email: teacher.user.email,
                    teacher_phone_number: teacher.user.phone_number,
                    department: teacher.department
                } : null
            };
        });

        return { error: null, data: studentDetails };
    } catch (error) {
        console.error("Error fetching student details:", error);
        return { error: "An error occurred while fetching student details", data: null };
    }
};
// Service to get all student IDs
export const getAllStudentIDs = async () => {
    try {
        const students = await model.Student.findAll({
            attributes: ['student_id']
        });

        const student_ids = students.map(student => student.student_id);
        return { error: null, data: student_ids };
    } catch (error) {
        console.error("Error fetching student IDs:", error);
        return { error: "An error occurred while fetching student IDs", data: null };
    }
};

// Service to get attendance IDs associated with student IDs
export const getAttendanceIDsByStudentIDs = async (student_ids) => {
    try {
        const attendances = await model.Attendance.findAll({
            where: { student_id: student_ids },
            attributes: ['attendance_id']
        });

        const attendance_ids = attendances.map(attendance => attendance.attendance_id);
        return { error: null, data: attendance_ids };
    } catch (error) {
        console.error("Error fetching attendance IDs:", error);
        return { error: "An error occurred while fetching attendance IDs", data: null };
    }
};

// Service to get notifications associated with attendance IDs
export const getNotificationsByAttendanceIDs = async (attendance_ids) => {
    try {
        const notifications = await model.Notification.findAll({
            where: { attendance_id: attendance_ids },
            attributes: ['notification_id', 'time_stamp', 'message', 'image']
        });

        return { error: null, data: notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "An error occurred while fetching notifications", data: null };
    }
};
export const getAllUsersWithRoleDetails = async () => {
    try {
        // Fetch all users with their role information
        const users = await model.User.findAll({
            attributes: ['user_id', 'name', 'phone_number', 'email', 'role_id'],
            include: [{
                model: model.Role,
                as: 'role',
                attributes: ['role_name']
            }]
        });

        if (!users || users.length === 0) {
            return { error: "No users found", data: null };
        }

        // Process each user and fetch role-specific details
        const userDetails = await Promise.all(users.map(async (user) => {
            const userData = user.toJSON();

            // Fetch role-specific details based on role_id
            if (user.role_id === 1) { // Parent
                const parentDetails = await model.Parent.findOne({
                    where: { user_id: user.user_id },
                    attributes: ['address']
                });
                userData.role_details = parentDetails ? parentDetails.toJSON() : null;
            } else if (user.role_id === 2) { // Driver
                const driverDetails = await model.Driver.findOne({
                    where: { user_id: user.user_id },
                    attributes: ['license_number']
                });
                userData.role_details = driverDetails ? driverDetails.toJSON() : null;
            } else if (user.role_id === 3) { // Teacher
                const teacherDetails = await model.Teacher.findOne({
                    where: { user_id: user.user_id },
                    attributes: ['department']
                });
                userData.role_details = teacherDetails ? teacherDetails.toJSON() : null;
            }

            return userData;
        }));

        return { error: null, data: userDetails };
    } catch (error) {
        console.error("Error fetching users with role details:", error);
        return { error: "An error occurred while fetching users", data: null };
    }
};
export const adminCreateUserService = async (role_id, name, phone_number, email, password, other) => {
  try {
    let check_user = await model.User.findOne({
      where: { email },
    });

    if (check_user) {
      return { error: "Email exists, use another email", status: 400 };
    }

    let hashedPassword = bcrypt.hashSync(password, 10);
    let newUser = await model.User.create({
      role_id,
      name,
      phone_number,
      email,
      password: hashedPassword,
    });

    switch (role_id) {
      case 1: // Parent
        await model.Parent.create({
          address: other,
          user_id: newUser.user_id,
        });
        break;
      case 2: // Driver
        await model.Driver.create({
          license_number: other,
          user_id: newUser.user_id,
        });
        break;
      case 3: // Teacher
        await model.Teacher.create({
          department: other,
          user_id: newUser.user_id,
        });
        break;
      case 4: // Admin
        // No additional action needed unless there's admin-specific info
        break;
    }

    // Generate token for the new user (optional, depending on your use case)
    let key = new Date().getTime();
    let token = createToken({ user_id: newUser.user_id, key });
    let ref_token = createRefToken({ user_id: newUser.user_id, key });

    // Save refresh token
    await model.User.update(
      { refresh_token: ref_token },
      {
        where: { user_id: newUser.user_id },
      }
    );

    return { data: { newUser, token }, status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error creating user", status: 500 };
  }
};
export const adminUpdateUserService = async (user_id, role_id, name, phone_number, email, password, other) => {
  try {
    // Fetch the user by user_id
    let user = await model.User.findOne({
      where: { user_id },
    });

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    // Update user details
    let updatedData = {
      role_id,
      name,
      phone_number,
      email,
    };

    // If the password is provided, hash it
    if (password) {
      updatedData.password = bcrypt.hashSync(password, 10);
    }

    await model.User.update(updatedData, {
      where: { user_id },
    });

    // Update role-specific details
    switch (role_id) {
      case 1: // Parent
        await model.Parent.update(
          { address: other },
          { where: { user_id } }
        );
        break;
      case 2: // Driver
        await model.Driver.update(
          { license_number: other },
          { where: { user_id } }
        );
        break;
      case 3: // Teacher
        await model.Teacher.update(
          { department: other },
          { where: { user_id } }
        );
        break;
    }

    return { data: "User updated successfully", status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error updating user", status: 500 };
  }
};

export const adminDeleteUserService = async (user_id) => {
    try {
        // Fetch the user by user_id
        let user = await model.User.findOne({
            where: { user_id },
        });

        if (!user) {
            return { error: "User not found", status: 404 };
        }

        // Determine the role of the user
        const role_id = user.role_id;

        // Delete role-specific details
        switch (role_id) {
            case 1: // Parent
                await model.Parent.destroy({
                    where: { user_id }
                });
                break;
            case 2: // Driver
                await model.Driver.destroy({
                    where: { user_id }
                });
                break;
            case 3: // Teacher
                await model.Teacher.destroy({
                    where: { user_id }
                });
                break;
        }

        // Delete the user record from the User table
        await model.User.destroy({
            where: { user_id }
        });

        return { data: "User deleted successfully", status: 200 };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Error deleting user", status: 500 };
    }
};

export const listPendingRegistrationsService = async () => {
    try {
        // Fetch all students with teacher_id as null
        const pendingRegistrations = await model.Student.findAll({
            where: { teacher_id: null },
            attributes: ['student_id', 'name', 'class', 'parent_id', 'avatar', 'feature_vector'],
            include: [{
                model: model.Parent,
                as: 'parent',
                attributes: ['parent_id', 'user_id'],
                include: [{
                    model: model.User,
                    as: 'user',
                    attributes: ['name', 'email', 'phone_number']
                }]
            }]
        });

        if (!pendingRegistrations || pendingRegistrations.length === 0) {
            return { error: "No pending registrations found", data: null };
        }

        return { error: null, data: pendingRegistrations };
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        return { error: "An error occurred while fetching pending registrations", data: null };
    }
};

export const getAllTeachersService = async () => {
    try {
        const teachers = await model.Teacher.findAll({
            attributes: ['teacher_id', 'department'],
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        if (!teachers || teachers.length === 0) {
            return { error: "No teachers found", data: null };
        }

        return { error: null, data: teachers };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return { error: "An error occurred while fetching teachers", data: null };
    }
};
export const assignTeacherToStudentsService = async (teacher_id, student_ids) => {
    try {
        // Check if the teacher exists
        const teacher = await model.Teacher.findOne({
            where: { teacher_id }
        });
        if (!teacher) {
            return { error: "Teacher not found", data: null };
        }

        // Fetch the teacher's user details separately
        const teacherUser = await model.User.findOne({
            where: { user_id: teacher.user_id },
            attributes: ['name', 'email', 'phone_number']
        });

        // Update students with the provided teacher_id
        await model.Student.update(
            { teacher_id },
            { where: { student_id: student_ids, teacher_id: null } } // Only update students with null teacher_id
        );

        // Fetch the updated student details
        const students = await model.Student.findAll({
            where: { student_id: student_ids },
            attributes: ['student_id', 'name', 'class', 'parent_id']
        });

        // Fetch the parent user details for each student
        const studentDetails = await Promise.all(
            students.map(async (student) => {
                const parent = await model.Parent.findOne({ where: { parent_id: student.parent_id } });
                const parentUser = await model.User.findOne({
                    where: { user_id: parent.user_id },
                    attributes: ['name', 'email', 'phone_number']
                });

                return {
                    student_id: student.student_id,
                    name: student.name,
                    class: student.class,
                    parent: {
                        address: parent.address,
                        user: parentUser
                    }
                };
            })
        );

        return {
            error: null,
            data: {
                teacher: {
                    teacher_id: teacher.teacher_id,
                    department: teacher.department,
                    user: teacherUser
                },
                students: studentDetails
            }
        };
    } catch (error) {
        console.error("Error assigning teacher:", error);
        return { error: "An error occurred while assigning the teacher", data: null };
    }
};

export const updateStudentInfoService = async (student_id, updateData) => {
    try {
        // Fetch the student record
        const student = await model.Student.findOne({
            where: { student_id }
        });

        if (!student) {
            return { error: "Student not found", data: null };
        }

        // Update student information
        const updatedStudent = await student.update(updateData);

        // If teacher_id is updated, fetch the new teacher's information
        let teacherInfo = null;
        if (updateData.teacher_id) {
            const teacher = await model.Teacher.findOne({
                where: { teacher_id: updateData.teacher_id }
            });
            if (teacher) {
                const teacherUser = await model.User.findOne({
                    where: { user_id: teacher.user_id },
                    attributes: ['name', 'email', 'phone_number']
                });
                teacherInfo = {
                    teacher_id: teacher.teacher_id,
                    department: teacher.department,
                    user: teacherUser
                };
            }
        }

        return {
            error: null,
            data: {
                student: updatedStudent.toJSON(),
                teacher: teacherInfo
            }
        };
    } catch (error) {
        console.error("Error updating student information:", error);
        return { error: "An error occurred while updating the student information", data: null };
    }
};