import { AppDataSource } from "./database";
import app from "./app";

const PORT = process.env.PORT || 3003;

AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos conectada correctamente");
    app.listen(PORT, () => {
      console.log(`Microservicio de Facturas corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar la base de datos:", error);
  });
