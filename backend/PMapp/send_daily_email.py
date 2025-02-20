import os
import psycopg2
from datetime import datetime, timedelta
from flask import Flask
from flask_mail import Mail, Message
from dotenv import load_dotenv
import pandas as pd  # Pour créer les tableaux HTML plus facilement

# --- Charger les variables d'environnement ---
load_dotenv()

# --- Configurer Flask et Flask-Mail ---
app = Flask(__name__)

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.mailtrap.io')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 2525))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

# --- Connexion à PostgreSQL ---
DATABASE_URL = os.getenv('DATABASE_URL')

def get_tomorrow_reservations():
    """Récupère les réservations pour le lendemain et retourne deux DataFrames"""
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Date du lendemain
    tomorrow = (datetime.now() + timedelta(days=1)).date()

    # 1. Récupérer les détails des réservations
    cursor.execute("""
        SELECT u.first_name, u.last_name, u.phone, r.product_name, r.quantity
        FROM reservation r
        JOIN "user" u ON r.user_id = u.id
        WHERE r.reservation_date = %s
        ORDER BY u.last_name, u.first_name;
    """, (tomorrow,))
    reservations = cursor.fetchall()

    # Transformer les résultats en DataFrame
    df_reservations = pd.DataFrame(reservations, columns=['Nom', 'Prénom', 'Téléphone', 'Produit', 'Quantité'])

    # 2. Calculer les totaux par produit
    df_totals = df_reservations.groupby('Produit')['Quantité'].sum().reset_index()

    conn.close()

    return df_reservations, df_totals


def create_email_content():
    """Crée le contenu HTML de l'e-mail avec les deux tableaux"""
    df_reservations, df_totals = get_tomorrow_reservations()

    # Convertir en tableaux HTML stylisés
    html_reservations = df_reservations.to_html(index=False, border=1, classes='table')
    html_totals = df_totals.to_html(index=False, border=1, classes='table')

    # Contenu de l'e-mail
    html_content = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
            }}
            .table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            .table th, .table td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }}
            .table th {{
                background-color: #4c8d5e;
                color: white;
            }}
        </style>
    </head>
    <body>
        <h2>📦 Réservations pour le { (datetime.now() + timedelta(days=1)).strftime('%d/%m/%Y') }</h2>
        
        <h3>🧑‍🤝‍🧑 Détails par client :</h3>
        {html_reservations}

        <h3>📋 Totaux par produit :</h3>
        {html_totals}
    </body>
    </html>
    """
    return html_content


def send_email():
    """Envoie l'e-mail à l'administrateur"""
    with app.app_context():
        try:
            html_content = create_email_content()

            msg = Message(
                subject="🛒 Récapitulatif des réservations - Le Petit Marché",
                sender=os.getenv('MAIL_USERNAME'),
                recipients=[os.getenv('ADMIN_EMAIL')],
                html=html_content
            )

            mail.send(msg)
            print("✅ E-mail envoyé avec succès !")

        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'e-mail : {e}")


if __name__ == "__main__":
    send_email()
