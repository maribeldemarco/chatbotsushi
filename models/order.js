const mongoose = require('mongoose');

const pedidoModelo = new mongoose.Schema({
  producto: { type: String, required: true }, // Nombre del producto
  domicilio: { type: String, required: true }, // Dirección del cliente
  fecha: { type: Date, default: Date.now },    // Fecha del pedido
});

const Order = mongoose.model('Order', pedidoModelo, 'pedidos');

module.exports = Order;
