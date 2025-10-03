// ====== Referencias de elementos ======
const btnSobre = document.getElementById("btnSobre");
const caixaSobre = document.getElementById("caixaSobre");
const toggleTema = document.getElementById("toggleTema");
const btnMusicas = document.getElementById("btnMusicas");
const playerMusicas = document.getElementById("playerMusicas");
// ====== Frase de destaque com digitacao automatica ======
const fraseEfeitoContainer = document.querySelector(".frase-efeito");

if (fraseEfeitoContainer) {
    const frase = "Obrigado por visitar meu portf\u00f3lio, sua aten\u00e7\u00e3o faz toda a diferen\u00e7a! \uD83D\uDE4C";
    let indiceAtual = 0;
    let apagando = false;

    const digitar = () => {
        if (!apagando) {
            fraseEfeitoContainer.textContent = frase.slice(0, indiceAtual++);
            if (indiceAtual > frase.length) {
                apagando = true;
                setTimeout(digitar, 2000);
                return;
            }
        } else {
            fraseEfeitoContainer.textContent = frase.slice(0, indiceAtual--);
            if (indiceAtual < 0) {
                apagando = false;
                indiceAtual = 0;
            }
        }

        setTimeout(digitar, apagando ? 50 : 100);
    };

    digitar();
}

// ====== Controle do player de musicas ======
if (btnMusicas && playerMusicas) {
    btnMusicas.addEventListener("click", () => {
        const estaOculto = playerMusicas.classList.toggle("oculto");
        playerMusicas.setAttribute("aria-hidden", estaOculto ? "true" : "false");
        btnMusicas.setAttribute("aria-expanded", estaOculto ? "false" : "true");
    });
}


// ====== Controle do botao Sobre ======
if (btnSobre && caixaSobre) {
    btnSobre.addEventListener("click", () => {
        btnSobre.classList.add("clicked");
        const isVisible = caixaSobre.classList.toggle("mostrar");

        caixaSobre.setAttribute("aria-hidden", String(!isVisible));
        btnSobre.setAttribute("aria-expanded", String(isVisible));

        setTimeout(() => {
            btnSobre.classList.remove("clicked");
        }, 200);
    });
}

// ====== Alternancia de tema claro/escuro ======
const temaPreferido = localStorage.getItem("portfolio-tema");
const prefereEscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const aplicarTema = (modoEscuroAtivo) => {
    document.body.classList.toggle("dark-mode", modoEscuroAtivo);
    const label = modoEscuroAtivo ? "Desativar modo escuro" : "Ativar modo escuro";
    const conteudo = modoEscuroAtivo ? "&#x2600;" : "&#x1F319;";

    if (toggleTema) {
        toggleTema.setAttribute("aria-label", label);
        toggleTema.innerHTML = conteudo + " " + (modoEscuroAtivo ? "Modo claro" : "Modo escuro");
    }
};

const modoInicial = temaPreferido === "dark" || (temaPreferido === null && prefereEscuro);
aplicarTema(modoInicial);

if (toggleTema) {
    toggleTema.addEventListener("click", () => {
        const ativarEscuro = !document.body.classList.contains("dark-mode");
        aplicarTema(ativarEscuro);
        localStorage.setItem("portfolio-tema", ativarEscuro ? "dark" : "light");
    });
}

// ====== Preferencias de movimento ======
const prefereMenosMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ====== Efeito visual de rastro para cursores precisos ======
if (!prefereMenosMovimento && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    const elementosInterativos = document.querySelectorAll('a, button');

    document.addEventListener('mousemove', (evento) => {
        if (document.body.classList.contains('no-rastro')) {
            return;
        }

        const rastro = document.createElement('div');
        rastro.className = 'rastro';
        rastro.style.left = `${evento.clientX}px`;
        rastro.style.top = `${evento.clientY}px`;
        document.body.appendChild(rastro);

        setTimeout(() => {
            rastro.remove();
        }, 400);
    });

    elementosInterativos.forEach((elemento) => {
        elemento.addEventListener('mouseenter', () => document.body.classList.add('no-rastro'));
        elemento.addEventListener('mouseleave', () => document.body.classList.remove('no-rastro'));
    });
}

// ====== Logica do chat Anderson.AI ======
const btnAndersonAI = document.getElementById("btnAndersonAI");
const andersonAIChat = document.getElementById("andersonAIChat");
const closeAndersonAIChat = document.getElementById("closeAndersonAIChat");
const andersonAIChatForm = document.getElementById("andersonAIChatForm");
const andersonAIChatInput = document.getElementById("andersonAIChatInput");
const andersonAIChatMessages = document.getElementById("andersonAIChatMessages");
const andersonAIChatStatus = document.getElementById("andersonAIChatStatus");
const N8N_AI_ENDPOINT = "[{name/webhook/anderson-ai";/////////////////////////
const FALLBACK_MENSAGEM_AI = "Desculpa, estou hospedada em servidor Particular, mas est\u00e1 desligado no momento.";
const LIMITE_PERGUNTAS_CHAT = 7;
const MENSAGEM_LIMITE_CHAT = "Voc\u00ea atingiu o limite de sete perguntas. Para continuar, aperte o Reset e fique \u00e0 vontade. Obrigado!";
let totalPerguntasChat = 0;
let limitePerguntasNotificado = false;
let mensagemLimiteElemento = null;
let botaoResetChat = null;

let ultimaPerguntaItem = null;
let ultimaRespostaFalada = "";
let fecharMenuTTS = null;
let interromperLeituraTTS = null;
const placeholderPadrao = andersonAIChatInput ? (andersonAIChatInput.getAttribute("placeholder") || "Digite sua pergunta...") : "Digite sua pergunta...";
const placeholderPensando = String.fromCodePoint(0x1F914) + " ...";
const ICONE_OUVIR = String.fromCodePoint(0x1F50A);
const ICONE_MUDO = "X";
const ICONE_SEM_AUDIO = String.fromCodePoint(0x1F507);

const exibirAvisoLimiteChat = () => {
    const botaoEnviar = andersonAIChatForm ? andersonAIChatForm.querySelector(".anderson-ai-chat__send") : null;

    if (!limitePerguntasNotificado) {
        limitePerguntasNotificado = true;
        mensagemLimiteElemento = adicionarMensagemAI(MENSAGEM_LIMITE_CHAT, "bot");
    } else if (!mensagemLimiteElemento && andersonAIChatMessages) {
        mensagemLimiteElemento = andersonAIChatMessages.querySelector(".chat-item:last-child .answer:last-child");
    }

    if (andersonAIChatStatus) {
        andersonAIChatStatus.textContent = MENSAGEM_LIMITE_CHAT;
    }

    if (andersonAIChatInput) {
        andersonAIChatInput.value = "";
        andersonAIChatInput.disabled = true;
        andersonAIChatInput.placeholder = "Limite atingido. Use o bot\u00e3o Reset.";
    }

    if (botaoEnviar) {
        botaoEnviar.disabled = true;
    }

    if (andersonAIChatMessages) {
        const destino = mensagemLimiteElemento && mensagemLimiteElemento.parentElement
            ? mensagemLimiteElemento.parentElement
            : andersonAIChatMessages.lastElementChild;

        if (destino && !botaoResetChat) {
            botaoResetChat = document.createElement("button");
            botaoResetChat.type = "button";
            botaoResetChat.className = "chat-reset";
            botaoResetChat.textContent = "Reset Chat";
            botaoResetChat.addEventListener("click", resetLimiteChat);
            destino.appendChild(botaoResetChat);
        }
    }
};

const resetLimiteChat = () => {
    const botaoEnviar = andersonAIChatForm ? andersonAIChatForm.querySelector(".anderson-ai-chat__send") : null;

    totalPerguntasChat = 0;
    limitePerguntasNotificado = false;
    mensagemLimiteElemento = null;

    if (botaoResetChat) {
        botaoResetChat.remove();
        botaoResetChat = null;
    }

    if (andersonAIChatInput) {
        andersonAIChatInput.disabled = false;
        andersonAIChatInput.placeholder = placeholderPadrao;
        andersonAIChatInput.focus();
    }

    if (botaoEnviar) {
        botaoEnviar.disabled = false;
    }

    if (andersonAIChatStatus) {
        andersonAIChatStatus.textContent = "Limite reiniciado. Pode continuar perguntando!";
    }

    adicionarMensagemAI("Limite reiniciado. Pode continuar perguntando!", "bot");
};



const toggleAndersonAIChat = (abrir) => {
    if (!andersonAIChat || !btnAndersonAI) {
        return;
    }

    const deveAbrir = Boolean(abrir);
    const estaOculta = andersonAIChat.classList.contains("oculto");

    if (deveAbrir && estaOculta) {
        andersonAIChat.classList.remove("oculto");
        andersonAIChat.setAttribute("aria-hidden", "false");
        btnAndersonAI.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => {
            if (andersonAIChatInput) {
                andersonAIChatInput.focus();
            }
        });
    } else if (!deveAbrir && !estaOculta) {
        andersonAIChat.classList.add("oculto");
        andersonAIChat.setAttribute("aria-hidden", "true");
        btnAndersonAI.setAttribute("aria-expanded", "false");
        if (typeof fecharMenuTTS === "function") {
            fecharMenuTTS();
        }
        if (typeof interromperLeituraTTS === "function") {
            interromperLeituraTTS("");
        }
        if (andersonAIChatStatus) {
            andersonAIChatStatus.textContent = "";
        }
    }
};

const adicionarMensagemAI = (conteudo, tipo = "bot") => {
    if (!andersonAIChatMessages) {
        return null;
    }

    let elementoCriado = null;

    if (tipo === "user") {
        const item = document.createElement("div");
        item.classList.add("chat-item");

        const pergunta = document.createElement("p");
        pergunta.className = "question";
        pergunta.textContent = conteudo;
        item.appendChild(pergunta);

        andersonAIChatMessages.appendChild(item);
        ultimaPerguntaItem = item;
        elementoCriado = item;
    } else {
        let destino = ultimaPerguntaItem && !ultimaPerguntaItem.querySelector(".answer")
            ? ultimaPerguntaItem
            : null;

        if (!destino) {
            destino = document.createElement("div");
            destino.classList.add("chat-item");
            andersonAIChatMessages.appendChild(destino);
        }

        const resposta = document.createElement("p");
        resposta.className = "answer";
        if (tipo === "placeholder") {
            resposta.classList.add("answer--placeholder");
        }
        resposta.textContent = conteudo;
        destino.appendChild(resposta);
        if (tipo === "bot") {
            ultimaRespostaFalada = conteudo;
        }
        elementoCriado = resposta;

        if (tipo !== "placeholder") {
            ultimaPerguntaItem = null;
        }
    }

    andersonAIChatMessages.scrollTop = andersonAIChatMessages.scrollHeight;
    return elementoCriado;
};

const extrairRespostaIA = (payload) => {
    if (payload === null || payload === undefined) {
        return "";
    }

    if (typeof payload === "string") {
        return payload.trim();
    }

    if (Array.isArray(payload)) {
        for (const item of payload) {
            const resposta = extrairRespostaIA(item);
            if (resposta) {
                return resposta;
            }
        }
        return "";
    }

    if (typeof payload === "object") {
        const chavesPreferidas = ["resposta", "answer", "texto", "message", "mensagem", "output", "data"];
        for (const chave of chavesPreferidas) {
            if (Object.prototype.hasOwnProperty.call(payload, chave)) {
                const resposta = extrairRespostaIA(payload[chave]);
                if (resposta) {
                    return resposta;
                }
            }
        }

        try {
            return JSON.stringify(payload);
        } catch (erro) {
            console.error("Falha ao serializar resposta da IA:", erro);
            return String(payload);
        }
    }

    return String(payload);
};

if (btnAndersonAI && andersonAIChat && andersonAIChatForm && andersonAIChatInput && andersonAIChatMessages) {
    const ttsButton = document.getElementById("andersonAITTSButton");
    const ttsConfigButton = document.getElementById("andersonAITTSConfig");
    const ttsMenu = document.getElementById("andersonAITTSMenu");
    const ttsLangSelect = document.getElementById("andersonAITTSLang");
    const ttsVoiceSelect = document.getElementById("andersonAITTSVoice");
    const ttsRateInput = document.getElementById("andersonAITTSRate");
    const ttsRateValue = document.getElementById("andersonAITTSRateValue");
    const ttsRateReset = document.getElementById("andersonAITTSRateReset");
    const speechDisponivel = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";

    let vozesDisponiveis = [];
    let ultimaVozSelecionada = "";
    let ttsEmExecucao = false;

    const atualizarRotuloVelocidade = () => {
        if (ttsRateInput && ttsRateValue) {
            const valor = Number(ttsRateInput.value || 1).toFixed(1);
            ttsRateValue.textContent = valor + "x";
        }
    };

    const atualizarEstadoBotaoTTS = () => {
        if (!ttsButton) {
            return;
        }
        if (!speechDisponivel) {
            ttsButton.textContent = ICONE_SEM_AUDIO + " Ouvir";
            return;
        }
        if (ttsEmExecucao || window.speechSynthesis.speaking) {
            ttsButton.textContent = ICONE_MUDO + " Mudo";
            ttsButton.classList.add("chat-tts-trigger--active");
        } else {
            ttsButton.textContent = ICONE_OUVIR + " Ouvir";
            ttsButton.classList.remove("chat-tts-trigger--active");
        }
    };

    const obterNomeIdioma = (codigo) => {
        if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
            try {
                const idiomaBase = codigo.split("-")[0];
                const display = new Intl.DisplayNames([navigator.language || "pt-BR"], { type: "language" });
                const nome = display.of(idiomaBase);
                if (nome) {
                    return nome + " (" + codigo + ")";
                }
            } catch (erro) {
                console.warn("Nao foi possivel resolver o idioma", erro);
            }
        }
        return codigo;
    };

    const popularIdiomas = (voices) => {
        if (!ttsLangSelect) {
            return;
        }
        const idiomaAtual = ttsLangSelect.value;
        ttsLangSelect.innerHTML = "";
        const opcaoAuto = document.createElement("option");
        opcaoAuto.value = "";
        opcaoAuto.textContent = "Automatico";
        ttsLangSelect.appendChild(opcaoAuto);

        const idiomasUnicos = Array.from(new Set(voices.map((voz) => voz.lang))).sort();
        idiomasUnicos.forEach((lang) => {
            const option = document.createElement("option");
            option.value = lang;
            option.textContent = obterNomeIdioma(lang);
            ttsLangSelect.appendChild(option);
        });

        if (idiomaAtual && idiomasUnicos.includes(idiomaAtual)) {
            ttsLangSelect.value = idiomaAtual;
        } else if (!idiomaAtual && idiomasUnicos.includes("pt-BR")) {
            ttsLangSelect.value = "pt-BR";
        }
    };

    const popularVozes = (voices, lang) => {
        if (!ttsVoiceSelect) {
            return;
        }
        const selecionada = ultimaVozSelecionada;
        ttsVoiceSelect.innerHTML = "";
        const filtradas = lang ? voices.filter((voz) => voz.lang === lang) : voices;

        if (!filtradas.length) {
            ttsVoiceSelect.disabled = true;
            const option = document.createElement("option");
            option.textContent = "Nenhuma voz disponivel";
            ttsVoiceSelect.appendChild(option);
            return;
        }

        filtradas.forEach((voz) => {
            const option = document.createElement("option");
            option.value = voz.voiceURI;
            option.textContent = voz.name + " (" + voz.lang + ")";
            ttsVoiceSelect.appendChild(option);
        });

        ttsVoiceSelect.disabled = false;
        if (selecionada && filtradas.some((voz) => voz.voiceURI === selecionada)) {
            ttsVoiceSelect.value = selecionada;
        } else {
            ttsVoiceSelect.value = filtradas[0].voiceURI;
            ultimaVozSelecionada = filtradas[0].voiceURI;
        }
    };

    const carregarVozes = () => {
        if (!speechDisponivel) {
            return;
        }
        const voices = window.speechSynthesis.getVoices().filter((voz) => voz.lang);
        if (!voices.length) {
            return;
        }
        vozesDisponiveis = voices.sort((a, b) => a.name.localeCompare(b.name));
        popularIdiomas(vozesDisponiveis);
        const idiomaAtual = ttsLangSelect ? ttsLangSelect.value : "";
        popularVozes(vozesDisponiveis, idiomaAtual);
    };

    const atualizarIdiomaPadrao = () => {
        if (!speechDisponivel || !ttsLangSelect) {
            return;
        }
        if (!ttsLangSelect.value && Array.from(ttsLangSelect.options).some((opt) => opt.value === "pt-BR")) {
            ttsLangSelect.value = "pt-BR";
            popularVozes(vozesDisponiveis, "pt-BR");
        }
    };

    const interromperLeitura = (mensagem) => {
        if (!speechDisponivel) {
            return;
        }
        if (window.speechSynthesis.speaking || ttsEmExecucao) {
            window.speechSynthesis.cancel();
        }
        ttsEmExecucao = false;
        atualizarEstadoBotaoTTS();
        if (mensagem && andersonAIChatStatus) {
            andersonAIChatStatus.textContent = mensagem;
        }
    };

    const falarUltimaResposta = () => {
        if (!speechDisponivel) {
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Leitura por voz nao suportada neste navegador.";
            }
            return;
        }

        const texto = ultimaRespostaFalada.trim();
        if (!texto) {
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Ainda nao tenho nenhuma resposta para ler.";
            }
            return;
        }

        const utterance = new SpeechSynthesisUtterance(texto);
        if (ttsRateInput) {
            utterance.rate = Number(ttsRateInput.value) || 1;
        }

        if (ttsVoiceSelect && !ttsVoiceSelect.disabled && ttsVoiceSelect.value) {
            const voz = vozesDisponiveis.find((item) => item.voiceURI === ttsVoiceSelect.value);
            if (voz) {
                utterance.voice = voz;
                utterance.lang = voz.lang;
            }
        } else if (ttsLangSelect && ttsLangSelect.value) {
            utterance.lang = ttsLangSelect.value;
        }

        utterance.onend = () => {
            ttsEmExecucao = false;
            atualizarEstadoBotaoTTS();
            if (andersonAIChatStatus && andersonAIChatStatus.textContent === "Lendo resposta...") {
                andersonAIChatStatus.textContent = "";
            }
        };

        utterance.onerror = () => {
            ttsEmExecucao = false;
            atualizarEstadoBotaoTTS();
            window.speechSynthesis.cancel();
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Nao foi possivel sintetizar a voz.";
            }
        };

        if (andersonAIChatStatus) {
            andersonAIChatStatus.textContent = "Lendo resposta...";
        }
        ttsEmExecucao = true;
        atualizarEstadoBotaoTTS();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    fecharMenuTTS = () => {
        if (ttsMenu && !ttsMenu.classList.contains("oculto")) {
            ttsMenu.classList.add("oculto");
            ttsMenu.setAttribute("aria-hidden", "true");
        }
        if (ttsConfigButton) {
            ttsConfigButton.setAttribute("aria-expanded", "false");
        }
    };

    const tratarCliqueExternoTTS = (evento) => {
        if (!ttsMenu || ttsMenu.classList.contains("oculto")) {
            return;
        }
        if (ttsMenu.contains(evento.target) || evento.target === ttsConfigButton) {
            return;
        }
        fecharMenuTTS();
    };

    document.addEventListener("click", tratarCliqueExternoTTS);

    if (ttsConfigButton && ttsMenu) {
        ttsConfigButton.addEventListener("click", () => {
            if (!speechDisponivel) {
                return;
            }
            const vaiMostrar = ttsMenu.classList.contains("oculto");
            if (vaiMostrar) {
                ttsMenu.classList.remove("oculto");
                ttsMenu.setAttribute("aria-hidden", "false");
                ttsConfigButton.setAttribute("aria-expanded", "true");
                if (!vozesDisponiveis.length) {
                    carregarVozes();
                }
            } else {
                fecharMenuTTS();
            }
        });
    }

    const enviarPerguntaParaIA = async (pergunta, placeholderElemento) => {
        const botaoEnviar = andersonAIChatForm ? andersonAIChatForm.querySelector(".anderson-ai-chat__send") : null;

        try {
            if (botaoEnviar) {
                botaoEnviar.disabled = true;
            }
            interromperLeitura("");
            if (andersonAIChatInput) {
                andersonAIChatInput.disabled = true;
                andersonAIChatInput.placeholder = placeholderPensando;
            }
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Consultando Anderson.AI...";
            }
            if (placeholderElemento) {
                placeholderElemento.textContent = "Pensando...";
                placeholderElemento.classList.add("answer--placeholder");
            }

            const resposta = await fetch(N8N_AI_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pergunta })
            });

            if (!resposta.ok) {
                throw new Error(`Status ${resposta.status}`);
            }

            const contentType = resposta.headers.get("content-type") || "";
            const carga = contentType.includes("application/json") ? await resposta.json() : await resposta.text();
            const respostaExtraida = extrairRespostaIA(carga) || FALLBACK_MENSAGEM_AI;

            if (placeholderElemento) {
                placeholderElemento.textContent = respostaExtraida;
                placeholderElemento.classList.remove("answer--placeholder");
            } else {
                adicionarMensagemAI(respostaExtraida, "bot");
            }

            ultimaRespostaFalada = respostaExtraida;

            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = respostaExtraida === FALLBACK_MENSAGEM_AI ? FALLBACK_MENSAGEM_AI : "";
            }
        } catch (erro) {
            console.error("Erro ao consultar Anderson.AI:", erro);
            if (placeholderElemento) {
                placeholderElemento.textContent = FALLBACK_MENSAGEM_AI;
                placeholderElemento.classList.remove("answer--placeholder");
            } else {
                adicionarMensagemAI(FALLBACK_MENSAGEM_AI, "bot");
            }
            ultimaRespostaFalada = FALLBACK_MENSAGEM_AI;
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = FALLBACK_MENSAGEM_AI;
            }
        } finally {
            if (botaoEnviar) {
                botaoEnviar.disabled = false;
            }
            if (andersonAIChatInput) {
                andersonAIChatInput.disabled = false;
                andersonAIChatInput.placeholder = placeholderPadrao;
                andersonAIChatInput.focus();
            }
        }
    };
    if (ttsButton) {
        if (!speechDisponivel) {
            ttsButton.disabled = true;
            ttsButton.title = "Leitura por voz nao suportada neste navegador.";
            atualizarEstadoBotaoTTS();
            if (ttsConfigButton) {
                ttsConfigButton.disabled = true;
            }
        } else {
            ttsButton.addEventListener("click", () => {
                if (ttsEmExecucao || window.speechSynthesis.speaking) {
                    interromperLeitura("Leitura interrompida.");
                    return;
                }
                if (ttsMenu && !ttsMenu.classList.contains("oculto")) {
                    fecharMenuTTS();
                }
                falarUltimaResposta();
            });
        }
    }

    if (ttsLangSelect) {
        ttsLangSelect.addEventListener("change", () => {
            ultimaVozSelecionada = "";
            popularVozes(vozesDisponiveis, ttsLangSelect.value);
        });
    }

    if (ttsVoiceSelect) {
        ttsVoiceSelect.addEventListener("change", () => {
            ultimaVozSelecionada = ttsVoiceSelect.value;
        });
    }

    if (ttsRateInput) {
        ttsRateInput.addEventListener("input", atualizarRotuloVelocidade);
        atualizarRotuloVelocidade();
    }

    if (ttsRateReset && ttsRateInput) {
        ttsRateReset.addEventListener("click", () => {
            ttsRateInput.value = "1";
            atualizarRotuloVelocidade();
        });
    }

    if (btnAndersonAI) {
        btnAndersonAI.addEventListener("click", () => {
            const deveAbrir = andersonAIChat.classList.contains("oculto");
            toggleAndersonAIChat(deveAbrir);
        });
    }

    if (closeAndersonAIChat) {
        closeAndersonAIChat.addEventListener("click", () => {
            toggleAndersonAIChat(false);
            btnAndersonAI.focus();
        });
    }

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !andersonAIChat.classList.contains("oculto")) {
            toggleAndersonAIChat(false);
            btnAndersonAI.focus();
        }
    });

    if (andersonAIChatInput) {
        andersonAIChatInput.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" && !evento.shiftKey) {
                evento.preventDefault();
                andersonAIChatForm.requestSubmit();
            }
        });

        andersonAIChatInput.addEventListener("input", () => {
            andersonAIChatInput.placeholder = placeholderPadrao;
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "";
            }
        });
    }    if (andersonAIChatForm) {
        andersonAIChatForm.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            if (limitePerguntasNotificado || totalPerguntasChat >= LIMITE_PERGUNTAS_CHAT) {
                exibirAvisoLimiteChat();
                return;
            }

            const pergunta = andersonAIChatInput ? andersonAIChatInput.value.trim() : "";
            if (!pergunta) {
                if (andersonAIChatStatus) {
                    andersonAIChatStatus.textContent = "Digite uma pergunta para continuar.";
                }
                return;
            }

            totalPerguntasChat += 1;

            if (andersonAIChatInput) {
                andersonAIChatInput.placeholder = placeholderPensando;
            }
            adicionarMensagemAI(pergunta, "user");
            if (andersonAIChatInput) {
                andersonAIChatInput.value = "";
            }
            const placeholderResposta = adicionarMensagemAI("Pensando...", "placeholder");
            await enviarPerguntaParaIA(pergunta, placeholderResposta);
            if (placeholderResposta) {
                placeholderResposta.classList.remove("answer--placeholder");
            }

            if (totalPerguntasChat >= LIMITE_PERGUNTAS_CHAT) {
                exibirAvisoLimiteChat();
            }
        });
    }
    atualizarEstadoBotaoTTS();
    atualizarEstadoBotaoTTS();
    interromperLeituraTTS = interromperLeitura;
    if (speechDisponivel) {
        carregarVozes();
        atualizarIdiomaPadrao();
        window.speechSynthesis.onvoiceschanged = () => {
            carregarVozes();
            atualizarIdiomaPadrao();
        };
    }
}

// ====== Grafico em tempo real com dados do n8n ======
const graficoCanvas = document.getElementById("graficoEvolucao");
const graficoStatus = document.getElementById("graficoStatus");
const graficoLegenda = document.getElementById("grafico-legenda");
const N8N_ENDPOINT = "http://localhost:5678/webhook/grafico-evolucao";
const LIMITE_EXIBICAO = 100;
const INTERVALO_CONSULTA = 15000;
const LIMITE_SINCRONIA = 60;
const INTERVALO_ATUALIZACAO = prefereMenosMovimento ? 250 : 100;
const LIMITE_PONTOS = 24;
const ALTURA_MINIMA_GRAFICO = 360;

const TECNOLOGIAS = [
    { chave: "n8n", label: "n8n", corLinha: "#ff8fa3", corPreenchimento: "rgba(255, 143, 163, 0.18)", limitePadrao: 90, aliases: ["n8n"] },
    { chave: "html", label: "HTML", corLinha: "#ff6f61", corPreenchimento: "rgba(255, 111, 97, 0.18)", limitePadrao: 88, aliases: ["html"] },
    { chave: "css", label: "CSS", corLinha: "#1cc5dc", corPreenchimento: "rgba(28, 197, 220, 0.18)", limitePadrao: 85, aliases: ["css"] },
    { chave: "javascript", label: "JavaScript", corLinha: "#f9c74f", corPreenchimento: "rgba(249, 199, 79, 0.18)", limitePadrao: 80, aliases: ["javascript", "js"] },
    { chave: "react", label: "React", corLinha: "#7bdff2", corPreenchimento: "rgba(123, 223, 242, 0.18)", limitePadrao: 75, aliases: ["react"] },
    { chave: "github", label: "GitHub", corLinha: "#6e5494", corPreenchimento: "rgba(110, 84, 148, 0.18)", limitePadrao: 73, aliases: ["github", "git"] }
];

const normalizarTexto = (texto) => texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const clampValor = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) {
        return 0;
    }
    return Math.max(0, Math.min(LIMITE_EXIBICAO, Number(numero.toFixed(1))));
};

const atualizarStatusGrafico = (mensagem) => {
    if (graficoStatus) {
        graficoStatus.textContent = mensagem;
    }
};

const extrairValorPercentual = (fonte, aliases = []) => {
    if (fonte === null || fonte === undefined) {
        return null;
    }

    if (typeof fonte === "number" && Number.isFinite(fonte)) {
        return fonte;
    }

    if (typeof fonte === "string") {
        const normalizado = fonte.replace(/,/g, ".");
        const correspondencias = normalizado.match(/-?\d+(?:\.\d+)?/g);
        if (!correspondencias) {
            return null;
        }
        return parseFloat(correspondencias[correspondencias.length - 1]);
    }

    if (Array.isArray(fonte)) {
        for (let i = fonte.length - 1; i >= 0; i -= 1) {
            const valor = extrairValorPercentual(fonte[i], aliases);
            if (valor !== null) {
                return valor;
            }
        }
        return null;
    }

    if (typeof fonte === "object") {
        const entradas = Object.entries(fonte);

        if (aliases.length) {
            for (const alias of aliases) {
                const alvo = normalizarTexto(alias);
                for (const [chave, valor] of entradas) {
                    if (normalizarTexto(chave).includes(alvo)) {
                        const encontrado = extrairValorPercentual(valor);
                        if (encontrado !== null) {
                            return encontrado;
                        }
                    }
                }
            }
        }

        for (const [, valor] of entradas) {
            const encontrado = extrairValorPercentual(valor, aliases);
            if (encontrado !== null) {
                return encontrado;
            }
        }
    }

    return null;
};

if (graficoCanvas) {
    if (ALTURA_MINIMA_GRAFICO && Number.isFinite(ALTURA_MINIMA_GRAFICO)) {
        graficoCanvas.style.minHeight = `${ALTURA_MINIMA_GRAFICO}px`;
        if (graficoCanvas.height < ALTURA_MINIMA_GRAFICO) {
            graficoCanvas.height = ALTURA_MINIMA_GRAFICO;
        }
        if (graficoCanvas.parentElement && graficoCanvas.parentElement.style) {
            graficoCanvas.parentElement.style.minHeight = `${ALTURA_MINIMA_GRAFICO}px`;
        }
    }
    if (typeof Chart === "undefined") {
        atualizarStatusGrafico("O grafico precisa do Chart.js para funcionar.");
    } else {
        const contexto = graficoCanvas.getContext("2d");
        const limitesPadrao = TECNOLOGIAS.reduce((acumulador, tecnologia) => {
            acumulador[tecnologia.chave] = tecnologia.limitePadrao;
            return acumulador;
        }, {});
        const limitesAtuais = { ...limitesPadrao };
        const valoresAtuais = TECNOLOGIAS.reduce((acumulador, tecnologia) => {
            acumulador[tecnologia.chave] = 0;
            return acumulador;
        }, {});
        let passoAtual = 0;
        let cicloAtivo = false;
        let temporizadorAnimacao = null;
        let temporizadorConsulta = null;

        const formatarHorario = () => {
            try {
                return new Intl.DateTimeFormat("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }).format(new Date());
            } catch (erro) {
                const agora = new Date();
                const horas = String(agora.getHours()).padStart(2, "0");
                const minutos = String(agora.getMinutes()).padStart(2, "0");
                const segundos = String(agora.getSeconds()).padStart(2, "0");
                return `${horas}:${minutos}:${segundos}`;
            }
        };

        const TOTAL_PASSOS = 100;
        const PASSOS_DIVERGENCIA = Math.max(1, TOTAL_PASSOS - LIMITE_SINCRONIA);
        const LINHAS_REFERENCIA = [
            { valor: 60, cor: "rgba(123, 223, 242, 0.35)", texto: "Referencia coletiva 60%" },
            { valor: 90, cor: "rgba(255, 143, 163, 0.45)", texto: "Limite superior 90%" }
        ];
        const legendaPorTecnologiaPlugin = {
            id: "legendaPorTecnologia",
            afterUpdate(chart) {
                const legend = chart.legend;
                if (!legend || !Array.isArray(legend.legendItems)) {
                    return;
                }

                legend.legendItems.forEach((item) => {
                    const dataset = chart.data.datasets[item.datasetIndex];
                    if (!dataset) {
                        return;
                    }

                    const cor = dataset.borderColor || dataset.backgroundColor || "#f5f5f5";
                    item.textColor = cor;
                    item.strokeStyle = cor;
                    item.fillStyle = cor;
                });
            }
        };
        const linhasReferenciaPlugin = {
            id: "linhasReferencia",
            afterDraw(chart) {
                const { ctx, chartArea, scales } = chart;
                if (!chartArea || !scales || !scales.y) {
                    return;
                }

                const eixoY = scales.y;
                ctx.save();
                ctx.lineWidth = 1;
                ctx.setLineDash([6, 6]);

                LINHAS_REFERENCIA.forEach((referencia) => {
                    const yPixel = eixoY.getPixelForValue(referencia.valor);
                    if (Number.isNaN(yPixel) || yPixel < chartArea.top || yPixel > chartArea.bottom) {
                        return;
                    }

                    ctx.strokeStyle = referencia.cor;
                    ctx.beginPath();
                    ctx.moveTo(chartArea.left, yPixel);
                    ctx.lineTo(chartArea.right, yPixel);
                    ctx.stroke();

                    if (referencia.texto) {
                        ctx.setLineDash([]);
                        ctx.fillStyle = referencia.cor;
                        ctx.font = "12px 'Poppins', 'Montserrat', sans-serif";
                        ctx.textAlign = "right";
                        ctx.textBaseline = "bottom";
                        ctx.fillText(referencia.texto, chartArea.right - 8, yPixel - 6);
                        ctx.setLineDash([6, 6]);
                    }
                });

                ctx.restore();
            }
        };

        const graficoEvolucao = new Chart(contexto, {
            type: "line",
            data: {
                labels: [],
                datasets: TECNOLOGIAS.map((tecnologia) => ({
                    label: tecnologia.label,
                    data: [],
                    borderColor: tecnologia.corLinha,
                    backgroundColor: tecnologia.corPreenchimento,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: prefereMenosMovimento ? 0 : 3,
                    pointHoverRadius: prefereMenosMovimento ? 0 : 5,
                    pointBackgroundColor: tecnologia.corLinha,
                    pointBorderColor: "#0b2130",
                    pointBorderWidth: 2,
                    fill: false,
                    metaChave: tecnologia.chave
                }))
            },
            plugins: [legendaPorTecnologiaPlugin, linhasReferenciaPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    mode: "nearest",
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: (valor) => `${valor}%`,
                            color: "#f5f5f5",
                            stepSize: 10,
                            autoSkip: false,
                            maxTicksLimit: 11,
                            padding: 12,
                            font: {
                                family: "'Poppins', 'Montserrat', sans-serif",
                                size: 13,
                                weight: "600",
                                lineHeight: 1.25
                            }
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.15)"
                        }
                    },
                    x: {
                        ticks: {
                            color: "#e4e4e4",
                            maxTicksLimit: 6,
                            autoSkip: true
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.08)"
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                        align: "center",
                        labels: {
                            color: "#f5f5f5",
                            usePointStyle: true,
                            padding: 16,
                            font: {
                                family: "'Poppins', 'Montserrat', sans-serif",
                                size: 13,
                                weight: "500"
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (contextoTooltip) => {
                                const valor = contextoTooltip.parsed.y;
                                return `${contextoTooltip.dataset.label}: ${valor}%`;
                            }
                        }
                    }
                }
            }
        });
        if (graficoLegenda) {
            graficoLegenda.setAttribute("hidden", "true");
            graficoLegenda.style.display = "none";
        }

        const montarResumoLimites = () => TECNOLOGIAS
            .map((tecnologia) => `${tecnologia.label} ${limitesAtuais[tecnologia.chave]}%`)
            .join(", ");

        const extrairLimitesDaCarga = (carga) => {
            const resultados = {};
            TECNOLOGIAS.forEach((tecnologia) => {
                const aliases = [tecnologia.chave, tecnologia.label, ...(tecnologia.aliases || [])];
                const valorExtraido = extrairValorPercentual(carga, aliases);
                if (valorExtraido !== null && !Number.isNaN(valorExtraido)) {
                    resultados[tecnologia.chave] = clampValor(valorExtraido);
                }
            });
            return resultados;
        };

        const aplicarLimites = (limitesDetectados) => {
            let houveAlteracao = false;

            TECNOLOGIAS.forEach((tecnologia, indice) => {
                const chave = tecnologia.chave;
                const novoLimite = limitesDetectados[chave];

                if (typeof novoLimite === "number" && Number.isFinite(novoLimite)) {
                    if (limitesAtuais[chave] !== novoLimite) {
                        limitesAtuais[chave] = novoLimite;
                        houveAlteracao = true;
                    }

                    if (valoresAtuais[chave] > novoLimite) {
                        valoresAtuais[chave] = novoLimite;
                        const dataset = graficoEvolucao.data.datasets[indice];
                        if (dataset.data.length) {
                            dataset.data[dataset.data.length - 1] = novoLimite;
                        }
                    }
                }
            });

            if (houveAlteracao) {
                graficoEvolucao.update("none");
            }

            return houveAlteracao;
        };

        const reiniciarCiclo = () => {
            const { labels, datasets } = graficoEvolucao.data;
            const horario = formatarHorario();

            labels.push(horario);

            datasets.forEach((dataset) => {
                dataset.data.push(0);
                const chave = dataset.metaChave;
                if (chave && Object.prototype.hasOwnProperty.call(valoresAtuais, chave)) {
                    valoresAtuais[chave] = 0;
                }
            });

            if (labels.length > LIMITE_PONTOS) {
                labels.shift();
                datasets.forEach((dataset) => {
                    dataset.data.shift();
                });
            }

            passoAtual = 0;
            cicloAtivo = true;
            graficoEvolucao.update("none");
        };


        const atualizarGrafico = () => {
            if (!cicloAtivo) {
                return;
            }

            const { datasets, labels } = graficoEvolucao.data;
            if (!labels.length) {
                return;
            }

            if (passoAtual >= TOTAL_PASSOS) {
                cicloAtivo = false;
                return;
            }

            passoAtual += 1;

            const fatorProgresso = passoAtual <= LIMITE_SINCRONIA
                ? 0
                : (passoAtual - LIMITE_SINCRONIA) / PASSOS_DIVERGENCIA;

            datasets.forEach((dataset) => {
                const chave = dataset.metaChave;
                const limiteFinal = limitesAtuais[chave];
                let novoValor;

                if (passoAtual <= LIMITE_SINCRONIA) {
                    novoValor = Math.min(limiteFinal, passoAtual);
                } else if (limiteFinal <= LIMITE_SINCRONIA) {
                    novoValor = limiteFinal;
                } else {
                    const delta = limiteFinal - LIMITE_SINCRONIA;
                    const interpolado = LIMITE_SINCRONIA + delta * fatorProgresso;
                    novoValor = Math.min(limiteFinal, Number(interpolado.toFixed(1)));
                }

                valoresAtuais[chave] = novoValor;
                const ultimoIndice = dataset.data.length - 1;
                if (ultimoIndice >= 0) {
                    dataset.data[ultimoIndice] = novoValor;
                }
            });

            graficoEvolucao.update("none");

            const todosNoLimite = datasets.every((dataset) => {
                const chave = dataset.metaChave;
                return valoresAtuais[chave] >= limitesAtuais[chave];
            });

            if (todosNoLimite) {
                cicloAtivo = false;
            }
        };

        const iniciarConsulta = () => {
            const consultar = async () => {
                try {
                    const resposta = await fetch(N8N_ENDPOINT, {
                        method: "GET",
                        headers: {
                            Accept: "application/json"
                        },
                        cache: "no-store"
                    });

                    if (!resposta.ok) {
                        throw new Error(`Status ${resposta.status}`);
                    }

                    let carga;
                    try {
                        carga = await resposta.clone().json();
                    } catch (erroJson) {
                        carga = await resposta.text();
                    }

                    const limitesDetectados = extrairLimitesDaCarga(carga);
                    const horarioConsulta = formatarHorario();

                    if (Object.keys(limitesDetectados).length) {
                        aplicarLimites(limitesDetectados);
                        atualizarStatusGrafico(`Dados do n8n às ${horarioConsulta}: ${montarResumoLimites()}.`);
                    } else {
                        atualizarStatusGrafico(`n8n sem novos dados às ${horarioConsulta}. Limites atuais: ${montarResumoLimites()}.`);
                    }

                    reiniciarCiclo();
                } catch (erro) {
                    console.error("[Grafico] Erro ao consultar o n8n:", erro);
                    atualizarStatusGrafico(`Falha ao consultar o n8n. Mantendo limites: ${montarResumoLimites()}.`);
                }
            };

            consultar();
            temporizadorConsulta = window.setInterval(consultar, INTERVALO_CONSULTA);
        };

        reiniciarCiclo();
        atualizarStatusGrafico(`Simulacao ativa. Atualizacao a cada 15s via n8n. Limites atuais: ${montarResumoLimites()}.`);
        temporizadorAnimacao = window.setInterval(atualizarGrafico, INTERVALO_ATUALIZACAO);
        iniciarConsulta();

        window.addEventListener("beforeunload", () => {
            if (temporizadorAnimacao) {
                clearInterval(temporizadorAnimacao);
                temporizadorAnimacao = null;
            }
            if (temporizadorConsulta) {
                clearInterval(temporizadorConsulta);
                temporizadorConsulta = null;
            }
        });
    }
}







