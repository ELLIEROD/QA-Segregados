// ==========================================
// 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
// ==========================================

// O objeto firebaseConfig agora vem centralizado do arquivo js/config.js
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==========================================
// 2. CONTROLE DE AUTENTICAÇÃO E PERFIL
// ==========================================
const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));

// Só expulsa se NÃO estiver logado E se o usuário não estiver na página de login
if (!usuarioLogado && !window.location.pathname.includes('index.html')) {
    window.location.href = 'index.html';
}

// Atualizar cabeçalho
let nomeTopo = usuarioLogado.apelido && usuarioLogado.apelido.trim() !== "" ? usuarioLogado.apelido : (usuarioLogado.nome ? usuarioLogado.nome.trim().split(" ")[0] : "Colaborador");
document.getElementById('dash-user-nome').innerText = nomeTopo;
document.getElementById('dash-user-perfil').innerText = usuarioLogado.nivel;
document.getElementById('dash-user-foto').src = usuarioLogado.foto || 'https://www.w3schools.com/howto/img_avatar.png';

// Liberar aba de gerenciamento apenas para cargos habilitados
if (["Supervisor", "Qualidade", "Administrador"].includes(usuarioLogado.nivel)) {
    document.getElementById('aba-usuarios-btn').classList.remove('hidden');
}

if (usuarioLogado.nivel === "Qualidade") {
    document.querySelector('#area-formulario h2').innerText = "📌 Registrar Produto (Modo QA Habilitado)";
}

// Banco de Dados de Produtos organizados por Linha e Regras de Embalagem
const BANCO_PRODUTOS = {
    "Bolleria": [
        { codigo: "502642", nome: "Gran Gurguer Gergelim 420g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 },
        { codigo: "500226", nome: "Gran Burguer Gergelim 420g PVT", cestosPorDolly: 38, produtosPorCesto: 10 },
        { codigo: "502644", nome: "Pão Brioche 520g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 }, // <-- Faltava essa vírgula
        { codigo: "502874", nome: "Pão Brioche 520g PVT", cestosPorDolly: 38, produtosPorCesto: 10 },   // <-- Faltava essa vírgula
        { codigo: "505878", nome: "Pão Hamburguer Artesano 420g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 }, // <-- Faltava essa vírgula
        { codigo: "505879", nome: "Pão Hamburguer Artesano 420g PVT", cestosPorDolly: 38, produtosPorCesto: 10 },   // <-- Faltava essa vírgula
        { codigo: "505880", nome: "Pão Hamb. Artesano Australiano 420g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 }, // <-- Faltava essa vírgula
        { codigo: "505881", nome: "Pão Hamb. Artesano Australiano 420g PVT", cestosPorDolly: 38, produtosPorCesto: 10 }
    ],
    "Linha 3": [
        { codigo: "973515", nome: "PÃO FORMA 100% NATURAL TRIT. GIRASSOL E CASTANHAS 350G BIMBO WICKBOLD", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "973516", nome: "PÃO FORMA 100% NATURAL TRIT. CASTANHAS 350G BIMBO WICKBOLD", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "973517", nome: "PÃO DE FORMA 100% NATURAL TRADICIONAL 350G BIMBO WICKBOLD", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "182", nome: "PÃO SUPREME CASTANHA DO PARÁ E QUINOA 450G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "20109", nome: "PÃO GRÃOS E CASTANHA VITTA 450G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "23004", nome: "PÃO ZERO 12 GRÃOS 350G PULLMAN", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "23005", nome: "PÃO 12 GRÃOS 450G PULLMAN", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "28540", nome: "PÃO 100% NATURAL 450G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "28541", nome: "PÃO FRUTAS GRÃOS E CASTANHAS 500G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "500199", nome: "PÃO GRÃOS E CASTANHAS 450G PULLMAN", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "20108", nome: "PÃO 14 GRÃOS VITTA 450G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "503128", nome: "PÃO ABÓBORA E LINHAÇA 350G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "503129", nome: "PÃO CRANBERRY E QUINOA 350G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "503130", nome: "PÃO CASTANHA DO PARÁ E QUINOA 350G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "503655", nome: "PÃO AVEIA SEMENTES E GRÃOS 350G BIMBO NUTRELLA", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "965403", nome: "PÃO FIBRA MAIS PROTEÍNA 370G PULLMAN", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "965402", nome: "PÃO FIBRA MAIS PROTEÍNA 370G PVT", cestosPorDolly: 32, produtosPorCesto: 12 }
    ],
    "Linha 20K": [
        { codigo: "27636", nome: "Pão Integral 480g Pullman", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "9101", nome: "Pão Pullman Tradicional 480g", cestosPorDolly: 32, produtosPorCesto: 12 },
        { codigo: "7515", nome: "Pão Artesano Tradicional 500g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 },
        { codigo: "500290", nome: "Pão Artesano Intergral 500g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 },
        { codigo: "503140", nome: "Pão Artesano Na Chapa 500g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 },
        { codigo: "965253", nome: "Pão Artesano Brioche 500g Pullman", cestosPorDolly: 38, produtosPorCesto: 10 }
    ]
};

// Controla a alternância de abas principais do painel
window.mudarAba = function(aba) {
    const secoes = {
        'segregacao': 'secao-segregacao',
        'usuarios': 'secao-usuarios',
        'arquivo': 'secao-arquivo'
    };
    
    const botoes = {
        'segregacao': 'aba-segregacao-btn',
        'usuarios': 'aba-usuarios-btn',
        'arquivo': 'aba-arquivo-btn'
    };

    Object.keys(secoes).forEach(key => {
        const secaoEl = document.getElementById(secoes[key]);
        const botaoEl = document.getElementById(botoes[key]);
        
        if (key === aba) {
            if(secaoEl) secaoEl.classList.remove('hidden');
            if(botaoEl) botaoEl.classList.add('text-blue-700', 'border-b-2', 'border-blue-700');
        } else {
            if(secaoEl) secaoEl.classList.add('hidden');
            if(botaoEl) botaoEl.classList.remove('text-blue-700', 'border-b-2', 'border-blue-700');
        }
    });
}

// Funções de logout e interface de segurança
window.logout = function() { 
    sessionStorage.removeItem('usuarioLogado'); 
    window.location.href = 'index.html'; 
};

window.toggleVisibilidadeSenha = function(inputId, botao) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        botao.innerText = "🔒";
    } else {
        input.type = "password";
        botao.innerText = "👁️";
    }
}

// ==========================================
// 3. LÓGICA DE PRODUÇÃO E CÁLCULOS
// ==========================================

window.atualizarListaProdutos = function() {
    const linhaSelecionada = document.getElementById('prod-linha').value;
    const selectProduto = document.getElementById('prod-nome');
    
    selectProduto.innerHTML = '<option value="">-- Selecione o Produto --</option>';
    
    if (!linhaSelecionada || !BANCO_PRODUTOS[linhaSelecionada]) {
        selectProduto.innerHTML = '<option value="">Selecione primeiro a linha...</option>';
        calcularQuantidadeTotal();
        return;
    }
    
    BANCO_PRODUTOS[linhaSelecionada].forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.nome;
        option.setAttribute('data-codigo', prod.codigo);
        option.setAttribute('data-cestos', prod.cestosPorDolly);
        option.setAttribute('data-produtos', prod.produtosPorCesto);
        option.innerText = `[Cód: ${prod.codigo}] ${prod.nome}`;
        selectProduto.appendChild(option);
    });
    
    calcularQuantidadeTotal();
}

window.calcularQuantidadeTotal = function() {
    const selectProduto = document.getElementById('prod-nome');
    const optionSelecionada = selectProduto.options[selectProduto.selectedIndex];
    
    const dollys = parseInt(document.getElementById('prod-dollys').value) || 0;
    const cestosAvulsos = parseInt(document.getElementById('prod-cestos').value) || 0;
    
    if (!optionSelecionada || !optionSelecionada.value) {
        document.getElementById('prod-qtd-total-display').innerText = "0 produtos";
        return;
    }
    
    const cestosPorDolly = parseInt(optionSelecionada.getAttribute('data-cestos'));
    const produtosPorCesto = parseInt(optionSelecionada.getAttribute('data-produtos'));
    
    const totalCestos = (dollys * cestosPorDolly) + cestosAvulsos;
    const totalProdutos = totalCestos * produtosPorCesto;
    
    document.getElementById('prod-qtd-total-display').innerText = `${totalProdutos} produtos (${totalCestos} cx total)`;
}

window.toggleLote = function(checkbox) {
    const sup = document.getElementById('prod-lote-sup');
    const inf = document.getElementById('prod-lote-inf');
    if (checkbox.checked) {
        sup.value = "SEM LOTE";
        inf.value = "APARAS / REFUGO";
        sup.disabled = true;
        inf.disabled = true;
    } else {
        sup.value = "";
        inf.value = "";
        sup.disabled = false;
        inf.disabled = false;
    }
}

// ==========================================
// 4. SCANNER OCR E CAPTURA DE FOTOS (IN-APP)
// ==========================================

let localVideoStream = null;
let contextoCameraAtual = null; // 'lote', 'evidencia' ou 'perfil'

/**
 * Detecta se o usuário está em um dispositivo móvel
 */
function esMobile() {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || window.innerWidth < 768;
}

/**
 * Ponto de entrada inteligente: Abre arquivo no PC ou Câmera no celular
 */
window.gerenciarCapturaMídia = function(contexto, inputIdFallback) {
    if (!esMobile()) {
        const fileInput = document.getElementById(inputIdFallback);
        if (fileInput) {
            fileInput.click();
        } else {
            alert("Erro: Seletor de arquivos não encontrado no sistema.");
        }
    } else {
        window.abrirCameraInApp(contexto);
    }
};

/**
 * Abre o modal customizado e inicia o stream da câmera traseira
 */
window.abrirCameraInApp = function(contexto) {
    contextoCameraAtual = contexto;
    
    const modal = document.getElementById('modal-camera');
    const video = document.getElementById('video-stream');
    const overlayLote = document.getElementById('camera-overlay-lote');
    const titulo = document.getElementById('camera-titulo');
    
    if (!modal || !video) return;

    if (contexto === 'lote') {
        titulo.innerText = "Escanear Código de Lote";
        if (overlayLote) {
            overlayLote.classList.remove('hidden');
            overlayLote.classList.add('modo-lote');
        }
    } else {
        titulo.innerText = contexto === 'perfil' ? "Foto de Perfil" : "Foto da Evidência";
        if (overlayLote) {
            overlayLote.classList.add('hidden');
            overlayLote.classList.remove('modo-lote');
        }
    }

    modal.classList.remove('hidden');

    const constraints = {
        video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            localVideoStream = stream;
            video.srcObject = stream;
            
            const btnDisparar = document.getElementById('btn-disparar-foto');
            if (btnDisparar) {
                btnDisparar.onclick = () => dispararCapturaFoto();
            }
        })
        .catch(err => {
            console.error("Erro ao acessar a câmera do dispositivo:", err);
            alert("Não foi possível acessar a câmera do aparelho. Mudando para seleção de arquivo.");
            fecharCameraInApp();
            if(contexto === 'lote') document.getElementById('prod-lote-file')?.click();
            if(contexto === 'evidencia') document.getElementById('prod-foto-file')?.click();
        });
};

/**
 * Interrompe os tracks de hardware da câmera
 */
window.fecharCameraInApp = function() {
    const modal = document.getElementById('modal-camera');
    const video = document.getElementById('video-stream');
    const overlayLote = document.getElementById('camera-overlay-lote');
    
    if (modal) modal.classList.add('hidden');
    if (overlayLote) overlayLote.classList.remove('modo-lote');
    
    if (localVideoStream) {
        localVideoStream.getTracks().forEach(track => track.stop());
        localVideoStream = null;
    }
    if (video) video.srcObject = null;
};

/**
 * Captura o frame atual e distribui para os processadores corretos
 */
function dispararCapturaFoto() {
    const video = document.getElementById('video-stream');
    if (!video || !localVideoStream) return;

    const contextoParaProcessar = contextoCameraAtual;

    const canvasCaptura = document.createElement('canvas');
    canvasCaptura.width = video.videoWidth || 1280;
    canvasCaptura.height = video.videoHeight || 720;
    
    const ctx = canvasCaptura.getContext('2d');
    ctx.drawImage(video, 0, 0, canvasCaptura.width, canvasCaptura.height);
    
    const rawBase64 = canvasCaptura.toDataURL('image/jpeg', 0.85); 
    
    fecharCameraInApp();

    if (contextoParaProcessar === 'lote') {
        processarOcrLote(rawBase64);
    } else if (contextoParaProcessar === 'evidencia') {
        processarFotoEvidencia(rawBase64);
    } else if (contextoParaProcessar === 'perfil') {
        processarFotoPerfil(rawBase64);
    }
}

// ========================================================
// PROCESSADORES DE MÍDIA DE ACORDO COM O CONTEXTO DA CÂMERA
// ========================================================

/**
 * Processamento OCR via API Gratuita (OCR.space) - Versão Definitiva Sem Bloqueio de CORS
 */
window.processarOcrLote = function(rawBase64) {
    if (!rawBase64) return;
    
    const inputSup = document.getElementById('prod-lote-sup');
    const inputInf = document.getElementById('prod-lote-inf');
    
    if (inputSup) inputSup.value = "Conectando ao Servidor...";
    if (inputInf) inputInf.value = "Conectando ao Servidor...";

    // Insira sua chave privada recebida por e-mail aqui
    const OCR_SPACE_KEY = "K84567120588957"; 

    // Uso do FormData Nativo (Exigido pela API para evitar Preflight do CORS)
    const dadosEnvio = new FormData();
    dadosEnvio.append("base64Image", rawBase64);
    dadosEnvio.append("language", "por");
    dadosEnvio.append("isOverlayRequired", "false");
    dadosEnvio.append("scale", "true");
    dadosEnvio.append("OCREngine", "2"); 

    const URL_ENDPOINT_CORRETO = "https://ocr.space";

    fetch(URL_ENDPOINT_CORRETO, {
        method: "POST",
        headers: { 
            "apikey": OCR_SPACE_KEY
            // ATENÇÃO: NÃO inclua "Content-Type" manualmente aqui.
            // Deixar em branco força o navegador a gerar o 'multipart/form-data' correto, limpando o CORS.
        },
        body: dadosEnvio
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Resposta inválida do servidor: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.IsErroredOnProcessing || !result.ParsedResults) {
            throw new Error(result.ErrorMessage || "Erro ao processar imagem na nuvem.");
        }

        const textoCru = result.ParsedResults[0]?.ParsedText || "";
        console.log("Texto coletado da nuvem com sucesso:", textoCru);

        if (!textoCru || textoCru.trim().length < 3) {
            throw new Error("A nuvem processou a foto, mas não detectou nenhuma palavra legível.");
        }

        let textoTratadoGeral = textoCru.toUpperCase().replace(/[^A-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
        
        textoTratadoGeral = textoTratadoGeral
            .replace(/WAL/g, 'VAL')
            .replace(/WENC/g, 'VENC')
            .replace(/[08OQ]R\s?/g, 'DR')
            .replace(/[S5]ET/g, 'SET')
            .replace(/[L1I|][S5][PDB]/g, 'LSP')
            .replace(/[D0OQ][E0F]/g, 'DE');

        let linhaSuperior = "FALHA NA LEITURA SUPERIOR";
        let linhaInferior = "FALHA NA LEITURA INFERIOR";

        const matchVal = textoTratadoGeral.match(/VAL\s?(\d{2})\s?([A-Z]{3})\s?(\d{2})/);
        const matchDr = textoTratadoGeral.match(/DR\s?(\d{4})/);
        const matchLsp = textoTratadoGeral.match(/LSP\s?(\d{11,15})/);
        const matchDe = textoTratadoGeral.match(/DE\s?(\d{4})/);

        if (matchVal && matchDr) {
            linhaSuperior = `VAL${matchVal[1]} ${matchVal[2]} ${matchVal[3]} DR${matchDr[1]}`;
        } else if (matchVal) {
            linhaSuperior = `VAL${matchVal[1]} ${matchVal[2]} ${matchVal[3]}`;
        }

        if (matchLsp && matchDe) {
            linhaInferior = `LSP${matchLsp[1]} DE${matchDe[1]}`;
        } else if (matchLsp) {
            linhaInferior = `LSP${matchLsp[1]}`;
        } else {
            let blocoNumeros = textoTratadoGeral.replace(/\s/g, '').match(/\d{11,15}/);
            if (blocoNumeros) linhaInferior = `LSP${blocoNumeros[0]}`;
        }

        if (inputSup) inputSup.value = linhaSuperior;
        if (inputInf) inputInf.value = linhaInferior;
    })
    .catch(err => {
        console.error("Erro capturado no catch do processo:", err);
        if (inputSup) inputSup.value = "";
        if (inputInf) inputInf.value = "";
        alert("Não foi possível escanear o lote automaticamente. Por favor, digite manualmente.");
    });
};


// ========================================================
// 4.1 CAPTURA E RETENÇÃO DE FOTOS (EVIDÊNCIA E PERFIL)
// ========================================================

/**
 * Processa a Foto de Evidência e renderiza os previews na tela de forma estrita
 */
window.processarFotoEvidencia = function(rawBase64) {
    if (!rawBase64) return;

    const imgPreviewPadrao = document.getElementById('prod-foto-preview');
    const containerPreviewPadrao = document.getElementById('prod-preview-container');

    if (imgPreviewPadrao && containerPreviewPadrao) {
        imgPreviewPadrao.src = rawBase64;
        containerPreviewPadrao.classList.remove('hidden');
    }

    let inputHiddenFoto = document.getElementById('prod-foto-base64') || document.getElementById('foto-evidencia-base64');
    if (!inputHiddenFoto) {
        inputHiddenFoto = document.createElement('input');
        inputHiddenFoto.type = 'hidden';
        inputHiddenFoto.id = 'prod-foto-base64';
        document.getElementById('form-segregacao')?.appendChild(inputHiddenFoto);
    }
    inputHiddenFoto.value = rawBase64;

    let previewSeguranca = document.getElementById('preview-seguranca-dinamico');
    if (!previewSeguranca) {
        previewSeguranca = document.createElement('div');
        previewSeguranca.id = 'preview-seguranca-dinamico';
        previewSeguranca.style.cssText = "margin: 15px auto; padding: 12px; border: 2px dashed #2563eb; background: #f8fafc; border-radius: 8px; text-align: center; max-width: 100%; box-sizing: border-box; clear: both;";
        previewSeguranca.innerHTML = `
            <p style="margin: 0 0 8px 0; color: #2563eb; font-weight: bold; font-size: 13px; display: block;">✓ Foto da Evidência Capturada</p>
            <div style="width: 100%; max-height: 220px; overflow: hidden; border-radius: 6px; display: flex; justify-content: center; align-items: center; background: #000;">
                <img id="img-seguranca-dinamica" src="${rawBase64}" style="max-width: 100%; max-height: 220px; object-fit: contain; display: block; margin: 0 auto;"/>
            </div>
        `;
        
        let areaForm = document.getElementById('form-segregacao') || document.querySelector('form');
        if (areaForm) {
            let btnSubmit = areaForm.querySelector('button[type="submit"]') || areaForm.lastChild;
            areaForm.insertBefore(previewSeguranca, btnSubmit);
        }
    } else {
        const imgDinamica = document.getElementById('img-seguranca-dinamica');
        if (imgDinamica) imgDinamica.src = rawBase64;
    }
};

/**
 * Processa e renderiza a Foto de Perfil do usuário
 */
window.processarFotoPerfil = function(rawBase64) {
    if (!rawBase64) return;
    const inputPerfilBase64 = document.getElementById('perfil-foto-base64');
    if (inputPerfilBase64) inputPerfilBase64.value = rawBase64;
    const imgPerfil = document.getElementById('avatar-perfil-img');
    if (imgPerfil) imgPerfil.src = rawBase64;
};

// ==========================================
// 5. OPERAÇÕES DE SALVAR / ALTERAR NA NUVEM
// ==========================================

document.getElementById('form-segregacao').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const linha = document.getElementById('prod-linha').value;
    // PASSO 1: Captura do Turno adicionado no HTML
    const turno = document.getElementById('reg-turno-producao').value; 
    const produto = document.getElementById('prod-nome').value;
    
    // PASSO 2: Ajuste da regra para quando for "Sem Lote"
    const loteSuperior = document.getElementById('prod-lote-sup').value.trim().toUpperCase();
    const loteInferior = document.getElementById('prod-lote-inf').value.trim().toUpperCase();
    
    let loteConsolidado = "";
    // Se o lote superior ou inferior estiver marcado/escrito como sem lote, salva apenas "Sem Lote"
    if (loteSuperior === "SEM LOTE" || loteInferior === "SEM LOTE" || (loteSuperior === "" && loteInferior === "")) {
        loteConsolidado = "Sem Lote";
    } else {
        loteConsolidado = loteSuperior + " | " + loteInferior;
    }

    const dollys = document.getElementById('prod-dollys').value;
    const cestos = document.getElementById('prod-cestos').value;
    const qtdTexto = document.getElementById('prod-qtd-total-display').innerText;

    const motivo = document.getElementById('prod-motivo').value;
    const observacoes = document.getElementById('prod-observacoes').value.trim();

    // --- CORREÇÃO DA FOTO DE EVIDÊNCIA ---
    // Busca prioritariamente no input hidden onde a câmera salvou o base64
    let fotoProduto = "";
    const inputHiddenFoto = document.getElementById('prod-foto-base64') || document.getElementById('foto-evidencia-base64');
    
    if (inputHiddenFoto && inputHiddenFoto.value) {
        fotoProduto = inputHiddenFoto.value;
    } else {
        // Fallback caso a foto venha do carregamento de arquivos tradicional (PC)
        const previewTradicional = document.getElementById('prod-foto-preview');
        const containerTradicional = document.getElementById('prod-preview-container');
        if (previewTradicional && containerTradicional && !containerTradicional.classList.contains('hidden')) {
            fotoProduto = previewTradicional.src;
        }
    }
    // -------------------------------------

    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    const novoItem = { 
        id: Date.now(), 
        linha,
        turno, // PASSO 1: Adicionado ao banco
        produto, 
        lote: loteConsolidado, 
        quantidade: `${qtdTexto} (${dollys}D + ${cestos}C)`, 
        motivo: motivo,
        observacao: observacoes, 
        foto: fotoProduto, // Salva o base64 correto recuperado acima
        dataHora: dataHoraStr, 
        responsavel: usuarioLogado.nome, 
        status: "Pendente", // Nasce pendente
        motivoSupervisor: "", // PASSO 5: Inicializa vazio
        motivoQualidade: ""   // PASSO 4: Inicializa vazio
    };

    db.ref('segregados/' + novoItem.id).set(novoItem)
    .then(() => {
        alert("Registro de segregação efetuado com sucesso na nuvem!");
        this.reset();
        
        // Limpa o input hidden para o próximo registro não repetir a foto antiga
        if (inputHiddenFoto) inputHiddenFoto.value = "";
        
        // Remove o container de preview dinâmico da câmera se ele existir
        const previewDinamico = document.getElementById('preview-seguranca-dinamico');
        if (previewDinamico) previewDinamico.remove();

        document.getElementById('prod-lote-sup').disabled = false;
        document.getElementById('prod-lote-inf').disabled = false;
        document.getElementById('prod-preview-container').classList.add('hidden');
        document.getElementById('prod-qtd-total-display').innerText = "0 produtos";
    })
    .catch((error) => {
        console.error("Erro ao salvar no Firebase:", error);
        alert("Erro técnico ao salvar dados na nuvem.");
    });
});

// PASSO 5: Supervisor solicita ação para a Qualidade aprovar
window.solicitarAcao = function(id, tipoSolicitacao) {
    const motivo = prompt(`Digite o motivo técnico para a solicitação de ${tipoSolicitacao}:`);
    if (!motivo || motivo.trim() === "") {
        alert("Ação cancelada. É obrigatório informar o motivo da solicitação.");
        return;
    }

    db.ref('segregados/' + id).update({
        status: `Aguardando ${tipoSolicitacao}`,
        motivoSupervisor: motivo.trim()
    }).then(() => alert("Solicitação enviada com sucesso para análise da Qualidade!"));
};

// PASSO 4: Qualidade define o veredito (mudar status + input do motivo final)
window.decisaoQualidade = function(id, novoStatus) {
    db.ref('segregados/' + id).once('value').then((snapshot) => {
        const item = snapshot.val();
        const textoSugestao = item.motivoSupervisor ? item.motivoSupervisor : "";
        
        const motivoFinal = prompt(`Informe o motivo técnico para a ação de [${novoStatus}]:`, textoSugestao);
        if (!motivoFinal || motivoFinal.trim() === "") {
            alert("Ação cancelada. A Qualidade precisa preencher o motivo do parecer técnico.");
            return;
        }

        db.ref('segregados/' + id).update({
            status: novoStatus,
            motivoQualidade: motivoFinal.trim(),
            dataMudancaStatus: new Date().toISOString() // Salva o carimbo de data para o Passo 6 (15 dias)
        }).then(() => alert(`Status do produto updated para: ${novoStatus}`));
    });
};

// PASSO 3: Apenas mover para o arquivo/histórico definitivamente
window.arquivarItem = function(id) {
    if (!confirm("Deseja mover este item permanentemente para o histórico de arquivos?")) return;
    
    db.ref('segregados/' + id).update({
        status: "Arquivado",
        dataArquivamento: new Date().toISOString()
    }).then(() => alert("Item movido para o histórico de arquivados."));
};

window.excluirItemHistorico = function(id) {
    if (!confirm("⚠️ ATENÇÃO: Deseja realmente deletar permanentemente este registro do histórico de auditoria? Esta ação não poderá ser desfeita.")) return;

    db.ref('segregados/' + id).remove()
    .then(() => {
        alert("🗑️ Registro eliminado do histórico da nuvem com sucesso.");
    })
    .catch(error => console.error("Erro ao excluir histórico:", error));
}

// ==========================================
// 6. FILTROS E RENDERIZAÇÃO DAS TABELAS (VISUAL)
// ==========================================
let filtroTempoAtivo = '7dias';
let dadosSegregadosCache = []; // Armazena o snapshot atual na memória para uso dos filtros visuais

function carregarTabelaSegregados(segregados) {
    const tabela = document.getElementById('tabela-segregados');
    if (!tabela) return;
    
    // Filtra itens ativos (tudo que ainda NÃO foi arquivado)
    let itensAtivos = segregados.filter(item => item.status !== "Arquivado");
    
    // Passo 6: Verificação de Automação de 15 Dias (Itens esquecidos sem arquivar)
    const agoraMs = Date.now();
    const quinzeDiasMs = 15 * 24 * 60 * 60 * 1000;
    
    itensAtivos.forEach(item => {
        if (item.dataMudancaStatus) {
            const dataStatusMs = new Date(item.dataMudancaStatus).getTime();
            if ((agoraMs - dataStatusMs) >= quinzeDiasMs) {
                // Executa o arquivamento automático silencioso na nuvem
                db.ref('segregados/' + item.id).update({
                    status: "Arquivado",
                    dataArquivamento: new Date().toISOString(),
                    arquivadoAutomatico: true
                });
            }
        }
    });
    
    document.getElementById('contador-itens').innerText = itensAtivos.length;
    tabela.innerHTML = "";

    if (itensAtivos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-slate-400">Nenhum produto sob análise ativa no momento.</td></tr>`;
        return;
    }

    itensAtivos.forEach(item => {
        let acoesInterface = `<p class="text-center text-xs text-slate-400 italic">Aguardando Liberação</p>`;
        const nivel = usuarioLogado.nivel;
        
        // INTERFACE DO SUPERVISOR (Passo 5)
        if (nivel === "Supervisor") {
            if (item.status === "Pendente") {
                acoesInterface = `
                    <div class="grid grid-cols-1 gap-1 max-w-[180px] mx-auto">
                        <button onclick="solicitarAcao(${item.id}, 'Liberação')" class="bg-amber-500 text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-amber-600 transition">📋 Solicitar Liberação</button>
                        <button onclick="solicitarAcao(${item.id}, 'Descarte')" class="bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-red-600 transition">🗑️ Solicitar Descarte</button>
                    </div>
                `;
            } else {
                acoesInterface = `
                    <div class="text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 animate-pulse">${item.status}</span>
                    </div>
                `;
            }
        }
        
        // INTERFACE DA QUALIDADE / ADM (Passo 3 e 4)
        if (nivel === "Qualidade" || nivel === "Administrador") {
            if (item.status === "Pendente" || item.status.startsWith("Aguardando")) {
                acoesInterface = `
                    <div class="grid grid-cols-2 gap-1 max-w-[220px] mx-auto">
                        <button onclick="decisaoQualidade(${item.id}, 'Liberado')" class="bg-green-600 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-green-700 transition">✓ Liberar</button>
                        <button onclick="decisaoQualidade(${item.id}, 'Descartado')" class="bg-red-600 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-red-700 transition">𐄂 Descartar</button>
                        <button onclick="decisaoQualidade(${item.id}, 'Reprocessar')" class="bg-blue-600 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-blue-700 transition">↻ Reprocessar</button>
                        <button onclick="decisaoQualidade(${item.id}, 'Aparas')" class="bg-orange-500 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-orange-600 transition">✂ Aparas</button>
                    </div>
                `;
            } else {
                // Passo 3: Somente exibe botão arquivar após mudar o status (Liberado, Descartado, etc.)
                acoesInterface = `
                    <div class="max-w-[180px] mx-auto text-center">
                        <button onclick="arquivarItem(${item.id})" class="w-full bg-slate-700 text-white text-[11px] font-bold py-1.5 px-2 rounded hover:bg-slate-800 transition shadow-sm">📦 Arquivar no Histórico</button>
                    </div>
                `;
            }
        }

        const imagemTag = item.foto 
            ? `<img src="${item.foto}" class="w-10 h-10 object-cover rounded cursor-zoom-in hover:scale-105 transition shadow-sm" onclick="expandirFoto('${item.foto}')">` 
            : `<img src="https://placehold.co/50" class="w-10 h-10 object-cover rounded opacity-40">`;

        // Montagem das observações + Exibição dos motivos dinâmicos (Passo 4 e 5)
        let blocoObs = item.observacao ? `<div class="mt-1 text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px]">Dica/Obs: ${item.observacao}</div>` : '';
        
        if (item.motivoSupervisor) {
            blocoObs += `<div class="mt-1 text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 text-[11px]">🔸 <b>Solicitação Super:</b> ${item.motivoSupervisor}</div>`;
        }
        if (item.motivoQualidade && (nivel === "Qualidade" || nivel === "Administrador")) {
            blocoObs += `<div class="mt-1 text-green-700 bg-green-50 p-1.5 rounded border border-green-200 text-[11px]">🔹 <b>Parecer QA:</b> ${item.motivoQualidade}</div>`;
        }

        // Estilização dinâmica das tags de status
        let badgeStatus = `<span class="px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800">PENDENTE</span>`;
        if (item.status.startsWith("Aguardando")) {
            badgeStatus = `<span class="px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-800 text-[10px]">${item.status}</span>`;
        } else if (item.status === "Liberado") {
            badgeStatus = `<span class="px-2 py-0.5 rounded-full font-bold uppercase bg-green-100 text-green-800">LIBERADO</span>`;
        } else if (item.status === "Descartado") {
            badgeStatus = `<span class="px-2 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-800">DESCARTADO</span>`;
        } else if (item.status === "Reprocessar") {
            badgeStatus = `<span class="px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-800">REPROCESSAR</span>`;
        } else if (item.status === "Aparas") {
            badgeStatus = `<span class="px-2 py-0.5 rounded-full font-bold uppercase bg-orange-100 text-orange-800">APARAS</span>`;
        }

        // PASSO 7: Gerenciador de Impressão (Chama a função centralizada de escolha)
        const botaoQRCode = `
            <button onclick="gerenciarEscolhaImpressao(${item.id})" class="mt-2 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold py-1 px-1.5 rounded flex items-center justify-center gap-1 transition shadow-sm">
                🖨️ Imprimir Etiqueta QR
            </button>
        `;

        tabela.innerHTML += `
            <tr class="border-b hover:bg-slate-50/70 text-xs">
                <td class="p-2.5">${imagemTag}</td>
                <td class="p-2.5">
                    <b>${item.produto}</b><br>
                    <span class="font-mono text-blue-600 font-bold">${item.lote}</span><br>
                    <span class="text-slate-500 font-medium text-[11px]">${item.quantidade}</span>
                    ${item.turno ? `<br><span class="text-purple-700 font-bold text-[10px]">Turno: ${item.turno}</span>` : ''}
                    ${botaoQRCode}
                </td>
                <td class="p-2.5"><span class="font-bold text-slate-700 block">⚠️ ${item.motivo}</span>${blocoObs}<span class="text-[10px] text-slate-400 block mt-1">Registrado por: ${item.responsavel} às ${item.dataHora}</span></td>
                <td class="p-2.5">${badgeStatus}</td>
                <td class="p-2.5">${acoesInterface}</td>
            </tr>
        `;
    });
}

function carregarTabelaArquivo(segregados) {
    const tabela = document.getElementById('tabela-arquivo-historico');
    if (!tabela) return;

    // Histórico mostra apenas o que foi arquivado definitivamente
    let itensConcluidos = segregados.filter(item => item.status === "Arquivado");

    const agoraTimestamp = Date.now();
    const umDiaEmMs = 24 * 60 * 60 * 1000;

    if (filtroTempoAtivo === '7dias') {
        itensConcluidos = itensConcluidos.filter(item => (agoraTimestamp - item.id) <= (7 * umDiaEmMs));
    } else if (filtroTempoAtivo === 'mes') {
        itensConcluidos = itensConcluidos.filter(item => (agoraTimestamp - item.id) <= (30 * umDiaEmMs));
    } else if (filtroTempoAtivo === 'ano') {
        itensConcluidos = itensConcluidos.filter(item => (agoraTimestamp - item.id) <= (365 * umDiaEmMs));
    }

    tabela.innerHTML = "";

    if (itensConcluidos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-slate-400">Nenhum registro encontrado para este período no arquivo.</td></tr>`;
        return;
    }

    itensConcluidos.sort((a,b) => b.id - a.id).forEach(item => {
        let corStatus = "bg-slate-200 text-slate-800";

        const imagemTag = item.foto 
            ? `<img src="${item.foto}" class="w-10 h-10 object-cover rounded cursor-zoom-in hover:scale-105 transition shadow-sm" onclick="expandirFoto('${item.foto}')">` 
            : `<img src="https://placehold.co/50" class="w-10 h-10 object-cover rounded opacity-40">`;

        let blocoObs = item.observacao ? `<div class="mt-1 text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px]">💬 ${item.observacao}</div>` : '';
        if (item.motivoQualidade) {
            blocoObs += `<div class="mt-1 text-green-700 bg-green-50 p-1.5 rounded border border-green-100 text-[10px]"><b>Motivo Final QA:</b> ${item.motivoQualidade}</div>`;
        }

        let botaoExcluirHistorico = '';
        if (["Qualidade", "Administrador"].includes(usuarioLogado.nivel)) {
            botaoExcluirHistorico = `
                <button onclick="excluirItemHistorico(${item.id})" class="text-red-600 hover:text-red-800 font-bold hover:underline text-[11px] block mt-1 transition">
                    🗑️ Deletar
                </button>
            `;
        } else {
            botaoExcluirHistorico = `<span class="text-slate-300 text-[10px] italic">Sem permissão</span>`;
        }

        tabela.innerHTML += `
            <tr class="border-b bg-slate-50/40 hover:bg-slate-50 text-xs">
                <td class="p-2.5">${imagemTag}</td>
                <td class="p-2.5">
                    <b>${item.produto}</b><br>
                    <span class="font-mono text-slate-500">${item.lote}</span><br>
                    <span class="text-slate-400">${item.quantidade}</span>
                </td>
                <td class="p-2.5"><span class="font-bold text-slate-600 block">📋 ${item.motivo}</span>${blocoObs}<span class="text-[10px] text-slate-400 block mt-1">Gerado em: ${item.dataHora}</span></td>
                <td class="p-2.5"><span class="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${corStatus}">ARQUIVADO</span>${item.arquivadoAutomatico ? '<br><span class="text-[9px] text-amber-600 font-medium italic">Auto (15d)</span>' : ''}</td>
                <td class="p-2.5 text-center font-medium text-slate-600">${item.responsavel}</td>
                <td class="p-2.5 text-center">${botaoExcluirHistorico}</td>
            </tr>
        `;
    });
}

// ==========================================
// 7. IMPRESSÃO DA ETIQUETA TÉRMICA E QR CODE
// ==========================================

// Função Intermediária para o usuário escolher o método de impressão e quantidade
window.gerenciarEscolhaImpressao = function(id) {
    const qtdPrompt = prompt("Quantas cópias desta etiqueta deseja imprimir?", "1");
    if (!qtdPrompt) return; // Cancelou
    
    const quantidade = parseInt(qtdPrompt);
    if (isNaN(quantidade) || quantidade < 1) {
        alert("Quantidade inválida.");
        return;
    }

    const escolha = confirm("Deseja imprimir direto na impressora ZEBRA via rede?\n\n[OK] para Zebra (Rede)\n[Cancelar] para Impressão Padrão (Navegador)");
    if (escolha) {
        window.gerenciarImpressorasZebra(id, quantidade);
    } else {
        window.gerarEtiquetaProduto(id, quantidade);
    }
};

// Gerenciador de Equipamentos Zebra (Salvar, Listar e Excluir)
// Modificado para usar 'sys_global_zebras' evitando perdas ao deslogar
window.gerenciarImpressorasZebra = function(id, quantidade = 1) {
    let impressoras = JSON.parse(localStorage.getItem('sys_global_zebras')) || [];
    
    let mensagem = "Selecione uma impressora digitando o NÚMERO correspondente:\n\n";
    
    if (impressoras.length === 0) {
        mensagem += "[Nenhum equipamento cadastrado ainda]\n";
    } else {
        impressoras.forEach((imp, index) => {
            mensagem += `${index + 1} - ${imp.nome} (${imp.ip})\n`;
        });
    }
    
    mensagem += "\nOutras opções:\n";
    mensagem += "N - Cadastrar Nova Impressora\n";
    if (impressoras.length > 0) {
        mensagem += "E - Excluir uma Impressora Salva\n";
    }
    mensagem += "C - Cancelar";

    const opcao = prompt(mensagem);
    if (!opcao) return; 
    const opcaoLimpa = opcao.trim().toUpperCase();

    // Opção: Cadastrar Nova
    if (opcaoLimpa === 'N') {
        const nome = prompt("Digite um nome para a impressora Zebra (Ex: Almoxarifado, Linha 2):");
        if (!nome) return;
        const ip = prompt("Digite o endereço IP da impressora Zebra:", "192.168.1.150");
        if (!ip) return;

        impressoras.push({ nome: nome.trim(), ip: ip.trim() });
        localStorage.setItem('sys_global_zebras', JSON.stringify(impressoras));
        alert("Impressora cadastrada com sucesso!");
        
        window.gerenciarImpressorasZebra(id, quantidade);
        return;
    }

    // Opção: Excluir Aparelho
    if (opcaoLimpa === 'E' && impressoras.length > 0) {
        let msgExcluir = "Digite o número da impressora que deseja REMOVER:\n\n";
        impressoras.forEach((imp, index) => {
            msgExcluir += `${index + 1} - ${imp.nome} (${imp.ip})\n`;
        });
        
        const numExcluir = parseInt(prompt(msgExcluir));
        if (isNaN(numExcluir) || numExcluir < 1 || numExcluir > impressoras.length) {
            alert("Número inválido. Operação cancelada.");
            return;
        }

        const removida = impressoras.splice(numExcluir - 1, 1);
        localStorage.setItem('sys_global_zebras', JSON.stringify(impressoras));
        alert(`A impressora "${removida[0].nome}" foi excluída.`);
        
        window.gerenciarImpressorasZebra(id, quantidade);
        return;
    }

    if (opcaoLimpa === 'C') return;

    // Opção: Selecionar Impressora Existente da Lista
    const indiceSelecionado = parseInt(opcaoLimpa) - 1;
    if (!isNaN(indiceSelecionado) && indiceSelecionado >= 0 && indiceSelecionado < impressoras.length) {
        const ipEscolhido = impressoras[indiceSelecionado].ip;
        window.imprimirZebraRede(id, ipEscolhido, quantidade);
    } else {
        alert("Opção inválida.");
    }
};

// OPÇÃO 1: IMPRESSÃO COMUM (Layout Lado a Lado Otimizado para 10x7.5 cm)
window.gerarEtiquetaProduto = function(id, quantidade = 1) {
    db.ref('segregados/' + id).once('value').then((snapshot) => {
        const item = snapshot.val();
        if (!item) {
            alert("Erro: Produto não encontrado para gerar etiqueta.");
            return;
        }

        const urlLimpa = window.location.href.split('?')[0].replace('dashboard.html', '').replace('index.html', '');
        const urlConsulta = `${urlLimpa}rastreabilidade.html?id=${item.id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(urlConsulta)}`;
        
        const janelaImpressao = window.open('', '_blank', 'width=500,height=400');
        
        let conteudoEtiquetas = "";
        for (let i = 0; i < quantidade; i++) {
            conteudoEtiquetas += `
                <div class="label-page">
                    <div class="alerta">PRODUTO RETIDO</div>
                    <div class="header">CONTROLE DE QUALIDADE</div>
                    
                    <div class="main-content">
                        <div class="info-block">
                            <b>PRODUTO:</b> ${item.produto}<br>
                            <b>LOTE:</b> ${item.lote}<br>
                            <b>QTD:</b> ${item.quantidade}<br>
                            ${item.turno ? `<b>TURNO:</b> ${item.turno}<br>` : ''}
                            <b>DATA:</b> ${item.dataHora}<br>
                            <b>STATUS:</b> ${item.status.toUpperCase()}<br>
                            <b>RESP:</b> ${item.responsavel}
                        </div>

                        <div class="qrcode-container">
                            <img src="${qrCodeUrl}" alt="QR Code">
                            <div class="qr-text">ESCANEE PARA RASTREABILIDADE</div>
                        </div>
                    </div>

                    <div class="footer">
                        ID Interno: #RL-${item.id}
                    </div>
                </div>
            `;
        }
        
        janelaImpressao.document.write(`
            <html>
            <head>
                <title>Etiqueta de Retenção - Lote ${item.lote}</title>
                <style>
                    @page { size: 100mm 75mm; margin: 0; }
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        margin: 0; 
                        padding: 0;
                        background: #fff;
                    }
                    .label-page {
                        width: 100mm;
                        height: 75mm;
                        box-sizing: border-box;
                        padding: 8px 12px;
                        page-break-after: always;
                        display: flex;
                        flex-direction: column;
                    }
                    .alerta { font-size: 14px; font-weight: bold; background: #000; color: #fff; padding: 3px; text-align: center; width: 100%; box-sizing: border-box; }
                    .header { font-size: 11px; font-weight: bold; border-bottom: 2px dashed #000; padding: 3px 0; text-align: center; margin-bottom: 6px; }
                    
                    /* Divide as informações do QR Code lado a lado */
                    .main-content { display: flex; flex-direction: row; flex: 1; align-items: flex-start; justify-content: space-between; }
                    .info-block { width: 62%; text-align: left; font-size: 10px; line-height: 1.3; font-weight: bold; }
                    .qrcode-container { width: 35%; text-align: center; display: flex; flex-direction: column; align-items: center; }
                    .qrcode-container img { width: 95px; height: 95px; object-fit: contain; }
                    .qr-text { font-size: 7px; margin-top: 2px; font-weight: bold; line-height: 1; }
                    
                    .footer { font-size: 9px; border-top: 1px dashed #000; padding-top: 3px; margin-top: auto; text-align: center; }
                    
                    @media print {
                        .label-page { width: 100mm; height: 75mm; }
                    }
                </style>
            </head>
            <body>
                ${conteudoEtiquetas}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 600);
                    };
                <\/script>
            </body>
            </html>
        `);
        janelaImpressao.document.close();
    }).catch(err => {
        console.error("Erro ao processar etiqueta:", err);
        alert("Erro ao buscar dados para impressão.");
    });
};

// OPÇÃO 2: ENVIAR PARA ZEBRA (Com QRCode posicionado ao lado e livre de Cache)
window.imprimirZebraRede = function(id, ipImpressora, quantidade = 1) {
    if (!ipImpressora) return;

    db.ref('segregados/' + id).once('value').then((snapshot) => {
        const item = snapshot.val();
        if (!item) {
            alert("Erro: Produto não localizado na base.");
            return;
        }

        const urlConsulta = `${window.location.origin}/rastreabilidade.html?id=${item.id}`;

        // Reestruturação ZPL para Etiqueta 100mm x 75mm (800x600 dots em 203 dpi)
        // O QR Code foi empurrado para a extrema direita (^FO520,130) e as informações estão à esquerda
        const comandoZPL = `
^XA
^CI28
^PW800
^LL600

^FX --- Faixa Superior de Alerta ---
^FO40,30^GB720,45,45^FS
^FO270,40^A0N,32,32^FR^FDPRODUTO RETIDO^FS

^FX --- Cabeçalho ---
^FO40,95^A0N,22,22^FDCONTROLE DE QUALIDADE^FS
^FO40,120^GB720,2,2^FS

^FX --- Bloco de Informações (Esquerda) ---
^FO40,150^A0N,24,24^FDPRODUTO: ${item.produto.toUpperCase()}^FS
^FO40,190^A0N,24,24^FDLOTE:    ${item.lote}^FS
^FO40,230^A0N,24,24^FDQTD:     ${item.quantidade}^FS
^FO40,270^A0N,24,24^FDDATA:    ${item.dataHora}^FS
^FO40,310^A0N,24,24^FDSTATUS:  ${item.status.toUpperCase()}^FS
^FO40,350^A0N,24,24^FDRESP:    ${item.responsavel.toUpperCase()}^FS

^FX --- Bloco do QR Code (Direita - Sem Cortar) ---
^FO520,150^BQN,2,5^FDQA,${urlConsulta}^FS
^FO480,290^A0N,15,15^FDESCANEE PARA^FS
^FO480,310^A0N,15,15^FDRASTREABILIDADE^FS

^FX --- Rodapé ---
^FO40,400^GB720,2,2^FS
^FO260,415^A0N,20,20^FDID Interno: #RL-${item.id}^FS

^FX --- Quantidade de Cópias Emitidas Nativamente ---
^PQ${quantidade},0,1,Y
^XZ
        `;

        // Geração de timestamp contra retenção de cache do barramento
        const cacheBuster = Date.now();

        fetch(`http://${ipImpressora}:9100/?cb=${cacheBuster}`, {
            method: 'POST',
            body: comandoZPL,
            mode: 'no-cors',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
        .then(() => {
            alert(`Comando de impressão (${quantidade}x) enviado com sucesso para a Zebra!`);
        })
        .catch((err) => {
            console.error("Erro ao conectar na Zebra:", err);
            alert("Não foi possível alcançar a impressora Zebra. Verifique o IP cadastrado e a sua conexão de rede.");
        });

    }).catch(err => {
        console.error("Erro ao buscar dados para Zebra:", err);
        alert("Erro ao processar dados da etiqueta.");
    });
};

// ==========================================
// FUNÇÕES DE INTERAÇÃO (FILTROS E MODAL)
// ==========================================
window.filtrarHistoricoTempo = function(periodo, botaoClicado) {
    filtroTempoAtivo = periodo;
    
    const botoes = document.querySelectorAll('#filtros-tempo-historico button');
    botoes.forEach(btn => {
        btn.classList.remove('bg-white', 'text-blue-700', 'shadow-sm');
        btn.classList.add('hover:bg-white/60');
    });
    
    botaoClicado.classList.add('bg-white', 'text-blue-700', 'shadow-sm');
    botaoClicado.classList.remove('hover:bg-white/60');
    
    carregarTabelaArquivo(dadosSegregadosCache);
}

window.expandirFoto = function(srcBase64) {
    const modal = document.getElementById('modal-zoom-foto');
    const img = document.getElementById('img-zoom-display');
    if(modal && img) {
        img.src = srcBase64;
        modal.classList.remove('hidden');
    }
}

window.fecharZoomFoto = function() {
    const modal = document.getElementById('modal-zoom-foto');
    if(modal) modal.classList.add('hidden');
}


// ==========================================
// 8. GERENCIAMENTO DE COLABORADORES (REALTIME NUVEM)
// ==========================================
function atualizarTabelaUsuarios(listaUsuarios) {
    let tabela = document.getElementById('tabela-usuarios-adm');
    if (!tabela) return;
    tabela.innerHTML = ''; 

    let contagemPendentes = 0;

    listaUsuarios.forEach(user => {
        let badgeStatus = '';
        if (user.status === 'recusado') {
            badgeStatus = `<span class="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">Recusado</span>`;
        } else if (user.status === 'aprovado') {
            badgeStatus = `<span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Aprovado</span>`;
        } else {
            badgeStatus = `<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">Pendente</span>`;
            contagemPendentes++;
        }

        let userKey = user.re || user.email.replace(/[.#$\[\]]/g, "_");

        let linhaHTML = `
            <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                <td class="p-3 font-semibold text-slate-700">${user.nome}</td>
                <td class="p-3 font-mono text-xs text-slate-500">${user.re || '---'}<br>${user.email}</td>
                <td class="p-3 text-slate-600 text-xs">${user.setor || '---'} / ${user.turno || '---'}</td>
                <td class="p-3 text-slate-600 font-medium">${user.cargo || 'Colaborador'}</td>
                <td class="p-3 text-center">${badgeStatus}</td>
                <td class="p-3 text-center space-x-1 flex items-center justify-center min-h-[50px]">
                    ${(user.status !== 'aprovado') ? `
                        <button onclick="aprovarUsuario('${userKey}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm transition">Aprovar</button>
                    ` : ''}
                    ${(user.status !== 'recusado' && user.status !== 'aprovado') ? `
                        <button onclick="recusarUsuario('${userKey}')" class="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm transition">Recusar</button>
                    ` : ''}
                    <button onclick="excluirUsuario('${userKey}')" class="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm transition">Excluir</button>
                </td>
            </tr>
        `;
        tabela.innerHTML += linhaHTML;
    });

    const badge = document.getElementById('badge-pendentes');
    if (badge) badge.innerText = contagemPendentes;
}

window.aprovarUsuario = function(userKey) {
    db.ref('usuarios/' + userKey).update({
        status: 'aprovado',
        motivoRecusa: ""
    })
    .then(() => alert("🎉 O cadastro do colaborador foi aprovado com sucesso!"))
    .catch(err => console.error("Erro ao aprovar usuário:", err));
}

window.recusarUsuario = function(userKey) {
    const motivo = prompt(`Digite o motivo da recusa técnica para este cadastro:`);
    if (motivo === null) return; 
    if (motivo.trim() === "") {
        alert("⚠️ É obrigatório digitar um motivo formal para recusar o cadastro.");
        return;
    }

    db.ref('usuarios/' + userKey).update({
        status: 'recusado',
        motivoRecusa: motivo.trim()
    })
    .then(() => alert("🛑 Cadastro recusado. O motivo foi registrado na nuvem."))
    .catch(err => console.error("Erro ao recusar usuário:", err));
}

window.excluirUsuario = function(userKey) {
    if (!confirm(`⚠️ Tem certeza que deseja apagar permanentemente este colaborador da base de dados corporativa?`)) return;

    db.ref('usuarios/' + userKey).remove()
    .then(() => alert("🗑️ Usuário removido com sucesso da nuvem."))
    .catch(err => console.error("Erro ao excluir usuário:", err));
}

// ==========================================
// 9. MODAL EDITAR PERFIL
// ==========================================
window.abrirModalPerfil = function() {
    document.getElementById('edit-nome').value = usuarioLogado.nome || '';
    document.getElementById('edit-apelido').value = usuarioLogado.apelido || '';
    document.getElementById('edit-re').value = usuarioLogado.re || '';
    document.getElementById('edit-setor').value = usuarioLogado.setor || 'Pães';
    document.getElementById('edit-turno').value = usuarioLogado.turno || '1º Turno';
    document.getElementById('edit-perfil-preview').src = usuarioLogado.foto || 'https://www.w3schools.com/howto/img_avatar.png';
    
    document.getElementById('edit-senha-nova').value = '';
    document.getElementById('edit-senha-confirma').value = '';
    document.getElementById('modal-perfil').classList.remove('hidden');
}

window.fecharModalPerfil = function() { 
    document.getElementById('modal-perfil').classList.add('hidden'); 
}

if (document.getElementById('edit-foto')) {
    document.getElementById('edit-foto').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_LARGURA = 200;
                    const MAX_ALTURA = 200;
                    let largura = img.width;
                    let altura = img.height;

                    if (largura > altura) {
                        if (largura > MAX_LARGURA) {
                            altura *= MAX_LARGURA / largura;
                            largura = MAX_LARGURA;
                        }
                    } else {
                        if (altura > MAX_ALTURA) {
                            largura *= MAX_ALTURA / altura;
                            altura = MAX_ALTURA;
                        }
                    }

                    canvas.width = largura;
                    canvas.height = altura;
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, largura, altura);
                    ctx.drawImage(img, 0, 0, largura, altura);

                    const fotoOtimizadaBase64 = canvas.toDataURL('image/jpeg', 0.75);
                    document.getElementById('edit-perfil-preview').src = fotoOtimizadaBase64;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

document.getElementById('form-editar-perfil').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const novoNome = document.getElementById('edit-nome').value.trim();
    const novoApelido = document.getElementById('edit-apelido').value.trim();
    const novoSetor = document.getElementById('edit-setor').value;
    const novoTurno = document.getElementById('edit-turno').value;
    const senhaNova = document.getElementById('edit-senha-nova').value.replace(/\s+/g, '');
    const senhaConfirma = document.getElementById('edit-senha-confirma').value.replace(/\s+/g, '');
    const fotoNova = document.getElementById('edit-perfil-preview').src;

    let senhaDestino = usuarioLogado.senha;

    if (senhaNova.length > 0) {
        if (senhaNova !== senhaConfirma) {
            alert("Erro: A nova senha e a confirmação não batem!");
            return;
        }
        const temMaiuscula = /[A-Z]/.test(senhaNova);
        const temMinuscula = /[a-z]/.test(senhaNova);
        const temNumero = /[0-9]/.test(senhaNova);
        const temEspecial = /[^A-Za-z0-9]/.test(senhaNova);

        if (senhaNova.length < 8 || !temMaiuscula || !temMinuscula || !temNumero || !temEspecial) {
            alert("Sua nova senha não atende aos requisitos mínimos!");
            return;
        }
        senhaDestino = senhaNova;
        alert("Sua senha foi updated com sucesso!");
    }

    const dadosAtualizados = {
        ...usuarioLogado,
        nome: novoNome,
        apelido: novoApelido,
        setor: novoSetor,
        turno: novoTurno,
        senha: senhaDestino,
        foto: fotoNova
    };

    let userKey = usuarioLogado.re || usuarioLogado.email.replace(/[.#$\[\]]/g, "_");

    db.ref('usuarios/' + userKey).update(dadosAtualizados)
    .then(() => {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(dadosAtualizados));
        alert("Perfil profissional atualizado na nuvem!");
        location.reload();
    })
    .catch(err => {
        console.error("Erro ao atualizar perfil:", err);
        alert("Erro técnico ao salvar alterações.");
    });
});

window.excluirMinhaConta = function() {
    if(!confirm("Você excluirá sua conta do sistema de forma permanente. Prosseguir?")) return;
    let userKey = usuarioLogado.re || usuarioLogado.email.replace(/[.#$\[\]]/g, "_");
    
    db.ref('usuarios/' + userKey).remove()
    .then(() => {
        logout();
    });
}

// ==========================================
// 10. ESCUTA ATIVA EM TEMPO REAL (FIREBASE -> UI)
// ==========================================
db.ref('segregados').on('value', (snapshot) => {
    const dados = snapshot.val();
    dadosSegregadosCache = [];
    
    if (dados) {
        Object.keys(dados).forEach(key => {
            dadosSegregadosCache.push(dados[key]);
        });
    }
    
    carregarTabelaSegregados(dadosSegregadosCache);
    carregarTabelaArquivo(dadosSegregadosCache);
});

if (["Supervisor", "Qualidade", "Administrador"].includes(usuarioLogado.nivel)) {
    db.ref('usuarios').on('value', (snapshot) => {
        const dados = snapshot.val();
        const listaUsuarios = [];
        
        if (dados) {
            Object.keys(dados).forEach(key => {
                listaUsuarios.push(dados[key]);
            });
        }
        atualizarTabelaUsuarios(listaUsuarios);
    });
}
