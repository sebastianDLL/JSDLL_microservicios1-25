const mysql=require('mysql2');

//Configurar la conexion
const conection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "usersdb",
});

//Conectar a la base de datos
conection.connect((error)=>{
    if(error){
        console.log('Error al conectar a la base de datos');
        return;
    }
    console.log('Conectado a la base de datos');
});

module.exports=conection;