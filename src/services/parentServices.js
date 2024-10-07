import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export const getAllStudentsInformationByParentId = async (parent_id) => {
  try {
    // Lấy danh sách student_id từ Student_Parent thông qua parent_id
    const studentParentRecords = await model.Student_Parent.findAll({
      where: { parent_id: parent_id },
      attributes: ['student_id'],
    });

    // Lấy danh sách student_id từ studentParentRecords
    const studentIds = studentParentRecords.map(record => record.student_id);

    if (studentIds.length === 0) {
      return []; // Trả về mảng rỗng nếu không có học sinh nào
    }

    // Lấy thông tin chi tiết của từng student dựa vào student_id
    const students = await model.Student.findAll({
      where: {
        student_id: studentIds, // Lọc các student dựa vào danh sách student_id
      },
      attributes: ['student_id', 'name', 'class', 'teacher_id' , "driver_id", 'avatar'],
    });

    // Lấy thông tin giáo viên từ teacher_id trong Student
    return await Promise.all(
      students.map(async (student) => {
        const teacher = await model.Teacher.findOne({
          where: { teacher_id: student.teacher_id },
          attributes: ['teacher_id', 'user_id'], // Chỉ lấy teacher_id và user_id
        });

        // Lấy thông tin người dùng từ user_id của giáo viên
        const teacherUser = teacher
          ? await model.User.findOne({
              where: { user_id: teacher.user_id },
              attributes: ['user_id', 'name', 'phone_number', 'email'], //
            })
          : null;
        // Lấy thông tin tài xế (driver & user)
        const driver = await model.Driver.findOne({
          where: { driver_id: student.driver_id },
          attributes: ['driver_id', 'user_id'], // Chỉ lấy driver_id và user_id
        });

        const driverUser = driver
          ? await model.User.findOne({
              where: { user_id: driver.user_id },
              attributes: ['user_id', 'name', 'phone_number', 'email'], // Lấy thông tin cần thiết từ User
            })
          : null;

        // Chỉnh nội dung Response
        return {
          student_id: student.student_id,
          name: student.name,
          class: student.class,
          avatar: student.avatar,
          teacher: teacher
            ? {
                teacher_id: teacher.teacher_id,
                "Teacher information": teacherUser
                  ? {
                      user_id: teacherUser.user_id,
                      name: teacherUser.name,
                      phone_number: teacherUser.phone_number,
                      email: teacherUser.email,
                    }
                  : null,
              }
            : null,
          driver: driver
            ? {
                driver_id: driver.driver_id,
                "Driver information": driverUser
                  ? {
                      user_id: driverUser.user_id,
                      name: driverUser.name,
                      phone_number: driverUser.phone_number,
                      email: driverUser.email,
                    }
                  : null,
              }
            : null,
        };
      })
    );
  } catch (error) {
    throw new Error('Error fetching students for parent: ' + error.message);
  }
};

// services/notificationService.js
export const getNotificationsByStudentId = async (student_id) => {
  try {
    // Tìm attendance_id trong bảng Attendance dựa trên student_id
    const attendanceRecords = await model.Attendance.findAll({
      where: { student_id: student_id },
      attributes: ['attendance_id'], // Chỉ lấy attendance_id
    });

    const attendanceIds = attendanceRecords.map(record => record.attendance_id);

    if (attendanceIds.length === 0) {
      return []; // Nếu không có attendance_id nào
    }

    // Tìm tất cả notifications dựa trên attendance_id
    return await model.Notification.findAll({
      where: {
        attendance_id: attendanceIds, // Lọc các notification dựa trên attendance_id
      },
      attributes: ['notification_id', 'attendance_id', 'time_stamp', 'message', 'image', 'status'], // Các thuộc tính trong Notification
    });

  } catch (error) {
    throw new Error('Error fetching notifications: ' + error.message);
  }
};

export const getStudentIdsByParentId = async (parent_id) => {
  try {
    const studentParentRecords = await model.Student_Parent.findAll({
      where: { parent_id: parent_id },
      attributes: ['student_id'], // Chỉ lấy student_id
    });

    return studentParentRecords.map(record => record.student_id);

  } catch (error) {
    throw new Error('Error fetching student IDs: ' + error.message);
  }
};























export const getCurrentLocationByDriverId = async (driver_id) => {
  try {
    const bus = await model.Bus.findOne({
      where: { driver_id: driver_id },
      attributes: ['current_location'], // Chỉ lấy current_location từ Bus
    });

    if (!bus) {
      return null; // Nếu không có bus nào được tìm thấy
    }

    return bus.current_location; // Trả về current_location
  } catch (error) {
    throw new Error('Error fetching current location: ' + error.message);
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

export const getParentProfileById = async (parent_id) => {
    try {
        const parentProfile = await model.Parent.findOne({
            where: { parent_id },
            include: [{
                model: model.User,
                as: 'user',
            }]
        });

        if (!parentProfile) {
            return { error: "Parent not found", data: null };
        }

        return { error: null, data: parentProfile.toJSON() };
    } catch (error) {
        console.error("Error fetching parent profile:", error);
        return { error: "An error occurred while fetching the parent profile", data: null };
    }
};

export const updateParentProfileById = async (parent_id, updatedParentData) => {
    try {
        const { address, name, phone_number, email, password } = updatedParentData;

        // Find the parent profile by ID
        const parentProfile = await model.Parent.findOne({
            where: { parent_id },
            include: [{
                model: model.User,
                as: 'user',
            }]
        });

        if (!parentProfile) {
            return { error: "Parent not found", data: null };
        }

        // Hash the new password if it's provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update the User table with the provided user-related attributes, including the password
        const updatedUser = await parentProfile.user.update({
            name: name || parentProfile.user.name,
            phone_number: phone_number || parentProfile.user.phone_number,
            email: email || parentProfile.user.email,
            password: hashedPassword || parentProfile.user.password,
        });

        // Update the Parent table with the provided parent-related attributes
        await parentProfile.update({
            address: address || parentProfile.address,
        });

        // Return the updated profile
        return { error: null, data: { ...parentProfile.toJSON(), user: updatedUser.toJSON() } };
    } catch (error) {
        console.error("Error updating parent profile:", error);
        return { error: "An error occurred while updating the parent profile", data: null };
    }
};
export const registerStudent = async (parent_id, studentData) => {
    try {
        const { name, class_name, avatar, feature_vector } = studentData;

        // Check if the parent_id exists in the Parent table
        const parent = await model.Parent.findOne({ where: { parent_id } });

        if (!parent) {
            return { error: "Parent not found", data: null };
        }

        // Create a new student with teacher_id as NULL
        const newStudent = await model.Student.create({
            name,
            teacher_id: null, // Leaving teacher_id empty
            class: class_name,
            parent_id,
            avatar: avatar || null,
            feature_vector: feature_vector || null,
        });

        return { error: null, data: newStudent.toJSON() };
    } catch (error) {
        console.error("Error registering student:", error);
        return { error: "An error occurred while registering the student", data: null };
    }
};

// current_location of the relevant driver_id, current Journey included
export const getDriverLocationsByParentId = async (parent_id) => {
    try {
        console.log(`Service Start: Fetching driver locations for parent_id: ${parent_id}`);

        // Step 1: Get all student IDs associated with the parent
        const { error: studentError, data: student_ids } = await getStudentIDsByParentID(parent_id);
        console.log(`Step 1: Retrieved student_ids: ${JSON.stringify(student_ids)}`);

        if (studentError || student_ids.length === 0) {
            console.log("No students found or an error occurred while fetching students.");
            return { error: "No students found for this parent", data: null };
        }

        // Step 2: Get the unique ongoing journey ID for each student by checking the `end_time` in the `Journey` table
        const journeys = await model.Attendance.findAll({
            where: {
                student_id: student_ids,
            },
            attributes: ['journey_id'],
            include: [{
                model: model.Journey,
                as: 'journey',
                where: {
                    end_time: { [Op.is]: null }, // Filter by `end_time` being `null`
                },
                attributes: ['journey_id'],
                required: true // Ensures that only attendance with an ongoing journey is fetched
            }],
        });

        const journey_ids = journeys.map(journey => journey.journey.journey_id);
        console.log(`Step 2: Retrieved current unique journey_ids: ${JSON.stringify(journey_ids)}`);

        if (journey_ids.length === 0) {
            console.log("No current journeys found for these attendance records.");
            return { error: "No current journeys found for these attendance records", data: null };
        }

        // Step 3: Find the driver locations for the current journeys
        const drivers = await model.Journey.findAll({
            where: { journey_id: journey_ids },
            attributes: ['driver_id'],
            include: [{
                model: model.Driver,
                as: 'driver',
                attributes: ['current_location'],
            }]
        });
        console.log(`Step 3: Retrieved driver locations for current journeys: ${JSON.stringify(drivers)}`);

        if (drivers.length === 0) {
            console.log("No drivers found for the current journeys.");
            return { error: "No drivers found for the current journeys", data: null };
        }

        // Step 4: Extract the current locations of all relevant drivers
        const locations = drivers.map(driver => driver.driver.current_location);
        console.log(`Step 4: Final driver locations to return: ${JSON.stringify(locations)}`);

        return { error: null, data: locations };
    } catch (error) {
        console.error("Error fetching driver locations:", error);
        return { error: "Failed to retrieve bus tracking information", data: null };
    }
};


