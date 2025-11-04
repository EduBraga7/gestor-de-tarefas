// Arquivo: main.js
// Responsabilidade: "Maestro" da aplicação.
// 1. Importa as lógicas de API e UI.
// 2. Seleciona os elementos DOM.
// 3. Define os "handlers" (o que acontece em cada evento).
// 4. Anexa os ouvintes de evento (addEventListener).
// 5. Inicializa a aplicação.

// --- 1. Importações ---
import * as api from './api.js';
import * as ui from './ui.js';

/**
 * Formata uma string de data (YYYY-MM-DD HH:MM:SS) para um formato legível.
 * @param {string} stringData - A data vinda do banco de dados.
 * @returns {string} - A data formatada (ex: "04/11/2025 às 08:53").
 */
function formatarData(stringData) {
    if (!stringData) {
        return ""; // Retorna vazio se a data for nula
    }
    const dataObj = new Date(stringData.replace(" ", "T"));
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

// --- "Escutador" de Evento Principal ---
document.addEventListener('DOMContentLoaded', function () {

    // --- 2. Seletores DOM ---
    const btnAdicionar = document.getElementById('btn-adicionar');
    const inputNovaTarefa = document.getElementById('input-nova-tarefa');
    const listaPendentes = document.getElementById('lista-pendentes');
    const listaConcluidas = document.getElementById('lista-concluidas');
    const spanPendentes = document.getElementById('contador-pendentes');
    const spanConcluidas = document.getElementById('contador-concluidas');

    // --- 3. "Handlers" (Os Conectores) ---

    /**
     * Handler para ADICIONAR uma tarefa.
     */
    async function handleAddTask() {
        const descricao = inputNovaTarefa.value;
        if (descricao.trim() === '') {
            alert('Por favor, digite uma descrição para a tarefa.');
            return;
        }
        
        const novaTarefa = await api.addTask(descricao);
        
        if (novaTarefa.sucesso) {
            ui.clearInput(inputNovaTarefa);
            
            // O objeto 'novaTarefa' já tem 'data_criacao'
            // O 'ui.drawTask' vai lidar com tudo
            ui.drawTask(novaTarefa, listaPendentes, { 
                onStatusChange: handleStatusChange, 
                onDelete: handleDelete,
                onEditClick: handleEditClick
            });
            updateAllCounters();
        } else {
            alert('Houve um problema ao adicionar sua tarefa.');
        }
    }

    /**
 * Handler para MUDAR O STATUS de uma tarefa (concluir/desfazer).
 * @param {number} id - ID da tarefa
 * @param {boolean} concluida - O novo status (true/false)
 * @param {string} dataCriacaoOriginal - A data de criação original da tarefa
 */
async function handleStatusChange(id, concluida, dataCriacaoOriginal) {

    // 1. Chama a API para atualizar o status
    const resposta = await api.updateTaskStatus(id, concluida);

    if (resposta.sucesso) {

        // 2. Prepara os dados para a UI
        let textoDataFinal; // A string de data COMPLETA

        if (concluida) {
            // Se marcou como concluída
            // Monta a string final AQUI, usando a função que colamos
            textoDataFinal = `Concluída em: ${formatarData(resposta.data_conclusao)}`;
        } else {
            // Se reabriu a tarefa
            // Monta a string final AQUI
            textoDataFinal = `Criada em: ${formatarData(dataCriacaoOriginal)}`;
        }

        // 3. Chama o ui.js para mover o item com os argumentos CERTOS
        // Agora 'textoDataFinal' é o 3º argumento (novoTextoData)
        ui.moveTaskDOM(id, concluida, textoDataFinal, listaPendentes, listaConcluidas);

        // 4. Atualiza os contadores
        updateAllCounters();
    }
}
    /**
     * Handler para DELETAR uma tarefa.
     */
    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja apagar esta tarefa?')) {
            return;
        }
        
        const resposta = await api.deleteTask(id);
        if (resposta.sucesso) {
            ui.removeTaskDOM(id);
            updateAllCounters();
        }
    }

    /**
     * Handler para o CLIQUE NO BOTÃO "EDITAR" (✏️).
     */
    function handleEditClick(item, id, descricaoAtual) {
        // 'item' é o <li>
        const { editInput, saveButton } = ui.showEditView(item);

        saveButton.addEventListener('click', () => {
            handleSaveEdit(item, id, editInput);
        });
        
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSaveEdit(item, id, editInput);
            }
        });
    }

    /**
     * Handler para SALVAR a edição.
     */
    async function handleSaveEdit(item, id, editInput) {
        const novaDescricao = editInput.value;
        
        if (novaDescricao.trim() === '') {
            alert('A descrição não pode ficar vazia.');
            return;
        }
        
        const resposta = await api.editTask(id, novaDescricao);
        
        if (resposta.sucesso) {
            ui.hideEditView(item, resposta.nova_descricao);
        } else {
            alert('Erro ao salvar a edição.');
            ui.hideEditView(item, editInput.defaultValue); // 'defaultValue' guarda o valor original
        }
    }

    /**
     * Handler para INICIALIZAR a aplicação.
     */
    async function initializeApp() {
        const tarefas = await api.fetchTasks();
        
        listaPendentes.innerHTML = '';
        listaConcluidas.innerHTML = '';

        tarefas.forEach(tarefa => {
            const listaAlvo = tarefa.concluida ? listaConcluidas : listaPendentes;
            
            // O objeto 'tarefa' aqui já contém 'data_criacao' e 'data_conclusao',
            // então o 'drawTask' vai funcionar corretamente.
            ui.drawTask(tarefa, listaAlvo, { 
                onStatusChange: handleStatusChange, 
                onDelete: handleDelete,
                onEditClick: handleEditClick
            });
        });

        updateAllCounters();
    }

    /**
     * Função helper interna para atualizar os contadores.
     */
    function updateAllCounters() {
        ui.updateCounters(listaPendentes, listaConcluidas, spanPendentes, spanConcluidas);
    }

    // --- 4. "Ouvintes" de Eventos Principais ---
    btnAdicionar.addEventListener('click', handleAddTask);
    inputNovaTarefa.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });

    // --- 5. Inicialização ---
    initializeApp();

}); // Fim do 'DOMContentLoaded'