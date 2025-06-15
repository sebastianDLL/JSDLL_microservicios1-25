const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { verifyToken } = require("./middleware/auth");

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 requests por ventana por IP
  });
  app.use(limiter);

  // Conectar a MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }

  // Configurar Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Extraer token del header
      const token = req.headers.authorization?.replace("Bearer ", "");
      let user = null;

      if (token) {
        try {
          user = verifyToken(token);
        } catch (error) {
          console.log("Token inválido:", error.message);
        }
      }

      return { user };
    },
    introspection: process.env.NODE_ENV !== "production",
    playground: process.env.NODE_ENV !== "production",
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // Rutas de salud
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      service: "Medical Schedules Service",
      timestamp: new Date().toISOString(),
    });
  });

  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(
      `📊 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `💓 Health Check: http://localhost:${PORT}/health`
    );
  });
}

startServer().catch((error) => {
  console.error("Error iniciando servidor:", error);
  process.exit(1);
});
