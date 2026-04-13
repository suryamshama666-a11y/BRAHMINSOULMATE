
import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('ok'));
app.listen(3002, () => console.log('Test server on 3002'));
