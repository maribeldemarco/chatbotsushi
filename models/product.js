const mongoose = require('mongoose');

const productoModelo = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
});

const Product = mongoose.model('Product', productoModelo, 'productos');

module.exports = Product;
