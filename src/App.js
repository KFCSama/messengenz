import React, { useState, useEffect } from 'react';
import validationService from './services/validationService';
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
  const [questionData, setQuestionData] = useState({questionText: '', luEtAccepte: false});

  const [showPartieForm, setShowPartieForm] = useState(false);
  const [partieData, setPartieData] = useState({questionText: '', date: ''});

  const [showFpsModeForm, setShowFpsModeForm] = useState(false);
  const [fpsModeData, setFpsModeData] = useState({questionText: '', date: '', mode: 'Deathmatch'});

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
  const createNewThread = (title, firstMessage, schemas) => {
    const newThread = {
      id: `thread-${Date.now()}`,
      title,
      participants: ['Gauche', 'Droite'],
      createdAt: new Date().toISOString(),
      messages: [firstMessage],
      categories: ['general'],
      schemas
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

  // Envoi d'une question structurée
  const handleSubmitQuestion = () => {
    // Vérification de la version des schémas
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
      sentAt: new Date().toISOString(),
      schema: { name: 'lambda', version: availablePlugins['lambda'].version }
    };
    
    createNewThread(
      `Question: ${questionData.questionText.substring(0, 20)}${questionData.questionText.length > 20 ? '...' : ''}`,
      questionMessage,
      [{ name: 'lambda', version: availablePlugins['lambda'].version }]
    );
    
    setShowQuestionForm(false);
    setQuestionData({ questionText: '', luEtAccepte: false });
    setErrors({});
  };

  // Envoi d'une proposition de partie
  const handleSubmitPartie = () => {
    const partieSchema = validationService.getSchema('partie');
    if (!partieSchema) {
      setErrors({ general: 'Schéma partie non chargé' });
      return;
    }

    const isoDate = partieData.date ? new Date(partieData.date).toISOString() : '';

    const validationResult = validationService.validate(
      { ...partieData, date: isoDate },
      'partie'
    );    

    if (!validationResult.isValid) {
      const formattedErrors = {};
      validationResult.errors.forEach(error => {
        const fieldName = error.params?.missingProperty || 
                        error.instancePath?.replace('/', '') || 
                        'general';
        formattedErrors[fieldName] = error.message || 'Erreur de validation';
      });
      setErrors(formattedErrors);
      return;
    }

    const partieMessage = {
      ...partieData,
      sender: 'Gauche',
      type: 'partie',
      sentAt: new Date().toISOString(),
      schema: { name: 'partie', version: availablePlugins['partie'].version }
    };
    
    createNewThread(
      `Partie: ${partieData.questionText.substring(0, 20)}${partieData.questionText.length > 20 ? '...' : ''}`,
      partieMessage,
      [{ name: 'partie', version: availablePlugins['partie'].version }]
    );
    
    setShowPartieForm(false);
    setPartieData({ questionText: '', date: '' });
    setErrors({});
  };

  // Envoi d'une proposition de partie en mode FPS
  const handleSubmitFpsMode = () => {
    const fpsModeSchema = validationService.getSchema('fps-mode');
    if (!fpsModeSchema) {
      setErrors({ general: 'Schéma FPS mode non chargé' });
      return;
    }

    const isoDate = fpsModeData.date ? new Date(fpsModeData.date).toISOString() : '';

    // Ajout des secondes si nécessaire
    const dataToValidate = {
      ...fpsModeData,
      date: fpsModeData.date.includes(':00') ? fpsModeData.date : fpsModeData.date + ':00'
    };

    const validationResult = validationService.validate(
      { ...fpsModeData, date: isoDate },
      'fps-mode'
    );    

    if (!validationResult.isValid) {
      const formattedErrors = {};
      validationResult.errors.forEach(error => {
        const fieldName = error.params?.missingProperty || 
                        error.instancePath?.replace('/', '') || 
                        'general';
        formattedErrors[fieldName] = error.message || 'Erreur de validation';
      });
      setErrors(formattedErrors);
      return;
    }

    const fpsModeMessage = {
      ...dataToValidate,
      sender: 'Gauche',
      type: 'fps-mode',
      sentAt: new Date().toISOString(),
      schema: { name: 'fps-mode', version: availablePlugins['fps-mode'].version }
    };
    
    createNewThread(
      `FPS ${fpsModeData.mode}: ${fpsModeData.questionText.substring(0, 20)}${fpsModeData.questionText.length > 20 ? '...' : ''}`,
      fpsModeMessage,
      [{ name: 'fps-mode', version: availablePlugins['fps-mode'].version }]
    );
    
    setShowFpsModeForm(false);
    setFpsModeData({ questionText: '', date: '', mode: 'Deathmatch' });
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
                  className={`toggle-question-btn${showQuestionForm ? ' active cancel-btn' : ''}`}
                >
                  {showQuestionForm ? 'Annuler' : 'Poser une question'}
                </button>
              )}
              {activePlugins.includes('partie') && (
                <button 
                  onClick={() => setShowPartieForm(!showPartieForm)}
                  className={`toggle-question-btn${showQuestionForm ? ' active cancel-btn' : ''}`}
                >
                  {showPartieForm ? 'Annuler' : 'Proposer une partie'}
                </button>
              )}
              {activePlugins.includes('fps-mode') && (
                <button 
                  onClick={() => setShowFpsModeForm(!showFpsModeForm)}
                  className={`toggle-question-btn${showQuestionForm ? ' active cancel-btn' : ''}`}
                >
                  {showFpsModeForm ? 'Annuler' : 'Proposer un FPS Mode'}
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
              
              {showPartieForm && (
                <div className="question-form">
                  <textarea
                    value={partieData.questionText}
                    onChange={(e) => setPartieData({
                      ...partieData,
                      questionText: e.target.value
                    })}
                    placeholder="Proposez un jeu..."
                  />
                  {errors.questionText && <p className="error">{errors.questionText}</p>}
                  
                  <label>
                    Date et heure:
                    <input
                      type="datetime-local"
                      value={partieData.date}
                      onChange={(e) => setPartieData({
                        ...partieData,
                        date: e.target.value
                      })}
                    />
                  </label>
                  {errors.date && <p className="error">{errors.date}</p>}
                  
                  <button 
                    onClick={handleSubmitPartie}
                    className="submit-btn"
                  >
                    Proposer la partie
                  </button>
                </div>
              )}

              {showFpsModeForm && (
                <div className="question-form">
                  <textarea
                    value={fpsModeData.questionText}
                    onChange={(e) => setFpsModeData({
                      ...fpsModeData,
                      questionText: e.target.value
                    })}
                    placeholder="Proposez un jeu FPS..."
                  />
                  {errors.questionText && <p className="error">{errors.questionText}</p>}
                  
                  <label>
                    Mode de jeu:
                    <select
                      value={fpsModeData.mode}
                      onChange={(e) => setFpsModeData({
                        ...fpsModeData,
                        mode: e.target.value
                      })}
                    >
                      <option value="Deathmatch">Deathmatch</option>
                      <option value="Battle Royal">Battle Royal</option>
                      <option value="Capture the Flag">Capture the Flag</option>
                    </select>
                  </label>

                  <label>
                    Date et heure:
                    <input
                      type="datetime-local"
                      value={fpsModeData.date}
                      onChange={(e) => setFpsModeData({
                        ...fpsModeData,
                        date: e.target.value
                      })}
                    />
                  </label>
                  {errors.date && <p className="error">{errors.date}</p>}
                  
                  <button 
                    onClick={handleSubmitFpsMode}
                    className="submit-btn"
                  >
                    Proposer le FPS Mode
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