from PMapp import create_app, db
from PMapp.models import Product

# Crée l'application Flask
app = create_app()

# Liste des produits à ajouter par catégorie
products_data = [
    # Chocolats
    {"name": "Kinder Bueno", "price": 5.99,  "category": "Chocolats"},
    {"name": "Kinder Surprise", "price": 2.99,  "category": "Chocolats"},
    
    # Chiques
    {"name": "Haribo Peach", "price": 1.75,  "category": "Chiques"},
    {"name": "Dragibus", "price": 2.20,  "category": "Chiques"},
    {"name": "Haribo Starmix", "price": 1.75,  "category": "Chiques"},
    
    # Chips
    {"name": "Buggles Cheese", "price": 4.65,  "category": "Chips"},
    {"name": "Monster Munch", "price": 4.65, "category": "Chips"},
    {"name": "Curly", "price": 4.65,  "category": "Chips"},
    
    # Céréales
    {"name": "Honey Pops 600g", "price": 8.40,  "category": "Céréales"},
    {"name": "Nesquick 470g", "price": 6.70,  "category": "Céréales"},
    {"name": "Tresor Classic", "price": 7.90,  "category": "Céréales"},
    
    # Glaces
    {"name": "Calipo Citron", "price": 2.50,  "category": "Glaces"},
    {"name": "Calipo Coca", "price": 2.50,  "category": "Glaces"},
    {"name": "Calipo Orange", "price": 2.50,  "category": "Glaces"},
    
    # Surgelés
    {"name": "Pizza Tono", "price": 7.95,  "category": "Surgelés"},
    {"name": "Pizza Diavola", "price": 7.95,  "category": "Surgelés"},
    {"name": "Pizza Hawai", "price": 7.95,  "category": "Surgelés"},
    
    # Sauces
    {"name": "DL Samourai 300ml", "price": 4.85,  "category": "Sauces"},
    {"name": "DL Tartare 300ml", "price": 4.85,  "category": "Sauces"},
    {"name": "DL Andalouse 300ml", "price": 4.90,  "category": "Sauces"},
    
    # Conserves
    {"name": "Zwanfrank", "price": 6.95,  "category": "Conserves"},
    {"name": "Panzani Canelloni 400g", "price": 7.95,  "category": "Conserves"},
    {"name": "Zwan Cocktail 230g", "price": 4.95,  "category": "Conserves"},
    
    # Grignotages
    {"name": "Bifi Roll", "price": 2.95,  "category": "Grignotages"},
    {"name": "Bifi Roll XXL", "price": 3.45, "category": "Grignotages"},
    {"name": "Tuc Paprika", "price": 2.95,  "category": "Grignotages"},
    
    # Pains
    {"name": "Pains Burgers 6", "price": 4.45,  "category": "Pains"},
    {"name": "Pain Jacquet", "price": 5.90,  "category": "Pains"},
    
    # Pâtes lovers
    {"name": "Soubry Macaroni", "price": 3.85,  "category": "Pâtes lovers"},
    {"name": "Soubry Cappellini", "price": 3.85,  "category": "Pâtes lovers"},
    {"name": "Soubry Penne", "price": 3.85,  "category": "Pâtes lovers"},
    
    # Softs
    {"name": "Fantal 1,5L", "price": 3.95,  "category": "Softs"},
    {"name": "Coca Zero 1,5L", "price": 3.95,  "category": "Softs"},
    {"name": "Coca 1,5L", "price": 3.95,  "category": "Softs"},
    
    # Alcools en canettes
    {"name": "Despe Mojito", "price": 4.90,  "category": "Alcools en canettes"},
    {"name": "Gordon 10", "price": 5.50,  "category": "Alcools en canettes"},
    {"name": "Jup 33", "price": 2.20,  "category": "Alcools en canettes"},
    
    # Alcools bouteilles
    {"name": "Alsace Pinot Blanc", "price": 18.90,  "category": "Alcools bouteilles"},
    {"name": "Alsace Gewurztraminer", "price": 18.90,  "category": "Alcools bouteilles"},
    {"name": "Alsace Sylvaner", "price": 18.90,  "category": "Alcools bouteilles"},
    {"name": "Alsace Pinot Noir", "price": 18.90,  "category": "Alcools bouteilles"},
    
    # Hygiène
    {"name": "Scottex PQ 24", "price": 14.95,  "category": "Hygiène"},
    {"name": "Klennex 10 Paquets de Mouchoir", "price": 7.45,  "category": "Hygiène"},
    {"name": "Durex Original 10", "price": 15.00,  "category": "Hygiène"},
    
    # Animaux
    {"name": "Litière Boni 10L", "price": 11.95,  "category": "Animaux"},
    {"name": "Sheba Classic Terrine Pate", "price": 2.50,  "category": "Animaux"},
    {"name": "Rodeo Poulet", "price": 4.95,  "category": "Animaux"},
    
    # Pellets
    {"name": "Pellet 15kg Clean Fire", "price": 12.90,  "category": "Pellets"},
]

# Ajouter les produits à la base de données
with app.app_context():
    for product_data in products_data:
        product = Product(
            name=product_data["name"],
            price=product_data["price"],
            category=product_data["category"],
            stock=product_data["stock"] 
        )
        db.session.add(product)
    db.session.commit()

print("Les produits ont été ajoutés avec succès.")
