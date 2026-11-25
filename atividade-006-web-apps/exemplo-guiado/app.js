// 1. Monitoramento do Status da Conexão
const elementoStatus = document.getElementById('status-conexao');

function atualizarIndicadorRede() {
    if (navigator.onLine) {
        elementoStatus.innerText = 'Conexão: Online 🟢 (Conectado à Fábrica)';
        elementoStatus.style.color = '#76ff03';
    } else {
        elementoStatus.innerText = 'Conexão: Offline 🔴 (Exibindo Catálogo em Cache)';
        elementoStatus.style.color = '#ff8080';
    }
}

window.addEventListener('online', atualizarIndicadorRede);
window.addEventListener('offline', atualizarIndicadorRede);
atualizarIndicadorRede();

// 2. Registro do Service Worker da GelatoArt
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => console.log('SW GelatoArt registrado!', registro))
            .catch(erro => console.error('Erro no registro do SW:', erro));
    });
}

// 3. Ativação de Notificações Push
const btnNotificacao = document.getElementById('btn-notificacao');
btnNotificacao.addEventListener('click', () => {
    if ('Notification' in window) {
        Notification.requestPermission().then(permissao => {
            if (permissao === 'granted') {
                new Notification('GelatoArt', {
                    body: 'Notificações ativadas! Você receberá alertas dos novos lotes de sorvete. 🍦'
                });
            } else {
                alert('Permissão para notificações foi recusada.');
            }
        });
    }
});
