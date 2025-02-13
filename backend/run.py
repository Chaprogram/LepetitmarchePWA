from PMapp import create_app, socketio,db
from flask_migrate import Migrate

# Créer l'application Flask

PMapp = create_app()

migrate = Migrate(PMapp,db)


# Afficher les routes pour le débogage
print(PMapp.url_map)  # Liste toutes les routes connues

if __name__ == '__main__':
    # Lancer l'application avec Flask-SocketIO
    socketio.run(PMapp, debug=True,allow_unsafe_werkzeug=True )  # Utiliser socketio.run() au lieu de app.run()



