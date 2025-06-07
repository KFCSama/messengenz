const Message = ({ message }) => {
  return (
    <div className={`message ${message.sender.toLowerCase()}`}>
      <div className="message-header">
        <strong>{message.sender}</strong>
        <span>{new Date(message.sentAt).toLocaleString()}</span>
      </div>
      <div className="message-content">
        {message.type === 'question' ? (
          <>
            <p><strong>Question:</strong> {message.questionText}</p>
            <p><strong>Accepté:</strong> {message.luEtAccepte ? '✅ Oui' : '❌ Non'}</p>
          </>
        ) : message.type === 'partie' ? (
          <>
            <p><strong>Partie proposée:</strong> {message.questionText}</p>
            <p><strong>Date:</strong> {new Date(message.date).toLocaleString()}</p>
          </>
        ) : message.type === 'fps-mode' ? (
          <>
            <p><strong>Mode FPS:</strong> {message.questionText}</p>
            <p><strong>Date:</strong> {new Date(message.date).toLocaleString()}</p>
            {message.mode && <p><strong>Type:</strong> {message.mode}</p>}
          </>
        ) : (
          <p>{message.text}</p>
        )}
      </div>
    </div>
  );
};

export default Message;