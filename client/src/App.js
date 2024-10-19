import './App.css';
import io from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect } from 'react';

// Conexión con el servidor
const socket = io('http://localhost:4000');
const URL = 'http://localhost:4000/api/';

function App() {
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState(''); // Nuevo campo para el rol
  const [message, setMessage] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [storedMessages, setStoreMessages] = useState([]);
  const [chatId, setChatId] = useState(null); // Almacenar el chatId

  useEffect(() => {
    if (chatId) {
      console.log("Unirse al chat con chatId:", chatId);
      
      // Unirse a la sala del chat con el `chatId`
      socket.emit('joinChat', chatId);

      // Obtener mensajes almacenados cuando se actualice el chatId
      axios.get(`${URL}messages/${chatId}`)
        .then((res) => {
          setStoreMessages(res.data.messages.reverse());
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            setStoreMessages([]);
            console.log("No hay mensajes para este chat aún.");
          } else {
            console.error("Error al obtener mensajes:", error);
          }
        });
    }

    // Escuchar mensajes nuevos con socket.io
    const receivedMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on('message', receivedMessage);
    return () => {
      socket.off('message', receivedMessage);
    };
  }, [chatId]);

  // Función para establecer el nickname y el rol del usuario
  const nicknameSubmit = async (e) => {
    e.preventDefault();
    if (nickname && role) {
      setDisabled(true);
      try {
        // Buscar o crear un chat
        const response = await axios.post(`${URL}find-or-create-chat`, {
          name: nickname,
          role: role,
        });

        // Guardar el chatId creado o encontrado
        if (response.data && response.data.chat) {
          setChatId(response.data.chat._id);
          console.log("Chat obtenido con éxito. ID del chat:", response.data.chat._id);
        } else {
          alert('Error al obtener el chat');
          setDisabled(false);
        }
      } catch (error) {
        console.error('Error obteniendo o uniendo al chat:', error);
        alert('Error obteniendo o uniendo al chat');
        setDisabled(false);
      }
    } else {
      alert('Debes establecer un nickname y seleccionar un rol');
    }
  };

  // Función para enviar un mensaje
  const messageSubmit = (e) => {
    e.preventDefault();

    if (nickname !== '' && chatId) {
      const newMessage = {
        content: message,
        chatId,
        nickname,
        from: nickname,
      };

      console.log("Enviando mensaje:", newMessage);

      // Emitir el mensaje al servidor
      socket.emit('message', newMessage);

      // Petición HTTP por POST para guardar el mensaje
      axios.post(`${URL}save`, {
        chatId: chatId,
        content: message,
        nickname: nickname,
      }).catch((error) => {
        console.error('Error guardando el mensaje:', error);
      });

      // Limpiar el input de mensaje después de enviarlo
      setMessage('');
    } else {
      alert('Debes establecer un nickname y unirte a un chat antes de enviar un mensaje');
    }
  };

  return (
    <div className="App">
      <div className="container mt-3">
        <div className="card">
          <div className="card-body">
            <h5 className="text-center">Uniroom</h5>

            {/* Nickname */}
            <form onSubmit={nicknameSubmit}>
              <div className="d-flex mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nickname"
                  id="nickname"
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={disabled}
                />
                <select
                  className="form-control mx-2"
                  id="role"
                  onChange={(e) => setRole(e.target.value)}
                  disabled={disabled}
                >
                  <option value="">Selecciona un Rol</option>
                  <option value="arrendador">arrendador</option>
                  <option value="huésped">huésped</option>
                </select>
                <button className="btn btn-success mx-3" type="submit" id="btn-nickname">
                  Establecer
                </button>
              </div>
            </form>

            {/* Mensajes */}
            <form onSubmit={messageSubmit}>
              <div className="d-flex">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mensaje"
                  id="message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  disabled={!chatId} // Solo habilitar cuando se tenga un chatId
                />
                <button className="btn btn-success mx-3" type="submit" id="btn-message" disabled={!chatId}>
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Chat messages */}
        <div className="card mt-3 mb-3" id="content-chat">
          <div className="card-body">

          {/* Chat stored messages */}
          <small className="text-center text-muted">... Mensajes guardados ...</small>
            {storedMessages.map((message, index) => (
              <div key={index} className={`d-flex p-3 ${message.nickname === nickname ? "justify-content-end" : "justify-content-start"}`}>
                <div className={`card mb-3 border-1 ${message.nickname === nickname ? "bg-success bg-opacity-25" : "bg-light"}`}>
                  <div className="card-body">
                    <small className="text-muted">{message.nickname === nickname ? "Yo" : message.nickname}: {message.content}</small>
                  </div>
                </div>
              </div>
            ))}

            {/* Aquí puedes renderizar los mensajes almacenados */}
            {messages.map((message, index) => (
              <div key={index} className={`d-flex p-3 ${message.from === nickname ? "justify-content-end" : "justify-content-start"}`}>
                <div className={`card mb-3 border-1 ${message.from === nickname ? "bg-success bg-opacity-25" : "bg-light"}`}>
                  <div className="card-body">
                    <small className="">{message.from === nickname ? "Yo" : message.from}: {message.content}</small>
                  </div>
                </div>
              </div>
            ))}

            

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
