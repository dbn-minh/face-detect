const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Attendance', {
    attendanceID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    studentID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Student',
        key: 'studentID'
      }
    },
    journeyID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Journey',
        key: 'journeyID'
      }
    },
    boarded: {
      type: DataTypes.DATE,
      allowNull: true
    },
    alighted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    boardedImage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alightedImage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Attendance',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attendanceID" },
        ]
      },
      {
        name: "studentID",
        using: "BTREE",
        fields: [
          { name: "studentID" },
        ]
      },
      {
        name: "journeyID",
        using: "BTREE",
        fields: [
          { name: "journeyID" },
        ]
      },
    ]
  });
};
