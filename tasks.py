# --- Importações ---
from flask import Blueprint, render_template, jsonify, request
import datetime
from database import get_db_connection # Helper de conexão com o DB

# --- Inicialização do Blueprint ---
# Define um Blueprint chamado 'tasks' para organizar as rotas
tasks_bp = Blueprint('tasks', __name__)

# --- Rota Principal (Frontend) ---
# Serve o arquivo HTML principal da aplicação
@tasks_bp.route('/')
def index():
    return render_template('index.html')

# ----------------------------
# --- API (CRUD) Endpoints ---
# ----------------------------

# --- API: Criar Tarefa (Create) ---
@tasks_bp.route('/api/add_task', methods=['POST'])
def add_task():
    try:
        dados = request.get_json()
        nova_descricao = dados.get('descricao')

        if not nova_descricao:
            return jsonify({'erro': 'Descrição não pode ser vazia'}), 400

        data_agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO tasks (descricao, concluida, data_criacao) VALUES (?, 0, ?)", 
                (nova_descricao, data_agora)
            )
            novo_id = cursor.lastrowid
        
        return jsonify({
            'sucesso': True, 
            'id': novo_id, 
            'descricao': nova_descricao,
            'concluida': 0,
            'data_criacao': data_agora
        }), 201

    except Exception as e:
        print(f"Erro ao adicionar tarefa: {e}")
        return jsonify({'erro': str(e)}), 500

# --- API: Ler Tarefas (Read) ---
@tasks_bp.route('/api/get_tasks', methods=['GET'])
def get_tasks():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks ORDER BY id DESC")
            rows = cursor.fetchall()

        # Converte a lista de 'sqlite3.Row' em uma lista de dicionários
        tasks = [dict(row) for row in rows]
        
        return jsonify(tasks), 200

    except Exception as e:
        print(f"Erro ao buscar tarefas: {e}")
        return jsonify({'erro': str(e)}), 500
    
# --- API: Atualizar Status da Tarefa (Update) ---
@tasks_bp.route('/api/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """ Esta rota atualiza o status 'concluida' E a 'data_conclusao'. """
    try:
        dados = request.get_json()
        nova_concluida = dados.get('concluida') # Espera 1 (concluída) ou 0 (pendente)

        data_conclusao_final = None # Começa como None (nulo)
        
        # Se a tarefa está sendo MARCADA COMO CONCLUÍDA
        if nova_concluida == 1:
            # Pega a data e hora exata de agora
            data_conclusao_final = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Se a tarefa for REABERTA (nova_concluida == 0), 
        # o valor 'data_conclusao_final' permanece None, limpando a data no banco.

        with get_db_connection() as conn:
            cursor = conn.cursor()
            # Atualiza AMBAS as colunas no banco de dados
            cursor.execute(
                "UPDATE tasks SET concluida = ?, data_conclusao = ? WHERE id = ?", 
                (nova_concluida, data_conclusao_final, task_id)
            )
            
        # Retorna a data de conclusão para o front-end
        return jsonify({'sucesso': True, 'data_conclusao': data_conclusao_final}), 200
    
    except Exception as e:
        print(f"Erro ao atualizar tarefa: {e}")
        return jsonify({'erro': str(e)}), 500
    
# --- API: Editar Descrição da Tarefa (Update/Edit) ---
@tasks_bp.route('/api/edit_task/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    """ Esta rota atualiza apenas a 'descricao' da tarefa. """
    try:
        dados = request.get_json()
        nova_descricao = dados.get('descricao')

        # Validação para não aceitar descrição vazia
        if not nova_descricao or nova_descricao.strip() == '':
            return jsonify({'erro': 'Descrição não pode ser vazia'}), 400

        with get_db_connection() as conn:
            cursor = conn.cursor()
            # Usamos .strip() para salvar a descrição sem espaços extras no início ou fim
            cursor.execute("UPDATE tasks SET descricao = ? WHERE id = ?", (nova_descricao.strip(), task_id))
        
        # Retorna a nova descrição (já limpa) para o front-end
        return jsonify({'sucesso': True, 'nova_descricao': nova_descricao.strip()}), 200
    
    except Exception as e:
        print(f"Erro ao editar tarefa: {e}")
        return jsonify({'erro': str(e)}), 500

# --- API: Deletar Tarefa (Delete) ---
@tasks_bp.route('/api/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id): 
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        
        return jsonify({'sucesso': True}), 200

    except Exception as e:
        print(f"Erro ao deletar tarefa: {e}")
        return jsonify({'erro': str(e)}), 500