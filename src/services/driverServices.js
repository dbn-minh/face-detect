import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";

let model = initModels(sequelize);

export const getDriverDetails = async (driver_id) => {
    try {
        // Step 1: Get the Bus and Teacher info based on driver_id
        const bus = await model.Bus.findOne({
            where: { driver_id },
            attributes: ['bus_id', 'license_plate', 'capacity'],
            include: [
                {
                    model: model.Teacher,
                    as: 'teacher', // Include teacher information
                    attributes: ['teacher_id'],
                    include: [
                        {
                            model: model.User, // Get teacher's user info
                            as: 'user',
                            attributes: ['name', 'email', 'phone_number']
                        }
                    ]
                }
            ]
        });

        // Step 2: Get the ongoing journey for this bus
        const journey = await model.Journey.findOne({
            where: { bus_id: bus.bus_id, status: 'ongoing' },
            attributes: ['journey_id']
        });

        // Step 3: Count students on the bus (status = "boarded")
        const studentCount = journey
            ? await model.Attendance.count({
                  where: { journey_id: journey.journey_id, status: 'boarded' }
              })
            : 0;

        // Step 4: Get students with an "absent" status for the ongoing journey
        const absentStudents = journey
            ? await model.Attendance.findAll({
                  where: { journey_id: journey.journey_id, status: 'absent' },
                  include: [
                      {
                          model: model.Student,
                          as: 'student',
                          attributes: ['student_id', 'name', 'class', 'avatar']
                      }
                  ]
              })
            : [];

        // Step 5: Get all students related to the bus_id
        const students = await model.Student.findAll({
            where: { bus_id: bus.bus_id }, // Use bus_id to get students
            attributes: ['student_id', 'name', 'class', 'avatar'],
            include: [
                {
                    model: model.Student_Parent, // Join the Student_Parent table to link with Parent
                    as: 'Student_Parents',
                    attributes: ['parent_id'],
                    include: [
                        {
                            model: model.Parent, // Include the Parent to get the address
                            as: 'parent',
                            attributes: ['address'],
                        }
                    ]
                }
            ]
        });

        // Map the results to include both student and parent address
        return {
            bus: {
                bus_id: bus.bus_id,
                license_plate: bus.license_plate,
                students_on_board: `${studentCount}/${bus.capacity}`,
                teacher: bus.teacher
                    ? {
                          teacher_id: bus.teacher.teacher_id,
                          name: bus.teacher.user.name,
                          email: bus.teacher.user.email,
                          phone_number: bus.teacher.user.phone_number
                      }
                    : null
            },
            students: students.length > 0
                ? students.map((student) => ({
                      student_id: student.student_id,
                      name: student.name,
                      class: student.class,
                      avatar: student.avatar,
                      address: student.Student_Parents.length > 0
                          ? student.Student_Parents[0].parent.address
                          : null // Get the first parent's address (if any)
                  }))
                : [],
            absent_students: absentStudents.length > 0
                ? absentStudents.map((attendance) => ({
                      student_id: attendance.student.student_id,
                      name: attendance.student.name,
                      class: attendance.student.class,
                      avatar: attendance.student.avatar
                  }))
                : []
        };
    } catch (error) {
        throw new Error('Error fetching driver details: ' + error.message);
    }
};

export const getDriverSetting = async (driver_id) => {
    try {
        // Fetch the bus details first and include driver and user info
        const bus = await model.Bus.findOne({
            where: { driver_id },
            attributes: ['bus_id', 'license_plate'],
            include: [
                {
                    model: model.Driver,
                    as: 'driver',
                    attributes: ['driver_id', 'license_number'],
                    include: [
                        {
                            model: model.User,
                            as: 'user',
                            attributes: ['name', 'email', 'phone_number']
                        }
                    ]
                }
            ]
        });


        return {

            driver_id: bus.driver.driver_id,
            license_number: bus.driver.license_number,
            name: bus.driver.user.name,
            email: bus.driver.user.email,
            phone_number: bus.driver.user.phone_number,
            bus_id: bus.bus_id,
            license_plate: bus.license_plate
        };
    } catch (error) {
        throw new Error('Error fetching driver details: ' + error.message);
    }
};
export const writeFeedback = async (driver_id, title, content) => {
    try {
        const driver = await model.Driver.findOne({
            where: { driver_id },
            attributes: ['user_id'],
        });

        const user_id = driver.user_id;

        return await model.Feedback.create({
            user_id,
            title,
            content,
        });

    } catch (error) {
        throw new Error('Error writing feedback: ' + error.message);
    }
};

export const reportBrokenBus = async (driver_id, action) => {
    try {
        // Step 1: Find the bus associated with the driver
        const bus = await model.Bus.findOne({
            where: { driver_id },
            attributes: ['bus_id', 'license_plate', 'status']
        });

        let newStatus;
        let message;

        switch (action) {
            case 'report_broken':
                if (bus.status === 'ongoing') {
                    newStatus = 'broken';
                    message = "Bus status updated to broken";
                } else {
                    return { error: "Bus is already broken and cannot be reported as broken again.", bus };
                }
                break;

            case 'mark_ongoing':
                if (bus.status === 'broken') {
                    newStatus = 'ongoing';
                    message = "Bus status updated to ongoing";
                } else {
                    return { error: "Bus is already ongoing and cannot be marked as ongoing again.", bus };
                }
                break;

            default:
                return { error: "Invalid action. Use 'report_broken' or 'mark_ongoing'." };
        }


        // Step 2: Update the bus status to "broken"
        await model.Bus.update(
            { status: newStatus },
            { where: { bus_id: bus.bus_id } }
        );

        // Step 3: Return the updated bus details in the response
        return {
            message,
            bus: {
                bus_id: bus.bus_id,
                license_plate: bus.license_plate,
                previous_status: bus.status,
                updated_status: newStatus
            }
        };

    } catch (error) {
        throw new Error("Error reporting broken bus: " + error.message);
    }
};

