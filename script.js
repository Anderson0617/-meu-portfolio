const btnSobre = document.getElementById("btnSobre");
const caixaSobre = document.getElementById("caixaSobre");
const toggleTema = document.getElementById("toggleTema");

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
        rastro.style.left = `${evento.pageX}px`;
        rastro.style.top = `${evento.pageY}px`;
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
