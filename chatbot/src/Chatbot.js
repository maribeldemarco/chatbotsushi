import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const Chatbot = () => {
  const [mensajes, setMensajes] = useState([]);
  const [mensajeUsuario, setMensajeUsuario] = useState('');

  useEffect(() => {
    const enviarMensajeBienvenida = async () => {
      const respuesta = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensaje: '' }), 
      });

      const datos = await respuesta.json();
      setMensajes([{ texto: datos.respuesta || '', remitente: 'bot' }]);
    };

    enviarMensajeBienvenida();
  }, []);

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
      { texto: datos.respuesta || '', remitente: 'bot' },
    ]);

    setMensajeUsuario('');
  };


  useEffect(() => {

    setTimeout(() => {
      const chatBody = document.querySelector('.card-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight; 
      }
    }, 0);
  }, [mensajes]); 

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      enviarMensaje();
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="chatbot-window p-3">
        <div className="card" style={{ maxWidth: '500px', width: '100%' }}> {/* Hacemos el chat más ancho */}
          <div className="card-header bg-primary text-white">
            <strong>Chatbot</strong>
          </div>
          <div className="card-body" style={{ height: '300px', overflowY: 'auto' }}>
            <div className="mensajes-chatbot">
              {mensajes.map((mensaje, index) => (
                <div key={index} className={mensaje.remitente === 'usuario' ? 'text-end' : 'text-start'}>
                  <div className={mensaje.remitente === 'usuario' ? 'bg-primary text-white p-2 rounded-3' : 'bg-light p-2 rounded-3'}>
                    <span>{parse(mensaje.texto || '')}</span> {/* Aseguramos que sea siempre una cadena */}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer d-flex">
            <input
              type="text"
              className="form-control me-2"
              value={mensajeUsuario}
              onChange={(e) => setMensajeUsuario(e.target.value)}
              placeholder="Escribe tu mensaje..."
              onKeyDown={handleKeyDown} 
            />
            <button className="btn btn-primary" onClick={enviarMensaje}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
