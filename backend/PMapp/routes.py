from flask import Blueprint, render_template, redirect, url_for, request, flash, session,jsonify
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
import re  # Pour la validation des emails
from PMapp import db, socketio, mail
from PMapp.models import User, Product, Admin, Notification, Reservation
from datetime import datetime
from urllib.parse import quote




# Définir un blueprint
main = Blueprint('main', __name__)


@main.route('/')
def index():
    return render_template('index.html')

@main.route('/menu')
def menu():
    products = Product.query.all()
    return render_template('menu.html', products=products)



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
                flash('Connexion réussie', 'success')
                
                # Vérification du rôle d'admin après la connexion
                if user.is_admin:
                    return redirect(url_for('main.admin'))
                else:
                    return redirect(url_for('main.menu'))  # Redirection vers la page de menu pour les utilisateurs non-admin
                
            else:
                flash('Email ou mot de passe incorrect', 'danger')
        else:
            flash('Email ou mot de passe incorrect', 'danger')
        
    return render_template('login.html')


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

            # Envoi de l'e-mail de confirmation
            

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




@main.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@main.route('/admin')
@login_required
def admin():
    print(f"Utilisateur connecté : {current_user.username}")  # Debug
    if not current_user.is_admin:
        flash("Accès non autorisé", "danger")
        return redirect(url_for('main.index'))
    return render_template('admin.html')



@main.route("/add_product", methods=["POST"])
def add_product():
    data = request.get_json()
    if not all(key in data for key in ["nom", "prix", "categorie", "stock", "description"]):
        return jsonify({"message": "Données incomplètes"}), 400

    try:
        nouveau_produit = Product(
            name=data["nom"],
            price=float(data["prix"]),
            category=data["categorie"],
            stock=int(data["stock"]),
            description=data["description"]
        )
        db.session.add(nouveau_produit)
        db.session.commit()
        return jsonify({"message": f"Produit {data['nom']} ajouté avec succès"}), 201
    except Exception as e:
        return jsonify({"message": f"Erreur : {str(e)}"}), 500

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



def envoyer_email_admin(name, email, phone, commandes):
    with main.app_context():
        admin_email = "charlinec03@gmail.com"
        msg = Message("Nouvelle commande reçue !", sender="tonemail@gmail.com", recipients=[admin_email])
        msg.html = render_template("emails/email_commande.html", name=name, email=email, phone=phone, commandes=commandes)

        try:
            mail.send(msg)
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'e-mail : {e}")




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

@main.route('/commander', methods=['POST'])
def commander():
    client_email = request.form['email']
    # Ici, tu ajoutes la logique pour traiter la commande

    # Créer l'e-mail de confirmation
    message = Message(
        'Confirmation de commande',
        recipients=[client_email]
    )
    message.body = 'Merci pour votre commande !'

# Envoyer l'email
  
    mail.send(message)

    # Rediriger vers une page de confirmation ou afficher un message
    return render_template('menu.html')
    


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