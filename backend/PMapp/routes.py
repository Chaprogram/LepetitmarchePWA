
from flask import Blueprint, render_template, redirect, url_for, request, flash, session,jsonify,current_app,render_template_string, send_file
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
import re  # Pour la validation des emails
from PMapp import db, socketio, mail
from PMapp.models import User, Product, Admin, Notification, Reservation
from datetime import datetime
from urllib.parse import quote
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import qrcode
from io import BytesIO



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
                
                # Vérification du rôle d'admin après la connexion
                if user.is_admin:
                    return redirect(url_for('main.admin'))
                else:
                    return redirect(url_for('main.utilisateur'))  # Redirection vers la page de menu pour les utilisateurs non-admin
                
            else:
                flash('Email ou mot de passe incorrect', 'danger')
        else:
            flash('Email ou mot de passe incorrect', 'danger')
        
    return render_template('login.html')


@main.route('/utilisateur', methods=['GET'])
@login_required
def utilisateur():
    user = current_user
    print("Utilisateur connecté :", user)  # Log pour voir les données en console
    return render_template('utilisateur.html', user=user)

@main.route('/check-session')
def check_session():
    return {'logged_in': current_user.is_authenticated}





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
            email_reservation = request.form.get('email')  # Correction ici
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
                email_reservation=email_reservation,  # Correction ici
                phone_number=phone,
                order_details=", ".join(commandes)  # Stocke sous forme de chaîne
            )
            db.session.add(new_reservation)
            db.session.commit()

            # Envoi de l'email via Zoho
            send_email_via_zoho(name, email_reservation, ", ".join(commandes))  # Correction ici

            # Redirection vers la page de confirmation
            return redirect(url_for('main.reservation_submit', name=name, email=email_reservation, phone=phone, commandes="|".join(commandes)))

        except Exception as e:
            db.session.rollback()
            print(str(e))
            flash("Une erreur s'est produite. Veuillez réessayer.", "danger")
            return redirect(url_for('main.reservation'))

    return render_template('reservation.html')

@main.route('/reservation_submit')
def reservation_submit():
    name = request.args.get('name')
    email_reservation = request.args.get('email')  # Correction ici
    phone = request.args.get('phone')
    commandes = request.args.get('commandes', '').split('|')

    return render_template('reservation_submit.html', name=name, email=email_reservation, phone=phone, commandes=commandes)



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



def envoyer_email_admin(name, email, phone, commandes):
    with main.app_context():
        admin_email = "charlinec03@gmail.com"
        msg = Message("Nouvelle commande reçue !", sender="tonemail@gmail.com", recipients=[admin_email])
        msg.html = render_template("emails/email_commande.html", name=name, email=email, phone=phone, commandes=commandes)

        try:
            mail.send(msg)
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'e-mail : {e}")


# Route pour afficher la page admin
@main.route('/admin')
def admin():
    produits = Product.query.all()
    return render_template('admin.html', produits=produits)

@main.route('/api/ajouter_produit', methods=['POST'])
def ajouter_produit():
    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')
    

    if not name or not price or not category:
        return jsonify({"error": "Données invalides. Assurez-vous que 'name', 'price', 'category', 'stock' sont inclus."}), 400

    try:
        # Crée un nouvel objet Produit avec les données envoyées
        nouveau_produit = Product(
            name=name,
            price=float(price),
            category=category,
            
        )
        
        # Ajoute le produit à la base de données
        db.session.add(nouveau_produit)
        db.session.commit()
        
        # Renvoie une réponse avec les détails du produit ajouté
        return jsonify({
            "message": "Produit ajouté avec succès",
            "produit": {
                "id": nouveau_produit.id,  # Ajoute l'ID généré
                "name": nouveau_produit.name,
                "price": nouveau_produit.price,
                "category": nouveau_produit.category,
                
            }
        }), 201  # Code de statut HTTP 201 pour la création réussie
    
    except Exception as e:
        # En cas d'erreur, annule la transaction et renvoie une erreur
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'ajout du produit: {str(e)}"}), 500



# Route pour récupérer tous les produits
@main.route('/api/produits', methods=['GET', 'POST'])
def manage_produits():
    if request.method == 'GET':
        try:
            categorie = request.args.get('categorie')  # Récupérer la catégorie depuis l'URL
            query = Product.query
            if categorie:  # Filtrer si une catégorie est spécifiée
                query = query.filter_by(category=categorie)
            produits = query.all()
            produits_dict = [
                {"id": p.id, "name": p.name, "price": p.price, "category": p.category}
                for p in produits
            ]
            return jsonify(produits_dict), 200
        except Exception as e:
            return jsonify({"error": f"Erreur lors de la récupération des produits: {str(e)}"}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            new_product = Product(
                name=data['name'],
                price=data['price'],
                category=data['category'],
                
            )
            db.session.add(new_product)
            db.session.commit()
            return jsonify({"message": "Produit ajouté avec succès"}), 201
        except Exception as e:
            return jsonify({"error": f"Erreur lors de l'ajout du produit: {str(e)}"}), 500

@main.route('/api/produits/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if product:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Produit supprimé avec succès.'}), 200
    else:
        return jsonify({'message': 'Produit non trouvé.'}), 404


@main.route('/produits/<category>', methods=['GET'])
def get_products_by_category(category):
    valid_categories = ['pains', 'alcoolB', 'alcoolC', 'animaux', 'cereales', 'chips', 'chiques', 'chocolats', 'conserves', 'glaces', 'grignotages', 'hygienes', 'pates', 'pellets', 'sauces', 'softs', 'surgeles']
    
    if category not in valid_categories:
        return "Catégorie invalide", 404

    products = Product.query.filter_by(category=category).all()
    
    print(f"Produits trouvés pour {category}: {products}")  # Vérification en console

    return render_template(f'{category}.html', products=products)

@main.route('/pains')
def pains():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='pains') # Par exemple
    return render_template('pains.html', produits=produits)
   

@main.route('/alcoolB')
def alcoolB():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='alcoolB')  # Par exemple
    return render_template('alcoolB.html', produits=produits)

@main.route('/alcoolC')
def alcoolC():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='alcoolC')  # Par exemple
    return render_template('alcoolC.html', produits=produits)


@main.route('/animaux')
def animaux():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =   Product.query.filter_by(category='animaux')  # Par exemple
    return render_template('animaux.html', produits=produits)


@main.route('/cereales')
def cereales():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =  Product.query.filter_by(category='cereales')  # Par exemple
    return render_template('cereales.html', produits=produits)


@main.route('/chips')
def chips():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =   Product.query.filter_by(category='chips')  # Par exemple
    return render_template('chips.html', produits=produits)


@main.route('/chiques')
def chiques():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =  Product.query.filter_by(category='chiques') # Par exemple
    return render_template('chiques.html', produits=produits)


@main.route('/chocolats')
def chocolats():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='chocolats')  # Par exemple
    return render_template('chocolats.html', produits=produits)


@main.route('/conserves')
def conserves():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =   Product.query.filter_by(category='conserves')  # Par exemple
    return render_template('conserves.html', produits=produits)


@main.route('/glaces')
def glaces():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =  Product.query.filter_by(category='glaces')  # Par exemple
    return render_template('glaces.html', produits=produits)


@main.route('/grignotages')
def grignotages():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='grignotages')  # Par exemple
    return render_template('grignotages.html', produits=produits)


@main.route('/hygienes')
def hygienes():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='hygienes') # Par exemple
    return render_template('hygienes.html', produits=produits)


@main.route('/pates')
def pates():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =   Product.query.filter_by(category='pates')  # Par exemple
    return render_template('pates.html', produits=produits)


@main.route('/pellets')
def pellets():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='pellets')  # Par exemple
    return render_template('pellets.html', produits=produits)


@main.route('/sauces')
def sauces():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits =   Product.query.filter_by(category='sauces')  # Par exemple
    return render_template('sauces.html', produits=produits)


@main.route('/softs')
def softs():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='softs') # Par exemple
    return render_template('softs.html', produits=produits)


@main.route('/surgeles')
def surgeles():
    # Tu peux récupérer les produits de la catégorie "pains" depuis la base de données si tu le souhaites
    produits = Product.query.filter_by(category='surgeles') # Par exemple
    return render_template('surgeles.html', produits=produits)

@main.route('/cart')
def cart():
    cart = session.get('cart', [])  # Récupère le panier de la session
    total = sum(item['price'] * item['quantity'] for item in cart)
    return render_template('cart.html', cart=cart, total=total)


@main.route("/generate_payconiq_qr")
def generate_payconiq_qr():
    # Remplace cette URL par celle de ton compte Payconiq
    payconiq_payment_url = "https://payconiq.com/payment-link-exemple"

    # Générer le QR Code
    qr = qrcode.make(payconiq_payment_url)
    img_io = BytesIO()
    qr.save(img_io, "PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype="image/png")


@main.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    data = request.json  # Données envoyées par le client (JS)
    product_id = data.get('id')
    name = data.get('name')
    price = data.get('price')
    quantity = data.get('quantity', 1)

    if 'cart' not in session:
        session['cart'] = []

    cart = session['cart']

    # Vérifier si le produit est déjà dans le panier
    for item in cart:
        if item['id'] == product_id:
            item['quantity'] += quantity
            break
    else:
        cart.append({'id': product_id, 'name': name, 'price': price, 'quantity': quantity})

    session['cart'] = cart  # Mise à jour de la session
    session.modified = True  # Pour s'assurer que Flask enregistre les changements

    return jsonify({'message': 'Produit ajouté au panier', 'cart': cart})

@main.route("/submit_order", methods=["POST"])
def submit_order():
    data = request.json
    payment_method = data.get("payment_method")
    delivery_address = data.get("delivery_address")
    delivery_date = data.get("delivery_date")
    delivery_time = data.get("delivery_time")

    if not delivery_address:
        return jsonify({"success": False, "error": "Adresse de livraison manquante"}), 400

    # Récupérer les articles du panier
    cart = session.get("cart", [])
    if not cart:
        return jsonify({"success": False, "error": "Le panier est vide"}), 400

    # Sauvegarder la commande dans la base de données
    total_price = sum(item["price"] * item["quantity"] for item in cart)
    new_order = Reservation(
        user_id=session.get("user_id"),  # Assurez-vous que l'utilisateur est connecté
        items=str(cart),
        total_price=total_price,
        delivery_address=delivery_address,
        delivery_date=datetime.strptime(delivery_date, "%Y-%m-%d"),
        delivery_time=delivery_time,
        payment_method=payment_method,
        status="En attente"
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({"success": True, "order_id": new_order.id})




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
    

@main.route('/confirmation_commande', methods=['GET', 'POST'])
def confirmation():
    # Récupérer les informations de l'utilisateur et de la commande
    user = get_user_info()  # Cette fonction récupère les infos de l'utilisateur connecté
    produits = get_order_details()  # Cette fonction récupère les détails des produits dans le panier
    
    # Calculer le total de la commande
    total = sum(produit['price'] * produit['quantity'] for produit in produits)
    
    # Si la méthode est POST, on pourrait rediriger vers la page de paiement
    if request.method == 'POST':
        return redirect(url_for('main.process_payment'))  # Rediriger vers la route de paiement
    
    # Rendre la page de confirmation avec les données
    return render_template('confirmation_commande.html', user=user, produits=produits, total=total)

# Exemple de fonction pour récupérer les infos de l'utilisateur
def get_user_info():
    # À adapter selon ton modèle d'utilisateur
    return {
        'name': 'John',
        'surname': 'Doe',
        'email': 'john.doe@example.com',
        'address': '123 rue de Paris, 75000 Paris'
    }

# Exemple de fonction pour récupérer les détails des produits dans la commande
def get_order_details():
    # À adapter selon comment tu récupères les produits dans le panier
    return [
        {'name': 'Pain', 'price': 2.50, 'quantity': 2},
        {'name': 'Chocolat', 'price': 3.00, 'quantity': 1}
    ]



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
    

@main.route('/process_payment', methods=['GET', 'POST'])
def process_payment():
    # Ici, tu traiterais le paiement via l'API Payconiq
    # Pour l'instant, nous affichons un message de succès pour la démonstration
    return render_template('payment_success.html')
