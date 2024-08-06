const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Student', {
    studentID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    teacherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teacher',
        key: 'teacherID'
      }
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    parentID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Parent',
        key: 'parentID'
      }
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featureVector: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Student',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "studentID" },
        ]
      },
      {
        name: "teacherID",
        using: "BTREE",
        fields: [
          { name: "teacherID" },
        ]
      },
      {
        name: "parentID",
        using: "BTREE",
        fields: [
          { name: "parentID" },
        ]
      },
    ]
  });
};
