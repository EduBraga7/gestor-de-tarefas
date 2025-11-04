// Arquivo: ui.js
// Responsabilidade: Manipular o DOM (HTML).
// Não sabe nada sobre a API (fetch).

/**
 * Formata uma string de data (YYYY-MM-DD HH:MM:SS) para um formato legível.
 * @param {string} stringData - A data vinda do banco de dados.
 * @returns {string} - A data formatada (ex: "04/11/2025 às 08:53").
 */
function formatarData(stringData) {
    if (!stringData) {
        return ""; // Retorna vazio se a data for nula
    }
    
    // Converte a string em um objeto Date do JavaScript
    const dataObj = new Date(stringData.replace(" ", "T"));

    // Formata a data (DD/MM/YYYY)
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Meses começam do 0
    const ano = dataObj.getFullYear();
    
    // Formata a hora (HH:MM)
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

/**
 * Cria e insere o elemento HTML (<li>) de uma tarefa no DOM.
 * @param {object} tarefa - O objeto da tarefa (com id, descricao, concluida, data_criacao, data_conclusao).
 * @param {HTMLElement} listaAlvo - O <ul> (listaPendentes ou listaConcluidas) onde a tarefa será inserida.
 * @param {object} handlers - Um objeto contendo as funções de callback para os eventos.
 */
export function drawTask(tarefa, listaAlvo, handlers) {
    // Cria os elementos
    const item = document.createElement('li');
    item.dataset.id = tarefa.id;

    // NOVO: Container para o texto e a data
    const containerTexto = document.createElement('div');
    containerTexto.className = 'container-texto-tarefa';

    const textoTarefa = document.createElement('span');
    textoTarefa.textContent = tarefa.descricao;
    textoTarefa.className = 'descricao-tarefa editavel';

    // NOVO: Elemento de Data
    const textoData = document.createElement('small');
    textoData.className = 'data-tarefa';
    
    // Define o texto da data baseado no status
    if (tarefa.concluida && tarefa.data_conclusao) {
        textoData.textContent = `Concluída em: ${formatarData(tarefa.data_conclusao)}`;
    } else {
        textoData.textContent = `Criada em: ${formatarData(tarefa.data_criacao)}`;
    }

    const containerBotoes = document.createElement('div');
    containerBotoes.className = 'botoes';

    // Botão Concluir (Checkbox)
    const btnConcluir = document.createElement('input');
    btnConcluir.type = 'checkbox';
    btnConcluir.className = 'btn-concluir';
    btnConcluir.checked = tarefa.concluida;

    btnConcluir.addEventListener('change', () => {
        handlers.onStatusChange(tarefa.id, btnConcluir.checked, tarefa.data_criacao); // Passa a data de criação
    });

    // Botão Deletar (X)
    const btnDeletar = document.createElement('button');
    btnDeletar.textContent = 'X';
    btnDeletar.className = 'btn-deletar';
    btnDeletar.addEventListener('click', () => {
        handlers.onDelete(tarefa.id);
    });

    // Botão Editar (Lápis)
    const btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️';
    btnEditar.className = 'btn-editar';
    btnEditar.addEventListener('click', () => {
        handlers.onEditClick(item, tarefa.id, tarefa.descricao); 
    });

    if (tarefa.concluida) {
        item.classList.add('concluida');
    }

    // Monta o <li>
    containerBotoes.appendChild(btnConcluir);
    containerBotoes.prepend(btnEditar); // Lápis antes do X
    containerBotoes.appendChild(btnDeletar);

    // Adiciona o texto E a data ao container
    containerTexto.appendChild(textoTarefa);
    containerTexto.appendChild(textoData);

    // Adiciona o container de texto e o container de botões ao item
    item.appendChild(containerTexto);
    item.appendChild(containerBotoes);

    // Insere no DOM
    listaAlvo.prepend(item);
}

/**
 * Atualiza os números (spans) ao lado dos títulos h2.
 */
export function updateCounters(listaPendentes, listaConcluidas, spanPendentes, spanConcluidas) {
    const numPendentes = listaPendentes.getElementsByTagName('li').length;
    const numConcluidas = listaConcluidas.getElementsByTagName('li').length;

    spanPendentes.textContent = `(${numPendentes})`;
    spanConcluidas.textContent = `(${numConcluidas})`;
}

/**
 * Move um item <li> entre as listas E ATUALIZA O TEXTO DA DATA.
 * @param {number} id - O ID da tarefa (data-id).
 * @param {boolean} concluida - O novo status.
 * @param {string} novoTextoData - O texto exato (formatado) para a data.
 * @param {HTMLElement} listaPendentes - O <ul> de pendentes.
 * @param {HTMLElement} listaConcluidas - O <ul> de concluídas.
 */
export function moveTaskDOM(id, concluida, novoTextoData, listaPendentes, listaConcluidas) {
    const item = document.querySelector(`li[data-id="${id}"]`);
    if (item) {
        const textoData = item.querySelector('.data-tarefa');
        
        // Atualiza o texto da data
        if (textoData) {
            textoData.textContent = novoTextoData;
        }

        // Move o item
        if (concluida) {
            item.classList.add('concluida');
            listaConcluidas.prepend(item);
        } else {
            item.classList.remove('concluida');
            listaPendentes.prepend(item);
        }
    }
}


/**
 * Remove um item <li> do DOM.
 * @param {number} id - O ID da tarefa (data-id).
 */
export function removeTaskDOM(id) {
    const item = document.querySelector(`li[data-id="${id}"]`);
    if (item) {
        item.remove();
    }
}

/**
 * Limpa o campo de input.
 * @param {HTMLElement} input - O campo <input> a ser limpo.
 */
export function clearInput(input) {
    input.value = '';
}

/**
 * Transforma o <span> de texto em um <input> para edição.
 */
export function showEditView(item) {
    const textoSpan = item.querySelector('.descricao-tarefa.editavel');
    const botoesDiv = item.querySelector('.botoes');
    
    // NOVO: Encontra e esconde a data também
    const dataSmall = item.querySelector('.data-tarefa');
    if (dataSmall) dataSmall.style.display = 'none';

    textoSpan.style.display = 'none';
    botoesDiv.style.display = 'none';

    const editContainer = document.createElement('div');
    editContainer.className = 'edit-container';

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = textoSpan.textContent;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.className = 'btn-salvar-edit';

    editContainer.appendChild(editInput);
    editContainer.appendChild(saveButton);
    
    // Adiciona o editContainer DENTRO do container de texto
    const containerTexto = item.querySelector('.container-texto-tarefa');
    if (containerTexto) {
        // Coloca o input DEPOIS do span (que está escondido)
        containerTexto.appendChild(editContainer);
    } else {
        item.prepend(editContainer); // Fallback
    }

    editInput.focus();

    return { editInput, saveButton };
}

/**
 * Reverte o <input> de edição de volta para um <span> de texto.
 */
export function hideEditView(item, novaDescricao) {
    const editContainer = item.querySelector('.edit-container');
    if (editContainer) {
        editContainer.remove();
    }

    const textoSpan = item.querySelector('.descricao-tarefa.editavel');
    const botoesDiv = item.querySelector('.botoes');
    
    // NOVO: Encontra e mostra a data também
    const dataSmall = item.querySelector('.data-tarefa');
    if (dataSmall) dataSmall.style.display = '';

    textoSpan.textContent = novaDescricao;
    textoSpan.style.display = '';
    botoesDiv.style.display = '';
}