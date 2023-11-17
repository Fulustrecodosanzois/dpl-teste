import { db } from "./config-firebase.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Obtenha os documentos da coleção "registrar"
        const querySnapshot = await getDocs(collection(db, "registrar"));

        // Exiba as informações na página
        const informacoesDiv = document.getElementById("informacoes");
        informacoesDiv.innerHTML = ""; // Limpe o conteúdo anterior

        querySnapshot.forEach((doc, index) => {
            const data = doc.data();
            const infoCardHTML = criarCardInformacaoHTML(data, data.ordemServico, data.timestamp);
            informacoesDiv.innerHTML += infoCardHTML;
        });
    } catch (error) {
        console.error("Erro ao obter informações:", error);
    }
});

function criarCardInformacaoHTML(data, ordemServico, timestamp) {
    return `
        <div class="col-12 py-3 mt-4 shadow rounded-4 d-flex justify-content-center align-content-center">
            <div class="px-3">
                <table class="table px-4">
                    <tbody>
                        <tr>
                            <th scope="row" class="bg-body-secondary rounded-start" colspan="3">Ordem de Serviço:</th>
                            <td class="text-end bg-body-secondary rounded-end" colspan="5">${ordemServico}</td>
                        </tr>
                        <tr>
                            <th scope="row">Líder:</th>
                            <td class="text-end" colspan="5">${data.lider}</td>
                        </tr>
                        <tr>
                            <th scope="row" colspan="5">Matrícula Líder:</th>
                            <td class="text-end" colspan="5">${data.matriculaLider}</td>
                        </tr>
                        <tr>
                            <th scope="row" colspan="4">Matrículas Equipe:</th>
                            <td class="text-end" colspan="4">
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    ${data.matriculas.map((matricula, index) => `<li>M${index + 1}: ${matricula}</li>`).join("")}
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Equipe:</th>
                            <td class="text-end" colspan="5">${data.equipe}</td>
                        </tr>
                        <tr>
                            <th scope="row">Placa:</th>
                            <td class="text-end" colspan="5">${data.placa}</td>
                        </tr>
                        <tr>
                            <th scope="row">Endereço:</th>
                            <td class="text-end" colspan="5">${data.localizacao}</td>
                        </tr>
                        <tr>
                            <th scope="row" colspan="4">Data e Hora:</th>
                            <td colspan="5" class="bg-body-tertiary text-end">${formatarDataHora(timestamp)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function formatarDataHora(timestamp) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    return new Date(timestamp).toLocaleString('pt-BR', options);
}


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "registrar"), query => orderBy(query, 'timestamp', 'desc'));

        const informacoesDiv = document.getElementById("informacoes");
        informacoesDiv.innerHTML = "";

        querySnapshot.forEach((doc, index) => {
            const data = doc.data();
            const infoCardHTML = criarCardInformacaoHTML(data, data.ordemServico, data.timestamp);
            informacoesDiv.innerHTML += infoCardHTML;
        });
    } catch (error) {
        console.error("Erro ao obter informações:", error);
    }
});
