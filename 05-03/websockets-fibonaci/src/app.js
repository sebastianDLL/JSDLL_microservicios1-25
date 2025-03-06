const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

function fibonacci(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

wss.on('connection', (ws) => {
    console.log('Cliente conectado.');

    ws.on('message', (message) => {
        console.log(`Cliente envió: ${message}`);

        if (message == "fin") {
            ws.send("Conexión cerrada por solicitud del cliente.");
            ws.close();
        } else {
            let num = parseInt(message);
            if (!isNaN(num) && num >= 0) {
                let resultado = fibonacci(num);
                ws.send(`Fibonacci(${num}) = ${resultado}`);
            } else {
                ws.send("Por favor, envía un número válido.");
            }
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado.');
    });
});

console.log('🖥 Servidor WebSocket corriendo en ws://localhost:8080');
