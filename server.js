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
  //return  res.json(products);
  } catch (error) {
    console.log('Error al obtener los productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const { mensaje } = req.body;

    let menu;
    if (mensaje.toLowerCase() === 'menu' ||mensaje.toLowerCase() === 'menú' ) {
      const productos = await Product.find();
      menu = `Hola! Nuestro menú del día es: ${productos.map(product => `${product.name} - ${product.descripcion}`).join(', ')}`;
    
      return res.json({ respuesta: menu });
    }
    
     if (mensaje.toLowerCase() === 'faq' ) {
      
     const faq = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver nuestros horarios 🕒 . Escribe 'horarios' <br /> 2) Ver nuestro teléfono y ubicación🏠. Escribe 'datos'"
     return res.json({ respuesta: faq });
     }

      if (mensaje.toLowerCase() === 'horarios') {
        const respuestahr = "Nuestros horarios son: Lunes a Viernes, de 9:00 AM a 6:00 PM.";
        return res.json({ respuesta: respuestahr });
      }  
      
      
      
      if (mensaje.toLowerCase() === 'datos') {
        const respuestadir = "Nuestro teléfono es 123-456-789 y estamos ubicados en Calle Ficticia 123.";
        return res.json({ respuesta: respuestadir });
      }
     
     
    
    
    
     
      const respuestageneral = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver el menú de productos 🍔. Escribe 'menú' <br /> 2) Realizar un pedido 🛒. Escribe 'pedido'<br /> 3) Preguntar por horarios y otras preguntas frecuentes🕒. Escribe 'faq'";
  
      return res.json({ respuesta: respuestageneral });


    

  


    
  } catch (error) {
    console.error('Error al procesar el mensaje del chatbot:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje del chatbot' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
