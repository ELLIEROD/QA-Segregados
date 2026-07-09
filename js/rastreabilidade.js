// ==========================================
// CONFIGURAÇÃO DO FIREBASE (Substitua pelos seus dados oficiais)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAj14HRYh9L-mHOJ5Wg8vpin2SX6VALORI",
  authDomain: "controle-qualidade-qa.firebaseapp.com",
  databaseURL: "https://controle-qualidade-qa-default-rtdb.firebaseio.com",
  projectId: "controle-qualidade-qa",
  storageBucket: "controle-qualidade-qa.firebasestorage.app",
  messagingSenderId: "551389829977",
  appId: "1:551389829977:web:f70b65a720c25b0b204a48",
  measurementId: "G-JY6847X8DL"
};

// Inicializa o Firebase apenas se não tiver sido inicializado ainda
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// ==========================================
// CAPTURA DE PARÂMETROS DA URL E BUSCA REALTIME
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Pega o id enviado na URL (ex: ?id=171020304050)
    const params = new URLSearchParams(window.location.search);
    const idItem = params.get("id");

    if (!idItem) {
        exibirMensagemErro("Parâmetro ID inválido ou ausente na leitura do QR Code.");
        return;
    }

    // Busca os dados do item diretamente no Firebase
    db.ref('segregados/' + idItem).on('value', (snapshot) => {
        const item = snapshot.val();
        
        if (!item) {
            exibirMensagemErro("Lote ou registro de retenção não foi localizado na base de dados da nuvem.");
            return;
        }

        renderizarDadosProduto(item);
    }, (error) => {
        console.error("Erro na leitura do Firebase:", error);
        exibirMensagemErro("Erro técnico de conexão ao tentar buscar dados.");
    });
});

// ==========================================
// RENDERIZAÇÃO INTERFACES DINÂMICAS
// ==========================================
function renderizarDadosProduto(item) {
    // Preenchimento de Textos Básicos
    document.getElementById('info-produto').innerText = item.produto || '---';
    document.getElementById('info-lote').innerText = item.lote || '---';
    document.getElementById('info-quantidade').innerText = item.quantidade || '---';
    document.getElementById('info-data').innerText = item.dataHora || '---';
    document.getElementById('info-turno').innerText = item.turno ? `Turno: ${item.turno}` : 'Não Informado';
    document.getElementById('info-motivo').innerText = item.motivo || '---';
    document.getElementById('info-responsavel').innerText = item.responsavel || '---';
    document.getElementById('info-id').innerText = `#RL-${item.id}`;

    // Gerenciamento e customização do Topo de Status
    const topoStatus = document.getElementById('topo-status');
    const textoStatus = document.getElementById('texto-status');
    const statusLimpo = item.status ? item.status.toUpperCase() : 'PENDENTE';

    textoStatus.innerText = statusLimpo;

    // Remove classes antigas de cores do topo
    topoStatus.className = "text-white text-center py-4 px-6 transition-colors duration-300 ";
    
    if (statusLimpo === 'PENDENTE') {
        topoStatus.classList.add('bg-amber-500');
    } else if (statusLimpo.startsWith('AGUARDANDO')) {
        topoStatus.classList.add('bg-blue-500');
    } else if (statusLimpo === 'LIBERADO') {
        topoStatus.classList.add('bg-emerald-600');
    } else if (statusLimpo === 'DESCARTADO') {
        topoStatus.classList.add('bg-red-600');
    } else if (statusLimpo === 'REPROCESSAR') {
        topoStatus.classList.add('bg-indigo-600');
    } else if (statusLimpo === 'APARAS') {
        topoStatus.classList.add('bg-orange-500');
    } else {
        topoStatus.classList.add('bg-slate-600'); // Caso caia no histórico "Arquivado"
    }

    // Processamento da Foto (Evidência)
    const imgEl = document.getElementById('foto-produto');
    const loadingFoto = document.getElementById('loading-foto');
    if (item.foto) {
        imgEl.src = item.foto;
        imgEl.classList.remove('hidden');
        loadingFoto.classList.add('hidden');
    } else {
        imgEl.classList.add('hidden');
        loadingFoto.innerText = "Nenhuma foto anexada a este registro.";
        loadingFoto.classList.remove('animate-pulse');
    }

    // Tratamento dos Pareceres e Observações Extras
    const blocoHistorico = document.getElementById('bloco-historico-acoes');
    const pSupervisor = document.getElementById('parecer-supervisor');
    const pQualidade = document.getElementById('parecer-qualidade');
    let temHistorico = false;

    if (item.motivoSupervisor) {
        pSupervisor.innerHTML = `🔸 <b>Solicitação do Supervisor:</b> ${item.motivoSupervisor}`;
        pSupervisor.classList.remove('hidden');
        temHistorico = true;
    } else {
        pSupervisor.classList.add('hidden');
    }

    if (item.motivoQualidade) {
        pQualidade.innerHTML = `🔹 <b>Parecer Final Garantia da Qualidade:</b> ${item.motivoQualidade}`;
        pQualidade.classList.remove('hidden');
        temHistorico = true;
    } else {
        pQualidade.classList.add('hidden');
    }

    if (temHistorico) {
        blocoHistorico.classList.remove('hidden');
    } else {
        blocoHistorico.classList.add('hidden');
    }
}

function exibirMensagemErro(mensagem) {
    const topoStatus = document.getElementById('topo-status');
    const textoStatus = document.getElementById('texto-status');
    
    if (topoStatus && textoStatus) {
        topoStatus.className = "bg-red-700 text-white text-center py-4 px-6";
        textoStatus.innerText = "ERRO DE LEITURA";
    }

    const containerFoto = document.getElementById('container-foto');
    if (containerFoto) {
        containerFoto.innerHTML = `<div class="p-6 text-center text-sm font-semibold text-red-500">${mensagem}</div>`;
    }
}