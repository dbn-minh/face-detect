const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Notification', {
    notificationID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    attendanceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Attendance',
        key: 'attendanceID'
      }
    },
    timeStamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Notification',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "notificationID" },
        ]
      },
      {
        name: "attendanceID",
        using: "BTREE",
        fields: [
          { name: "attendanceID" },
        ]
      },
    ]
  });
};
