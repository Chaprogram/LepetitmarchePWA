from PMapp import create_app, db
from flask_migrate import Migrate
import os
from waitress import serve
import logging
import sys

# Configurer les logs pour qu'ils s'affichent dans stdout
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)

# Créer l'application Flask
PMapp = create_app()

migrate = Migrate(PMapp, db)

# Récupérer le port à partir de la variable d'environnement
port = int(os.environ.get("PORT", 5000))

# Afficher les routes pour le débogage (uniquement en mode debug)
if PMapp.config["DEBUG"]:
    print(PMapp.url_map)

if __name__ == '__main__':
    # Lancer l'application avec waitress
    serve(PMapp, host="0.0.0.0", port=port, threads=4)

