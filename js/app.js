import { app, db } from "./config-firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

//--------------------------- VARIÁVEIS 
const btnEnviar = document.querySelector("#btnResgistrar");
const btnConfirmarModal = document.querySelector("#item");
let modalClicado = false;
let alertAtivo = false;

btnConfirmarModal.addEventListener("click", () => {
    const meuModal = new bootstrap.Modal(document.getElementById("meuModal"));
    meuModal.hide();
    modalClicado = true;
});

btnEnviar.addEventListener("click", async (evento) => {
    evento.preventDefault();

    if (!modalClicado) {
        exibirAlerta("Por favor, leia e confirme o botão VER INFORMATIVO.");
        return;
    }

    const camposObrigatorios = [
        { campo: "lider", id: "lider" },
        { campo: "matriculaLider", id: "matriculaLider" },
        { campo: "placa", id: "placa" },
        { campo: "equipe", id: "equipe" },
        { campo: "matricula1", id: "matricula1" },
        { campo: "ordemServico", id: "ordemServico" }
    ];

    const camposNaoPreenchidos = camposObrigatorios.filter(campo => !document.getElementById(campo.id).value);

    if (camposNaoPreenchidos.length > 0) {
        const camposFaltantes = "Falta preencher os seguintes campos: " + camposNaoPreenchidos.map(campo => campo.campo).join(", ");
        exibirAlerta(camposFaltantes);
        return;
    }

    try {
        const localizacao = await obterLocalizacao();

        const ordemServico = document.getElementById("ordemServico").value;
        const dados = {
            lider: document.getElementById("lider").value,
            matriculaLider: document.getElementById("matriculaLider").value,
            placa: document.getElementById("placa").value,
            equipe: document.getElementById("equipe").value,
            matriculas: Array.from({ length: 6 }, (_, i) => document.getElementById(`matricula${i + 1}`).value),
            ordemServico,
            localizacao,
            timestamp: new Date().toISOString(),
        };

        localStorage.setItem(ordemServico, JSON.stringify(dados));
        window.location.href = './desligar1.html';
    } catch (error) {
        console.error("Erro ao adicionar documento: ", error);
        exibirAlerta("Ocorreu um erro. Por favor, tente novamente.");
    }
});

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
        input.style.border = "1px solid green";
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



// ---------------------------------- Função para exibir alerta personalizado

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






