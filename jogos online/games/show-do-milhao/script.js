document.getElementById('help-skip').onclick = () => {
    if (skipsRestantes === 0 || fimDeJogo) return;
    skipsRestantes--;
    perguntaAtual++;
    if (perguntaAtual < 20) {
        mostrarPergunta();
    } else {
        document.getElementById('result').innerText = 'Parabéns! Você ganhou R$ 1.000.000!';
        document.getElementById('options').innerHTML = '';
        document.getElementById('helpers').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
    }
};

// Carregar perguntas do arquivo JSON externo
let perguntas = [];
fetch('perguntas.json')
    .then(res => res.json())
    .then(data => {
        perguntas = data;
        escolherPerguntas();
        mostrarPergunta();
    });


const premios = [1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000, 100000, 150000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 950000, 1000000];
let perguntaAtual = 0;
let skipsRestantes = 3;
let eliminacaoUsada = false;
let publicitarioUsado = false;
let eliminacaoDisponivel = true;
let publicitarioDisponivel = true;
let perguntasUsadas = [];
let fimDeJogo = false;

function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function escolherPerguntas() {
    embaralhar(perguntas);
    perguntasUsadas = perguntas.slice(0, 20);
}

function mostrarPergunta() {
    document.getElementById('public-help').style.display = 'none';
    document.getElementById('result').innerText = '';
    document.getElementById('next-btn').style.display = 'none';
    eliminacaoUsada = false;
    publicitarioUsado = false;
    fimDeJogo = false;
    document.getElementById('helpers').style.display = 'flex';
    const p = perguntasUsadas[perguntaAtual];
    document.getElementById('question').innerText = p.pergunta;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    p.opcoes.forEach((op, idx) => {
        const btn = document.createElement('button');
        btn.innerText = op;
        btn.onclick = () => responder(idx);
        optionsDiv.appendChild(btn);
    });
    document.getElementById('prize-value').innerText = premios[perguntaAtual].toLocaleString('pt-BR');
    document.getElementById('help-eliminate').disabled = !eliminacaoDisponivel;
    document.getElementById('help-public').disabled = !publicitarioDisponivel;
    document.getElementById('help-skip').disabled = skipsRestantes === 0;
    document.getElementById('skips-left').innerText = skipsRestantes;
}

function responder(idx) {
    const p = perguntasUsadas[perguntaAtual];
    if (idx === p.resposta) {
        // Se usou ajuda nesta pergunta, ela é removida permanentemente
        if (eliminacaoUsada) eliminacaoDisponivel = false;
        if (publicitarioUsado) publicitarioDisponivel = false;
        document.getElementById('result').innerText = 'Resposta correta!';
        document.getElementById('next-btn').style.display = 'inline-block';
    } else {
        document.getElementById('result').innerText = 'Você errou! Fim de jogo.';
        document.getElementById('options').innerHTML = '';
        document.getElementById('helpers').style.display = 'none';
        document.getElementById('next-btn').innerText = 'Reiniciar';
        document.getElementById('next-btn').style.display = 'inline-block';
        fimDeJogo = true;
    }
}

document.getElementById('next-btn').onclick = () => {
    if (fimDeJogo) {
        // Reiniciar o jogo
        perguntaAtual = 0;
        skipsRestantes = 3;
        eliminacaoUsada = false;
        publicitarioUsado = false;
        escolherPerguntas();
        mostrarPergunta();
        document.getElementById('next-btn').innerText = 'Próxima Pergunta';
        return;
    }
    perguntaAtual++;
    if (perguntaAtual < 20) {
        mostrarPergunta();
    } else {
        document.getElementById('result').innerText = 'Parabéns! Você ganhou R$ 1.000.000!';
        document.getElementById('options').innerHTML = '';
        document.getElementById('helpers').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
    }
};

document.getElementById('help-eliminate').onclick = () => {
    if (eliminacaoUsada || !eliminacaoDisponivel) return;
    eliminacaoUsada = true;
    const p = perguntasUsadas[perguntaAtual];
    let erradas = [];
    for (let i = 0; i < p.opcoes.length; i++) {
        if (i !== p.resposta) erradas.push(i);
    }
    embaralhar(erradas);
    let paraEliminar = erradas.slice(0, 2);
    const btns = document.querySelectorAll('#options button');
    paraEliminar.forEach(idx => {
        btns[idx].disabled = true;
        btns[idx].style.opacity = 0.5;
    });
    document.getElementById('help-eliminate').disabled = true;
};

document.getElementById('help-public').onclick = () => {
    if (publicitarioUsado || !publicitarioDisponivel) return;
    publicitarioUsado = true;
    const p = perguntasUsadas[perguntaAtual];
    let respostas = [0, 0, 0, 0];
    // Simula 5 publicitários, maioria acerta, mas pode errar
    for (let i = 0; i < 5; i++) {
        let palpite;
        if (Math.random() < 0.7) {
            palpite = p.resposta;
        } else {
            let erradas = [0,1,2,3].filter(x => x !== p.resposta);
            palpite = erradas[Math.floor(Math.random()*erradas.length)];
        }
        respostas[palpite]++;
    }
    let texto = 'Publicitários dizem: <br>';
    p.opcoes.forEach((op, idx) => {
        texto += `${op}: ${respostas[idx]}<br>`;
    });
    document.getElementById('public-help').innerHTML = texto;
    document.getElementById('public-help').style.display = 'block';
    document.getElementById('help-public').disabled = true;
};

document.getElementById('next-btn').onclick = () => {
    if (fimDeJogo) {
        // Reiniciar o jogo
        perguntaAtual = 0;
        skipsRestantes = 3;
        eliminacaoUsada = false;
        publicitarioUsado = false;
        eliminacaoDisponivel = true;
        publicitarioDisponivel = true;
        escolherPerguntas();
        mostrarPergunta();
        document.getElementById('next-btn').innerText = 'Próxima Pergunta';
        return;
    }
    perguntaAtual++;
    if (perguntaAtual < 20) {
        mostrarPergunta();
    } else {
        document.getElementById('result').innerText = 'Parabéns! Você ganhou R$ 1.000.000!';
        document.getElementById('options').innerHTML = '';
        document.getElementById('helpers').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
    }
};
