const btnSobre = document.getElementById("btnSobre");
const caixaSobre = document.getElementById("caixaSobre");
const toggleTema = document.getElementById("toggleTema");
const btnMusicas = document.getElementById("btnMusicas");
const playerMusicas = document.getElementById("playerMusicas");
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

if (btnMusicas && playerMusicas) {
    btnMusicas.addEventListener("click", () => {
        const estaOculto = playerMusicas.classList.toggle("oculto");
        playerMusicas.setAttribute("aria-hidden", estaOculto ? "true" : "false");
        btnMusicas.setAttribute("aria-expanded", estaOculto ? "false" : "true");
    });
}


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

const prefereMenosMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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





