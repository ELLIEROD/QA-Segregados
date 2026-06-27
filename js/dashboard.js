// ==========================================
// 0. FUNÇÕES AUXILIARES GLOBAIS (Carregam primeiro para evitar erros no HTML)
// ==========================================
window.toggleVisibilidadeSenha = function(inputId, botao) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        botao.innerText = "🔒"; 
    } else {
        input.type = "password";
        botao.innerText = "👁️";
    }
}

function alternarTelas() {
    const loginSec = document.getElementById('login-section');
    const cadSec = document.getElementById('cadastro-section');
    const boxReconhecimento = document.getElementById('user-recognition');
    if (loginSec) loginSec.classList.toggle('hidden');
    if (cadSec) cadSec.classList.toggle('hidden');
    if (boxReconhecimento) boxReconhecimento.classList.add('hidden');
}

// Fazer a função ser vista pelo clique dos botões do index.html
window.alternarTelas = alternarTelas;

// ==========================================
// 1. INICIALIZAÇÃO DO FIREBASE (AUTH/INDEX)
// ==========================================
if (typeof firebaseConfig !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}
const db = firebase.database();

// Criar DOIS Administradores Master padrões na Nuvem caso o banco esteja vazio
function inicializarAdminsMaster() {
    db.ref('usuarios').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const adminsIniciais = {
                "ADM001": {
                    nome: "Admin Geral 1",
                    apelido: "Admin 1",
                    re: "ADM001",
                    email: "admin1@grupobimbo.com",
                    setor: "Qualidade",
                    turno: "Administrativo",
                    nivel: "Administrador",
                    senha: "AdminBimbo@2026", 
                    foto: "",
                    status: "aprovado",
                    aprovado: true
                },
                "ADM002": {
                    nome: "Admin Geral 2",
                    apelido: "Admin 2",
                    re: "ADM002",
                    email: "admin2@grupobimbo.com",
                    setor: "Qualidade",
                    turno: "Administrativo",
                    nivel: "Administrador",
                    senha: "SegurancaBimbo#99",
                    foto: "",
                    status: "aprovado",
                    aprovado: true
                }
            };
            db.ref('usuarios').set(adminsIniciais);
        }
    });
}
inicializarAdminsMaster();

// Captura de elementos da interface
const inputIdentificador = document.getElementById('login-identificador');
const feedbackLogin = document.getElementById('login-feedback');
const boxReconhecimento = document.getElementById('user-recognition');
const fotoReconhecimento = document.getElementById('user-recon-foto');
const nomeReconhecimento = document.getElementById('user-recon-nome');
const nivelReconhecimento = document.getElementById('user-recon-nivel');

// ==========================================
// 2. RECONHECIMENTO DINÂMICO (PULL DO FIREBASE)
// ==========================================
function verificarUsuario() {
    if (!inputIdentificador || !boxReconhecimento) return;
    
    const valor = inputIdentificador.value.trim().toUpperCase();
    if (valor.length < 3) {
        boxReconhecimento.classList.add('hidden');
        if (feedbackLogin) feedbackLogin.innerText = "Digite seu ID ou e-mail cadastrado.";
        if (feedbackLogin) feedbackLogin.className = "text-[11px] font-medium text-slate-400 mt-1 pl-1";
        return;
    }

    db.ref('usuarios').once('value', (snapshot) => {
        const listaUsuarios = snapshot.val();
        let usuarioEncontrado = null;

        if (listaUsuarios) {
            usuarioEncontrado = Object.values(listaUsuarios).find(user => 
                user.re === valor || (user.email && user.email.toUpperCase() === valor)
            );
        }

        if (usuarioEncontrado) {
            const estaAprovado = (usuarioEncontrado.aprovado || usuarioEncontrado.status === 'aprovado');
            const estaRecusado = (usuarioEncontrado.status === 'recusado');

            if (feedbackLogin) {
                if (estaRecusado) {
                    feedbackLogin.innerText = "Cadastro reprovado/recusado.";
                    feedbackLogin.className = "text-[11px] font-bold text-red-600 mt-1 pl-1";
                } else if (estaAprovado) {
                    feedbackLogin.innerText = "Usuário ativo!";
                    feedbackLogin.className = "text-[11px] font-bold text-green-600 mt-1 pl-1";
                } else {
                    feedbackLogin.innerText = "Cadastro pendente de aprovação.";
                    feedbackLogin.className = "text-[11px] font-bold text-amber-500 mt-1 pl-1";
                }
            }
            
            let nomeParaExibir = "Colaborador";
            if (usuarioEncontrado.apelido && usuarioEncontrado.apelido.trim() !== "") {
                nomeParaExibir = usuarioEncontrado.apelido;
            } else if (usuarioEncontrado.nome) {
                nomeParaExibir = usuarioEncontrado.nome.trim().split(" ")[0]; 
            }

            if (nomeReconhecimento) nomeReconhecimento.innerText = nomeParaExibir;
            if (nivelReconhecimento) nivelReconhecimento.innerText = usuarioEncontrado.nivel || "Operador";
            if (fotoReconhecimento) fotoReconhecimento.src = usuarioEncontrado.foto || 'https://www.w3schools.com/howto/img_avatar.png';
            
            boxReconhecimento.classList.remove('hidden');
        } else {
            if (feedbackLogin) {
                feedbackLogin.innerText = "Colaborador não localizado.";
                feedbackLogin.className = "text-[11px] font-bold text-red-500 mt-1 pl-1";
            }
            boxReconhecimento.classList.add('hidden');
        }
    });
}

if (inputIdentificador) {
    inputIdentificador.addEventListener('input', verificarUsuario);
}

// ==========================================
// 3. EXECUÇÃO DE LOGIN VIA NUVEM
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const identificador = inputIdentificador.value.trim().toUpperCase();
        const senhaDigitada = document.getElementById('login-senha').value.replace(/\s+/g, ''); 

        db.ref('usuarios').once('value', (snapshot) => {
            const listaUsuarios = snapshot.val();
            let usuarioValido = null;

            if (listaUsuarios) {
                usuarioValido = Object.values(listaUsuarios).find(user => 
                    (user.re === identificador || (user.email && user.email.toUpperCase() === identificador)) && user.senha === senhaDigitada
                );
            }

            if (usuarioValido) {
                if (usuarioValido.status === 'recusado') {
                    alert(`❌ Seu cadastro foi REPROVADO pelo seguinte motivo:\n\n"${usuarioValido.motivoRecusa || 'Dados inconsistentes'}"\n\nPor favor, realize um novo cadastro corrigindo estas informações.`);
                    return;
                }

                if (!usuarioValido.aprovado && usuarioValido.status !== 'aprovado') {
                    alert('⏳ Seu cadastro ainda não foi liberado por um superior. Por favor, aguarde a análise.');
                    return;
                }

                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioValido));
                window.location.href = 'dashboard.html'; 
            } else {
                alert('Usuário ou senha incorreta! Certifique-se dos dados informados.');
            }
        });
    });
}

// ==========================================
// 4. CADASTRO DE NOVOS COLABORADORES (PUSH)
// ==========================================
const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nome = document.getElementById('cad-nome').value;
        const apelido = document.getElementById('cad-apelido').value.trim();
        const re = document.getElementById('cad-re').value.trim().toUpperCase();
        const email = document.getElementById('cad-email').value.trim().toLowerCase();
        const setor = document.getElementById('cad-setor').value;
        const turno = document.getElementById('cad-turno').value;
        const nivel = document.getElementById('cad-nivel').value;
        
        const senha = document.getElementById('cad-senha').value.replace(/\s+/g, '');
        const senhaConfirma = document.getElementById('cad-senha-confirma').value.replace(/\s+/g, '');
        const fotoInput = document.getElementById('cad-foto');

        if (senha !== senhaConfirma) {
            alert("Erro: A senha e a confirmação de senha não são iguais!");
            return;
        }

        const temMaiuscula = /[A-Z]/.test(senha);
        const temMinuscula = /[a-z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        const temEspecial = /[^A-Za-z0-9]/.test(senha);

        if (senha.length < 8 || !temMaiuscula || !temMinuscula || !temNumero || !temEspecial) {
            alert("Sua senha não atende aos requisitos!\n\nMínimo 8 dígitos, 1 Letra Maiúscula, 1 Minúscula, 1 Número e 1 Caractere Especial.");
            return;
        }

        db.ref('usuarios').once('value', (snapshot) => {
            const listaUsuarios = snapshot.val() || {};
            
            const jaExiste = Object.values(listaUsuarios).some(user => user.email === email || user.re === re);
            if (jaExiste) {
                alert('Este ID ou E-mail já constam registrados no sistema central!');
                return;
            }

            let fotoBase64 = "";
            const previewImg = document.getElementById('foto-preview');
            if (fotoInput && fotoInput.files && fotoInput.files.length > 0 && previewImg) {
                fotoBase64 = previewImg.src;
            }

            const novoUsuario = { 
                nome, 
                apelido, 
                re, 
                email, 
                setor, 
                turno, 
                nivel, 
                senha, 
                foto: fotoBase64, 
                aprovado: false,
                status: "pendente"
            };

            db.ref('usuarios/' + re).set(novoUsuario)
            .then(() => {
                alert('Solicitação enviada para a nuvem! Aguarde a liberação do seu Supervisor, Qualidade ou ADM.');
                cadastroForm.reset();
                const previewCont = document.getElementById('preview-container');
                if (previewCont) previewCont.classList.add('hidden');
                alternarTelas(); // Chamada correta: interna ao sucesso do envio
            })
            .catch(err => {
                console.error("Erro ao registrar usuário:", err);
                alert("Falha de conexão ao enviar o cadastro.");
            });
        });
    });
}

// Tratamento e Compressão de Foto de Perfil
const cadFotoBtn = document.getElementById('cad-foto');
if (cadFotoBtn) {
    cadFotoBtn.addEventListener('change', function(e) {
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

                    const fotoProcessadaBase64 = canvas.toDataURL('image/jpeg', 0.75);

                    const previewImg = document.getElementById('foto-preview');
                    const previewCont = document.getElementById('preview-container');
                    
                    if (previewImg) previewImg.src = fotoProcessadaBase64;
                    if (previewCont) previewCont.classList.remove('hidden');
                };
                
                img.onerror = function() {
                    alert("Erro ao processar o formato desta imagem.");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
} (O PULO DO GATO) ---
            img.onload = null;
            img.src = ""; // Arranca a foto bruta original de 10MB da memória RAM imediatamente!

            // Agora o Tesseract roda com o celular leve e com memória livre
            Tesseract.recognize(imagemProcessada, 'por+eng', {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:- VALVAL.LOTEFABVENC '
            })
            .then(({ data: { text } }) => {
                const linhas = text.split('\n')
                    .map(linha => {
                        let l = linha.trim().toUpperCase();
                        l = l.replace(/WAL/g, 'VAL').replace(/WENC/g, 'VENC');

                        if (l.startsWith("LS")) {
                            if (l.charAt(2) === 'E' || l.charAt(2) === 'B') {
                                l = 'LSP' + l.substring(3);
                            }
                            let prefixo = l.substring(0, 3);
                            let corpo = l.substring(3);
                            
                            corpo = corpo.replace(/Z/g, '2')
                                         .replace(/O/g, '0')
                                         .replace(/S/g, '5')
                                         .replace(/I/g, '1')
                                         .replace(/T/g, '7')
                                         .replace(/A/g, '41')
                                         .replace(/L/g, '77');
                            
                            l = prefixo + corpo;
                        }
                        return l;
                    })
// ==========================================
// 1. LEITURA DE LOTE (OCR COM TESSERACT E LIMPEZA)
// ==========================================
window.capturarFotoLote = function(input) {
    const file = input.files[0];
    if (!file) return;

    const labelSpan = input.previousElementSibling.querySelector('span');
    const originalText = labelSpan.innerText;
    labelSpan.innerText = "⏳ Lendo Lote... Aguarde";

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('ocr-canvas');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const LARGURA_FIXA = 700; 
            canvas.width = LARGURA_FIXA;
            canvas.height = (img.height / img.width) * LARGURA_FIXA;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                let cinza = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
                let pixelFinal = (cinza < 135) ? 0 : 255; 
                data[i]     = pixelFinal;
                data[i + 1] = pixelFinal;
                data[i + 2] = pixelFinal;
            }
            ctx.putImageData(imgData, 0, 0);

            // Gera o link leve em formato JPEG para o processamento
            const imagemProcessada = canvas.toDataURL('image/jpeg', 0.8);

            // --- 🚨 LIMPEZA DE MEMÓRIA CRÍTICA ---
            img.onload = null;
            img.src = ""; // Arranca a foto bruta original da memória RAM imediatamente!

            // Agora o Tesseract roda com o celular leve e com memória livre
            Tesseract.recognize(imagemProcessada, 'por+eng', {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:- VALVAL.LOTEFABVENC '
            })
            .then(({ data: { text } }) => {
                const linhas = text.split('\n')
                    .map(linha => {
                        let l = linha.trim().toUpperCase();
                        l = l.replace(/WAL/g, 'VAL').replace(/WENC/g, 'VENC');

                        if (l.startsWith("LS")) {
                            if (l.charAt(2) === 'E' || l.charAt(2) === 'B') {
                                l = 'LSP' + l.substring(3);
                            }
                            let prefixo = l.substring(0, 3);
                            let corpo = l.substring(3);
                            
                            corpo = corpo.replace(/Z/g, '2')
                                         .replace(/O/g, '0')
                                         .replace(/S/g, '5')
                                         .replace(/I/g, '1')
                                         .replace(/T/g, '7')
                                         .replace(/A/g, '41')
                                         .replace(/L/g, '77');
                            
                            l = prefixo + corpo;
                        }
                        return l;
                    })
                    .filter(l => l.length > 2);
                
                if (linhas.length >= 2) {
                    document.getElementById('prod-lote-sup').value = linhas[0];
                    document.getElementById('prod-lote-inf').value = CalculeLoteFormatado(linhas[1]);
                } else if (linhas.length === 1) {
                    document.getElementById('prod-lote-sup').value = linhas[0];
                    document.getElementById('prod-lote-inf').value = "";
                } else {
                    alert("⚠️ Erro de leitura física na datadora. Digite o lote manualmente.");
                }
            })
            .catch(err => {
                console.error("Erro OCR:", err);
                alert("Falha no escaneamento automático.");
            })
            .finally(() => {
                labelSpan.innerText = originalText;
                canvas.width = 0; // Zera o canvas para garantir que não sobrou lixo de pixel
                canvas.height = 0;
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

function CalculeLoteFormatado(textoStr) {
    return textoStr;
}

// ==========================================
// 2. FOTO DE EVIDÊNCIA (COMPRIMIDA E SEGURA)
// ==========================================
window.capturarFotoEvidencia = function(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const max_width = 800; 
                const scale = max_width / img.width;
                
                canvas.width = max_width;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const fotoComprimidaBase64 = canvas.toDataURL('image/jpeg', 0.6);
                
                document.getElementById('prod-foto-preview').src = fotoComprimidaBase64;
                document.getElementById('prod-preview-container').classList.remove('hidden');
                
                // --- LIMPEZA DE MEMÓRIA ---
                img.onload = null;
                img.src = ""; 
                canvas.width = 0; 
                canvas.height = 0;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

// ==========================================
// 5. OPERAÇÕES DE SALVAR / ALTERAR NA NUVEM
// ==========================================

document.getElementById('form-segregacao').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const linha = document.getElementById('prod-linha').value;
    const produto = document.getElementById('prod-nome').value;
    
    const loteSuperior = document.getElementById('prod-lote-sup').value.trim().toUpperCase();
    const loteInferior = document.getElementById('prod-lote-inf').value.trim().toUpperCase();
    const loteConsolidado = loteSuperior + " | " + loteInferior;

    const dollys = document.getElementById('prod-dollys').value;
    const cestos = document.getElementById('prod-cestos').value;
    const qtdTexto = document.getElementById('prod-qtd-total-display').innerText;

    const motivo = document.getElementById('prod-motivo').value;
    const observacoes = document.getElementById('prod-observacoes').value.trim();
    const fotoProduto = document.getElementById('prod-preview-container').classList.contains('hidden') ? "" : document.getElementById('prod-foto-preview').src;

    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    const novoItem = { 
        id: Date.now(), 
        linha,
        produto, 
        lote: loteConsolidado, 
        quantidade: `${qtdTexto} (${dollys}D + ${cestos}C)`, 
        motivo: motivo,
        observacao: observacoes, 
        foto: fotoProduto, 
        dataHora: dataHoraStr, 
        responsavel: usuarioLogado.nome, 
        status: "Pendente" 
    };

    db.ref('segregados/' + novoItem.id).set(novoItem)
    .then(() => {
        alert("Registro de segregação efetuado com sucesso na nuvem!");
        this.reset();
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

window.julgarLote = function(id, statusFinal) {
    if (!confirm(`Confirma a ação técnica de aplicar o status [${statusFinal.toUpperCase()}] para este lote? Ele será direcionado para o histórico.`)) return;

    db.ref('segregados/' + id).update({ status: statusFinal })
    .then(() => {
        alert("Status atualizado com sucesso na nuvem!");
    })
    .catch(error => console.error("Erro ao julgar lote:", error));
}

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
    
    let itensPendentes = segregados.filter(item => item.status === "Pendente");
    
    document.getElementById('contador-itens').innerText = itensPendentes.length;
    tabela.innerHTML = "";

    if (itensPendentes.length === 0) {
        tabela.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-slate-400">Nenhum produto sob análise ativa no momento.</td></tr>`;
        return;
    }

    itensPendentes.forEach(item => {
        let acoesQA = `<p class="text-center text-xs text-slate-400 italic">Aguardando Avaliação</p>`;
        
        if (usuarioLogado.nivel === "Qualidade" || usuarioLogado.nivel === "Administrador") {
            acoesQA = `
                <div class="grid grid-cols-2 gap-1 max-w-[220px] mx-auto">
                    <button onclick="julgarLote(${item.id}, 'Liberado')" class="bg-green-600 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-green-700 transition">Liberar</button>
                    <button onclick="julgarLote(${item.id}, 'Descartado')" class="bg-red-600 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-red-700 transition">Descartar</button>
                    <button onclick="julgarLote(${item.id}, 'Reprocessar')" class="bg-blue-600 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-blue-700 transition">Reprocessar</button>
                    <button onclick="julgarLote(${item.id}, 'Aparas')" class="bg-orange-500 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-orange-600 transition">Aparas</button>
                    <button onclick="julgarLote(${item.id}, 'Arquivado')" class="col-span-2 bg-slate-700 text-white text-[10px] font-bold py-1 px-1 rounded hover:bg-slate-800 transition">📦 Apenas Arquivar no Histórico</button>
                </div>
            `;
        }

        const imagemTag = item.foto 
            ? `<img src="${item.foto}" class="w-10 h-10 object-cover rounded cursor-zoom-in hover:scale-105 transition shadow-sm" onclick="expandirFoto('${item.foto}')">` 
            : `<img src="https://placehold.co/50" class="w-10 h-10 object-cover rounded opacity-40">`;

        const blocoObs = item.observacao 
            ? `<div class="mt-1 text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px]">💬 ${item.observacao}</div>` 
            : '';

        tabela.innerHTML += `
            <tr class="border-b hover:bg-slate-50/70 text-xs">
                <td class="p-2.5">${imagemTag}</td>
                <td class="p-2.5"><b>${item.produto}</b><br><span class="font-mono text-blue-600 font-bold">${item.lote}</span><br><span class="text-slate-500 font-medium">${item.quantidade}</span></td>
                <td class="p-2.5"><span class="font-bold text-slate-700 block">⚠️ ${item.motivo}</span>${blocoObs}<span class="text-[10px] text-slate-400 block mt-1">Registrado por: ${item.responsavel} às ${item.dataHora}</span></td>
                <td class="p-2.5"><span class="px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800">PENDENTE</span></td>
                <td class="p-2.5">${acoesQA}</td>
            </tr>
        `;
    });
}

function carregarTabelaArquivo(segregados) {
    const tabela = document.getElementById('tabela-arquivo-historico');
    if (!tabela) return;

    let itensConcluidos = segregados.filter(item => item.status !== "Pendente");

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
        let corStatus = "bg-green-100 text-green-800";
        if (item.status === "Descartado") corStatus = "bg-red-100 text-red-800";
        if (item.status === "Reprocessar") corStatus = "bg-blue-100 text-blue-800";
        if (item.status === "Aparas") corStatus = "bg-orange-100 text-orange-800";
        if (item.status === "Arquivado") corStatus = "bg-slate-200 text-slate-800";

        const imagemTag = item.foto 
            ? `<img src="${item.foto}" class="w-10 h-10 object-cover rounded cursor-zoom-in hover:scale-105 transition shadow-sm" onclick="expandirFoto('${item.foto}')">` 
            : `<img src="https://placehold.co/50" class="w-10 h-10 object-cover rounded opacity-40">`;

        const blocoObs = item.observacao 
            ? `<div class="mt-1 text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px]">💬 ${item.observacao}</div>` 
            : '';

        let botaoExcluirHistorico = '';
        if (["Qualidade", "Administrador"].includes(usuarioLogado.nivel)) {
            botaoExcluirHistorico = `
                <button onclick="excluirItemHistorico(${item.id})" class="text-red-600 hover:text-red-800 font-bold hover:underline transition">
                    🗑️ Excluir
                </button>
            `;
        } else {
            botaoExcluirHistorico = `<span class="text-slate-300 text-[10px] italic">Sem permissão</span>`;
        }

        tabela.innerHTML += `
            <tr class="border-b bg-slate-50/40 hover:bg-slate-50 text-xs">
                <td class="p-2.5">${imagemTag}</td>
                <td class="p-2.5"><b>${item.produto}</b><br><span class="font-mono text-slate-500">${item.lote}</span><br><span class="text-slate-400">${item.quantidade}</span></td>
                <td class="p-2.5"><span class="font-bold text-slate-600 block">📋 ${item.motivo}</span>${blocoObs}<span class="text-[10px] text-slate-400 block mt-1">Gerado em: ${item.dataHora}</span></td>
                <td class="p-2.5"><span class="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${corStatus}">${item.status}</span></td>
                <td class="p-2.5 text-center font-medium text-slate-600">${item.responsavel}</td>
                <td class="p-2.5 text-center">${botaoExcluirHistorico}</td>
            </tr>
        `;
    });
}

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
// 7. GERENCIAMENTO DE COLABORADORES (REALTIME NUVEM)
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

        // Gera uma chave segura para o Firebase usando o ID ou RE
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
// 8. MODAL EDITAR PERFIL
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
        alert("Sua senha foi atualizada com sucesso!");
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
// 9. ESCUTA ATIVA EM TEMPO REAL (FIREBASE -> UI)
// ==========================================

// Escuta em tempo real para os Produtos Segregados
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

// Escuta em tempo real para a Tabela de Controle de Usuários (Apenas se o cargo permitir ver o elemento na tela)
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
