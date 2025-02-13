from flask import Blueprint

# Déclare le Blueprint 'main'
main = Blueprint('main', __name__)

# Importer les routes de ce Blueprint (doit être en bas pour éviter l'import circulaire)
from . import routes



