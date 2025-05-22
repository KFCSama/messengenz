import React, { useState } from 'react';
import './App.css';

function App() {
  const [leftMessage, setLeftMessage] = useState('');
  const [rightMessage, setRightMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sendLeftMessage = () => {
    if (leftMessage.trim() === '') {
      alert('Veuillez entrer un message.');
      return;
    }
    setMessages([...messages, { text: leftMessage, sender: 'Gauche' }]);
    setLeftMessage('');
  };

  const sendRightMessage = () => {
    if (rightMessage.trim() === '') {
      alert('Veuillez entrer un message.');
      return;
    }
    setMessages([...messages, { text: rightMessage, sender: 'Droite' }]);
    setRightMessage('');
  };

  return (
    <div className="App">
      <h1>MessengenZ
      </h1>
      <div className="messages">
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender} : </strong>{msg.text}</p>
        ))}
      </div>
      <div className="message-forms">
        <div className="left-form">
          <h2>Client Gauche</h2>
          <textarea
            value={leftMessage}
            onChange={(e) => setLeftMessage(e.target.value)}
            placeholder="Écrivez votre message ici..."
          />
          <button onClick={sendLeftMessage}>Envoyer</button>
        </div>
        <div className="right-form">
          <h2>Client Droite</h2>
          <textarea
            value={rightMessage}
            onChange={(e) => setRightMessage(e.target.value)}
            placeholder="Écrivez votre message ici..."
          />
          <button onClick={sendRightMessage}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}

export default App;
