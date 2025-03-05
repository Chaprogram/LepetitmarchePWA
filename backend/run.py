from PMapp import create_app, db
from flask_migrate import Migrate
import os
from waitress import serve
import logging
from PMapp.scheduler import schedule_report

# Créer l'application Flask
PMapp = create_app()

# Initialisation de Migrate
migrate = Migrate(PMapp, db)

# Initialisation du scheduler
schedule_report()

# Récupérer le port à partir de l'environnement (Render fournit un port dynamique)
port = int(os.environ.get("PORT", 5000))

# Afficher les routes pour débogage
print(PMapp.url_map)  # Liste toutes les routes connues

# Lancer l'application avec Waitress
if __name__ == '__main__':
    serve(PMapp, host="0.0.0.0", port=port, threads=4)

