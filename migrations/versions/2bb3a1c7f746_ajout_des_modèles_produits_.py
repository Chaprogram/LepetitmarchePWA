"""Ajout des modèles produits, notifications et réservations

Revision ID: 2bb3a1c7f746
Revises: 
Create Date: 2025-02-10 21:10:35.727462

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2bb3a1c7f746'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Créer la table 'reservations' avec 'name' et 'email' nullable pour commencer
    op.create_table(
        'reservations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=True),  # 'name' est initialement nullable
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=True),  # 'email' nullable au début
        sa.Column('order_details', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Mettre à jour la colonne 'name' avec une valeur par défaut pour les lignes existantes
    op.execute("""
        UPDATE reservations
        SET name = 'Nom par défaut'
        WHERE name IS NULL
    """)

    # Mettre à jour la colonne 'email' avec une valeur par défaut pour les lignes existantes
    op.execute("""
        UPDATE reservations
        SET email = 'default@example.com'
        WHERE email IS NULL
    """)

    # Rendre la colonne 'name' NON NULL après avoir mis à jour les valeurs
    op.alter_column('reservations', 'name', existing_type=sa.String(length=50), nullable=False)
    op.alter_column('reservations', 'email', nullable=False)  # Rendre 'email' NON NULL

    # Supprimer la colonne 'description' de la table 'product'
    with op.batch_alter_table('product', schema=None) as batch_op:
        batch_op.drop_column('description')



def downgrade():
    # Revert operations in case of rollback
    # Supprimer la table 'reservations' et 'notification'
    op.drop_table('reservations')
    op.drop_table('notification')

    # Rétablir la colonne 'description' dans la table 'product'
    with op.batch_alter_table('product', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.VARCHAR(length=500), nullable=True))

    
