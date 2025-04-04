import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./database";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a la base de datos establecida");
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
  }
}

main();