import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Parent extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    parent_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'user_id'
      },
      unique: "Parent_ibfk_1"
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    relationship: {
      type: DataTypes.ENUM('Father','Mother','Other'),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Parent',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "parent_id" },
        ]
      },
      {
        name: "user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
