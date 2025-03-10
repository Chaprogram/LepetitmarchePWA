from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_mail import Mail
import os
from dotenv import load_dotenv

# Initialisation des extensions, mais pas encore liées à l'application
db = SQLAlchemy()
socketio = SocketIO()
mail = Mail()
login_manager = LoginManager()

# Charger les variables d'environnement
load_dotenv()

def create_app():
    # Créer l'application Flask
    app = Flask(__name__)

    # Configuration de l'application
    db_url = os.getenv('DATABASE_URL', 'postgresql://lepetitmarchedelixhe25:tbzuGTQxH0iJJvq3PXutmcPxbROEk10r@dpg-cuofka8gph6c73dmi630-a.frankfurt-postgres.render.com:5432/dbpetitmarche')  # Utilisation de DATABASE_URL
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)  # Fix PostgreSQL

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url  # Utilisation de DATABASE_URL dans SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_clé_secrète')  

    # Configuration de Flask-Mail
    app.config['MAIL_SERVER'] = 'smtp.zoho.eu'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.getenv('ZOHO_EMAIL')
    app.config['MAIL_PASSWORD'] = os.getenv('ZOHO_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_FROM_EMAIL')
    app.config['SESSION_COOKIE_SECURE'] = True 

    # Initialisation des extensions
    db.init_app(app)
    socketio.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'main.login'

    print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("DATABASE_URL: ", os.getenv("DATABASE_URL"))

    # Vérifier la connexion à la base de données (pour le démarrage)
    with app.app_context():
        try:
            # Connexion avec l'application contextuelle
            db.engine.connect()
            print("✅ Connexion à PostgreSQL réussie !")
        except Exception as e:
            print("❌ Erreur de connexion à PostgreSQL :", e)

    # Fonction user_loader pour Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from PMapp.models import User
        return User.query.get(int(user_id))

    # Importation et enregistrement des routes
    from PMapp.routes import main
    app.register_blueprint(main)

    return app

