from PMapp import create_app, socketio,db
from flask_migrate import Migrate
import os

# Créer l'application Flask

PMapp = create_app()

migrate = Migrate(PMapp,db)


# Afficher les routes pour le débogage
print(PMapp.url_map)  # Liste toutes les routes connues

if __name__ == '__main__':
    # Utilise le port fourni par Render via la variable d'environnement PORT
    port = int(os.environ.get('PORT', 5000))  # Utilise 5000 comme valeur par défaut si PORT n'est pas défini
    # Lancer l'application avec Flask-SocketIO
    socketio.run(PMapp, host='0.0.0.0', port=port, debug=True)