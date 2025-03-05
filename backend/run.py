from PMapp import create_app,db
from flask_migrate import Migrate
import os
from waitress import serve
import logging
logging.basicConfig(level=logging.DEBUG)
from . import schedule_report

# Créer l'application Flask

PMapp = create_app()

migrate = Migrate(PMapp,db)

schedule_report(PMapp)


port = int(os.environ.get("PORT", 5000)) 
# Afficher les routes pour le débogage
print(PMapp.url_map)  # Liste toutes les routes connues

if __name__ == '__main__':
 
    serve(PMapp, host="0.0.0.0", port=port, threads=4)