const mongoose = require('mongoose');

const pedidoModelo = new mongoose.Schema({
  productos: [
    {
      nombre: { type: String, required: true },  // Nombre del producto
      cantidad: { type: Number, required: true }, // Cantidad seleccionada
      precio: { type: Number, required: true },   // Precio del producto
    },
  ],
  domicilio: { type: String, required: true }, // Dirección del cliente
  costoTotal: { type: Number, required: true }, // Costo total del pedido (producto + envío)
  fecha: { type: Date, default: Date.now },    // Fecha del pedido
});

const Order = mongoose.model('Order', pedidoModelo, 'pedidos');

module.exports = Order;
