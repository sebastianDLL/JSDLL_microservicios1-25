require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID
} = require('graphql');

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Tipo de objeto Task
const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    status: { type: GraphQLNonNull(GraphQLString) }
  })
});

// Root Query
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    tasks: {
      type: GraphQLList(TaskType),
      resolve: async () => {
        try {
          return await Task.find();
        } catch (error) {
          throw new Error('Error al obtener tareas');
        }
      }
    },
    task: {
      type: TaskType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          return await Task.findById(args.id);
        } catch (error) {
          throw new Error('Error al obtener la tarea');
        }
      }
    }
  }
});

// Root Mutation
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addTask: {
      type: TaskType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        status: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: async (parent, args) => {
        try {
          const newTask = new Task({
            title: args.title,
            description: args.description,
            status: args.status
          });
          return await newTask.save();
        } catch (error) {
          throw new Error('Error al crear tarea');
        }
      }
    },
    updateTask: {
      type: TaskType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString }
      },
      resolve: async (parent, args) => {
        try {
          const validStatus = ['pendiente', 'en progreso', 'completado'];
          if (args.status && !validStatus.includes(args.status)) {
            throw new Error('Estado inválido');
          }
          return await Task.findByIdAndUpdate(
            args.id,
            { title: args.title, description: args.description, status: args.status },
            { new: true }
          );
        } catch (error) {
          throw new Error('Error al actualizar tarea');
        }
      }
    },
    deleteTask: {
      type: TaskType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          const deletedTask = await Task.findByIdAndDelete(args.id);
          if (!deletedTask) {
            throw new Error('Tarea no encontrada');
          }
          return deletedTask;
        } catch (error) {
          throw new Error('Error al eliminar tarea');
        }
      }
    }
  }
});

// Esquema
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

// Servidor
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true // Habilita UI para pruebas
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor GraphQL en http://localhost:${PORT}/graphql`));