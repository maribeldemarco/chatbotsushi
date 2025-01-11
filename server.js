const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const natural = require('natural');
const Product = require('./models/product');
const Order = require('./models/order');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.error('Error al conectar', error));

const tokenizer = new natural.WordTokenizer();

let menuMostrado = false;
let numeroPedido = null;
let domicilio = false;
let pedir = '';
const respuestageneral = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver el menú de productos 🍣. Escribe 'menú' <br /> 2) Por preguntas frecuentes❓. Escribe 'faq' <br /> 3) Para saber como hacer un pedido escribe 'pedido'.🤔 <br /> 4) Para saber de nuestra promo de la semana escribe 'promo' 💸 <br /> 5)Para volver atras escribe 'cancelar'❌ <br /> 6)Para ver formas de pago escribe 'formas de pago'💳";

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
    const tokens = tokenizer.tokenize(mensaje.toLowerCase());
    let menu;

    if (tokens.includes('menu') || tokens.includes('menú')) {
      const productos = await Product.find();
      let contador = 1;
      menu = `Hola! Nuestro menú del día es 🍽️:<br /> ${productos.map(product => {
        return `${contador++}) ${product.nombre} : ${product.descripcion}. Precio: ${product.precio} <br />`;
      }).join('')}`;
      pedir = `Si querés elegir un producto ingresa su número. Por ejemplo : 1 🛒  <br /> 5)Para volver atras escribe 'cancelar'❌`;
      menuMostrado = true;
      return res.json({ respuesta: menu + pedir });
    }


    if (tokens.includes('formas') || tokens.includes('pago')) {
      const respuestaPago = "💳 Formas de pago: Aceptamos actualmente efectivo, proximamente se incorporarán tarjetas de débito y crédito. Abonás el producto cuando llega a tu domicilio 📍. Para volver atras escribe 'cancelar'❌";
      return res.json({ respuesta: respuestaPago });
    }
    
    if (tokens.includes('cancelar')) {
      domicilio = false;
      menuMostrado = false;
      numeroPedido = null;
      pedir = '';
      return res.json({ respuesta: respuestageneral });
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

    

    if (tokens.includes('gracias') || tokens.includes('adiós') || tokens.includes('adios') || tokens.includes('hasta luego')) {
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
          costoTotal: costoTotal,
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

    if (tokens.includes('faq')) {
      const faq = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver nuestros horarios 🕒 . Escribe 'horarios' <br /> 2) Ver nuestra ubicación🏠. Escribe 'direccion' <br /> 3) Ver nuestro teléfono 📞. Escribe 'telefono'<br /> 4)Por tiempos de entrega escribe 'entrega' ❓ <br /> 5)Para volver atras escribe 'cancelar'❌";
      return res.json({ respuesta: faq });
    }

    if (tokens.includes('pedido') || tokens.includes('pedir')) {
      const respuestaPedido = "Para hacer un pedido, primero escribe 'menú', elige el número del producto que te interese, y después ingresa tu dirección. ¡Así de fácil!.  Para volver atras escribe 'cancelar'❌";
      return res.json({ respuesta: respuestaPedido });
    }

  
    if (tokens.includes('horarios') || tokens.includes('horario')) {
      const respuestahr = "Nuestros horarios son: Lunes a Viernes, de 9:00 AM a 6:00 PM.";
      return res.json({ respuesta: respuestahr });
    }

    if (tokens.includes('direccion') || tokens.includes('dirección')) {
      const respuestadir = "Estamos ubicados en Calle Boedo 45587. Capital Federal";
      return res.json({ respuesta: respuestadir });
    }

    if (tokens.includes('telefono') || tokens.includes('teléfono')) {
      const respuestatel = "Nuestro teléfono es 11-65696658.";
      return res.json({ respuesta: respuestatel });
    }

    if (tokens.includes('entregas') || tokens.includes('entrega')) {
      const respuestaTiempo = "El tiempo estimado de entrega es de 30 a 45 minutos, dependiendo de tu ubicación.";
      return res.json({ respuesta: respuestaTiempo });
    }

    if (tokens.includes('promociones') || tokens.includes('promo')) {
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
