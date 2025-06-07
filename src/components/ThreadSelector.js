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
        </li>
      ))}
    </ul>
  </div>
);

export default ThreadSelector;