import { app, db } from "./config-firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

//--------------------------- VARIÁVEIS 

const formRegistro = document.querySelector("#form-registro");
const btnEnviar = document.querySelector("#btnResgistrar");
const btnConfirmarModal = document.querySelector("#item");
let modalClicado = false;
let alertAtivo = false;

// -------------------- AUTENTICAÇÃO DO MODAL

btnConfirmarModal.addEventListener("click", () => {
    const meuModal = new bootstrap.Modal(document.getElementById("meuModal"));
    meuModal.hide();
    modalClicado = true;
});

// -------------------- DADOS DO FORMULÁRIO

btnEnviar.addEventListener("click", async (evento) => {
    evento.preventDefault();

    if (!modalClicado) {
        exibirAlerta("Por favor, leia e confirme o botão VER INFORMATIVO.");
        return;
    }

    // ------------------------- CAMPOS FALTANDO

    const lider = document.getElementById("lider").value;
    const matriculaLider = document.getElementById("matriculaLider").value;
    const placa = document.getElementById("placa").value;
    const equipe = document.getElementById("equipe").value;
    const matricula1 = document.getElementById("matricula1").value;
    const matricula2 = document.getElementById("matricula2").value;
    const matricula3 = document.getElementById("matricula3").value;
    const matricula4 = document.getElementById("matricula4").value;
    const matricula5 = document.getElementById("matricula5").value;
    const matricula6 = document.getElementById("matricula6").value;
    const ordemServico = document.getElementById("ordemServico").value;

    const camposObrigatorios = [
        { campo: "lider", valor: lider, mensagem: "Líder" },
        { campo: "matriculaLider", valor: matriculaLider, mensagem: "Matrícula do Líder" },
        { campo: "placa", valor: placa, mensagem: "Placa" },
        { campo: "equipe", valor: equipe, mensagem: "Equipe" },
        { campo: "matricula1", valor: matricula1, mensagem: "No mínimo Matrícula 1°" },
        { campo: "ordemServico", valor: ordemServico, mensagem: "Ordem de Serviço" }
    ];

    const camposNaoPreenchidos = camposObrigatorios.filter(campo => !campo.valor);

    if (camposNaoPreenchidos.length > 0) {
        const camposFaltantes = "Falta preencher os seguintes campos: " + camposNaoPreenchidos.map(campo => campo.mensagem).join(", ");
        exibirAlerta(camposFaltantes);
        return;
    }

    // ---------------------------------- Adicionar documento ao Firestore
    try {
        // Obter localização e adicionar ao documento
        const localizacao = await obterLocalizacao();
        
        const docRef = await addDoc(collection(db, "registrar"), {
            lider,
            matriculaLider,
            placa,
            equipe,
            matriculas: [matricula1, matricula2, matricula3, matricula4, matricula5, matricula6],
            ordemServico,
            localizacao,
            timestamp: new Date().toISOString(),
        });

        console.log("Documento adicionado com ID: ", docRef.id);

        // Redirecionar para outra página após o envio bem-sucedido
        window.location.href = "./desligar1.html";
    } catch (error) {
        console.error("Erro ao adicionar documento: ", error);
        exibirAlerta("Ocorreu um erro. Por favor, tente novamente.");
    }
});

// ... (restante do código para manipular campos, exibir alertas, etc.)

// Função para obter a localização
async function obterLocalizacao() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((posicao) => {
                const latitude = posicao.coords.latitude;
                const longitude = posicao.coords.longitude;

                // Utilizando a API de geocodificação do Google Maps
                const apiKey = 'AIzaSyBjOHNCyjuHDNVTf8Vw9qie3O3sLJ60DpI';
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results.length > 0) {
                            const endereco = data.results[0].formatted_address;
                            resolve(endereco);
                        } else {
                            reject('Endereço não encontrado.');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao obter o endereço:', error);
                        reject('Erro ao obter o endereço.');
                    });
            });
        } else {
            reject('Geolocalização não é suportada pelo seu navegador.');
        }
    });
}


// --------------------------------AUTENTICAÇÕES

const lider = document.querySelector("#lider");

function exibirLider() {
    if (lider.value == "") {
        lider.style.border = "1px solid red";
    } else {
        lider.style.border = "1px solid green";
    }
}

lider.addEventListener("blur", exibirLider);

const matriculas = [
    document.querySelector("#matricula1"),
    document.querySelector("#matricula2"),
    document.querySelector("#matricula3"),
    document.querySelector("#matricula4"),
    document.querySelector("#matricula5"),
    document.querySelector("#matricula6"),
    document.querySelector("#matriculaLider")
];

function exibirMatriculas(event) {
    const input = event.target;

    if (input.value == "") {
        input.style.border = "1px solid red";
    } else {
        input.style.border = "2px solid green";
    }
}

matriculas.forEach((input) => {
    input.addEventListener("blur", exibirMatriculas);

    function limitarComprimento(event) {
        const input = event.target;
        const valor = input.value;

        if (valor.length > 5) {
            input.value = valor.slice(0, 5); // Limita a 5 caracteres
        }
    }

    matriculas.forEach((input) => {
        input.addEventListener("input", limitarComprimento);
    });
});

let placa = document.querySelector("#placa");

function exibirPlaca() {
    if (placa.value == "") {
        placa.style.border = "1px solid red";
    } else {
        placa.style.border = "1px solid green";
    }
}

placa.addEventListener("blur", exibirPlaca);

let equipe = document.querySelector("#equipe");

function exibirEquipe() {
    if (equipe.value == "") {
        equipe.style.border = "1px solid red";
    } else {
        equipe.style.border = "1px solid green";
    }
}

equipe.addEventListener("blur", exibirEquipe);

let ordemServico = document.querySelector("#ordemServico");

function exibirOrdemServico() {
    if (ordemServico.value == "") {
        ordemServico.style.border = "1px solid red";
    } else {
        ordemServico.style.border = "1px solid green";
    }
}

ordemServico.addEventListener("blur", exibirOrdemServico);

// Função para exibir alerta personalizado
function exibirAlerta(mensagem) {
    if (alertAtivo) {
        return; // Evita a sobreposição de alertas
    }

    alertAtivo = true;

    // Ícone de alerta da FontAwesome
    const alertIcon = '<i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #fff;"></i>';

    // Adiciona a mensagem e botões ao corpo do documento (HTML)
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = `
        <div class="text-center" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: #000; border: 2px solid #fff; border-radius: 9%; z-index: 9999; width: 80%;">
            ${alertIcon}
            <p style="font-size: 18px; font-weight: bold; color: #fff; ; padding: 5px 10px; display: inline-block;">${mensagem}</p>
            <div style="margin-top: 10px; text-align: center;">
                <button id="fecharAlert" style="font-size: 16px; font-weight: bold; padding: 8px 16px; background: #fff; color: #000; border: none; cursor: pointer;">Fechar</button>
            </div>
        </div>
    `;
    alertContainer.style.zIndex = '9999';
    document.body.appendChild(alertContainer);

    // Adiciona evento ao botão de fechar
    const fecharButton = document.getElementById('fecharAlert');

    fecharButton.addEventListener('click', () => {
        // Lógica para lidar com o botão de fechar
        document.body.removeChild(alertContainer);
        alertAtivo = false;
    });
}









































// // ---------------------- PLANO B















// import { db } from "./config-firebase.js";
// import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// document.addEventListener("DOMContentLoaded", async () => {
//     try {
//         // Obtenha os documentos da coleção "registrar"
//         const querySnapshot = await getDocs(collection(db, "registrar"));

//         // Exiba as informações na página
//         const informacoesDiv = document.getElementById("informacoes");
//         informacoesDiv.innerHTML = ""; // Limpe o conteúdo anterior

//         querySnapshot.forEach((doc, index) => {
//             const data = doc.data();
//             const infoCardHTML = criarCardInformacaoHTML(data, data.ordemServico, data.timestamp);
//             informacoesDiv.innerHTML += infoCardHTML;
//         });
//     } catch (error) {
//         console.error("Erro ao obter informações:", error);
//     }
// });

// function criarCardInformacaoHTML(data, ordemServico, timestamp) {
//     return `
//         <div class="col-12 py-3 mt-4 shadow rounded-4 d-flex justify-content-center align-content-center">
//             <div class="px-3">
//                 <table class="table px-4">
//                     <tbody>
//                         <tr>
//                             <th scope="row" class="bg-body-secondary rounded-start">Ordem de Serviço:</th>
//                             <td class="text-end bg-body-secondary rounded-end" colspan="3">${ordemServico}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Líder:</th>
//                             <td class="text-end" colspan="3">${data.lider}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Matrícula Líder:</th>
//                             <td class="text-end" colspan="3">${data.matriculaLider}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Matrículas Equipe:</th>
//                             <td class="text-end" colspan="3">${data.matriculas.map((matricula, index) => `M${index + 1}: ${matricula}`).join(", ")}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Equipe:</th>
//                             <td class="text-end" colspan="3">${data.equipe}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Placa:</th>
//                             <td class="text-end" colspan="3">${data.placa}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Endereço:</th>
//                             <td class="text-end" colspan="3">${data.localizacao}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row" colspan="4">Data e Hora:</th>
//                             <td colspan="1" class="bg-body-tertiary">${formatarDataHora(timestamp)}</td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     `;
// }

// function formatarDataHora(timestamp) {
//     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
//     return new Date(timestamp).toLocaleString('pt-BR', options);
// }


































// import { app, db } from "./config-firebase.js";
// import { addDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// document.addEventListener("DOMContentLoaded", async () => {
//     try {
//         // Obtenha os documentos da coleção "registrar"
//         const querySnapshot = await getDocs(collection(db, "registrar"));

//         // Exiba as informações na página
//         const historicoContainer = document.querySelector("#historico-container");
//         historicoContainer.innerHTML = ""; // Limpe o conteúdo anterior

//         querySnapshot.forEach((doc, index) => {
//             const data = doc.data();
//             const infoCardHTML = criarCardInformacaoHTML(data, data.ordemServico, data.timestamp);
//             historicoContainer.innerHTML += infoCardHTML;
//         });
//     } catch (error) {
//         console.error("Erro ao obter informações:", error);
//     }
// });

// function criarCardInformacaoHTML(data, ordemServico, timestamp) {
//     return `
//         <div class="col-12 py-3 mt-4 shadow rounded-4 d-flex justify-content-center align-content-center">
//             <div class="px-3">
//                 <table class="table px-4">
//                     <tbody>
//                         <tr>
//                             <th scope="row" class="bg-body-secondary rounded-start">Ordem de Serviço:</th>
//                             <td class="text-end bg-body-secondary rounded-end" colspan="">${ordemServico}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Líder:</th>
//                             <td class="text-end" colspan="5">${data.lider}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Matrícula Líder:</th>
//                             <td class="text-end" colspan="5">${data.matriculaLider}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Matrículas Equipe:</th>
//                             <td class="text-end" colspan="5">${data.matriculas.map((matricula, index) => `M${index + 1}: ${matricula}`).join(", ")}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Equipe:</th>
//                             <td class="text-end" colspan="5">${data.equipe}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Placa:</th>
//                             <td class="text-end" colspan="5">${data.placa}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row">Endereço:</th>
//                             <td class="text-end" colspan="5">${data.localizacao}</td>
//                         </tr>
//                         <tr>
//                             <th scope="row" colspan="4">Data e Hora:</th>
//                             <td colspan="1" class="bg-body-tertiary">${formatarDataHora(timestamp)}</td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     `;
// }

// function formatarDataHora(timestamp) {
//     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
//     return new Date(timestamp).toLocaleString('pt-BR', options);
// }

// //--------------------------- VARIÁVEIS 

// const formRegistro = document.querySelector("#form-registro");
// const btnEnviar = document.querySelector("#btnEnviar");
// const btnConfirmarModal = document.querySelector("#item");
// let modalClicado = false;
// let alertAtivo = false;

// // -------------------- AUTENTICAÇÃO DO MODAL

// btnConfirmarModal.addEventListener("click", () => {
//     const meuModal = new bootstrap.Modal(document.getElementById("meuModal"));
//     meuModal.hide();
//     modalClicado = true;
// });

// // -------------------- DADOS DO FORMULÁRIO

// btnEnviar.addEventListener("click", async (evento) => {
//     evento.preventDefault();

//     if (!modalClicado) {
//         exibirAlerta("Por favor, leia e confirme o botão VER INFORMATIVO.");
//         return;
//     }

//     // ------------------------- CAMPOS FALTANDO

//     const lider = document.getElementById("lider").value;
//     const matriculaLider = document.getElementById("matriculaLider").value;
//     const placa = document.getElementById("placa").value;
//     const equipe = document.getElementById("equipe").value;
//     const matricula1 = document.getElementById("matricula1").value;
//     const matricula2 = document.getElementById("matricula2").value;
//     const matricula3 = document.getElementById("matricula3").value;
//     const matricula4 = document.getElementById("matricula4").value;
//     const matricula5 = document.getElementById("matricula5").value;
//     const matricula6 = document.getElementById("matricula6").value;
//     const ordemServico = document.getElementById("ordemServico").value;

//     const camposObrigatorios = [
//         { campo: "lider", valor: lider, mensagem: "Líder" },
//         { campo: "matriculaLider", valor: matriculaLider, mensagem: "Matrícula do Líder" },
//         { campo: "placa", valor: placa, mensagem: "Placa" },
//         { campo: "equipe", valor: equipe, mensagem: "Equipe" },
//         { campo: "matricula1", valor: matricula1, mensagem: "No mínimo Matrícula 1°" },
//         { campo: "ordemServico", valor: ordemServico, mensagem: "Ordem de Serviço" }
//     ];

//     const camposNaoPreenchidos = camposObrigatorios.filter(campo => !campo.valor);

//     if (camposNaoPreenchidos.length > 0) {
//         const camposFaltantes = "Falta preencher os seguintes campos: " + camposNaoPreenchidos.map(campo => campo.mensagem).join(", ");
//         exibirAlerta(camposFaltantes);
//         return;
//     }

//     // ---------------------------------- Adicionar documento ao Firestore
//     try {
        
//         const docRef = await addDoc(collection(db, "registrar"), {
//             lider,
//             matriculaLider,
//             placa,
//             equipe,
//             matriculas: [matricula1, matricula2, matricula3, matricula4, matricula5, matricula6],
//             ordemServico,
//             timestamp: new Date().toISOString(),
//         });

//         console.log("Documento adicionado com ID: ", docRef.id);

//         // Redirecionar para outra página após o envio bem-sucedido
//         window.location.href = "./desligar1.html";
//     } catch (error) {
//         console.error("Erro ao adicionar documento: ", error);
//         exibirAlerta("Ocorreu um erro. Por favor, tente novamente.");
//     }
// });



// // --------------------------------AUTENTICAÇÕES

// const liderInput = document.querySelector("#lider");

// function exibirLider() {
//     if (liderInput.value == "") {
//         liderInput.style.border = "1px solid red";
//     } else {
//         liderInput.style.border = "1px solid green";
//     }
// }

// liderInput.addEventListener("blur", exibirLider);

// const matriculasInputs = [
//     document.querySelector("#matricula1"),
//     document.querySelector("#matricula2"),
//     document.querySelector("#matricula3"),
//     document.querySelector("#matricula4"),
//     document.querySelector("#matricula5"),
//     document.querySelector("#matricula6"),
//     document.querySelector("#matriculaLider")
// ];

// function exibirMatriculas(event) {
//     const input = event.target;

//     if (input.value == "") {
//         input.style.border = "1px solid red";
//     } else {
//         input.style.border = "2px solid green";
//     }
// }

// matriculasInputs.forEach((input) => {
//     input.addEventListener("blur", exibirMatriculas);

//     function limitarComprimento(event) {
//         const input = event.target;
//         const valor = input.value;

//         if (valor.length > 5) {
//             input.value = valor.slice(0, 5); // Limita a 5 caracteres
//         }
//     }

//     matriculasInputs.forEach((input) => {
//         input.addEventListener("input", limitarComprimento);
//     });
// });

// let placaInput = document.querySelector("#placa");

// function exibirPlaca() {
//     if (placaInput.value == "") {
//         placaInput.style.border = "1px solid red";
//     } else {
//         placaInput.style.border = "1px solid green";
//     }
// }

// placaInput.addEventListener("blur", exibirPlaca);

// let equipeInput = document.querySelector("#equipe");

// function exibirEquipe() {
//     if (equipeInput.value == "") {
//         equipeInput.style.border = "1px solid red";
//     } else {
//         equipeInput.style.border = "1px solid green";
//     }
// }

// equipeInput.addEventListener("blur", exibirEquipe);

// let ordemServicoInput = document.querySelector("#ordemServico");

// function exibirOrdemServico() {
//     if (ordemServicoInput.value == "") {
//         ordemServicoInput.style.border = "1px solid red";
//     } else {
//         ordemServicoInput.style.border = "1px solid green";
//     }
// }

// ordemServicoInput.addEventListener("blur", exibirOrdemServico);

// // Função para exibir alerta personalizado
// function exibirAlerta(mensagem) {
//     if (alertAtivo) {
//         return; // Evita a sobreposição de alertas
//     }

//     alertAtivo = true;

//     // Ícone de alerta da FontAwesome
//     const alertIcon = '<i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #fff;"></i>';

//     // Adiciona a mensagem e botões ao corpo do documento (HTML)
//     const alertContainer = document.createElement('div');
//     alertContainer.innerHTML = `
//         <div class="text-center" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: #000; border: 2px solid #fff; border-radius: 9%; z-index: 9999; width: 80%;">
//             ${alertIcon}
//             <p style="font-size: 18px; font-weight: bold; color: #fff; ; padding: 5px 10px; display: inline-block;">${mensagem}</p>
//             <div style="margin-top: 10px; text-align: center;">
//                 <button id="fecharAlert" style="font-size: 16px; font-weight: bold; padding: 8px 16px; background: #fff; color: #000; border: none; cursor: pointer;">Fechar</button>
//             </div>
//         </div>
//     `;
//     alertContainer.style.zIndex = '9999';
//     document.body.appendChild(alertContainer);

//     // Adiciona evento ao botão de fechar
//     const fecharButton = document.getElementById('fecharAlert');

//     fecharButton.addEventListener('click', () => {
//         // Lógica para lidar com o botão de fechar
//         document.body.removeChild(alertContainer);
//         alertAtivo = false;
//     });
// }




















