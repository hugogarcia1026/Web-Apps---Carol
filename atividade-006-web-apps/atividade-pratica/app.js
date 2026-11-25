// =====================================================
// GelatoArt Repositor — Sistema de Estoque e Pedidos
// =====================================================

// ---------- Dados iniciais do estoque ----------
const ESTOQUE_INICIAL = [
    { id: 'baunilha', nome: '🍦 Baunilha Madagascar', quantidade: 120 },
    { id: 'chocolate', nome: '🍫 Chocolate Amargo 70%', quantidade: 85 },
    { id: 'morango', nome: '🍓 Morango Silvestre', quantidade: 40 },
    { id: 'pistache', nome: '🟢 Pistache Gourmet', quantidade: 18 },
    { id: 'limao', nome: '🍋 Limão Siciliano', quantidade: 60 },
    { id: 'coco', nome: '🥥 Coco Queimado', quantidade: 25 }
];
const LIMITE_ESTOQUE_BAIXO = 30;
const CHAVE_ESTOQUE = 'gelatoart-estoque';
const CHAVE_PEDIDOS = 'gelatoart-pedidos';

// ---------- Persistência local (localStorage) ----------
function lerDados(chave, padrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : padrao;
    } catch (erro) {
        return padrao;
    }
}

function salvarDados(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        console.warn('Não foi possível salvar os dados localmente:', erro);
    }
}

let estoque = lerDados(CHAVE_ESTOQUE, ESTOQUE_INICIAL.map(item => ({ ...item })));
let pedidos = lerDados(CHAVE_PEDIDOS, []);

// ---------- 1. Monitoramento do Status da Conexão ----------
const elementoStatus = document.getElementById('status-conexao');

function atualizarIndicadorRede() {
    if (navigator.onLine) {
        elementoStatus.innerText = 'Conexão: Online 🟢 (Conectado à Fábrica)';
        elementoStatus.style.color = '#76ff03';
    } else {
        elementoStatus.innerText = 'Conexão: Offline 🔴 (Formulário disponível em cache)';
        elementoStatus.style.color = '#ffd6d6';
    }
}

window.addEventListener('online', atualizarIndicadorRede);
window.addEventListener('offline', atualizarIndicadorRede);
atualizarIndicadorRede();

// ---------- 2. Registro do Service Worker ----------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => console.log('SW GelatoArt Repositor registrado! Escopo:', registro.scope))
            .catch(erro => console.error('Erro no registro do SW:', erro));
    });
}

// ---------- 3. Notificações de Reposição ----------
const btnNotificacao = document.getElementById('btn-notificacao');

// Exibe a notificação pelo Service Worker quando disponível (necessário no
// Chrome para Android) e, caso contrário, pela API Notification da janela.
function exibirNotificacao(titulo, corpo) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const opcoes = { body: corpo, tag: 'gelatoart-reposicao' };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
            .then(reg => reg ? reg.showNotification(titulo, opcoes) : new Notification(titulo, opcoes))
            .catch(() => new Notification(titulo, opcoes));
    } else {
        new Notification(titulo, opcoes);
    }
}

function atualizarBotaoNotificacao() {
    if (!('Notification' in window)) {
        btnNotificacao.disabled = true;
        btnNotificacao.innerText = '🔕 Notificações não suportadas neste navegador';
    } else if (Notification.permission === 'granted') {
        btnNotificacao.innerText = '✅ Alertas de Reposição Ativados';
    }
}

btnNotificacao.addEventListener('click', () => {
    if (!('Notification' in window)) {
        alert('Este navegador não suporta notificações.');
        return;
    }

    Notification.requestPermission().then(permissao => {
        if (permissao === 'granted') {
            exibirNotificacao(
                'GelatoArt Repositor',
                'Alertas ativados! Você será avisado a cada pedido de reposição registrado. 🍦'
            );
            atualizarBotaoNotificacao();
        } else {
            alert('Permissão para notificações foi recusada.');
        }
    });
});

atualizarBotaoNotificacao();

// ---------- 4. Renderização do Estoque ----------
const gradeEstoque = document.getElementById('grade-estoque');
const selectSabor = document.getElementById('sabor');

function renderizarEstoque() {
    gradeEstoque.innerHTML = '';

    estoque.forEach(item => {
        const artigo = document.createElement('article');
        artigo.className = 'item-sabor';
        if (item.quantidade < LIMITE_ESTOQUE_BAIXO) artigo.classList.add('baixo');

        const titulo = document.createElement('h3');
        titulo.textContent = item.nome;

        const qtd = document.createElement('p');
        qtd.textContent = item.quantidade < LIMITE_ESTOQUE_BAIXO
            ? `${item.quantidade} potes — estoque baixo!`
            : `${item.quantidade} potes disponíveis`;

        artigo.append(titulo, qtd);
        gradeEstoque.appendChild(artigo);
    });
}

function preencherSabores() {
    estoque.forEach(item => {
        const opcao = document.createElement('option');
        opcao.value = item.id;
        opcao.textContent = item.nome;
        selectSabor.appendChild(opcao);
    });
}

// ---------- 5. Renderização dos Pedidos ----------
const listaPedidos = document.getElementById('lista-pedidos');

function renderizarPedidos() {
    listaPedidos.innerHTML = '';

    if (pedidos.length === 0) {
        const vazio = document.createElement('li');
        vazio.className = 'vazio';
        vazio.textContent = 'Nenhum pedido de reposição registrado.';
        listaPedidos.appendChild(vazio);
        return;
    }

    pedidos.slice().reverse().forEach(pedido => {
        const li = document.createElement('li');
        if (pedido.prioridade === 'Urgente') li.classList.add('urgente');

        const resumo = document.createElement('strong');
        resumo.textContent = `${pedido.quantidade}x ${pedido.saborNome} — ${pedido.pontoVenda}`;

        const detalhes = document.createElement('small');
        detalhes.textContent =
            `${pedido.prioridade} • ${pedido.responsavel} • ${pedido.data}` +
            (pedido.offline ? ' • registrado offline' : '');

        li.append(resumo, detalhes);
        listaPedidos.appendChild(li);
    });
}

// ---------- 6. Formulário de Reposição ----------
const form = document.getElementById('form-reposicao');
const mensagem = document.getElementById('mensagem-form');

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const dados = new FormData(form);
    const pontoVenda = dados.get('pontoVenda').trim();
    const responsavel = dados.get('responsavel').trim();
    const saborId = dados.get('sabor');
    const quantidade = parseInt(dados.get('quantidade'), 10);
    const prioridade = dados.get('prioridade');

    if (!pontoVenda || !responsavel || !saborId || !(quantidade > 0)) {
        mostrarMensagem('Preencha todos os campos corretamente.', 'erro');
        return;
    }

    const sabor = estoque.find(item => item.id === saborId);
    if (quantidade > sabor.quantidade) {
        mostrarMensagem(`Estoque insuficiente: restam apenas ${sabor.quantidade} potes de ${sabor.nome}.`, 'erro');
        return;
    }

    sabor.quantidade -= quantidade;

    const pedido = {
        pontoVenda,
        responsavel,
        saborId,
        saborNome: sabor.nome,
        quantidade,
        prioridade,
        offline: !navigator.onLine,
        data: new Date().toLocaleString('pt-BR')
    };
    pedidos.push(pedido);

    salvarDados(CHAVE_ESTOQUE, estoque);
    salvarDados(CHAVE_PEDIDOS, pedidos);

    renderizarEstoque();
    renderizarPedidos();

    mostrarMensagem(
        navigator.onLine
            ? 'Reposição registrada com sucesso!'
            : 'Reposição salva no dispositivo (você está offline).',
        'sucesso'
    );

    exibirNotificacao(
        'Reposição registrada 🍦',
        `${quantidade}x ${sabor.nome} para ${pontoVenda} (${prioridade}).`
    );

    if (sabor.quantidade < LIMITE_ESTOQUE_BAIXO) {
        exibirNotificacao('Estoque baixo ⚠️', `${sabor.nome}: restam ${sabor.quantidade} potes na fábrica.`);
    }

    form.reset();
});

// ---------- 7. Limpar pedidos ----------
document.getElementById('btn-limpar').addEventListener('click', () => {
    if (!confirm('Deseja apagar todos os pedidos e restaurar o estoque inicial?')) return;

    estoque = ESTOQUE_INICIAL.map(item => ({ ...item }));
    pedidos = [];
    salvarDados(CHAVE_ESTOQUE, estoque);
    salvarDados(CHAVE_PEDIDOS, pedidos);
    renderizarEstoque();
    renderizarPedidos();
    mostrarMensagem('', '');
});

// ---------- Inicialização ----------
preencherSabores();
renderizarEstoque();
renderizarPedidos();
