import { DataTypes } from 'sequelize'
import { sequelize } from '../config'

// Define models
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  role: DataTypes.STRING,
  settings: DataTypes.JSONB,
})

export const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  status: DataTypes.STRING,
  capabilities: DataTypes.ARRAY(DataTypes.STRING),
  metadata: DataTypes.JSONB,
})

export const Memory = sequelize.define('Memory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: DataTypes.STRING,
  content: DataTypes.TEXT,
  tags: DataTypes.ARRAY(DataTypes.STRING),
  metadata: DataTypes.JSONB,
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
})

export const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: DataTypes.STRING,
  steps: DataTypes.JSONB,
  metadata: DataTypes.JSONB,
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
})

// Define relationships
User.hasMany(Memory)
Memory.belongsTo(User)

User.hasMany(Workflow)
Workflow.belongsTo(User)

// Initialize database
export const initDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection established successfully')

    // Sync models with database
    await sequelize.sync()
    console.log('Database models synchronized')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

export { sequelize }
