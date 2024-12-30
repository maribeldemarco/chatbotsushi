const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());


mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.error('Error al conectar', error));


const productoModelo = new mongoose.Schema({
  name: { type: String, required: true },
  descripcion: { type: String, required: true },
});

const Product = mongoose.model('Product', productoModelo, 'productos');


app.get('/menu', async (req, res) => {
  try {
    const products = await Product.find();
    console.log('Productos recuperados:', products);
    res.json(products);
  } catch (error) {
    console.log('Error al obtener los productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const { mensaje } = req.body;

    let menu;
    if (mensaje.toLowerCase() === 'menu') {
      const productos = await Product.find();
      menu = `Menú: ${productos.map(product => `${product.name} - ${product.descripcion}`).join(', ')}`;
    } else {
      menu = `Mensaje recibido: ${mensaje}`;
    }
    res.json({ respuesta: menu });
  } catch (error) {
    console.error('Error al procesar el mensaje del chatbot:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje del chatbot' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
