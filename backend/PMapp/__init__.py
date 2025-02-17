from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask_mail import Mail
import os
from flask_debugtoolbar import DebugToolbarExtension


# Initialisation des extensions
db = SQLAlchemy()
socketio = SocketIO()
mail = Mail()
login_manager = LoginManager()

def create_app():
    # Créer l'application Flask
    app = Flask(__name__)

# the toolbar is only enabled in debug mode:
    app.debug = True

    # Configuration de l'application
    db_url = os.getenv('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)  # Fix PostgreSQL

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_clé_secrète')  

    toolbar = DebugToolbarExtension(app)

    # Configuration de Flask-Mail
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'  
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')  # Utilisation des variables d'environnement
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')  

    print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("DATABASE_URL: ", os.getenv("DATABASE_URL"))

    # Initialisation des extensions
    db.init_app(app)  
    socketio.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'main.login'
    toolbar.init_app(app) 
     


    # Création de la base de données (tables)
    with app.app_context():
        from PMapp import models  
        db.create_all()  

    # Fonction user_loader pour Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from PMapp.models import User
        return User.query.get(int(user_id))

    # Importation et enregistrement des routes
    from PMapp.routes import main  
    app.register_blueprint(main)

    return app
