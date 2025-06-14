import React, { useState, useEffect } from 'react';
import validationService from './services/validationService';
import Message from './components/Message';
import ThreadSelector from './components/ThreadSelector';
import PluginManager from './components/PluginManager';
import ClientInput from './components/ClientInput';
import './App.css';

function App() {
  // États principaux
  const [availablePlugins, setAvailablePlugins] = useState({});
  const [activePlugins, setActivePlugins] = useState(['lambda']); // Par défaut, le plugin lambda est activé
  const [pluginSchemas, setPluginSchemas] = useState({});
  const [threads, setThreads] = useState([
    {
      id: 'main',
      title: 'Conversation principale',
      participants: ['Gauche', 'Droite'],
      createdAt: new Date().toISOString(),
      messages: []
    }
  ]);
  const [activeThread, setActiveThread] = useState('main');
  
  // États pour les messages

  const [errors, setErrors] = useState({});

  // Chargement des plugins disponibles
  useEffect(() => {
    setAvailablePlugins({
      'lambda': {
        name: 'Plugin Lambda',
        version: '1.0',
        description: 'Gestion des questions simples'
      },
      'partie': {
        name: 'Plugin Partie',
        version: '1.0',
        description: 'Organisation de parties de jeu'
      },
      'fps-mode': {
        name: 'Plugin FPS Mode',
        version: '1.0',
        description: 'Mode de jeu FPS'
      }
    });

    // Vérifiez que le schéma est chargé
    const checkSchema = async () => {
      await validationService.init();
      setPluginSchemas({
        'lambda': validationService.getSchema('lambda'),
        'partie': validationService.getSchema('partie'),
        'fps-mode': validationService.getSchema('fps-mode')
      });
    };
    checkSchema();
  }, []);

  // Gestion de l'activation/désactivation des plugins
  const togglePlugin = (pluginId) => {
    setActivePlugins(prev => 
      prev.includes(pluginId) 
        ? prev.filter(id => id !== pluginId) 
        : [...prev, pluginId]
    );
  };

  // Création d'un nouveau fil de discussion
  const createNewThread = (title, firstMessage, schema) => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title,
      participants: ['Gauche', 'Droite'],
      createdAt: new Date().toISOString(),
      messages: [firstMessage],
      categories: ['general'],
      schema
    };
    
    setThreads([...threads, newThread]);
    setActiveThread(newThread.id);
  };

  // Envoi d'un message standard
  const sendMessage = (messageText, sender, expectType) => {
    console.log('Sending message:', messageText, 'from', sender, 'expectType:', expectType);
    if (!messageText.trim()) {
      setErrors({ general: 'Veuillez entrer un message.' });
      return;
    }
    
    const newMessage = { 
      text: messageText, 
      sender,
      type: 'texte',
      expectType,
      sentAt: new Date().toISOString()
    };
    
    setThreads(threads.map(thread => 
      thread.id === activeThread
        ? { ...thread, messages: [...thread.messages, newMessage] }
        : thread
    ));
    
    setErrors({});
  };

  const sendMessageRaw = (msg) => {
    console.log('Sending raw message:', msg);
    
    setThreads(threads.map(thread => 
      thread.id === activeThread
        ? { ...thread, messages: [...thread.messages, {...msg}] }
        : thread
    ));
  };


  return (
    <div className="App">
      <h1>MessengenZ</h1>
      
      <div className="app-layout">
        <div className="sidebar">
          <ThreadSelector 
            threads={threads} 
            activeThread={activeThread} 
            setActiveThread={setActiveThread} 
          />
          <PluginManager 
            availablePlugins={availablePlugins}
            activePlugins={activePlugins}
            onTogglePlugin={togglePlugin}
          />
        </div>
        
        <div className="main-content">
          {errors.general && <p className="error">{errors.general}</p>}
          
          <div className="messages">
            <h2>{threads.find(t => t.id === activeThread)?.title}</h2>
            {threads.find(t => t.id === activeThread)?.messages.map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
          </div>
          
          <div className="message-forms">
            <ClientInput
              side="Gauche"
              color="#4285f4"
              activePlugins={activePlugins}
              availablePlugins={availablePlugins}
              onSendMessage={sendMessage}
              onSendMessageRaw={sendMessageRaw}
              onCreateNewThread={createNewThread}
              lastMessage={threads.find(t => t.id === activeThread)?.messages.slice(-1)[0] || null}
            />
            <ClientInput
              side="Droite"
              color="#34a853"
              activePlugins={activePlugins}
              availablePlugins={availablePlugins}
              onSendMessage={sendMessage}
              onSendMessageRaw={sendMessageRaw}
              onCreateNewThread={createNewThread}
              lastMessage={threads.find(t => t.id === activeThread)?.messages.slice(-1)[0] || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;