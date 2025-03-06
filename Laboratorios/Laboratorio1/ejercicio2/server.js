const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3002;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/generate', (req, res) => {
    const { operation, numero, inicio, fin } = req.body;
    const num = parseInt(numero);
    const start = parseInt(inicio);
    const end = parseInt(fin);
    let results = [];

    for (let i = start; i <= end; i++) {
        let result;
        switch (operation) {
            case 'sum':
                result = num + i;
                break;
            case 'subtract':
                result = num - i;
                break;
            case 'multiply':
                result = num * i;
                break;
            case 'divide':
                result = i !== 0 ? (num / i).toFixed(2) : '∞';
                break;
            default:
                result = 'Error';
        }
        results.push({ num, operation, i, result });
    }

    res.render('table', { results });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
