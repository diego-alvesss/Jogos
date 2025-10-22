const palavras = [
    {
        palavra: "girassol",
        dicas: [
            "É uma planta.",
            "Tem pétalas amarelas.",
            "Gira em direção ao sol.",
            "Usada para óleo.",
            "Muito vista em campos no verão."
        ]
    },
    {
        palavra: "computador",
        dicas: [
            "Objeto de tecnologia.",
            "Tem teclado e tela.",
            "Usado para programar.",
            "Pode ser de mesa ou portátil.",
            "Processa dados rapidamente."
        ]
    },
    {
        palavra: "oceano",
        dicas: [
            "Grande extensão.",
            "Tem água salgada.",
            "Abriga muitos seres vivos.",
            "É azul visto do espaço.",
            "Cobre boa parte do planeta."
        ]
    },
    {
        palavra: "abacaxi",
        dicas: [
            "Fruta tropical.",
            "Tem coroa.",
            "Casca espinhosa.",
            "Sabor marcante.",
            "Usada em sucos e doces."
        ]
    },
    {
        palavra: "astronauta",
        dicas: [
            "Profissão.",
            "Viaja para longe.",
            "Precisa de traje especial.",
            "Treina em gravidade zero.",
            "Explora o desconhecido."
        ]
    }
];

let sorteio, palavra, dicas, dicaIndex;
let letrasCorretas = [];
let letrasTentadas = [];
let erros = 0;
const maxErros = 6;

const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas.getContext('2d');
const dicaTexto = document.getElementById('dicaTexto');
const palavraDiv = document.getElementById('palavra');
const letrasTentadasSpan = document.getElementById('letrasTentadas');
const inputLetra = document.getElementById('inputLetra');
const btnTentar = document.getElementById('btnTentar');
const mensagemDiv = document.getElementById('mensagem');
const inputArrisque = document.getElementById('inputArrisque');
const btnArrisque = document.getElementById('btnArrisque');
const btnReiniciar = document.getElementById('btnReiniciar');
let palavrasRestantes = [...palavras];

function novoJogo() {
    if (palavrasRestantes.length === 0) {
        palavrasRestantes = [...palavras];
    }
    const idx = Math.floor(Math.random() * palavrasRestantes.length);
    sorteio = palavrasRestantes.splice(idx, 1)[0];
    palavra = sorteio.palavra;
    dicas = sorteio.dicas;
    dicaIndex = 0;
    letrasCorretas = [];
    letrasTentadas = [];
    erros = 0;
    dicaTexto.textContent = dicas[dicaIndex];
    mensagemDiv.textContent = "";
    inputLetra.value = "";
    inputLetra.disabled = false;
    btnTentar.disabled = false;
    inputArrisque.value = "";
    inputArrisque.disabled = false;
    btnArrisque.disabled = false;
    btnReiniciar.style.display = 'none';
    desenhar();
    atualizarPalavra();
    atualizarLetras();
}

function atualizarPalavra() {
    let display = "";
    for (let letra of palavra) {
        if (letrasCorretas.includes(letra)) {
            display += letra + " ";
        } else {
            display += "_ ";
        }
    }
    palavraDiv.textContent = display.trim();
}

function atualizarLetras() {
    letrasTentadasSpan.textContent = letrasTentadas.join(", ");
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Forca
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 280); ctx.lineTo(200, 280); // base
    ctx.moveTo(120, 280); ctx.lineTo(120, 60); // haste
    ctx.lineTo(220, 60); // topo
    ctx.lineTo(220, 90); // suporte
    ctx.stroke();
    // Cabeça
    if (erros > 0) {
        ctx.beginPath();
        ctx.arc(220, 110, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Tronco
    if (erros > 1) {
        ctx.beginPath();
        ctx.moveTo(220, 130); ctx.lineTo(220, 190);
        ctx.stroke();
    }
    // Braço 1
    if (erros > 2) {
        ctx.beginPath();
        ctx.moveTo(220, 140); ctx.lineTo(200, 170);
        ctx.stroke();
    }
    // Braço 2
    if (erros > 3) {
        ctx.beginPath();
        ctx.moveTo(220, 140); ctx.lineTo(240, 170);
        ctx.stroke();
    }
    // Perna 1
    if (erros > 4) {
        ctx.beginPath();
        ctx.moveTo(220, 190); ctx.lineTo(200, 230);
        ctx.stroke();
    }
    // Perna 2
    if (erros > 5) {
        ctx.beginPath();
        ctx.moveTo(220, 190); ctx.lineTo(240, 230);
        ctx.stroke();
    }
}

btnTentar.onclick = tentarLetra;
inputLetra.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') tentarLetra();
});

function tentarLetra() {
    let letra = inputLetra.value.toLowerCase();
    if (!letra.match(/^[a-záéíóúãõâêîôûç]$/i)) {
        mensagemDiv.textContent = "Digite uma letra válida.";
        inputLetra.value = "";
        return;
    }
    if (letrasTentadas.includes(letra)) {
        mensagemDiv.textContent = "Você já tentou essa letra.";
        inputLetra.value = "";
        return;
    }
    letrasTentadas.push(letra);
    if (palavra.includes(letra)) {
        letrasCorretas.push(letra);
        mensagemDiv.textContent = "";
    } else {
        erros++;
        dicaIndex = Math.min(dicaIndex + 1, dicas.length - 1);
        dicaTexto.textContent = dicas[dicaIndex];
        mensagemDiv.textContent = "Letra incorreta!";
    }
    desenhar();
    atualizarPalavra();
    atualizarLetras();
    inputLetra.value = "";
    verificarFim();
}

function verificarFim() {
    if (erros >= maxErros) {
        mensagemDiv.textContent = `Você perdeu! A palavra era: ${palavra}`;
        inputLetra.disabled = true;
        btnTentar.disabled = true;
        inputArrisque.disabled = true;
        btnArrisque.disabled = true;
        btnReiniciar.style.display = 'inline-block';
    } else if (palavra.split('').every(l => letrasCorretas.includes(l))) {
        mensagemDiv.textContent = "Parabéns, você acertou!";
        inputLetra.disabled = true;
        btnTentar.disabled = true;
        inputArrisque.disabled = true;
        btnArrisque.disabled = true;
        btnReiniciar.style.display = 'inline-block';
        setTimeout(() => {
            btnReiniciar.style.display = 'none';
            novoJogo();
        }, 1200);
    }
}

btnArrisque.onclick = arrisqueTudo;
inputArrisque.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') arrisqueTudo();
});

function arrisqueTudo() {
    let tentativa = inputArrisque.value.trim().toLowerCase();
    if (!tentativa) return;
    if (tentativa === palavra) {
        mensagemDiv.textContent = "Parabéns, você acertou!";
        inputLetra.disabled = true;
        btnTentar.disabled = true;
        inputArrisque.disabled = true;
        btnArrisque.disabled = true;
        btnReiniciar.style.display = 'inline-block';
    } else {
        erros = maxErros;
        desenhar();
        mensagemDiv.textContent = `Você perdeu! A palavra era: ${palavra}`;
        inputLetra.disabled = true;
        btnTentar.disabled = true;
        inputArrisque.disabled = true;
        btnArrisque.disabled = true;
        btnReiniciar.style.display = 'inline-block';
    }
}

btnReiniciar.onclick = function() {
    btnReiniciar.style.display = 'none';
    novoJogo();
}

novoJogo();
