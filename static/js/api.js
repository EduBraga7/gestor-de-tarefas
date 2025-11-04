// Arquivo: api.js
// Responsabilidade: Conversar com o backend (API).
// Não sabe nada sobre HTML ou DOM.

/**
 * (Read)
 * Busca todas as tarefas do servidor.
 * @returns {Promise<Array>} Uma promessa que resolve para a lista de tarefas.
 */
export async function fetchTasks() {
    try {
        const resposta = await fetch('/api/get_tasks');
        if (!resposta.ok) throw new Error('Erro ao buscar tarefas');
        return await resposta.json();
    } catch (erro) {
        console.error('Erro em fetchTasks:', erro);
        return []; // Retorna um array vazio em caso de erro
    }
}

/**
 * (Create)
 * Envia uma nova tarefa para o servidor.
 * @param {string} descricao - O texto da nova tarefa.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto da nova tarefa.
 */
export async function addTask(descricao) {
    try {
        const resposta = await fetch('/api/add_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: descricao })
        });
        if (!resposta.ok) throw new Error('Erro ao salvar a tarefa');
        return await resposta.json();
    } catch (erro) {
        console.error('Erro em addTask:', erro);
        return { sucesso: false, erro: erro };
    }
}

/**
 * (Update)
 * Atualiza o status de uma tarefa (concluída/pendente) no servidor.
 * @param {number} id - O ID da tarefa.
 * @param {boolean} concluida - O novo status (true ou false).
 * @returns {Promise<object>} Uma promessa que resolve para o objeto de sucesso.
 */
export async function updateTaskStatus(id, concluida) {
    try {
        const resposta = await fetch(`/api/update_task/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concluida: concluida ? 1 : 0 })
        });
        if (!resposta.ok) throw new Error('Erro ao atualizar status');
        return await resposta.json();
    } catch (erro) {
        console.error('Erro em updateTaskStatus:', erro);
        return { sucesso: false, erro: erro };
    }
}

/**
 * (Delete)
 * Exclui uma tarefa do servidor.
 * @param {number} id - O ID da tarefa.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto de sucesso.
 */
export async function deleteTask(id) {
    try {
        const resposta = await fetch(`/api/delete_task/${id}`, {
            method: 'DELETE'
        });
        if (!resposta.ok) throw new Error('Erro ao deletar tarefa');
        return await resposta.json();
    } catch (erro) {
        console.error('Erro em deleteTask:', erro);
        return { sucesso: false, erro: erro };
    }
}

/**
 * (Update/Edit)
 * Edita a descrição de uma tarefa no servidor.
 * @param {number} id - O ID da tarefa.
 * @param {string} novaDescricao - O novo texto da tarefa.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto de sucesso (com a nova descrição).
 */
export async function editTask(id, novaDescricao) {
    try {
        const resposta = await fetch(`/api/edit_task/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: novaDescricao })
        });
        if (!resposta.ok) throw new Error('Erro ao editar tarefa');
        return await resposta.json();
    } catch (erro) {
        console.error('Erro em editTask:', erro);
        return { sucesso: false, erro: erro };
    }
}