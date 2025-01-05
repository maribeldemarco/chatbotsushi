import React, { useState } from 'react';
import parse from 'html-react-parser';

const Chatbot = () => {
  const [mensajes, setMensajes] = useState([]);
  const [mensajeUsuario, setMensajeUsuario] = useState('');

  const enviarMensaje = async () => {
    if (!mensajeUsuario.trim()) return;

    setMensajes([...mensajes, { texto: mensajeUsuario, remitente: 'usuario' }]);

    const respuesta = await fetch('http://localhost:5000/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mensaje: mensajeUsuario }),
    });

    const datos = await respuesta.json();

    setMensajes([
      ...mensajes,
      { texto: mensajeUsuario, remitente: 'usuario' },
      { texto: datos.respuesta, remitente: 'bot' },
    ]);

    setMensajeUsuario('');
  };

  return (
    <div> Escribinos tu consulta
    <div className="contenedor-chatbot">
      <div className="mensajes-chatbot">
        {mensajes.map((mensaje, index) => (
          <div key={index} className={mensaje.remitente}>
   <span>{parse(mensaje.texto)}</span>    </div>
        ))}
      </div>
      <div className="entrada-chatbot">
        <input
          type="text"
          value={mensajeUsuario}
          onChange={(e) => setMensajeUsuario(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
    </div>
  );
};

export default Chatbot;
