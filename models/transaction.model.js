module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'transactions',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      channelId: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      virtualchannelId: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sigA: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      sigB: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      balanceA: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      balanceB: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      nonce: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      currentState: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'transactions',
      timestamps: true
    }
  )
}
