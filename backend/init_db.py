from PMapp import create_app, db
from PMapp.models import User, Product  # Importez tous les modèles ici

# Créez l'application Flask
app = create_app()

# Initialisez la base de données
with app.app_context():
    db.create_all()  # Crée toutes les tables définies dans vos modèles
    print("Base de données initialisée avec succès !")
    product = Product(name="Produit test", price=10.0, stock=100, category="Test")
    db.session.add(product)
    db.session.commit()
    print("Produit ajouté avec succès !")