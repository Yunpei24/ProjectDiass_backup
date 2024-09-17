from mysql.connector import Error
from sqlalchemy import create_engine


# Créer une connexion via SQLAlchemy engine
def create_engine_mysql():
    user = 'root'
    password = ''
    host = '127.0.0.1'
    database = 'solaire_db'
    engine = create_engine(f'mysql+mysqlconnector://{user}:{password}@{host}/{database}', echo=False)
    return engine