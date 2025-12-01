
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
const N8N_AI_ENDPOINT = "https://unexhaustively-extendible-jeni.ngrok-free.dev/webhook/anderson-ai";// <= Atualiza A cada 30 minutos via ngrok-free.dev
const FALLBACK_MENSAGEM_AI = "Desculpa, estou hospedada em servidor Particular, mas est\u00e1 desligado no momento.";
const LIMITE_CONTINUAR_CHAT = 4;
const LIMITE_ENCERRAMENTO_CHAT = 6;
const MENSAGEM_CONTINUAR_CHAT = "Voc\u00ea atingiu 4 execu\u00e7\u00f5es com o Anderson.AI. Clique em Continuar para seguir com a conversa.";
const MENSAGEM_ENCERRAMENTO_CHAT = "Obrigado pela conversa! Voc\u00ea atingiu o limite de 6 execu\u00e7\u00f5es. Fique \u00e0 vontade pra continuar explorando meu portf\u00f3lio. A tecnologia mudou minha vida para melhor. Hoje n\u00e3o me vejo sem programar, porque cada linha de c\u00f3digo me leva mais longe \u2014 e o c\u00e9u n\u00e3o tem limites \ud83d\ude80\ud83e\udde0.";
const MENSAGEM_APOS_ENCERRAMENTO = "E deu! O limite de 6 execu\u00e7\u00f5es j\u00e1 foi atingido.";
const PLACEHOLDER_CHAT_ENCERRADO = "Limite atingido. Novas perguntas trar\u00e3o o aviso final.";
let totalRespostasValidas = 0;
let aguardandoConfirmacaoContinuar = false;
let solicitacaoContinuarAtiva = false;
let chatEncerrado = false;
let mensagemEncerramentoElemento = null;
let botaoContinuarChat = null;
let perguntaPendente = null;
let placeholderPendente = null;
let mensagemContinuarElemento = null;

let ultimaPerguntaItem = null;
let ultimaRespostaFalada = "";
let fecharMenuTTS = null;
let interromperLeituraTTS = null;
const placeholderPadrao = andersonAIChatInput ? (andersonAIChatInput.getAttribute("placeholder") || "Digite sua pergunta...") : "Digite sua pergunta...";
const placeholderPensando = String.fromCodePoint(0x1F914) + " ...";
const ICONE_OUVIR = String.fromCodePoint(0x1F50A);
const ICONE_MUDO = "X";
const ICONE_SEM_AUDIO = String.fromCodePoint(0x1F507);
const chatCounter = document.querySelector(".chat-counter");
const chatCounterDigits = chatCounter ? chatCounter.querySelectorAll(".chat-counter__digit") : [];

const atualizarContadorPerguntas = () => {
    if (chatCounterDigits.length) {
        chatCounterDigits.forEach((digito) => {
            const passo = Number(digito.dataset.step || "0");
            if (passo && passo <= totalRespostasValidas) {
                digito.classList.add("is-active");
            } else {
                digito.classList.remove("is-active");
            }
        });
    }
    if (chatCounter) {
        let descricao = "Nenhuma execução gerada ainda.";
        if (totalRespostasValidas === 1) {
            descricao = "1 execução concluída de 6.";
        } else if (totalRespostasValidas > 1) {
            descricao = totalRespostasValidas + " execuções concluídas de 6.";
        }
        chatCounter.setAttribute("aria-label", descricao);
    }
};

const removerMensagemContinuar = () => {
    if (botaoContinuarChat) {
        botaoContinuarChat.remove();
        botaoContinuarChat = null;
    }
    if (mensagemContinuarElemento) {
        const parent = mensagemContinuarElemento.parentElement;
        mensagemContinuarElemento.remove();
        mensagemContinuarElemento = null;
        if (parent && !parent.querySelector(".answer")) {
            parent.remove();
        }
    }
};

const anexarBotaoContinuar = (destino) => {
    if (!destino || botaoContinuarChat || chatEncerrado) {
        return;
    }
    botaoContinuarChat = document.createElement("button");
    botaoContinuarChat.type = "button";
    botaoContinuarChat.className = "chat-continue";
    botaoContinuarChat.textContent = "Continuar";
    botaoContinuarChat.addEventListener("click", executarContinuacaoChat);
    destino.appendChild(botaoContinuarChat);
    botaoContinuarChat.focus();
};

const solicitarContinuacaoChat = (pergunta, placeholderElemento) => {
    if (solicitacaoContinuarAtiva || chatEncerrado) {
        return;
    }
    removerMensagemContinuar();
    solicitacaoContinuarAtiva = true;
    perguntaPendente = pergunta;
    placeholderPendente = placeholderElemento;

    if (placeholderElemento) {
        placeholderElemento.textContent = "Clique no bot\u00e3o Continuar para seguir com a conversa.";
        placeholderElemento.classList.remove("answer--placeholder");
    }

    const botaoEnviar = andersonAIChatForm ? andersonAIChatForm.querySelector(".anderson-ai-chat__send") : null;
    if (botaoEnviar) {
        botaoEnviar.disabled = true;
    }
    if (andersonAIChatInput) {
        andersonAIChatInput.disabled = true;
        andersonAIChatInput.placeholder = "Use o bot\u00e3o Continuar para prosseguir.";
    }
    if (andersonAIChatStatus) {
        andersonAIChatStatus.textContent = MENSAGEM_CONTINUAR_CHAT;
    }
    const respostaAviso = adicionarMensagemAI(MENSAGEM_CONTINUAR_CHAT, "bot");
    mensagemContinuarElemento = respostaAviso;
    const destino = respostaAviso && respostaAviso.parentElement
        ? respostaAviso.parentElement
        : (andersonAIChatMessages ? andersonAIChatMessages.lastElementChild : null);
    anexarBotaoContinuar(destino);
};

const encerrarChatDefinitivo = () => {
    if (chatEncerrado) {
        return;
    }
    chatEncerrado = true;
    removerMensagemContinuar();
    aguardandoConfirmacaoContinuar = false;
    solicitacaoContinuarAtiva = false;
    perguntaPendente = null;
    placeholderPendente = null;
    const botaoEnviar = andersonAIChatForm ? andersonAIChatForm.querySelector(".anderson-ai-chat__send") : null;
    if (botaoEnviar) {
        botaoEnviar.disabled = false;
    }
    if (andersonAIChatInput) {
        andersonAIChatInput.disabled = false;
        andersonAIChatInput.placeholder = PLACEHOLDER_CHAT_ENCERRADO;
    }
    if (botaoContinuarChat) {
        botaoContinuarChat.remove();
        botaoContinuarChat = null;
    }
    mensagemEncerramentoElemento = adicionarMensagemAI(MENSAGEM_ENCERRAMENTO_CHAT, "bot");
    if (andersonAIChatStatus) {
        andersonAIChatStatus.textContent = MENSAGEM_ENCERRAMENTO_CHAT;
    }
};

const executarContinuacaoChat = () => {
    if (!solicitacaoContinuarAtiva || !perguntaPendente) {
        return;
    }
    aguardandoConfirmacaoContinuar = false;
    solicitacaoContinuarAtiva = false;

    const perguntaParaEnviar = perguntaPendente;
    const placeholderParaAtualizar = placeholderPendente;
    perguntaPendente = null;
    placeholderPendente = null;

    removerMensagemContinuar();

    const botaoEnviar = andersonAIChatForm ? andersonAIChatForm.querySelector(".anderson-ai-chat__send") : null;
    if (botaoEnviar) {
        botaoEnviar.disabled = false;
    }
    if (andersonAIChatInput) {
        andersonAIChatInput.disabled = false;
        andersonAIChatInput.placeholder = placeholderPadrao;
    }
    if (andersonAIChatStatus && andersonAIChatStatus.textContent === MENSAGEM_CONTINUAR_CHAT) {
        andersonAIChatStatus.textContent = "";
    }

    if (placeholderParaAtualizar) {
        placeholderParaAtualizar.textContent = "Pensando...";
        placeholderParaAtualizar.classList.add("answer--placeholder");
    }

    enviarPerguntaParaIA(perguntaParaEnviar, placeholderParaAtualizar).catch((erro) => {
        console.error("[Anderson.AI][Continuar] Falha ao reenviar pergunta ap\u00f3s confirma\u00e7\u00e3o:", erro);
    });
};

const registrarRespostaValida = () => {
    totalRespostasValidas += 1;
    atualizarContadorPerguntas();
    if (totalRespostasValidas >= LIMITE_ENCERRAMENTO_CHAT) {
        encerrarChatDefinitivo();
        return;
    }
    if (!aguardandoConfirmacaoContinuar && totalRespostasValidas === LIMITE_CONTINUAR_CHAT) {
        aguardandoConfirmacaoContinuar = true;
    }
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
    let cancelamentoSolicitado = false;
    let ttsInicializado = false;

    const MAX_TTS_TENTATIVAS = 3;
    const TTS_INTERVALO_APOS_CANCELAR = 140;
    const IDIOMA_PADRAO_TTS = "pt-BR";
    const isIOS = /iP(hone|od|ad)/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "");
    const DETECTOR_FALA_TIMEOUT = isMobile ? 4000 : 1500;
    const normalizarCodigoIdioma = (codigo) => {
        if (!codigo) {
            return "";
        }
        return String(codigo).toLowerCase().replace(/_/g, "-");
    };
    const idiomasSaoCompatíveis = (codigoVoz, codigoDesejado) => {
        const vozNorm = normalizarCodigoIdioma(codigoVoz);
        const desejadoNorm = normalizarCodigoIdioma(codigoDesejado);
        if (!vozNorm || !desejadoNorm) {
            return false;
        }
        if (vozNorm === desejadoNorm) {
            return true;
        }
        const baseVoz = vozNorm.split("-")[0];
        const baseDesejado = desejadoNorm.split("-")[0];
        return baseVoz === baseDesejado;
    };

    if (ttsLangSelect && !ttsLangSelect.dataset.preferredLang) {
        ttsLangSelect.dataset.preferredLang = IDIOMA_PADRAO_TTS;
    }

    const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const normalizarTextoParaFala = (texto) => texto.replace(/\s+/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

    const selecionarVozParaTentativa = (voices, tentativaAtual) => {
        const lista = Array.isArray(voices) ? voices : Array.from(voices || []);
        if (!lista.length) {
            return null;
        }

        if (tentativaAtual === 1 && ttsVoiceSelect && !ttsVoiceSelect.disabled && ttsVoiceSelect.value) {
            const preferida = lista.find((voz) => voz.voiceURI === ttsVoiceSelect.value);
            if (preferida) {
                return preferida;
            }
        }

        const candidatos = [];
        const idiomaSelecionado = ttsLangSelect ? (ttsLangSelect.value || ttsLangSelect.dataset.preferredLang || IDIOMA_PADRAO_TTS) : IDIOMA_PADRAO_TTS;
        const idiomaNavegador = navigator.language || "";

        if (idiomaSelecionado) {
            candidatos.push((voz) => idiomasSaoCompatíveis(voz.lang, idiomaSelecionado) && voz.localService);
            candidatos.push((voz) => idiomasSaoCompatíveis(voz.lang, idiomaSelecionado));
        }
        if (idiomaNavegador) {
            candidatos.push((voz) => idiomasSaoCompatíveis(voz.lang, idiomaNavegador) && voz.localService);
            candidatos.push((voz) => idiomasSaoCompatíveis(voz.lang, idiomaNavegador));
        }

        candidatos.push((voz) => normalizarCodigoIdioma(voz.lang).startsWith("pt") && voz.localService);
        candidatos.push((voz) => normalizarCodigoIdioma(voz.lang).startsWith("pt"));
        candidatos.push((voz) => voz.default);
        candidatos.push((voz) => voz.localService);

        for (const criterio of candidatos) {
            const encontrada = lista.find(criterio);
            if (encontrada) {
                return encontrada;
            }
        }

        return lista[0];
    };

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

    const inicializarTTSSeNecessario = async () => {
        if (!speechDisponivel || ttsInicializado) {
            return;
        }
        try {
            await new Promise((resolve) => {
                let finalizado = false;
                const finalizar = () => {
                    if (finalizado) {
                        return;
                    }
                    finalizado = true;
                    resolve();
                };
                const desbloqueio = new SpeechSynthesisUtterance(" ");
                desbloqueio.volume = 0;
                desbloqueio.rate = 1;
                desbloqueio.pitch = 1;
                desbloqueio.onerror = finalizar;
                desbloqueio.onend = () => {
                    const filler = new SpeechSynthesisUtterance("Anderson AI pronto.");
                    filler.volume = 0.05;
                    filler.rate = 0.8;
                    filler.pitch = 0.9;
                    filler.lang = IDIOMA_PADRAO_TTS;
                    filler.onerror = finalizar;
                    filler.onend = finalizar;
                    try {
                        window.speechSynthesis.speak(filler);
                        if (typeof window.speechSynthesis.resume === "function") {
                            window.speechSynthesis.resume();
                        }
                    } catch (erroFiller) {
                        console.warn("[Anderson.AI][TTS] Falha ao reproduzir filler:", erroFiller);
                        finalizar();
                    }
                };
                try {
                    window.speechSynthesis.speak(desbloqueio);
                    if (typeof window.speechSynthesis.resume === "function") {
                        window.speechSynthesis.resume();
                    }
                } catch (erroDesbloqueio) {
                    console.warn("[Anderson.AI][TTS] Falha ao tentar desbloquear TTS:", erroDesbloqueio);
                    finalizar();
                }
                window.setTimeout(finalizar, 1200);
            });
        } finally {
            ttsInicializado = true;
            carregarVozes();
        }
    };

    const popularIdiomas = (voices) => {
        if (!ttsLangSelect) {
            return;
        }
        const idiomaPreferido = ttsLangSelect.dataset.preferredLang || IDIOMA_PADRAO_TTS;
        const idiomaAnterior = ttsLangSelect.value;
        let idiomaAtual = idiomaAnterior || idiomaPreferido;
        ttsLangSelect.innerHTML = "";
        const opcaoAuto = document.createElement("option");
        opcaoAuto.value = "";
        opcaoAuto.textContent = "Automatico";
        ttsLangSelect.appendChild(opcaoAuto);

        const idiomasUnicos = [];
        voices.forEach((voz) => {
            const langOriginal = voz.lang || "";
            if (!langOriginal) {
                return;
            }
            if (!idiomasUnicos.some((item) => idiomasSaoCompatíveis(item, langOriginal))) {
                idiomasUnicos.push(langOriginal);
            }
        });
        idiomasUnicos.sort((a, b) => obterNomeIdioma(a).localeCompare(obterNomeIdioma(b), "pt-BR"));

        idiomasUnicos.forEach((lang) => {
            const option = document.createElement("option");
            option.value = lang;
            option.textContent = obterNomeIdioma(lang);
            ttsLangSelect.appendChild(option);
        });

        const encontrarIdiomaDisponivel = (alvo) => idiomasUnicos.find((lang) => idiomasSaoCompatíveis(lang, alvo));

        let idiomaEncontrado = null;

        const opcaoPtBr = idiomasUnicos.find((lang) => normalizarCodigoIdioma(lang) === "pt-br");
        if (opcaoPtBr) {
            idiomaEncontrado = opcaoPtBr;
        }

        if (!idiomaEncontrado && idiomaAtual) {
            idiomaEncontrado = encontrarIdiomaDisponivel(idiomaAtual);
        }
        if (!idiomaEncontrado) {
            idiomaEncontrado = encontrarIdiomaDisponivel(IDIOMA_PADRAO_TTS);
        }
        if (!idiomaEncontrado && idiomasUnicos.length) {
            idiomaEncontrado = idiomasUnicos.find((lang) => normalizarCodigoIdioma(lang).startsWith("pt")) || idiomasUnicos[0];
        }

        if (idiomaEncontrado) {
            ttsLangSelect.value = idiomaEncontrado;
            idiomaAtual = idiomaEncontrado;
        } else {
            idiomaAtual = "";
            ttsLangSelect.value = "";
        }

        ttsLangSelect.dataset.preferredLang = idiomaAtual || IDIOMA_PADRAO_TTS;
    };

    const popularVozes = (voices, lang) => {
        if (!ttsVoiceSelect) {
            return;
        }
        const selecionada = ultimaVozSelecionada;
        ttsVoiceSelect.innerHTML = "";
        const filtroIdioma = lang || IDIOMA_PADRAO_TTS;
        let filtradas = filtroIdioma ? voices.filter((voz) => idiomasSaoCompatíveis(voz.lang, filtroIdioma)) : voices;
        if (!filtradas.length && filtroIdioma) {
            const baseFiltro = normalizarCodigoIdioma(filtroIdioma).split("-")[0];
            filtradas = voices.filter((voz) => normalizarCodigoIdioma(voz.lang).startsWith(baseFiltro));
        }
        if (!filtradas.length) {
            const fallbackPt = voices.filter((voz) => normalizarCodigoIdioma(voz.lang).startsWith("pt"));
            filtradas = fallbackPt.length ? fallbackPt : voices;
        }

        if (!filtradas.length) {
            ttsVoiceSelect.disabled = true;
            const option = document.createElement("option");
            option.textContent = "Nenhuma voz disponivel";
            ttsVoiceSelect.appendChild(option);
            return;
        }

        filtradas.sort((a, b) => {
            const langA = normalizarCodigoIdioma(a.lang);
            const langB = normalizarCodigoIdioma(b.lang);
            const prioridade = (lang) => {
                if (!lang) {
                    return 3;
                }
                if (lang === "pt-br") {
                    return 0;
                }
                if (lang.startsWith("pt")) {
                    return 1;
                }
                return 2;
            };
            const diff = prioridade(langA) - prioridade(langB);
            if (diff !== 0) {
                return diff;
            }
            if (b.localService && !a.localService) {
                return 1;
            }
            if (a.localService && !b.localService) {
                return -1;
            }
            return a.name.localeCompare(b.name);
        });

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
        const idiomaAtual = ttsLangSelect ? (ttsLangSelect.value || IDIOMA_PADRAO_TTS) : IDIOMA_PADRAO_TTS;
        popularVozes(vozesDisponiveis, idiomaAtual);
    };
    const obterVozesDisponiveis = () => {
        if (!speechDisponivel) {
            return [];
        }
        if (vozesDisponiveis.length) {
            return vozesDisponiveis;
        }
        carregarVozes();
        if (vozesDisponiveis.length) {
            return vozesDisponiveis;
        }
        const vozes = window.speechSynthesis.getVoices().filter((voz) => voz.lang);
        if (vozes.length) {
            vozesDisponiveis = vozes.sort((a, b) => a.name.localeCompare(b.name));
            popularIdiomas(vozesDisponiveis);
            const idiomaAtual = ttsLangSelect ? (ttsLangSelect.value || IDIOMA_PADRAO_TTS) : IDIOMA_PADRAO_TTS;
            popularVozes(vozesDisponiveis, idiomaAtual);
        }
        return vozesDisponiveis;
    };


    const atualizarIdiomaPadrao = () => {
        if (!speechDisponivel || !ttsLangSelect) {
            return;
        }
        const preferido = ttsLangSelect.dataset.preferredLang || IDIOMA_PADRAO_TTS;
        const opcoes = Array.from(ttsLangSelect.options);
        if (opcoes.some((opt) => opt.value === preferido) && ttsLangSelect.value !== preferido) {
            ttsLangSelect.value = preferido;
            popularVozes(vozesDisponiveis, preferido);
        }
    };

    const interromperLeitura = (mensagem) => {
        if (!speechDisponivel) {
            return;
        }
        if (window.speechSynthesis.speaking || ttsEmExecucao || window.speechSynthesis.pending || window.speechSynthesis.paused) {
            cancelamentoSolicitado = true;
            window.speechSynthesis.cancel();
        }
        ttsEmExecucao = false;
        atualizarEstadoBotaoTTS();
        if (mensagem && andersonAIChatStatus) {
            andersonAIChatStatus.textContent = mensagem;
        }
    };

    const fracionarTextoParaFala = (texto, tamanhoMaximo = 220) => {
        const partes = [];
        let restante = texto;
        while (restante.length > tamanhoMaximo) {
            let indiceCorte = restante.lastIndexOf(".", tamanhoMaximo);
            if (indiceCorte === -1) {
                indiceCorte = restante.lastIndexOf(" ", tamanhoMaximo);
            }
            if (indiceCorte === -1) {
                indiceCorte = tamanhoMaximo;
            }
            partes.push(restante.slice(0, indiceCorte + 1).trim());
            restante = restante.slice(indiceCorte + 1).trim();
        }
        if (restante.trim().length) {
            partes.push(restante.trim());
        }
        return partes.filter(Boolean);
    };

    const falarUltimaResposta = (tentativaAtual = 1) => {
        if (!speechDisponivel) {
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Leitura por voz nao suportada neste navegador.";
            }
            return;
        }

        const textoNormalizado = normalizarTextoParaFala(ultimaRespostaFalada);
        if (!textoNormalizado) {
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Ainda nao tenho nenhuma resposta para ler.";
            }
            return;
        }

        const voices = obterVozesDisponiveis();
        const listaVozes = Array.isArray(voices) ? voices : Array.from(voices || []);
        if (!listaVozes.length && tentativaAtual < MAX_TTS_TENTATIVAS) {
            window.setTimeout(() => falarUltimaResposta(tentativaAtual + 1), 200);
            return;
        }
        if (!listaVozes.length) {
            if (andersonAIChatStatus) {
                andersonAIChatStatus.textContent = "Nenhuma voz sintetica disponivel neste navegador.";
            }
            return;
        }

        const vozSelecionada = selecionarVozParaTentativa(listaVozes, tentativaAtual);
        let linguaPreferida = "";
        if (!isIOS && vozSelecionada) {
            linguaPreferida = vozSelecionada.lang || "";
        } else if (ttsLangSelect) {
            linguaPreferida = ttsLangSelect.value || ttsLangSelect.dataset.preferredLang || IDIOMA_PADRAO_TTS;
        } else {
            linguaPreferida = navigator.language || IDIOMA_PADRAO_TTS;
        }

        const segmentos = fracionarTextoParaFala(textoNormalizado);
        let indiceSegmento = 0;
        let verificadorInicio = null;
        let verificadorFala = null;
        let falaIniciada = false;

        const limparMonitores = () => {
            if (verificadorInicio) {
                clearTimeout(verificadorInicio);
                verificadorInicio = null;
            }
            if (verificadorFala) {
                clearTimeout(verificadorFala);
                verificadorFala = null;
            }
        };

        const finalizarLeitura = () => {
            limparMonitores();
            cancelamentoSolicitado = false;
            ttsEmExecucao = false;
            atualizarEstadoBotaoTTS();
            if (andersonAIChatStatus) {
                const statusAtual = andersonAIChatStatus.textContent;
                if (statusAtual === "Lendo resposta..." || statusAtual === "Ajustando voz... tentando novamente." || statusAtual === "Nao consegui usar esta voz, tentando outra...") {
                    andersonAIChatStatus.textContent = "";
                }
            }
        };

        const tratarErroGenerico = (codigoErro, evento, ehSegmento) => {
            limparMonitores();
            ttsEmExecucao = false;
            atualizarEstadoBotaoTTS();
            window.speechSynthesis.cancel();
            const canceladoManual = cancelamentoSolicitado && (codigoErro === "interrupted" || codigoErro === "canceled");
            cancelamentoSolicitado = false;
            if (canceladoManual) {
                return;
            }
            if (tentativaAtual < MAX_TTS_TENTATIVAS && (codigoErro === "synthesis-failed" || codigoErro === "audio-busy" || codigoErro === "interrupted" || ehSegmento)) {
                console.warn("[Anderson.AI][TTS] Falha na tentativa " + tentativaAtual + " (" + codigoErro + "). Tentando outra voz.", evento);
                if (andersonAIChatStatus) {
                    andersonAIChatStatus.textContent = "Nao consegui usar esta voz, tentando outra...";
                }
                window.setTimeout(() => {
                    try {
                        falarUltimaResposta(tentativaAtual + 1);
                    } catch (erroFallback) {
                        console.error("[Anderson.AI][TTS] Falha ao tentar fallback de voz:", erroFallback);
                    }
                }, 200);
                return;
            }
            if (andersonAIChatStatus) {
                const detalheErro = codigoErro ? " (" + codigoErro + ")" : "";
                andersonAIChatStatus.textContent = "Nao foi possivel sintetizar a voz" + detalheErro + ".";
            }
        };

        const configurarUtterance = (conteudoSegmento, ehUltimo) => {
            const utter = new SpeechSynthesisUtterance(conteudoSegmento);
            utter.volume = 1;
            utter.pitch = 1;
            if (ttsRateInput) {
                utter.rate = Number(ttsRateInput.value) || 1;
            }
            if (!isIOS && vozSelecionada) {
                utter.voice = vozSelecionada;
                if (vozSelecionada.lang) {
                    utter.lang = vozSelecionada.lang;
                }
                ultimaVozSelecionada = vozSelecionada.voiceURI;
                if (ttsVoiceSelect && !ttsVoiceSelect.disabled) {
                    ttsVoiceSelect.value = vozSelecionada.voiceURI;
                }
            }
            if (!utter.lang && linguaPreferida) {
                utter.lang = linguaPreferida;
            }
            if (!utter.lang && navigator.language) {
                utter.lang = navigator.language;
            }
            utter.onstart = () => {
                falaIniciada = true;
                if (verificadorInicio) {
                    clearTimeout(verificadorInicio);
                    verificadorInicio = null;
                }
            };
            utter.onend = () => {
                limparMonitores();
                if (!ehUltimo && !cancelamentoSolicitado) {
                    indiceSegmento += 1;
                    reproduzirSegmento();
                } else {
                    finalizarLeitura();
                }
            };
            utter.onerror = (evento) => {
                const codigoErro = evento && evento.error ? evento.error : "";
                tratarErroGenerico(codigoErro, evento, true);
            };
            return utter;
        };

        const iniciarComSeguranca = (utter) => {
            const iniciar = () => {
                try {
                    window.speechSynthesis.speak(utter);
                    if (typeof window.speechSynthesis.resume === "function" && window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    }
                } catch (erroSpeak) {
                    console.error("[Anderson.AI][TTS] Falha ao chamar speak:", erroSpeak);
                    tratarErroGenerico("speak-error", erroSpeak, true);
                }
            };

            if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
                window.speechSynthesis.cancel();
                window.setTimeout(iniciar, TTS_INTERVALO_APOS_CANCELAR);
            } else if (isMobile) {
                window.setTimeout(iniciar, 0);
            } else {
                iniciar();
            }
        };

        const reproduzirSegmento = () => {
            if (indiceSegmento >= segmentos.length) {
                finalizarLeitura();
                return;
            }
            falaIniciada = false;
            const ehUltimo = indiceSegmento === segmentos.length - 1;
            const utter = configurarUtterance(segmentos[indiceSegmento], ehUltimo);
            iniciarComSeguranca(utter);

            verificadorInicio = window.setTimeout(() => {
                if (!falaIniciada && !window.speechSynthesis.speaking) {
                    tratarErroGenerico("no-start", null, true);
                }
            }, isMobile ? 700 : 400);

            if (!isIOS) {
                verificadorFala = window.setTimeout(() => {
                    if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                        tratarErroGenerico("not-speaking", null, true);
                    }
                }, DETECTOR_FALA_TIMEOUT);
            }
        };

        if (andersonAIChatStatus) {
            andersonAIChatStatus.textContent = tentativaAtual === 1 ? "Lendo resposta..." : "Ajustando voz... tentando novamente.";
        }
        ttsEmExecucao = true;
        cancelamentoSolicitado = false;
        atualizarEstadoBotaoTTS();

        reproduzirSegmento();
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
        ttsConfigButton.addEventListener("click", async () => {
            if (!speechDisponivel) {
                return;
            }
            await inicializarTTSSeNecessario().catch((erro) => {
                console.warn("[Anderson.AI][TTS] Falha ao inicializar TTS ao abrir menu:", erro);
            });
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
            const respostaValida = respostaExtraida !== FALLBACK_MENSAGEM_AI;

            if (placeholderElemento) {
                placeholderElemento.textContent = respostaExtraida;
                placeholderElemento.classList.remove("answer--placeholder");
            } else {
                adicionarMensagemAI(respostaExtraida, "bot");
            }

            ultimaRespostaFalada = respostaExtraida;

            if (respostaValida) {
                registrarRespostaValida();
            }

            if (andersonAIChatStatus) {
                if (!respostaValida) {
                    andersonAIChatStatus.textContent = FALLBACK_MENSAGEM_AI;
                } else if (!chatEncerrado && !solicitacaoContinuarAtiva) {
                    andersonAIChatStatus.textContent = "";
                }
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
                if (chatEncerrado) {
                    andersonAIChatInput.disabled = false;
                    andersonAIChatInput.placeholder = PLACEHOLDER_CHAT_ENCERRADO;
                } else {
                    andersonAIChatInput.disabled = false;
                    andersonAIChatInput.placeholder = placeholderPadrao;
                    andersonAIChatInput.focus();
                }
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
            const acionarLeitura = () => {
                if (ttsEmExecucao || window.speechSynthesis.speaking) {
                    interromperLeitura("Leitura interrompida.");
                    return;
                }
                if (ttsMenu && !ttsMenu.classList.contains("oculto")) {
                    fecharMenuTTS();
                }
                try {
                    falarUltimaResposta();
                } catch (erro) {
                    console.error("[Anderson.AI][TTS] Falha ao iniciar leitura:", erro);
                    if (andersonAIChatStatus) {
                        andersonAIChatStatus.textContent = "Nao consegui iniciar a leitura de voz.";
                    }
                }
            };

            ttsButton.addEventListener("click", () => {
                inicializarTTSSeNecessario().catch((erro) => {
                    console.warn("[Anderson.AI][TTS] Falha ao preparar TTS:", erro);
                });
                acionarLeitura();
            });
        }
    }

    if (ttsLangSelect) {
        ttsLangSelect.addEventListener("change", () => {
            ultimaVozSelecionada = "";
            const valorSelecionado = ttsLangSelect.value;
            ttsLangSelect.dataset.preferredLang = valorSelecionado || IDIOMA_PADRAO_TTS;
            popularVozes(vozesDisponiveis, valorSelecionado || IDIOMA_PADRAO_TTS);
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

    if (speechDisponivel) {
        const eventosDesbloqueio = ["click", "touchend"];
        const prepararTTS = () => {
            inicializarTTSSeNecessario().catch((erro) => {
                console.warn("[Anderson.AI][TTS] Falha ao desbloquear TTS via interacao:", erro);
            });
        };
        eventosDesbloqueio.forEach((eventoNome) => {
            document.addEventListener(eventoNome, prepararTTS, { once: true, passive: true });
        });
    }

    if (btnAndersonAI) {
        btnAndersonAI.addEventListener("click", () => {
            const deveAbrir = andersonAIChat.classList.contains("oculto");
            toggleAndersonAIChat(deveAbrir);
            if (speechDisponivel) {
                inicializarTTSSeNecessario().catch((erro) => {
                    console.warn("[Anderson.AI][TTS] Falha ao preparar TTS ao abrir o chat:", erro);
                });
            }
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
            if (chatEncerrado) {
                return;
            }
            andersonAIChatInput.placeholder = placeholderPadrao;
            if (andersonAIChatStatus && !solicitacaoContinuarAtiva) {
                andersonAIChatStatus.textContent = "";
            }
        });
    } if (andersonAIChatForm) {
        andersonAIChatForm.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            if (solicitacaoContinuarAtiva) {
                if (andersonAIChatStatus) {
                    andersonAIChatStatus.textContent = MENSAGEM_CONTINUAR_CHAT;
                }
                return;
            }

            const pergunta = andersonAIChatInput ? andersonAIChatInput.value.trim() : "";
            if (!pergunta) {
                if (andersonAIChatStatus) {
                    andersonAIChatStatus.textContent = "Digite uma pergunta para continuar.";
                }
                return;
            }

            adicionarMensagemAI(pergunta, "user");
            if (andersonAIChatInput) {
                andersonAIChatInput.value = "";
            }
            if (chatEncerrado) {
                adicionarMensagemAI(MENSAGEM_APOS_ENCERRAMENTO, "bot");
                if (andersonAIChatStatus) {
                    andersonAIChatStatus.textContent = MENSAGEM_APOS_ENCERRAMENTO;
                }
                return;
            }

            if (andersonAIChatInput) {
                andersonAIChatInput.placeholder = placeholderPensando;
            }
            const placeholderResposta = adicionarMensagemAI("Pensando...", "placeholder");

            if (aguardandoConfirmacaoContinuar && !solicitacaoContinuarAtiva) {
                if (placeholderResposta) {
                    placeholderResposta.classList.remove("answer--placeholder");
                }
                solicitarContinuacaoChat(pergunta, placeholderResposta);
                return;
            }

            await enviarPerguntaParaIA(pergunta, placeholderResposta);
            if (placeholderResposta) {
                placeholderResposta.classList.remove("answer--placeholder");
            }
        });
    }
    atualizarContadorPerguntas();
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
const N8N_ENDPOINT = "https://unexhaustively-extendible-jeni.ngrok-free.dev/webhook/grafico-evolucao";// <= Atualiza A cada 30 minutos via ngrok-free.dev
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
                            Accept: "application/json",
                            "Cache-Control": "no-cache",
                            "ngrok-skip-browser-warning": "true"
                        },
                        mode: "cors",
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

                    if (typeof carga === "string") {
                        const textoNormalizado = carga.trim();
                        if (textoNormalizado.startsWith("{") || textoNormalizado.startsWith("[")) {
                            try {
                                carga = JSON.parse(textoNormalizado);
                            } catch (erroParseTexto) {
                                console.warn("[Grafico] Nao foi possivel converter texto em JSON valido:", erroParseTexto);
                            }
                        } else if (/<!DOCTYPE html>/i.test(textoNormalizado) || /<html/i.test(textoNormalizado)) {
                            console.warn("[Grafico] Resposta do webhook parece HTML. Verifique o cabecalho ngrok-skip-browser-warning no n8n.");
                        }
                    }

                    const limitesDetectados = extrairLimitesDaCarga(carga);
                    const horarioConsulta = formatarHorario();

                    if (Object.keys(limitesDetectados).length) {
                        aplicarLimites(limitesDetectados);
                        atualizarStatusGrafico(`Dados do n8n as ${horarioConsulta}: ${montarResumoLimites()}.`);
                    } else {
                        atualizarStatusGrafico(`n8n sem novos dados as ${horarioConsulta}. Limites atuais: ${montarResumoLimites()}.`);
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






const videoDelayTimers = new Map();

const ajustarVideosDeFundo = () => {
    const largura = window.innerWidth || document.documentElement.clientWidth;
    const videos = Array.from(document.querySelectorAll(".caixa-video__video"));

    videos.forEach((video) => {
        if (videoDelayTimers.has(video)) {
            clearTimeout(videoDelayTimers.get(video));
            videoDelayTimers.delete(video);
        }

        const estilos = window.getComputedStyle(video);
        const visivel = estilos.display !== "none" && estilos.visibility !== "hidden";
        const delaySegundos = Number(video.dataset.delay || 0);
        const offsetSegundos = Number(video.dataset.offset || 0);

        const aplicarOffset = () => {
            if (offsetSegundos > 0 && video.duration && isFinite(video.duration)) {
                const normalizado = offsetSegundos % video.duration;
                if (!Number.isNaN(normalizado)) {
                    try {
                        video.currentTime = normalizado;
                    } catch (erroOffset) {
                        console.warn("[Background Video] Nao foi possivel ajustar offset:", erroOffset);
                    }
                }
            } else if (offsetSegundos <= 0) {
                try {
                    video.currentTime = 0;
                } catch (erroReset) {
                    console.warn("[Background Video] Falha ao reiniciar video:", erroReset);
                }
            }
        };

        const removerLoopHandler = () => {
            if (video._backgroundLoopHandler) {
                video.removeEventListener("ended", video._backgroundLoopHandler);
                delete video._backgroundLoopHandler;
            }
        };

        const garantirLoopHandler = () => {
            if (video._backgroundLoopHandler) {
                return;
            }
            const handler = () => {
                const larguraAtual = window.innerWidth || document.documentElement.clientWidth;
                if (larguraAtual <= 768) {
                    aplicarOffset();
                    const promessaReexec = video.play();
                    if (promessaReexec && typeof promessaReexec.then === "function") {
                        promessaReexec.catch(() => {});
                    }
                }
            };
            video._backgroundLoopHandler = handler;
            video.addEventListener("ended", handler);
        };

        const iniciarVideo = () => {
            aplicarOffset();
            video.style.opacity = 1;
            const promessa = video.play();
            if (promessa && typeof promessa.then === "function") {
                promessa.catch((erroPlay) => {
                    if (erroPlay && erroPlay.name === "AbortError") {
                        // Reproduzir e pausar em sequencia gera AbortError; ignoramos para evitar ruido no console.
                        return;
                    }
                    console.warn("[Background Video] Falha ao reproduzir video:", erroPlay);
                });
            }
        };

        const prepararReproducao = () => {
            if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
                iniciarVideo();
            } else {
                video.addEventListener("loadedmetadata", iniciarVideo, { once: true });
            }
        };

        if (visivel && largura <= 768) {
            video.pause();
            video.style.opacity = 0;
            garantirLoopHandler();
            aplicarOffset();
            if (delaySegundos <= 0) {
                prepararReproducao();
            } else {
                const temporizador = window.setTimeout(() => {
                    prepararReproducao();
                    videoDelayTimers.delete(video);
                }, delaySegundos * 1000);
                videoDelayTimers.set(video, temporizador);
            }
        } else if (visivel) {
            video.pause();
            video.style.opacity = 1;
            removerLoopHandler();
            aplicarOffset();
            const promessa = video.play();
            if (promessa && typeof promessa.then === "function") {
                promessa.catch((erroPlay) => {
                    if (erroPlay && erroPlay.name === "AbortError") {
                        return;
                    }
                    console.warn("[Background Video] Falha ao reproduzir video (desktop):", erroPlay);
                });
            }
        } else {
            video.pause();
            video.style.opacity = 0;
            removerLoopHandler();
        }
    });
};

document.addEventListener("DOMContentLoaded", ajustarVideosDeFundo);
window.addEventListener("resize", ajustarVideosDeFundo);
window.addEventListener("orientationchange", ajustarVideosDeFundo);
ajustarVideosDeFundo();















































