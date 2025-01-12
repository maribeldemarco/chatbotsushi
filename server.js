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
let cantidadProducto = null;
let productosSeleccionados = [];
let domicilio = false;
let agregandoProducto = false;  
let pedir = '';
const respuestageneral = "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver el menú de productos 🍣. Escribe 'menú' <br /> 2) Por preguntas frecuentes❓. Escribe 'faq' <br /> 3) Para saber cómo hacer un pedido escribe 'pedido'.🤔 <br /> 4) Para saber de nuestra promo de la semana escribe 'promo' 💸 <br /> 5) Para volver atrás escribe 'cancelar'❌ <br /> 6) Para ver formas de pago escribe 'formas de pago'💳";

const obtenerMenu = async () => {
  try {
    const products = await Product.find();
    return products.map((product, index) => `${index + 1}) ${product.nombre} : ${product.descripcion}. Precio: ${product.precio}`).join('<br />');
  } catch (error) {
    console.log('Error al obtener los productos:', error);
    throw new Error('Error al obtener los productos');
  }
};

const obtenerFormasDePago = () => {
  return "💳 Formas de pago: Aceptamos actualmente efectivo, próximamente se incorporarán tarjetas de débito y crédito. Abonás el producto cuando llega a tu domicilio 📍. Para volver atrás escribe 'cancelar'❌";
};

const procesarPedido = async (direccion) => {
  try {
    const productos = await Product.find();
    let costoTotal = 0;
    let detallesPedido = productosSeleccionados.map((item) => {
      const producto = productos[item.numeroPedido - 1];
      costoTotal += producto.precio * item.cantidad;
      return `${item.cantidad} x ${producto.nombre} (Precio unitario: ${producto.precio})`;
    }).join('<br />');
    
    const costoEnvio = 50; 
    costoTotal += costoEnvio;

    const nuevoPedido = new Order({
      productos: productosSeleccionados.map((item) => {
        const producto = productos[item.numeroPedido - 1];
        return {
          nombre: producto.nombre,
          cantidad: item.cantidad,
          precio: producto.precio,
        };
      }),
      domicilio: direccion,  
      costoTotal: costoTotal, 
    });


    await nuevoPedido.save();

    domicilio = false;
    menuMostrado = false;
    agregandoProducto = false;
    productosSeleccionados = [];

    return `Su pedido fue enviado a ${direccion}. El costo total, incluyendo el envío, es ${costoTotal}. Detalles de su pedido:<br />${detallesPedido}<br />¡Gracias por su compra!`;
  } catch (error) {
    console.log('Error al procesar el pedido:', error);
    throw new Error('Error al procesar el pedido');
  }
};

const manejarMensaje = async (mensaje) => {
  const tokens = tokenizer.tokenize(mensaje.toLowerCase());

  if (tokens.includes('menu') || tokens.includes('menú')) {
    const menu = await obtenerMenu();
    pedir = `Si querés elegir un producto ingresa su número. Por ejemplo: 1 🛒 <br /> Para volver atrás escribe 'cancelar'❌`;
    menuMostrado = true;
    agregandoProducto = false;  
    return `Hola! Nuestro menú del día es 🍽️:<br /> ${menu} ${pedir}`;
  }

  if (tokens.includes('formas') || tokens.includes('pago')) {
    return obtenerFormasDePago();
  }

  if (tokens.includes('cancelar')) {
    domicilio = false;
    menuMostrado = false;
    agregandoProducto = false;
    numeroPedido = null;
    cantidadProducto = null;
    productosSeleccionados = [];
    pedir = '';
    return respuestageneral;
  }

  if (menuMostrado && !isNaN(mensaje) && mensaje > 0) {
    numeroPedido = parseInt(mensaje);
    menuMostrado = false;
    return "¿Cuántas unidades desea? Por favor, ingrese la cantidad 🛒";
  }

  if (numeroPedido && cantidadProducto === null) {
    cantidadProducto = parseInt(mensaje);
    if (!isNaN(cantidadProducto) && cantidadProducto > 0) {
      productosSeleccionados.push({ numeroPedido, cantidad: cantidadProducto });
      numeroPedido = null;
      cantidadProducto = null;
      agregandoProducto = true;  
      return "¿Desea agregar otro producto? Si es así, escribe 'agregar'. Si no, escribe 'finalizar'.";
    } else {
      return "Por favor, ingrese una cantidad válida.";
    }
  }

  if (agregandoProducto && tokens.includes('agregar')) {
    const menu = await obtenerMenu();
    menuMostrado = true;
    return `Por favor, elige otro producto de nuestro menú o escribe 'finalizar' si ya no deseas agregar más productos:<br /> ${menu}`;
  }

  if (tokens.includes('finalizar')) {
    agregandoProducto = false;
    domicilio = true;
    return "Por favor, ingrese su domicilio 🏠. Para cancelar pedido escriba 'cancelar'";
  }

  if (domicilio && !tokens.includes('cancelar')) {
    return await procesarPedido(mensaje);
  }

  if (tokens.includes('faq')) {
    return "¡Hola! ¿En qué puedo ayudarte? Estas son tus opciones:<br /> 1) Ver nuestros horarios 🕒 . Escribe 'horarios' <br /> 2) Ver nuestra ubicación🏠. Escribe 'direccion' <br /> 3) Ver nuestro teléfono 📞. Escribe 'telefono'<br /> 4) Por tiempos de entrega escribe 'entrega' ❓ <br /> Para volver atrás escribe 'cancelar'❌";
  }

  if (tokens.includes('pedido') || tokens.includes('pedir')) {
    return "Para hacer un pedido, primero escribe 'menú', elige el número del producto que te interese, y después ingresa tu dirección. ¡Así de fácil! Para volver atrás escribe 'cancelar'❌";
  }

  if (tokens.includes('horarios') || tokens.includes('horario')) {
    return "Nuestros horarios son: Lunes a Viernes, de 9:00 AM a 6:00 PM.";
  }

  if (tokens.includes('direccion') || tokens.includes('dirección')) {
    return "Estamos ubicados en Calle Boedo 45587. Capital Federal";
  }

  if (tokens.includes('telefono') || tokens.includes('teléfono')) {
    return "Nuestro teléfono es 11-65696658.";
  }

  if (tokens.includes('entregas') || tokens.includes('entrega')) {
    return "El tiempo estimado de entrega es de 30 a 45 minutos, dependiendo de tu ubicación.";
  }

  if (tokens.includes('promociones') || tokens.includes('promo')) {
    return "¡Claro! Tenemos una promo especial: los lunes 10% de descuento en efectivo 💸.";
  }

  return respuestageneral;
};

app.post('/api/chatbot', async (req, res) => {
  try {
    const { mensaje } = req.body;
    const respuesta = await manejarMensaje(mensaje);
    return res.json({ respuesta });
  } catch (error) {
    console.error('Error al procesar el mensaje del chatbot:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje del chatbot' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));




