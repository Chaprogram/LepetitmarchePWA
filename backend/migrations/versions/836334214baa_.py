"""empty message

Revision ID: 836334214baa
Revises: 1485c10ed5b9
Create Date: 2025-03-03 22:51:45.222655

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '836334214baa'
down_revision = '1485c10ed5b9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.drop_column('items')

    with op.batch_alter_table('order_item', schema=None) as batch_op:
        batch_op.add_column(sa.Column('product_order_id', sa.Integer(), nullable=False))
        batch_op.drop_constraint('order_item_order_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'product_order', ['product_order_id'], ['id'])
        batch_op.drop_column('order_id')

    with op.batch_alter_table('product_order', schema=None) as batch_op:
        batch_op.add_column(sa.Column('order_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(None, 'order', ['order_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('product_order', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('order_id')

    with op.batch_alter_table('order_item', schema=None) as batch_op:
        batch_op.add_column(sa.Column('order_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('order_item_order_id_fkey', 'product_order', ['order_id'], ['id'])
        batch_op.drop_column('product_order_id')

    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.add_column(sa.Column('items', sa.TEXT(), autoincrement=False, nullable=False))

    # ### end Alembic commands ###
