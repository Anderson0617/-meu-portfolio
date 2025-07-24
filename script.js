
const btnSobre = document.getElementById("btnSobre");
const caixaSobre = document.getElementById("caixaSobre");

btnSobre.addEventListener('click', () => {
    btnSobre.classList.add('clicked');
    
    caixaSobre.classList.toggle('mostrar');

    setTimeout(() => {
        btnSobre.classList.remove('clicked');
    }, 200);
});

