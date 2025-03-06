const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/calculate', (req, res) => {
    const { a, b, operacion } = req.body;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    let result;

    if (isNaN(numA) || isNaN(numB)) {
        return res.send('Error: Los valores deben ser números');
    }

    switch (operacion) {
        case 'suma':
            result = numA + numB;
            break;
        case 'resta':
            result = numA - numB;
            break;
        case 'multiplicacion':
            result = numA * numB;
            break;
        case 'division':
            if (numB === 0) return res.send('Error: No se puede dividir por 0');
            result = numA / numB;
            break;
        default:
            return res.send('Error: Operación no válida');
    }

    res.send(`Resultado: ${result}`);
});

// Iniciar servidor en el puerto 3001
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
