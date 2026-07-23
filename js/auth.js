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
}

// Esconde a Splash Screen após 2 segundos (2000ms)
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('splash-hidden');
    }
  }, 2000); // 2000 = 2 segundos (pode mudar para 1500 se quiser 1,5s)
});
