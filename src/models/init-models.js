var DataTypes = require("sequelize").DataTypes;
var _Attendance = require("./Attendance");
var _Bus = require("./Bus");
var _Driver = require("./Driver");
var _Journey = require("./Journey");
var _Notification = require("./Notification");
var _Parent = require("./Parent");
var _Role = require("./Role");
var _Student = require("./Student");
var _Teacher = require("./Teacher");
var _User = require("./User");

function initModels(sequelize) {
  var Attendance = _Attendance(sequelize, DataTypes);
  var Bus = _Bus(sequelize, DataTypes);
  var Driver = _Driver(sequelize, DataTypes);
  var Journey = _Journey(sequelize, DataTypes);
  var Notification = _Notification(sequelize, DataTypes);
  var Parent = _Parent(sequelize, DataTypes);
  var Role = _Role(sequelize, DataTypes);
  var Student = _Student(sequelize, DataTypes);
  var Teacher = _Teacher(sequelize, DataTypes);
  var User = _User(sequelize, DataTypes);

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
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
