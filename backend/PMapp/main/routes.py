
from flask import Blueprint, render_template, redirect, url_for, request, flash, session,jsonify, current_app,render_template_string

from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
import re  # Pour la validation des emails
from PMapp import db, socketio, mail
from PMapp.models import User, Product,Admin,Notification, Reservation
from datetime import datetime 
from urllib.parse import quote
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


from . import main  # Import du Blueprint déclaré dans main/__init__.py
 # Définir un blueprint
main = Blueprint('main', __name__)



@main.route('/')
def index():
    return render_template('index.html')

@main.route('/menu')
def menu():
    products = Product.query.all()
    return render_template('menu.html', products=products)



@main.route('/user')
@login_required
def user():
    products = Product.query.all()
    return render_template('user.html', products=products)

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        print(f"Email : {email}")  # Débogage : Vérifie que l'email est bien récupéré
        
        user = User.query.filter_by(email=email).first()
        if user:
            print(f"User trouvé : {user.username}")  # Débogage : Vérifie si l'utilisateur est trouvé
            
            # Vérification du mot de passe
            if user.check_password(password):
                print("Mot de passe correct")  # Débogage : Vérifie que le mot de passe est correct
                login_user(user)
                
                # Vérification du rôle d'admin après la connexion
                if user.is_admin:
                    return redirect(url_for('main.admin'))
                else:
                    return redirect(url_for('main.utilisateur'))  # Redirection vers la page de menu pour les utilisateurs non-admin
                
            else:
                flash('Email ou mot de passe incorrect', 'danger')
        else:
            flash('Email ou mot de passe incorrect', 'danger')
        
    return render_template('login.html',user=current_user)

@main.route('/utilisateur', methods=['GET'])
@login_required
def utilisateur():
    user = current_user
    print("Utilisateur connecté :", user)  # Log pour voir les données en console
    return render_template('utilisateur.html', user=user)

@main.route('/check-session')
def check_session():
    return jsonify({'logged_in': current_user.is_authenticated})




@main.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Vérification des mots de passe
        if password != confirm_password:
            flash("Les mots de passe ne correspondent pas.", 'error')
            return redirect(url_for('main.register'))

        # Vérification que l'email et le nom d'utilisateur sont uniques
        user_exists = User.query.filter_by(email=email).first()
        if user_exists:
            flash("Cet email est déjà utilisé.", 'error')
            return redirect(url_for('main.register'))

        new_user = User(username=username, email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        flash("Compte créé avec succès ! Vous pouvez maintenant vous connecter.", 'success')
        return redirect(url_for('main.login'))

    return render_template('register.html')


@main.route('/logout')
def logout():
    logout_user()
    session.pop('user_id', None)  # Supprimer l'id de l'utilisateur de la session
    flash("Vous êtes maintenant déconnecté.", "success")
    return redirect(url_for('main.login'))


@main.route('/admin')
@login_required
def admin_page():
    print(f"Utilisateur connecté : {current_user.username}")  # Debug
    if not current_user.is_admin:
        flash("Accès non autorisé", "danger")
        return redirect(url_for('main.index'))
    return render_template('admin.html')



@main.route("/notifications", methods=["GET"])
def get_notifications():
    try:
        notifications = Notification.query.all()
        data = [
            {"client": notif.client_name, "produit": notif.product_name, "quantite": notif.quantity}
            for notif in notifications
        ]
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": f"Erreur : {str(e)}"}), 500



def send_email_via_zoho(name, email, commandes):
    # Configuration de l'e-mail
    from_email = "no-reply@lepetitmarche.be"
    to_email = "email"
    subject = "Confirmation de votre commande - Le Petit Marché"
    body = f"Bonjour {name},<br><br>Merci pour votre commande ! Voici les détails : <br>{commandes}"

    # Création du message
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        # Connexion au serveur SMTP de Zoho
        server = smtplib.SMTP('smtp.zoho.eu', 587)
        server.starttls()
        server.login(from_email, os.getenv('ZOHO_PASSWORD'))  # Mot de passe Zoho ou mot de passe spécifique à l'application
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()
        print(f"E-mail envoyé avec succès à {to_email}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'e-mail : {e}")

@main.route('/reservation', methods=['GET', 'POST'])
def reservation():
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            email = request.form.get('email')
            phone = request.form.get('phone')

            # Construction de la liste des commandes
            produits = {
                "Petit Pain Blanc": "quantity_petit_pain_blanc",
                "Petit Pain Gris": "quantity_petit_pain_gris",
                "Grand Pain Blanc": "quantity_grand_pain_blanc",
                "Grand Pain Gris": "quantity_grand_pain_gris",
                "Baguette": "quantity_baguette",
                "Miche": "quantity_miche",
                "Croissant Nature": "quantity_croissant_nature",
                "Croissant Au Sucre": "quantity_croissant_au_sucre",
                "Pain au Chocolat": "quantity_pain_au_chocolat"
            }

            commandes = []
            for nom_produit, champ in produits.items():
                quantite = int(request.form.get(champ, 0))
                if quantite > 0:
                    commandes.append(f"{quantite} x {nom_produit}")

            # Sauvegarde dans la base de données
            new_reservation = Reservation(
                name=name,
                email=email,
                phone_number=phone,
                order_details=", ".join(commandes)  # Stocke sous forme de chaîne
            )
            db.session.add(new_reservation)
            db.session.commit()
 # Envoi de l'email via Zoho
            send_email_via_zoho(name, email, ", ".join(commandes))
            # Redirection vers la page de confirmation
            return redirect(url_for('main.reservation_submit', name=name, email=email, phone=phone, commandes=", ".join(commandes)))

        except Exception as e:
            db.session.rollback()
            print(str(e))
            flash("Une erreur s'est produite. Veuillez réessayer.", "danger")
            return redirect(url_for('main.reservation'))

    return render_template('reservation.html')


@main.route('/reservation_submit')
def reservation_submit():
    name = request.args.get('name')
    email = request.args.get('email')
    phone = request.args.get('phone')
    commandes = request.args.get('commandes', '').split('|')
    
    return render_template('reservation_submit.html', name=name, email=email, phone=phone, commandes=commandes)

@main.route('/test-email')
def test_email():
    msg = Message('Test Email', 
                  sender='no-reply@lepetitmarche.be', 
                  recipients=['ton-email@gmail.com'])
    msg.body = 'Ceci est un test de l envoi d e-mails via Zoho et Flask.'
    try:
        mail.send(msg)
        return 'E-mail envoyé avec succès !'
    except Exception as e:
        return f'Erreur lors de l\'envoi de l e-mail : {e}'




@main.route('/admin')
def admin():
    produits = Product.query.all()
    return render_template('admin.html',produits=produits)

@main.route('/ajouter_produit', methods=['POST'])
def ajouter_produit():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Données invalides"}), 400  # Renvoie une erreur si aucune donnée n'est envoyée
    
    try:
        nouveau_produit = Product(
            name=data['name'],       
            price=data['price'],
            category=data['category'],
            stock=data['stock']
        )
        db.session.add(nouveau_produit)
        db.session.commit()
        return jsonify({"message": "Produit ajouté avec succès", "produit": data})
    
    except Exception as e:
        db.session.rollback()  # Annule les changements en cas d'erreur
        return jsonify({"error": f"Erreur lors de l'ajout du produit: {str(e)}"}), 500


# Route pour récupérer tous les produits
@main.route('/produits', methods=['GET'])
def get_produits():
    produits = Product.query.all()  # Utilisation correcte de Product
    produits_dict = [{"id": p.id, "name": p.name, "price": p.price, "category": p.category, "stock": p.stock} for p in produits]
    return jsonify(produits_dict)


@main.route('/supprimer_produit/<int:id>', methods=['DELETE'])
def supprimer_produit(id):
    produit = Product.query.get(id)
    if not produit:
        return jsonify({"error": "Produit introuvable"}), 404  # Retourne une erreur HTTP 404 si le produit n'existe pas

    try:
        db.session.delete(produit)
        db.session.commit()
        return jsonify({"message": "Produit supprimé avec succès"})
    
    except Exception as e:
        db.session.rollback()  # Annule les changements en cas d'erreur
        return jsonify({"error": f"Erreur lors de la suppression: {str(e)}"}), 500









@main.route('/pains')
def pains():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='pains').all()  # Par exemple
    return render_template('pains.html', products=products)

@main.route('/alcoolB')
def alcoolB():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='alcoolB').all()  # Par exemple
    return render_template('alcoolB.html', products=products)

@main.route('/alcoolC')
def alcoolC():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='alcoolC').all()  # Par exemple
    return render_template('alcoolC.html', products=products)


@main.route('/animaux')
def animaux():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='animaux').all()  # Par exemple
    return render_template('animaux.html', products=products)


@main.route('/cereales')
def cereales():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='cereales').all()  # Par exemple
    return render_template('cereales.html', products=products)


@main.route('/chips')
def chips():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='chips').all()  # Par exemple
    return render_template('chips.html', products=products)


@main.route('/chiques')
def chiques():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='chiques').all()  # Par exemple
    return render_template('chiques.html', products=products)


@main.route('/chocolats')
def chocolats():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='chocolats').all()  # Par exemple
    return render_template('chocolats.html', products=products)


@main.route('/conserves')
def conserves():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='conserves').all()  # Par exemple
    return render_template('conserves.html', products=products)


@main.route('/glaces')
def glaces():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='glaces').all()  # Par exemple
    return render_template('glaces.html', products=products)


@main.route('/grignotages')
def grignotages():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='grignotages').all()  # Par exemple
    return render_template('grignotages.html', products=products)


@main.route('/hygienes')
def hygienes():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='hygienes').all()  # Par exemple
    return render_template('hygienes.html', products=products)


@main.route('/pates')
def pates():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='pates').all()  # Par exemple
    return render_template('pates.html', products=products)


@main.route('/pellets')
def pellets():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='pellets').all()  # Par exemple
    return render_template('pellets.html', products=products)


@main.route('/sauces')
def sauces():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='sauces').all()  # Par exemple
    return render_template('sauces.html', products=products)


@main.route('/softs')
def softs():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='softs').all()  # Par exemple
    return render_template('softs.html', products=products)


@main.route('/surgeles')
def surgeles():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    products = Product.query.filter_by(category='surgeles').all()  # Par exemple
    return render_template('surgeles.html', products=products)


@main.route('/cart')
def cart():
      return render_template('cart.html')




@main.route('/send_confirmation_email', methods=['POST'])
def send_confirmation_email():
    data = request.json  # On récupère les infos envoyées depuis le frontend
    user_email = data.get("email")
    order_details = data.get("order_details")  # Les détails de la commande

    if not user_email:
        return jsonify({"error": "Email requis"}), 400

    try:
        msg = Message(
            "Confirmation de votre commande - Le Petit Marché",
            recipients=[user_email]
        )
        msg.body = f"Merci pour votre commande ! Voici un récapitulatif :\n\n{order_details}"
        mail.send(msg)
        return jsonify({"message": "E-mail envoyé avec succès !"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500 