import { app, db } from "./config-firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

let btnAvancar = document.querySelector("#btnAvancar");
let confir = document.querySelector(".confirm");
let imageContainer = document.getElementById("imageContainer");

let loader = document.querySelector("#loader");
let btnCamera = document.querySelector("#btnCamera");

loader.classList.replace("d-block", "d-none"); // para desabilitar o loader

let nomeImagem = "";
let temporaryImageStorage = [];

// Renomeei para evitar conflito com a variável 'images'
let selectedImages = [];
let timestamp = new Date().getTime(); // para poder ser utilizado como nome da imagem ao salvar no cloud storage.

// criando um objeto para armazenar os dados da imagem
let dadosImagem = {
  nome: "",
  url: "",
};

dadosImagem.nome = timestamp; // pegando o novo nome da imagem

const storage = getStorage(app);

btnCamera.addEventListener('change', handleFileSelect);

// Essa função irá verificar em qual página o usuário está atualmente,
// e irá criar um nome único para poder utilizar no localStorage,
// para poder salvar os dados das imagens localmente e depois salvar no firestore
function verificaPagina() {
  if (btnCamera.classList.contains("apr")) {
    nomeImagem = "apr";
  } else if (btnCamera.classList.contains("desligar")) {
    nomeImagem = "desligar";
  } else if (btnCamera.classList.contains("bloquear")) {
    nomeImagem = "bloquear";
  } else if (btnCamera.classList.contains("sinalizar")) {
    nomeImagem = "sinalizar";
  } else if (btnCamera.classList.contains("testar")) {
    nomeImagem = "testar";
  } else if (btnCamera.classList.contains("aterrar")) {
    nomeImagem = "aterrar";
  } else if (btnCamera.classList.contains("proteger")) {
    nomeImagem = "proteger";
  }
}

// Esta função irá pegar a imagem e fazer com que ela seja exibida na página
function handleFileSelect(evt) {
  const files = evt.target.files;

  verificaPagina();

  selectedImages = []; // limpando o array de imagens selecionadas

  for (let i = 0; i < Math.min(files.length, 3); i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement('img');
      imgElement.src = e.target.result;
      imgElement.alt = 'Imagem';
      selectedImages.push({ file, imgElement }); // armazenando cada imagem selecionada
      displayImages(); // chamando a função para exibir as imagens
    };

    reader.readAsDataURL(file);
  }
}

function displayImages() {
  while (imageContainer.firstChild) {
    imageContainer.removeChild(imageContainer.firstChild);
  }

  for (let i = 0; i < selectedImages.length; i++) {
    imageContainer.appendChild(selectedImages[i].imgElement);
  }
}

btnAvancar.addEventListener("click", async (evento) => {
  evento.preventDefault();

  const isAprPage = window.location.href.includes("apr.html");

  if (isAprPage) {
    if (selectedImages.length === 0) {
      alert("VOCÊ DEVE INSERIR PELO MENOS UMA IMAGEM PARA PROSSEGUIR.");
    } else {
      temporaryImageStorage.push({ temporaryImageName: nomeImagem, selectedImages });
      store(); // Armazenar no Firestore Storage
    }
  } else {
    if (!confir.checked) {
      alert("VOCÊ DEVE CONFIRMAR ANTES DE PROSSEGUIR.");
    } else if (selectedImages.length === 0) {
      alert("VOCÊ DEVE INSERIR PELO MENOS UMA IMAGEM PARA PROSSEGUIR.");
    } else {
      temporaryImageStorage.push({ temporaryImageName: nomeImagem, selectedImages });
      store(); // Armazenar no Firestore Storage
    }
  }
});

function store() {
  loader.classList.replace("d-none", "d-block");

  try {
    const promises = [];
    let uploadedCount = 0; // Contador para acompanhar o número de uploads concluídos

    // Criar um objeto para armazenar as URLs das imagens por categoria (apr, desligar, bloquear, etc.)
    const dadosEquipe = JSON.parse(localStorage.getItem("dadosEquipe")) || {};

    verificaPagina(); // Identifica a página atual para determinar a categoria

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i].file;
      const imgDados = { ...dadosImagem }; // Copiando os dados da imagem

      const timestamp = new Date().getTime(); // Novo timestamp para cada imagem
      imgDados.nome = timestamp; // Atualizando o nome da imagem

      const storageRef = ref(storage, `DPLimagem/${timestamp}`); // Referência no Storage

      promises.push(
        uploadBytes(storageRef, file).then((resultado) => {
          return getDownloadURL(resultado.ref).then((url) => {
            imgDados.url = url;

            // Armazenar a URL no objeto sob a chave correspondente à categoria da página
            const categoria = nomeImagem;
            if (!dadosEquipe[categoria]) {
              dadosEquipe[categoria] = [];
            }
            dadosEquipe[categoria].push({ timestamp, url });

            localStorage.setItem("dadosEquipe", JSON.stringify(dadosEquipe));

            uploadedCount++;

            if (uploadedCount === selectedImages.length || uploadedCount === 3) {
              loader.classList.replace("d-block", "d-none");

              if (window.location.href.includes("proteger6")) {
                try {
                  const confirmEnvio = confirm("DESEJA REALMENTE ENVIAR O REGISTRO?");
                  if (confirmEnvio) {
                    cadastrarDados();
                    alert("ENVIO BEM-SUCEDIDO! REDIRECIONANDO PARA A PÁGINA INICIAL!");
                    setTimeout(() => {
                      window.location.href = "../..";
                      // window.location.href = "../index.html";
                    }, 2000);
                  }
                } catch (error) {
                  console.error("Erro ao enviar imagem para o Firebase:", error);
                }
              } else {
                const nextPageHref = btnAvancar.getAttribute("href");
                window.location.href = nextPageHref;
              }

              selectedImages = [];
              displayImages();
            }
          });
        }).catch((error) => {
          console.log("Erro ao fazer upload da imagem: " + error);
        })
      );
    }

    Promise.all(promises)
      .then(() => {
        // Continue your logic here after all uploads are successful
      })
      .catch((error) => {
        console.log("Error during image upload: ", error);
        // Handle the error, show an alert, or take appropriate action
      });

  } catch (error) {
    console.error("Erro ao fazer upload da imagem: ", error);
    alert("Não foi possível fazer o upload da imagem, insira uma imagem válida");
  }
}

// Restante do código...

// CADASTRANDO TODOS OS DADOS NO FIRESTORE
async function cadastrarDados() {
  // Pegando os dados do localStorage para armazenar no banco
  let resultado = JSON.parse(localStorage.getItem("dadosEquipe"));

  resultado.imgApr = JSON.parse(localStorage.getItem("apr"));
  resultado.imgDesligar = JSON.parse(localStorage.getItem("desligar"));
  resultado.imgBloquear = JSON.parse(localStorage.getItem("bloquear"));
  resultado.imgSinalizar = JSON.parse(localStorage.getItem("sinalizar"));
  resultado.imgAterrar = JSON.parse(localStorage.getItem("aterrar"));
  resultado.imgTestar = JSON.parse(localStorage.getItem("testar"));
  resultado.imgProteger = JSON.parse(localStorage.getItem("proteger"));
  try {
    console.log(resultado);
    await addDoc(collection(db, "registrar"), resultado);
    alert("Dados cadastrados com sucesso");

    localStorage.removeItem("dadosEquipe");
    localStorage.removeItem("apr");
    localStorage.removeItem("desligar");
    localStorage.removeItem("bloquear");
    localStorage.removeItem("sinalizar");
    localStorage.removeItem("aterrar");
    localStorage.removeItem("testar");
    localStorage.removeItem("proteger");

  } catch (e) {
    console.error("Erro ao criar o documento: ", e);
  }

  // getDados() // chamando função para atualizar lista de dados ao criar novo contato
}
