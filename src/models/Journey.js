const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Journey', {
    journeyID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    busID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Bus',
        key: 'busID'
      }
    },
    driverID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Driver',
        key: 'driverID'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Journey',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "journeyID" },
        ]
      },
      {
        name: "busID",
        using: "BTREE",
        fields: [
          { name: "busID" },
        ]
      },
      {
        name: "driverID",
        using: "BTREE",
        fields: [
          { name: "driverID" },
        ]
      },
    ]
  });
};
