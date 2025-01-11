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
const respuestageneral = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver el menú de productos 🍣. Escribe 'menú' <br /> 2) Por preguntas frecuentes❓. Escribe 'faq' <br /> 3) Para saber como hacer un pedido escribe 'pedido'.🤔 <br /> 4) Para saber de nuestra promo de la semana escribe 'promo'💳 ";

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
      pedir = `Si querés elegir un producto ingresa su número 🛒 )`;
      menuMostrado = true;
      return res.json({ respuesta: menu + pedir });
    }

    if (menuMostrado) {
      numeroPedido = parseInt(mensaje);
      if (numeroPedido >= 1 && numeroPedido <= 5) {
        domicilio = true;
        menuMostrado = false;
        return res.json({ respuesta: "Por favor, ingrese su domicilio 🏠 , para cancelar pedido escriba 'cancelar'" });
      } else {
        return res.json({ respuesta: "Por favor, ingrese un número de pedido correcto (del 1 al 5)" });
      }
    }

    if (mensaje.toLowerCase() === 'cancelar') {
      domicilio = false;
      menuMostrado = false;
      numeroPedido = null;
      pedir = '';
      return res.json({ respuesta: respuestageneral });
    }

    if (['gracias', 'adiós', 'adios', 'hasta luego'].includes(mensaje.toLowerCase())) {
      const respuestaDespedida = "¡Gracias por visitarnos! Esperamos tu pedido pronto. 😊";
      return res.json({ respuesta: respuestaDespedida });
    }

    if (domicilio && isNaN(mensaje)) {
      const productos = await Product.find();
      const productoSeleccionado = productos[numeroPedido - 1];
      const costoEnvio = 50; // Reemplazar con el costo de envío correspondiente
      const costoTotal = productoSeleccionado.precio + costoEnvio;
    
      if (productoSeleccionado) {
        const nuevoPedido = new Order({
          producto: productoSeleccionado.nombre,
          domicilio: mensaje,
          costoTotal: costoTotal
        });
    
        await nuevoPedido.save();
        domicilio = false;
        menuMostrado = false;
    
        return res.json({
          respuesta: `Su pedido de "${productoSeleccionado.nombre}" fue enviado a ${mensaje}. El costo total, incluyendo el envío, es ${costoTotal}. ¡Gracias por su compra!`,
        });
      } else {
        return res.json({ respuesta: "Error al procesar su pedido. Intente nuevamente." });
      }
    }

    if (mensaje.toLowerCase() === 'faq') {
      const faq = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver nuestros horarios 🕒 . Escribe 'horarios' <br /> 2) Ver nuestra  ubicación🏠. Escribe 'direccion' <br /> 3) Ver nuestro teléfono 📞. Escribe 'telefono'<br /> 4)Por tiempos de entrega escribe 'entrega' ❓";
      return res.json({ respuesta: faq });
    }

    if (mensaje.toLowerCase() === 'pedido' || mensaje.toLowerCase() === 'pedir') {
      const respuestaPedido = "Para hacer un pedido, primero escribe 'menú', elige el número del producto que te interese, y después ingresa tu dirección. ¡Así de fácil!";
      return res.json({ respuesta: respuestaPedido });
    }

    if (mensaje.toLowerCase() === 'horarios' || mensaje.toLowerCase() === 'horario') {
      const respuestahr = "Nuestros horarios son: Lunes a Viernes, de 9:00 AM a 6:00 PM.";
      return res.json({ respuesta: respuestahr });
    }

    if (mensaje.toLowerCase() === 'direccion' || mensaje.toLowerCase() === 'dirección') {
      const respuestadir = "Estamos ubicados en Calle Boedo 45587. Capital Federal";
      return res.json({ respuesta: respuestadir });
    }
    if (mensaje.toLowerCase() === 'teléfono' || mensaje.toLowerCase() === 'telefono') {
      const respuestatel = "Nuestro teléfono es 11-65696658.";
      return res.json({ respuesta: respuestatel });
    }

    if (mensaje.toLowerCase() === 'entregas' || mensaje.toLowerCase() === 'entrega') {
      const respuestaTiempo = "El tiempo estimado de entrega es de 30 a 45 minutos, dependiendo de tu ubicación.";
      return res.json({ respuesta: respuestaTiempo });
    }

    if (mensaje.toLowerCase() === 'promociones' || mensaje.toLowerCase() === 'promo') {
      const respuestaPromo = "¡Claro! Tenemos una promo especial: los lunes 10% de descuento en efectivo:💸 .";
      return res.json({ respuesta: respuestaPromo });
    }

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
