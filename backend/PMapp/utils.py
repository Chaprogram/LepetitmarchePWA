from flask_mail import Message
from . import create_app

def send_admin_report():
    # Créer l'application Flask
    app = create_app()  # Utilisation de la fonction create_app pour obtenir l'instance de l'app

    # Créer le contenu du rapport
    report_content = "Ceci est votre rapport des réservations."

    # Créer le message d'email
    msg = Message(
        'Récapitulatif des réservations',
        sender='your_email@example.com',
        recipients=['charlinec03@gmail.com']
    )
    msg.body = report_content

    # Envoyer l'email dans le contexte de l'application Flask
    with app.app_context():
        mail = app.extensions['mail']  # Accéder à l'extension Flask-Mail
        mail.send(msg)
