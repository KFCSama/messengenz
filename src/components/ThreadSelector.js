import React from 'react';

const ThreadSelector = ({ threads, activeThread, setActiveThread }) => (
  <div className="thread-selector">
    <h3>Fils de discussion</h3>
    <ul>
      {threads.map(thread => (
        <li 
          key={thread.id} 
          className={thread.id === activeThread ? 'active' : ''}
          onClick={() => setActiveThread(thread.id)}
        >
          {thread.title} ({thread.messages.length} messages)
          {thread.schema && thread.schema.length > 0 && (
            <div style={{ fontSize: '0.85em', color: '#888' }}>
              Schéma : {thread.schema.map(s => `${s.name} v${s.version}`).join(', ')}
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default ThreadSelector;