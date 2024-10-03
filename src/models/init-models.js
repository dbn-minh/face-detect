import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Attendance from  "./Attendance.js";
import _Bus from  "./Bus.js";
import _Driver from  "./Driver.js";
import _Journey from  "./Journey.js";
import _Notification from  "./Notification.js";
import _Parent from  "./Parent.js";
import _Role from  "./Role.js";
import _Student from  "./Student.js";
import _Student_Parent from  "./Student_Parent.js";
import _Teacher from  "./Teacher.js";
import _User from  "./User.js";

export default function initModels(sequelize) {
  const Attendance = _Attendance.init(sequelize, DataTypes);
  const Bus = _Bus.init(sequelize, DataTypes);
  const Driver = _Driver.init(sequelize, DataTypes);
  const Journey = _Journey.init(sequelize, DataTypes);
  const Notification = _Notification.init(sequelize, DataTypes);
  const Parent = _Parent.init(sequelize, DataTypes);
  const Role = _Role.init(sequelize, DataTypes);
  const Student = _Student.init(sequelize, DataTypes);
  const Student_Parent = _Student_Parent.init(sequelize, DataTypes);
  const Teacher = _Teacher.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);

  Parent.belongsToMany(Student, { as: 'student_id_Students', through: Student_Parent, foreignKey: "parent_id", otherKey: "student_id" });
  Student.belongsToMany(Parent, { as: 'parent_id_Parents', through: Student_Parent, foreignKey: "student_id", otherKey: "parent_id" });
  Notification.belongsTo(Attendance, { as: "attendance", foreignKey: "attendance_id"});
  Attendance.hasMany(Notification, { as: "Notifications", foreignKey: "attendance_id"});
  Journey.belongsTo(Bus, { as: "bus", foreignKey: "bus_id"});
  Bus.hasMany(Journey, { as: "Journeys", foreignKey: "bus_id"});
  Bus.belongsTo(Driver, { as: "driver", foreignKey: "driver_id"});
  Driver.hasMany(Bus, { as: "Buses", foreignKey: "driver_id"});
  Attendance.belongsTo(Journey, { as: "journey", foreignKey: "journey_id"});
  Journey.hasMany(Attendance, { as: "Attendances", foreignKey: "journey_id"});
  Student_Parent.belongsTo(Parent, { as: "parent", foreignKey: "parent_id"});
  Parent.hasMany(Student_Parent, { as: "Student_Parents", foreignKey: "parent_id"});
  User.belongsTo(Role, { as: "role", foreignKey: "role_id"});
  Role.hasMany(User, { as: "Users", foreignKey: "role_id"});
  Attendance.belongsTo(Student, { as: "student", foreignKey: "student_id"});
  Student.hasMany(Attendance, { as: "Attendances", foreignKey: "student_id"});
  Student_Parent.belongsTo(Student, { as: "student", foreignKey: "student_id"});
  Student.hasMany(Student_Parent, { as: "Student_Parents", foreignKey: "student_id"});
  Bus.belongsTo(Teacher, { as: "teacher", foreignKey: "teacher_id"});
  Teacher.hasMany(Bus, { as: "Buses", foreignKey: "teacher_id"});
  Student.belongsTo(Teacher, { as: "teacher", foreignKey: "teacher_id"});
  Teacher.hasMany(Student, { as: "Students", foreignKey: "teacher_id"});
  Driver.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Driver, { as: "Drivers", foreignKey: "user_id"});
  Parent.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Parent, { as: "Parents", foreignKey: "user_id"});
  Teacher.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Teacher, { as: "Teachers", foreignKey: "user_id"});

  return {
    Attendance,
    Bus,
    Driver,
    Journey,
    Notification,
    Parent,
    Role,
    Student,
    Student_Parent,
    Teacher,
    User,
  };
}
