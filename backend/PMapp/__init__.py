from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_mail import Mail
import os

# Initialisation des extensions
db = SQLAlchemy()
socketio = SocketIO()
mail = Mail()
login_manager = LoginManager()




def create_app():
    # Créer l'application Flask
    app = Flask(__name__)

    # Configuration de l'application
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://lepetitmarchedelixhe25:tbzuGTQxH0iJJvq3PXutmcPxbROEk10r@dpg-cuofka8gph6c73dmi630-a/dbpetitmarche'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Désactiver le suivi des modifications
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_clé_secrète')   # À remplacer par une variable d'environnement
    
    # Configuration de Flask-Mail
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Remplace par ton serveur SMTP
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'charlinec03@gmail.com'  # Remplace par ton email
    app.config['MAIL_PASSWORD'] = 'Jesuisprogrammeuse25'  # Remplace par ton mot de passe

    print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Initialisation des extensions avec l'application
    db.init_app(app)  # Utilise l'instance de db importée
    socketio.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'main.login'  # Vue de connexion

    # Création de la base de données (tables)
    with app.app_context():
        from PMapp import models  # Import des modèles avant de créer la base
        db.create_all()  # Crée les tables si elles n'existent pas

    # Fonction user_loader pour Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from PMapp.models import User
        return User.query.get(int(user_id))

    # Importation et enregistrement des routes
    from PMapp.routes import main  # Importer le Blueprint `main`
    app.register_blueprint(main)



    print("DATABASE_URL: ", os.getenv("DATABASE_URL"))

    return app
