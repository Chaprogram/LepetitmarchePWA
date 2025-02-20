from PMapp import db  # Importer `db` directement depuis `PMapp`
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy




class User(db.Model,UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)  # Ajoute cette ligne pour l'attribut is_admin
   

    def get_id(self):
        return str(self.id)  # Retourne l'ID unique sous forme de chaîne
    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    


class Product(db.Model):
    __tablename__ = 'product'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100))
    stock = db.Column(db.Integer, nullable=False, default=0) 

    def __repr__(self):
        return f'<Product {self.name}>'

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

class Reservation(db.Model):
    __tablename__ = 'reservations'
    id = Column(Integer, primary_key=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(20), nullable=False)
    order_details = Column(String, nullable=False)  # Contient les détails de la commande (produits)
    reservation_date = Column(DateTime, default=datetime.utcnow)

    # Lien avec un utilisateur (si tu veux associer une réservation à un utilisateur)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User', backref='reservations')

class Admin(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f"<Admin {self.email}>"