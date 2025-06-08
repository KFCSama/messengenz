import { useState, useEffect } from "react";
import validationService from "../services/validationService";

import "./ClientInput.css";

export default function ClientInput({
    side,
    color,
    activePlugins,
    availablePlugins,
    onSendMessage,
    onSendMessageRaw,
    onCreateNewThread,
    lastMessage,
}) {
    const [message, setMessage] = useState("");

    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [questionData, setQuestionData] = useState({
        questionText: ""
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

    const [lambdaReponseChecked, setLambdaReponseChecked] = useState(false);
    const [partieReponseData, setPartieReponseData] = useState({
        response: {
            accept: true,
        }
    });

    const [errors, setErrors] = useState({});
    const [noConstraint, setNoConstraint] = useState(true);

    // Envoi d'une question structurée
    const handleSubmitQuestion = () => {
        console.log("handleSubmitQuestion called with data:", questionData);
        // Vérification de la version des schémas
        const lambdaSchema = validationService.getSchema("lambda");
        if (!lambdaSchema) {
            setErrors({ general: "Schéma lambda non chargé" });
            return;
        }

        // Validation avec AJV
        const validationResult = validationService.validate(
            { questionText: questionData.questionText },
            "lambda"
        );

        if (!validationResult.isValid) {
            const formattedErrors = {};
            validationResult.errors.forEach((error) => {
                // Meilleure gestion du chemin de l'erreur
                const fieldName =
                    error.params?.missingProperty ||
                    error.instancePath?.replace("/", "") ||
                    "general";
                formattedErrors[fieldName] =
                    error.message || "Erreur de validation";
            });
            setErrors(formattedErrors);
            return;
        }

        // Création du message
        const questionMessage = {
            questionText: questionData.questionText,
            sender: side,
            type: "question",
            expectType: "lambda-reponse",
            sentAt: new Date().toISOString(),
            schema: { name: "lambda", version: availablePlugins["lambda"].version },
        };

        onCreateNewThread(
            `Question: ${questionData.questionText.substring(0, 20)}${
                questionData.questionText.length > 20 ? "..." : ""
            }`,
            questionMessage,
            [{ name: "lambda", version: availablePlugins["lambda"].version }]
        );

        setShowQuestionForm(false);
        setQuestionData({ questionText: ""});
        setErrors({});
    };

    // Envoi d'une proposition de partie
    const handleSubmitPartie = () => {
        console.log("handleSubmitPartie called with data:", partieData);
        const partieSchema = validationService.getSchema("partie");
        if (!partieSchema) {
            setErrors({ general: "Schéma partie non chargé" });
            return;
        }

        const isoDate = partieData.date? new Date(partieData.date).toISOString() : "";

        const validationResult = validationService.validate(
            { ...partieData, date: isoDate },
            "partie"
        );

        if (!validationResult.isValid) {
            const formattedErrors = {};
            validationResult.errors.forEach((error) => {
                const fieldName =
                    error.params?.missingProperty ||
                    error.instancePath?.replace("/", "") ||
                    "general";
                formattedErrors[fieldName] =
                    error.message || "Erreur de validation";
            });
            setErrors(formattedErrors);
            return;
        }

        const partieMessage = {
            ...partieData,
            sender: side,
            type: "partie",
            expectType: "partie-reponse",
            sentAt: new Date().toISOString(),
            schema: { name: "partie", version: availablePlugins["partie"].version }
        };

        onCreateNewThread(
            `Partie: ${partieData.questionText.substring(0, 20)}${
                partieData.questionText.length > 20 ? "..." : ""
            }`,
            partieMessage,
            [{ name: "partie", version: availablePlugins["partie"].version }]
        );

        setShowPartieForm(false);
        setPartieData({ questionText: "", date: "" });
        setErrors({});
    };

    // Envoi d'une proposition de partie en mode FPS
    const handleSubmitFpsMode = () => {
        console.log("handleSubmitFpsMode called with data:", fpsModeData);

        const fpsModeSchema = validationService.getSchema("fps-mode");
        if (!fpsModeSchema) {
            setErrors({ general: "Schéma FPS mode non chargé" });
            return;
        }

        const isoDate = fpsModeData.date? new Date(fpsModeData.date).toISOString() : "";

        // Ajout des secondes si nécessaire
        const dataToValidate = {
            ...fpsModeData,
            date: fpsModeData.date.includes(":00")
                ? fpsModeData.date
                : fpsModeData.date + ":00",
        };

        const validationResult = validationService.validate(
            { ...fpsModeData, date: isoDate },
            "fps-mode"
        );

        if (!validationResult.isValid) {
            const formattedErrors = {};
            validationResult.errors.forEach((error) => {
                const fieldName =
                    error.params?.missingProperty ||
                    error.instancePath?.replace("/", "") ||
                    "general";
                formattedErrors[fieldName] =
                    error.message || "Erreur de validation";
            });
            setErrors(formattedErrors);
            return;
        }

        const fpsModeMessage = {
            ...dataToValidate,
            sender: side,
            type: "fps-mode",
            expectType: "partie-reponse",
            sentAt: new Date().toISOString(),
            schema: { name: "fps-mode", version: availablePlugins["fps-mode"].version }
        };

        onCreateNewThread(
            `FPS ${fpsModeData.mode}: ${fpsModeData.questionText.substring(
                0,
                20
            )}${fpsModeData.questionText.length > 20 ? "..." : ""}`,
            fpsModeMessage,
            [{ name: "fps-mode", version: availablePlugins["fps-mode"].version }]
        );

        setShowFpsModeForm(false);
        setFpsModeData({ questionText: "", date: "", mode: "Deathmatch" });
        setErrors({});
    };

    const handleSubmitPartieReponse = () => {
        console.log("handleSubmitPartieReponse called with data:", partieReponseData);
        const partieReponseSchema = validationService.getSchema("partie-reponse");
        if (!partieReponseSchema) {
            setErrors({ general: "Schéma partie-reponse non chargé" });
            return;
        }

        // Conversion de la date si accept est false et newDate existe
        let dataToValidate = { ...partieReponseData };
        if (partieReponseData.response?.accept === false && partieReponseData.response?.newDate) {
            dataToValidate = {
                ...partieReponseData,
                response: {
                    ...partieReponseData.response,
                    newDate: new Date(partieReponseData.response.newDate).toISOString()
                }
            };
        }

        const validationResult = validationService.validate(
            dataToValidate,
            "partie-reponse"
        );

        console.log("Validation result:", validationResult);

        if (!validationResult.isValid) {
            const formattedErrors = {};
            validationResult.errors.forEach((error) => {
                const fieldName =
                    error.params?.missingProperty ||
                    error.instancePath?.replace("/", "") ||
                    "general";
                formattedErrors[fieldName] =
                    error.message || "Erreur de validation";
            });
            setErrors(formattedErrors);
            return;
        }

        const partieReponseMessage = {
            ...partieReponseData,
            sender: side,
            type: "partie-reponse",
            expectType: null,
            sentAt: new Date().toISOString(),
            schema: {
                name: "partie-reponse",
                version: availablePlugins["partie"].version,
            },
        };

        onSendMessageRaw(partieReponseMessage);

        setPartieReponseData({
            response: {
                accept: true,
            }
        });
        setErrors({});
    };


    useEffect(() => {
        setNoConstraint(
            lastMessage === null ||
                side === lastMessage.sender ||
                lastMessage.expectType === null
        );
    }, [lastMessage, side]);

    return (
        <div className="form-group" style={{ "--color": color }}>
            <h3>Client {side}</h3>

            {activePlugins.includes("lambda") && noConstraint && (
                <button
                    onClick={() => setShowQuestionForm(!showQuestionForm)}
                    className={`toggle-question-btn${
                        showQuestionForm ? " active cancel-btn" : ""
                    }`}
                >
                    {showQuestionForm ? "Annuler" : "Poser une question"}
                </button>
            )}
            {activePlugins.includes("partie") && noConstraint && (
                <button
                    onClick={() => setShowPartieForm(!showPartieForm)}
                    className={`toggle-question-btn${
                        showPartieForm ? " active cancel-btn" : ""
                    }`}
                >
                    {showPartieForm ? "Annuler" : "Proposer une partie"}
                </button>
            )}
            {activePlugins.includes("fps-mode") && noConstraint && (
                <button
                    onClick={() => setShowFpsModeForm(!showFpsModeForm)}
                    className={`toggle-question-btn${
                        showFpsModeForm ? " active cancel-btn" : ""
                    }`}
                >
                    {showFpsModeForm ? "Annuler" : "Proposer un FPS Mode"}
                </button>
            )}

            {showQuestionForm && noConstraint && (
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

                    <button
                        onClick={handleSubmitQuestion}
                        className="submit-btn"
                    >
                        Envoyer la question
                    </button>
                </div>
            )}

            {showPartieForm && noConstraint && (
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

                    <button onClick={handleSubmitPartie} className="submit-btn">
                        Proposer la partie
                    </button>
                </div>
            )}

            {showFpsModeForm && noConstraint && (
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
                        onClick={handleSubmitFpsMode}
                        className="submit-btn"
                    >
                        Proposer le FPS Mode
                    </button>
                </div>
            )}

            {noConstraint && (
                <>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Écrivez votre message ici..."
                    />
                    <button
                        onClick={() => {
                            onSendMessage(message, side, null);
                            setMessage("");
                        }}
                        className="send-btn"
                    >
                        Envoyer
                    </button>
                </>
            )}

            {/* constrained messages */}
            {/* Lambda response */}
            {!noConstraint && lastMessage !== null && lastMessage.expectType === "lambda-reponse" && lastMessage.sender !== side && (
                <div className="question-form">
                    <p><strong>Question:</strong> {lastMessage.questionText}</p>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={lambdaReponseChecked}
                            onChange={(e) => setLambdaReponseChecked(e.target.checked)}
                        />
                        Lu et accepté
                    </label>
                    {errors.luEtAccepte && (
                        <p className="error">{errors.luEtAccepte}</p>
                    )}
                    <button
                        onClick={() => {
                            // Validation avec le schéma de réponse
                            const validationResult = validationService.validate(
                                { luEtAccepte: lambdaReponseChecked },
                                "lambda-reponse"
                            );
                            if (!validationResult.isValid) {
                                setErrors({ luEtAccepte: "Vous devez lire et accepter." });
                                return;
                            }
                            onSendMessageRaw({
                                sender: side,
                                type: "lambda-reponse",
                                luEtAccepte: true,
                                expectType: null,
                                sentAt: new Date().toISOString(),
                                schema: { name: "lambda-reponse", version: availablePlugins["lambda"].version },
                            });
                            setLambdaReponseChecked(false);
                            setErrors({});
                        }}
                        className="send-btn"
                    >
                        Répondre
                    </button>
                </div>
            )}

            {/* Partie response */}
            {!noConstraint && lastMessage !== null && lastMessage.expectType === "partie-reponse" && (
                <>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={partieReponseData.response.accept}
                            onChange={(e) =>
                                setPartieReponseData({
                                    ...partieReponseData,
                                    response: {
                                        ...partieReponseData.response,
                                        accept: e.target.checked
                                    },
                                })
                            }
                        />
                        Accepté
                    </label>
                    {errors.accept && <p className="error">{errors.accept}</p>}

                    {!partieReponseData.response.accept && (
                        <>
                            <label>
                                Date et heure:
                                <input
                                    type="datetime-local"
                                    value={partieReponseData.response.newDate ?? ""}
                                    onChange={(e) =>
                                        setPartieReponseData({
                                            ...partieReponseData,
                                            response: {
                                                ...partieReponseData.response,
                                                newDate: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </label>
                            {errors.newDate && (
                                <p className="error">{errors.newDate}</p>
                            )}
                        </>
                    )}

                    <button className="send-btn" onClick={handleSubmitPartieReponse}>Envoyer</button>
                </>
            )}
        </div>
    );
}
