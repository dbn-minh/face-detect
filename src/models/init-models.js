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
  const Teacher = _Teacher.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);

  Notification.belongsTo(Attendance, { as: "attendance", foreignKey: "attendanceID"});
  Attendance.hasMany(Notification, { as: "Notifications", foreignKey: "attendanceID"});
  Journey.belongsTo(Bus, { as: "bus", foreignKey: "busID"});
  Bus.hasMany(Journey, { as: "Journeys", foreignKey: "busID"});
  Bus.belongsTo(Driver, { as: "driver", foreignKey: "driverID"});
  Driver.hasMany(Bus, { as: "Buses", foreignKey: "driverID"});
  Journey.belongsTo(Driver, { as: "driver", foreignKey: "driverID"});
  Driver.hasMany(Journey, { as: "Journeys", foreignKey: "driverID"});
  Attendance.belongsTo(Journey, { as: "journey", foreignKey: "journeyID"});
  Journey.hasMany(Attendance, { as: "Attendances", foreignKey: "journeyID"});
  Student.belongsTo(Parent, { as: "parent", foreignKey: "parentID"});
  Parent.hasMany(Student, { as: "Students", foreignKey: "parentID"});
  User.belongsTo(Role, { as: "role", foreignKey: "roleID"});
  Role.hasMany(User, { as: "Users", foreignKey: "roleID"});
  Attendance.belongsTo(Student, { as: "student", foreignKey: "studentID"});
  Student.hasMany(Attendance, { as: "Attendances", foreignKey: "studentID"});
  Student.belongsTo(Teacher, { as: "teacher", foreignKey: "teacherID"});
  Teacher.hasMany(Student, { as: "Students", foreignKey: "teacherID"});
  Driver.belongsTo(User, { as: "user", foreignKey: "userID"});
  User.hasMany(Driver, { as: "Drivers", foreignKey: "userID"});
  Parent.belongsTo(User, { as: "user", foreignKey: "userID"});
  User.hasMany(Parent, { as: "Parents", foreignKey: "userID"});
  Teacher.belongsTo(User, { as: "user", foreignKey: "userID"});
  User.hasMany(Teacher, { as: "Teachers", foreignKey: "userID"});

  return {
    Attendance,
    Bus,
    Driver,
    Journey,
    Notification,
    Parent,
    Role,
    Student,
    Teacher,
    User,
  };
}
