"""empty message

Revision ID: 34fee1e237f6
Revises: 061fca2a286c
Create Date: 2025-03-02 22:17:59.844499

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '34fee1e237f6'
down_revision = '061fca2a286c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('product_order',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('client_name', sa.String(length=100), nullable=False),
    sa.Column('postal_code', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('payment_method', sa.String(length=50), nullable=False),
    sa.Column('delivery_address', sa.String(length=200), nullable=False),
    sa.Column('delivery_date', sa.Date(), nullable=False),
    sa.Column('delivery_time', sa.String(length=50), nullable=False),
    sa.Column('items', sa.Text(), nullable=False),
    sa.Column('total_price', sa.Float(), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('product_order')
    # ### end Alembic commands ###
