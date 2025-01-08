const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/product');
const Order = require('./models/order');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.error('Error al conectar', error));

let menuMostrado = false;
let numeroPedido = null;
let domicilio = false;
let pedir = '';

app.get('/menu', async (req, res) => {
  try {
    const products = await Product.find();
    console.log('Productos recuperados:', products);
  } catch (error) {
    console.log('Error al obtener los productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const { mensaje } = req.body;
    let menu;

   
    if (mensaje.toLowerCase() === 'menu' || mensaje.toLowerCase() === 'menú') {
      const productos = await Product.find();
      let contador = 1;
      menu = `Hola! Nuestro menú del día es 🍽️:<br /> ${productos.map(product => {
        return `${contador++}) ${product.nombre} : ${product.descripcion}. Precio: ${product.precio} <br />`;
      }).join('')}`;
      pedir = `Si quieres elegir un producto ingresa su número 🛒 )`;
        menuMostrado = true;
      return res.json({ respuesta: menu + pedir });
    }

    
    if (menuMostrado) {
      numeroPedido = parseInt(mensaje, 10);
      if (numeroPedido >= 1 && numeroPedido <= 5) {
        domicilio = true;
        menuMostrado = false;  
        return res.json({ respuesta: "Por favor, ingrese su domicilio" });
      } 
      else {
        return res.json({ respuesta: "Por favor, ingrese un número de pedido correcto (del 1 al 5)" });
      }
    }

    if (domicilio && isNaN(mensaje)) {
      const productos = await Product.find(); 
      const productoSeleccionado = productos[numeroPedido - 1]; 
    
      if (productoSeleccionado) {
        const nuevoPedido = new Order({
          producto: productoSeleccionado.nombre,
          domicilio: mensaje, 
        });
    
        await nuevoPedido.save();
        domicilio = false;
        menuMostrado = false; 
    
        return res.json({
          respuesta: `Su pedido de "${productoSeleccionado.nombre}" fue enviado a ${mensaje}. ¡Gracias por su compra!`,
        });
      } else {
        return res.json({ respuesta: "Error al procesar su pedido. Intente nuevamente." });
      }
    }
    

    if (mensaje.toLowerCase() === 'faq') {
      const faq = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver nuestros horarios 🕒 . Escribe 'horarios' <br /> 2) Ver nuestro teléfono y ubicación🏠. Escribe 'datos'";
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


    const respuestageneral = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver el menú de productos 🍔. Escribe 'menú' <br /> <br /> 2) Preguntar por horarios y otras preguntas frecuentes🕒. Escribe 'faq'";
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
