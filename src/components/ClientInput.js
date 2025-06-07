import "./ClientInput.css";
import { useState } from "react";

export default function ClientInput({ side, color, activePlugins, onSendMessage, onHandleSubmitFpsMode, onHandleSubmitPartie, onHandleSubmitQuestion }) {
    const [message, setMessage] = useState("");

    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [questionData, setQuestionData] = useState({
        questionText: "",
        luEtAccepte: false,
    });

    const [showPartieForm, setShowPartieForm] = useState(false);
    const [partieData, setPartieData] = useState({
        questionText: "",
        date: "",
    });

    const [showFpsModeForm, setShowFpsModeForm] = useState(false);
    const [fpsModeData, setFpsModeData] = useState({
        questionText: "",
        date: "",
        mode: "Deathmatch",
    });

    const [errors, setErrors] = useState({});
    

    return (
        <div className="form-group" style={{ "--color": color }}>
            <h3>Client {side}</h3>

            {activePlugins.includes("lambda") && (
                <button
                    onClick={() => setShowQuestionForm(!showQuestionForm)}
                    className="toggle-question-btn"
                >
                    {showQuestionForm ? "Annuler" : "Poser une question"}
                </button>
            )}
            {activePlugins.includes("partie") && (
                <button
                    onClick={() => setShowPartieForm(!showPartieForm)}
                    className="toggle-question-btn"
                >
                    {showPartieForm ? "Annuler" : "Proposer une partie"}
                </button>
            )}
            {activePlugins.includes("fps-mode") && (
                <button
                    onClick={() => setShowFpsModeForm(!showFpsModeForm)}
                    className="toggle-question-btn"
                >
                    {showFpsModeForm ? "Annuler" : "Proposer un FPS Mode"}
                </button>
            )}

            {showQuestionForm && (
                <div className="question-form">
                    <textarea
                        value={questionData.questionText}
                        onChange={(e) =>
                            setQuestionData({
                                ...questionData,
                                questionText: e.target.value,
                            })
                        }
                        placeholder="Écrivez votre question ici..."
                    />
                    {errors.questionText && (
                        <p className="error">{errors.questionText}</p>
                    )}

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={questionData.luEtAccepte}
                            onChange={(e) =>
                                setQuestionData({
                                    ...questionData,
                                    luEtAccepte: e.target.checked,
                                })
                            }
                        />
                        Lu et accepté
                    </label>
                    {errors.luEtAccepte && (
                        <p className="error">{errors.luEtAccepte}</p>
                    )}

                    <button
                        onClick={() => {
                            onHandleSubmitQuestion();
                            setShowQuestionForm(false);
                        }}
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
                        onChange={(e) =>
                            setPartieData({
                                ...partieData,
                                questionText: e.target.value,
                            })
                        }
                        placeholder="Proposez un jeu..."
                    />
                    {errors.questionText && (
                        <p className="error">{errors.questionText}</p>
                    )}

                    <label>
                        Date et heure:
                        <input
                            type="datetime-local"
                            value={partieData.date}
                            onChange={(e) =>
                                setPartieData({
                                    ...partieData,
                                    date: e.target.value,
                                })
                            }
                        />
                    </label>
                    {errors.date && <p className="error">{errors.date}</p>}

                    <button onClick={() => {
                        onHandleSubmitPartie();
                        setShowPartieForm(false);
                    }} className="submit-btn">
                        Proposer la partie
                    </button>
                </div>
            )}

            {showFpsModeForm && (
                <div className="question-form">
                    <textarea
                        value={fpsModeData.questionText}
                        onChange={(e) =>
                            setFpsModeData({
                                ...fpsModeData,
                                questionText: e.target.value,
                            })
                        }
                        placeholder="Proposez un jeu FPS..."
                    />
                    {errors.questionText && (
                        <p className="error">{errors.questionText}</p>
                    )}

                    <label>
                        Mode de jeu:
                        <select
                            value={fpsModeData.mode}
                            onChange={(e) =>
                                setFpsModeData({
                                    ...fpsModeData,
                                    mode: e.target.value,
                                })
                            }
                        >
                            <option value="Deathmatch">Deathmatch</option>
                            <option value="Battle Royal">Battle Royal</option>
                            <option value="Capture the Flag">
                                Capture the Flag
                            </option>
                        </select>
                    </label>

                    <label>
                        Date et heure:
                        <input
                            type="datetime-local"
                            value={fpsModeData.date}
                            onChange={(e) =>
                                setFpsModeData({
                                    ...fpsModeData,
                                    date: e.target.value,
                                })
                            }
                        />
                    </label>
                    {errors.date && <p className="error">{errors.date}</p>}

                    <button
                        onClick={() => {
                            onHandleSubmitFpsMode();
                            setShowFpsModeForm(false);
                        }}
                        className="submit-btn"
                    >
                        Proposer le FPS Mode
                    </button>
                </div>
            )}

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez votre message ici..."
            />
            <button
                onClick={() => onSendMessage(message, side)}
                className="send-btn"
            >
                Envoyer
            </button>
        </div>
    );
}
