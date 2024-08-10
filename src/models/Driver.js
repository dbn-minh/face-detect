import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Driver extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    driverID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'userID'
      }
    }
  }, {
    sequelize,
    tableName: 'Driver',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "driverID" },
        ]
      },
      {
        name: "userID",
        using: "BTREE",
        fields: [
          { name: "userID" },
        ]
      },
    ]
  });
  }
}
