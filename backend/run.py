from PMapp import create_app, socketio,db
from flask_migrate import Migrate
import os


# Créer l'application Flask

PMapp = create_app()

migrate = Migrate(PMapp,db)


# Afficher les routes pour le débogage
print(PMapp.url_map)  # Liste toutes les routes connues

if __name__ == '__main__':
    PMapp.run(debug=False, use_reloader=False)
    from waitress import serve
    port = int(os.environ.get("PORT", 5000)) 
    serve(PMapp, host="0.0.0.0", port=5000)