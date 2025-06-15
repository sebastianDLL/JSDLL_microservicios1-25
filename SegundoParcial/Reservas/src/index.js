require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema');
const { verifyToken } = require('./auth');
const { pool } = require('./database');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    try {
      const user = verifyToken(token.replace('Bearer ', ''));
      return { user, pool };
    } catch (error) {
      return { pool };
    }
  }
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Servidor de reservas listo en ${url}`);
});