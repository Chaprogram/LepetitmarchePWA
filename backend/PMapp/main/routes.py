
from flask import Blueprint, render_template, redirect, url_for, request, flash, session,jsonify, current_app,render_template_string,send_file

from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
import re  # Pour la validation des emails
from PMapp import db, socketio, mail
from PMapp.models import User, Product,Admin,Notification, Reservation,Order,ProductOrder,OrderItem,DeliveryStatus
from datetime import datetime 
from urllib.parse import quote
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import qrcode
from io import BytesIO
from flask_socketio import emit





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



@main.route('/admin/board')
@login_required
def admin_board():
    # Récupérer l'état des livraisons
    delivery_status = DeliveryStatus.query.first()

    # Si aucune entrée n'existe, on crée une nouvelle entrée avec un statut par défaut
    if not delivery_status:
        delivery_status = DeliveryStatus(status=True)  # Par défaut, les livraisons sont ouvertes
        db.session.add(delivery_status)
        db.session.commit()

    # Récupérer les commandes pour les afficher dans la section "Notifications des Commandes"
    orders = Order.query.all()  # Assure-toi d'importer le modèle Order

    return render_template('admin.html', delivery_status=delivery_status, orders=orders)



@main.route('/order/<int:order_id>', methods=['POST'])
def process_order(order_id):
    order = ProductOrder.query.get_or_404(order_id)
    if order.is_blocked:
        flash('Désolé, les livraisons sont fermées.')
        return redirect(url_for('main.menu'))  # Ou une autre page appropriée
    # Code pour traiter la commande si elle n'est pas bloquée


@main.route('/admin/block_order/<int:order_id>', methods=['POST'])
def block_order(order_id):
    # Récupère la commande par son ID
    order = ProductOrder.query.get_or_404(order_id)
    
    # Change l'état de la commande
    order.is_blocked = not order.is_blocked  # Inverse l'état de "is_blocked"
    
    # Sauvegarde les modifications
    db.session.commit()

    # Affiche un message de succès
    flash('Statut de la commande mis à jour avec succès.')
    
    # Redirige vers le tableau de bord
    return redirect(url_for('main.admin'))


@main.route('/admin/toggle_delivery', methods=['POST'])
def toggle_delivery():
    # Récupère le statut actuel
    current_status = DeliveryStatus.query.first()

    if current_status:
        # Inverse le statut
        current_status.status = not current_status.status
    else:
        # Si le statut n'existe pas encore, on le crée
        new_status = DeliveryStatus(status=True)  # Par défaut ouvert
        db.session.add(new_status)
    
    # Sauvegarde la modification
    db.session.commit()

    # Affiche un message de succès
    flash('Statut des livraisons mis à jour avec succès.')

    # Redirige vers le tableau de bord
    return redirect(url_for('main.admin'))

@main.route('/passer_commande', methods=['POST'])
def passer_commande():
    # Vérifie si les livraisons sont fermées
    delivery_status = DeliveryStatus.query.first()
    
    if delivery_status and not delivery_status.status:
        flash("Les livraisons sont fermées pour le moment. Veuillez réessayer plus tard.")
        return redirect(url_for('main.menu'))

    # Logique pour passer la commande
    # (Si les livraisons sont ouvertes, on procède à la commande)
    # ...

    flash("Commande passée avec succès !")
    return redirect(url_for('main.cart'))


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





@main.route('/reservation', methods=['GET', 'POST'])
def reservation():
    if request.method == 'POST':
        try:
            # Récupération des données du formulaire
            name = request.form.get('name')
            email_reservation = request.form.get('email')
            phone_number = request.form.get('phone_number')

            # Vérification des champs requis
            if not name or not email_reservation or not phone_number:
                flash("Tous les champs sont requis", "danger")
                return redirect(url_for('main.reservation'))

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
                "Pain au Chocolat": "quantity_pain_au_chocolat",
                "Moka": "quantity_moka",
                "Boule de Berlin": "quantity_boule_de_berlin",
                "Tarte au riz": "quantity_tarte_au_riz",
                "Eclair": "quantity_eclair",
                "Gozette abricot": "quantity_gozette_abricot",
                "Gozette pomme": "quantity_gozette_pomme",
                "Gozette cerise": "quantity_gozette_cerise",
                "Gozette prune": "quantity_gozette_prune"
            }

            commandes = []
            for nom_produit, champ in produits.items():
                quantite = int(request.form.get(champ, 0))
                if quantite > 0:
                    commandes.append(f"{quantite} x {nom_produit}")

            if not commandes:
                flash("Veuillez sélectionner au moins un produit.", "danger")
                return redirect(url_for('main.reservation'))

            # Sauvegarde dans la base de données
            new_reservation = Reservation(
                name=name,
                email_reservation=email_reservation,
                phone_number=phone_number,
                order_details=", ".join(commandes)
            )
            db.session.add(new_reservation)
            db.session.commit()
            flash(f"Réservation enregistrée, redirection vers la page de confirmation (ID: {new_reservation.id})", "success")
            # Redirection vers la page de confirmation avec l'ID de la réservation
            return redirect(url_for('main.reservation_submit', reservation_id=new_reservation.id))

        except Exception as e:
            db.session.rollback()
            print(str(e))
            flash("Une erreur s'est produite. Veuillez réessayer.", "danger")
            return redirect(url_for('main.reservation'))

    return render_template('reservation.html')

@main.route('/reservation_submit/<int:reservation_id>', methods=['GET', 'POST'])
def reservation_submit(reservation_id):
    try:
        # Récupérer la réservation à partir de l'ID
        reservation = Reservation.query.get_or_404(reservation_id)

        # Détails de la commande et informations client
        order_details = reservation.order_details.split(',')
        name = reservation.name
        email_reservation = reservation.email_reservation
        phone_number = reservation.phone_number

        # Envoi de l'email de confirmation au client
        msg_client = Message(
            "Confirmation de votre commande - Le Petit Marché",
            recipients=[email_reservation]
        )
        msg_client.body = f"Bonjour {name},\n\nVotre commande a bien été reçue.\nDétails de la commande : {order_details}\nMerci de votre confiance !"
        mail.send(msg_client)

        # Retourner la page de confirmation avec les informations de la réservation
        return render_template(
            'reservation_submit.html',
            name=name,
            email=email_reservation,
            phone=phone_number,
            commandes=order_details
        )

    except Exception as e:
        print(str(e))
        flash("Une erreur s'est produite lors de l'envoi de l'email.", "danger")
        return redirect(url_for('main.reservation'))







@main.route('/admin')
def admin():
    orders = Order.query.all()
    return render_template('admin.html',orders=orders)

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
            category=category
            
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
                "category": nouveau_produit.category
               
            }
        }), 201  # Code de statut HTTP 201 pour la création réussie
    
    except Exception as e:
        # En cas d'erreur, annule la transaction et renvoie une erreur
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'ajout du produit: {str(e)}"}), 500



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
                category=data['category']
                
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


@main.route('/cart')
def cart():
    cart = session.get('cart', [])  # Récupère le panier de la session
    total = sum(item['price'] * item['quantity'] for item in cart)
    return render_template('cart.html', cart=cart, total=total)


@main.route("/get_cart", methods=["GET"])
def get_cart():
    cart = ProductOrder.query.all()  # Exemple si tu récupères les commandes en base de données
    cart_data = [{"name": p.name, "quantity": p.quantity, "price": p.price} for p in cart]

    print("Produits envoyés au frontend:", cart_data)  # 🔥 Log pour vérifier
    return jsonify(cart_data)


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
    try:
        # Récupère les données envoyées par le frontend
        data = request.get_json()  
        print("Données reçues :", data)

        # Vérification que les données contiennent 'cart_items'
        if not data or 'cart_items' not in data:
            return jsonify({"success": False, "error": "Clé 'cart_items' manquante dans la requête"}), 400

        # Calculer le total de la commande
        total_price = sum(item['price'] * item['quantity'] for item in data['cart_items'])

        # Créer la commande
        order = ProductOrder(
            client_name=data['client_name'],
            postal_code=data['postal_code'],
            email=data['email'],
            phone_number=data['phone_number'],
            payment_method=data['payment_method'],
            delivery_address=data['delivery_address'],
            delivery_date=datetime.strptime(data['delivery_date'], '%Y-%m-%d'),
            delivery_time=data['delivery_time'],
            total_price=total_price
        )

        # Ajouter la commande à la base de données
        db.session.add(order)
        db.session.commit()

        # Enregistrer les articles de la commande
        for item in data['cart_items']:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            db.session.add(order_item)
        
        db.session.commit()

        # Envoyer la confirmation au client et notification aux admins
        send_confirmation_email(data['email'],order)
        send_admin_notification(order)

        # Retourner une réponse de succès avec l'ID de la commande
        return jsonify({"success": True, "order_id": order.id}), 200

    except Exception as e:
        # Gestion des erreurs
        print(f"Erreur lors de la commande : {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@main.route('/clear-cart', methods=['POST'])
def clear_cart():
    # Supprimer le panier de la session
    session.pop('cart', None)
    session.modified = True

    # Retourner à la page d'accueil ou à la page du panier
    return redirect(url_for('main.cart'))  # ou redirect(url_for('index')) pour revenir à la page d'accueil

def send_confirmation_email(email, order):
    # Sujet de l'email
    subject = f"Confirmation de votre commande #{order.id}"

    # Corps de l'email en texte brut
    body = f"Bonjour {order.client_name},\n\n"
    body += f"Votre commande #{order.id} a bien été reçue.\n\n"  # Ajout du numéro de commande
    
    body += "Détails de la commande :\n\n"
    
    if not order.items:
        body += "Aucun article trouvé dans la commande.\n"
    else:
        for item in order.items:  # Indentation de la boucle for
            body += f"{item.product.name} - {item.quantity} x {item.price}€\n"
    
    # Création du message
    msg = Message(subject, recipients=[email])

    # Définition du corps de l'email (texte brut et HTML)
    msg.body = body  # Corps en texte brut
    msg.html = f"""
    <div style="font-family: Arial, sans-serif;">
        <h2>Confirmation de votre commande</h2>
        <p><strong>Merci pour votre commande, {order.client_name} !</strong></p>
        <p><strong>Commande n°{order.id}</strong></p>
        <p><strong>📦 Total : </strong>{order.total_price}€</p>
        <p><strong>🕒 Heure de livraison : </strong>{order.delivery_time}</p>  <!-- Ajout de l'heure -->
        <p><strong>📍 Adresse de livraison : </strong>{order.delivery_address}</p>
        
        <h3>Détails de la commande :</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produit</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantité</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Prix</th>
            </tr>
            """
        
    if not order.items:
            msg.html += "<tr><td colspan='3' style='border: 1px solid #ddd; padding: 8px;'>Aucun produit trouvé dans la commande</td></tr>"
    else:
            # Indentation correcte pour la boucle for
            for item in order.items:
                msg.html += f"""
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">{item.product.name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">{item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">{item.price}€</td>
                </tr>
                """
        
        # Ajouter le total de la commande à la fin
    msg.html += f"""
        </table>
        <p><strong>Total de la commande : </strong>{order.total_price}€</p>
        
        <p>☎️ En cas de problème, contactez-nous au 0467 81 15 52.</p>
        <p>Merci et à bientôt !</p>
        <p><strong>Cordialement,</strong></p>
        <p><i>✨ Le Petit Marché ✨</i></p>
    </div>
    """

    # Envoi du message
    mail.send(msg)


def send_admin_notification(order):
    admins_emails = ["charlinec03@gmail.com", "admin2@domain.com"]  # Liste des emails des administrateurs
    
    subject = f"Nouvelle commande {order.id}"
    body = f"Une nouvelle commande a été passée par {order.client_name}.\n\n"
    
    # Ajout des infos du client
    body += f"📍 Adresse : {order.delivery_address}, {order.postal_code}\n"
    body += f"📞 Téléphone : {order.phone_number}\n"
    body += f"📅 Heure de livraison : {order.delivery_time}\n\n"

    body += "Détails de la commande :\n\n"
    order_items = OrderItem.query.filter_by(order_id=order.id).all()
    for item in order.items:
        body += f"{item.product.name} - {item.quantity} x {item.price}€\n"
    
    body += f"\nTotal de la commande : {order.total_price}€\n\nMerci de traiter cette commande."

    for email in admins_emails:
        msg = Message(subject, recipients=[email])
        msg.body = body
        mail.send(msg)



@main.route('/process_payment', methods=['GET', 'POST'])
def process_payment():
    # Ici, tu traiterais le paiement via l'API Payconiq
    # Pour l'instant, nous affichons un message de succès pour la démonstration
    return render_template('payment_success.html')





@main.route('/send_admin_report', methods=['GET'])
def send_admin_report():
    # On récupère les réservations du jour (en fonction de la date actuelle)
    today = datetime.today().date()
    reservations_today = Reservation.query.filter(Reservation.created_at.date() == today).all()
    
    # Création du contenu de l'email récapitulatif
    email_body = "Récapitulatif des réservations pour aujourd'hui :\n\n"
    
    for reservation in reservations_today:
        name = reservation.name
        phone_number = reservation.phone_number
        email_reservation = reservation.email_reservation
        order_details = reservation.order_details
        email_body += f"Nom : {name}\nTéléphone : {phone_number}\nEmail : {email_reservation}\nDétails de la commande : {order_details}\n\n"
    
    # Envoi de l'email à l'admin
    msg_admin = Message(
        "Récapitulatif des réservations - Le Petit Marché",
        recipients=['charlinec03@gmail.com']  # Remplace avec l'email de l'admin
    )
    msg_admin.body = email_body
    mail.send(msg_admin)

    return "Email récapitulatif envoyé à l'admin", 200

