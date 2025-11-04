# Arquivo: app.py

# --- Importações ---
from flask import Flask
from tasks import tasks_bp    # Importa o Blueprint que contém as rotas da aplicação
from database import init_db  # Importa a função de inicialização do banco de dados

# --- "App Factory" (Padrão de Fábrica) ---
def create_app():
    """
    Cria e configura a instância principal do aplicativo Flask.
    Este padrão (App Factory) facilita testes e escalabilidade futura.
    """
    app = Flask(__name__)
    
    # Registra o Blueprint de 'tasks.py' no app principal
    # Todas as rotas (/, /api/add_task, etc.) agora são gerenciadas pelo app
    app.register_blueprint(tasks_bp)
    
    return app

# --- Ponto de Execução Principal ---
if __name__ == '__main__':
    
    # Garante que o banco de dados e a tabela 'tasks' existam ANTES de iniciar o servidor
    init_db() 
    
    # Cria a instância do app usando a "fábrica"
    app = create_app()
    
    # Inicia o servidor de desenvolvimento do Flask
    # debug=True reinicia o servidor automaticamente a cada mudança no código
    app.run(debug=True)