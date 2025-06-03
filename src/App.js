import React, { useState, useEffect } from 'react';
import validationService from './services/validationService';
// import schemaNoyau from './schemas/schema-noyau.json';
// import schemaLambda from './schemas/schema-lambda.json';
import Message from './components/Message';
import ThreadSelector from './components/ThreadSelector';
import PluginManager from './components/PluginManager';
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
  const [leftMessage, setLeftMessage] = useState('');
  const [rightMessage, setRightMessage] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionData, setQuestionData] = useState({
    questionText: '',
    luEtAccepte: false
  });
  const [errors, setErrors] = useState({});

  // Chargement des plugins disponibles
  useEffect(() => {
    setAvailablePlugins({
      'lambda': {
        name: 'Plugin Lambda',
        version: '1.0',
        description: 'Gestion des questions simples',
        schemaVersion: '1.0'
      }
    });

    // Vérifiez que le schéma est chargé
    const checkSchema = async () => {
      await validationService.init();
      setPluginSchemas({
        'lambda': validationService.getSchema('lambda')
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
  const createNewThread = (title, firstMessage) => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title,
      participants: ['Gauche', 'Droite'],
      createdAt: new Date().toISOString(),
      messages: [firstMessage],
      categories: ['general']
    };
    
    setThreads([...threads, newThread]);
    setActiveThread(newThread.id);
  };

  // Envoi d'un message standard
  const sendMessage = (messageText, sender) => {
    if (!messageText.trim()) {
      setErrors({ general: 'Veuillez entrer un message.' });
      return;
    }
    
    const newMessage = { 
      text: messageText, 
      sender,
      type: 'texte',
      sentAt: new Date().toISOString()
    };
    
    setThreads(threads.map(thread => 
      thread.id === activeThread
        ? { ...thread, messages: [...thread.messages, newMessage] }
        : thread
    ));
    
    if (sender === 'Gauche') setLeftMessage('');
    else setRightMessage('');
    setErrors({});
  };

  const supportedSchemas = {
    core: '1.0',
    extensions: {
      lambda: '1.0'
    }
  };

  // Envoi d'une question structurée
  const handleSubmitQuestion = () => {
    // Vérification de la version du schéma
    const lambdaSchema = validationService.getSchema('lambda');
    if (!lambdaSchema) {
      setErrors({ general: 'Schéma lambda non chargé' });
      return;
    }

    // Validation avec AJV
    const validationResult = validationService.validate(questionData, 'lambda');
    
    if (!validationResult.isValid) {
      const formattedErrors = {};
      validationResult.errors.forEach(error => {
        // Meilleure gestion du chemin de l'erreur
        const fieldName = error.params?.missingProperty || 
                        error.instancePath?.replace('/', '') || 
                        'general';
        formattedErrors[fieldName] = error.message || 'Erreur de validation';
      });
      setErrors(formattedErrors);
      return;
    }

    // Création du message
    const questionMessage = {
      ...questionData,
      sender: 'Gauche',
      type: 'question',
      sentAt: new Date().toISOString()
    };
    
    createNewThread(
      `Question: ${questionData.questionText.substring(0, 20)}${questionData.questionText.length > 20 ? '...' : ''}`,
      questionMessage
    );
    
    setShowQuestionForm(false);
    setQuestionData({ questionText: '', luEtAccepte: false });
    setErrors({});
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
            <div className="left-form">
              <h3>Client Gauche</h3>
              
              {activePlugins.includes('lambda') && (
                <button 
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                  className="toggle-question-btn"
                >
                  {showQuestionForm ? 'Annuler' : 'Poser une question'}
                </button>
              )}
              
              {showQuestionForm && (
                <div className="question-form">
                  <textarea
                    value={questionData.questionText}
                    onChange={(e) => setQuestionData({
                      ...questionData,
                      questionText: e.target.value
                    })}
                    placeholder="Écrivez votre question ici..."
                  />
                  {errors.questionText && <p className="error">{errors.questionText}</p>}
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={questionData.luEtAccepte}
                      onChange={(e) => setQuestionData({
                        ...questionData,
                        luEtAccepte: e.target.checked
                      })}
                    />
                    Lu et accepté
                  </label>
                  {errors.luEtAccepte && <p className="error">{errors.luEtAccepte}</p>}
                  
                  <button 
                    onClick={handleSubmitQuestion}
                    className="submit-btn"
                  >
                    Envoyer la question
                  </button>
                </div>
              )}
              
              <textarea
                value={leftMessage}
                onChange={(e) => setLeftMessage(e.target.value)}
                placeholder="Écrivez votre message ici..."
              />
              <button 
                onClick={() => sendMessage(leftMessage, 'Gauche')}
                className="send-btn"
              >
                Envoyer
              </button>
            </div>
            
            <div className="right-form">
              <h3>Client Droite</h3>
              <textarea
                value={rightMessage}
                onChange={(e) => setRightMessage(e.target.value)}
                placeholder="Écrivez votre message ici..."
              />
              <button 
                onClick={() => sendMessage(rightMessage, 'Droite')}
                className="send-btn"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;