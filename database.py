# Arquivo: database.py

# --- Importações ---
import sqlite3

# --- Constantes ---
# Define o nome do arquivo do banco de dados para ser usado em toda a aplicação
DATABASE_NAME = 'database.db'

# --- Funções Helper ---
def get_db_connection():
    """
    Cria e retorna uma nova conexão com o banco de dados SQLite.
    
    Configura o 'row_factory' para sqlite3.Row. Isso permite que os
    resultados das consultas sejam acessados como dicionários (ex: row['descricao']),
    o que é essencial para a serialização em JSON.
    """
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Inicializa o banco de dados.
    Cria a tabela 'tasks' se ela ainda não existir.
    Esta função é chamada uma vez na inicialização do app.
    """
    try:
        # O 'with' garante que a conexão será fechada (commit/close) automaticamente,
        # mesmo se ocorrer um erro.
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Script SQL para criar a tabela principal da aplicação
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    descricao TEXT NOT NULL,
                    concluida BOOLEAN NOT NULL CHECK (concluida IN (0, 1)),
                    data_criacao TEXT 
                )
            ''')
    
            try:
                cursor.execute('''
                    ALTER TABLE tasks ADD COLUMN data_conclusao TEXT
                ''')
                print("Coluna 'data_conclusao' adicionada com sucesso.")
            except sqlite3.OperationalError as e:
                # Este erro (OperationalError) geralmente significa que 
                # a coluna "data_conclusao" JÁ EXISTE, o que é ótimo.
                # Apenas imprimimos uma mensagem e continuamos.
                print(f"Info: Coluna 'data_conclusao' provavelmente já existe ({e})")
                pass
            
        print("Tabela 'tasks' verificada/criada com sucesso.")
        
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")