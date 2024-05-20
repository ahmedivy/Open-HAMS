"""add roles and permissions table

Revision ID: f55fd687148b
Revises: d4d7e4c30209
Create Date: 2024-05-04 17:32:07.769394

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'f55fd687148b'
down_revision: Union[str, None] = 'd4d7e4c30209'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('permission',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('role',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('rolepermission',
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('permission_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['permission_id'], ['permission.id'], ),
    sa.ForeignKeyConstraint(['role_id'], ['role.id'], ),
    sa.PrimaryKeyConstraint('role_id', 'permission_id')
    )
    op.add_column('animal', sa.Column('zoo_id', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'animal', 'zoo', ['zoo_id'], ['id'])
    op.add_column('user', sa.Column('role_id', sa.Integer(), nullable=False))
    op.add_column('user', sa.Column('zoo_id', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'user', 'zoo', ['zoo_id'], ['id'])
    op.create_foreign_key(None, 'user', 'role', ['role_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'user', type_='foreignkey')
    op.drop_constraint(None, 'user', type_='foreignkey')
    op.drop_column('user', 'zoo_id')
    op.drop_column('user', 'role_id')
    op.drop_constraint(None, 'animal', type_='foreignkey')
    op.drop_column('animal', 'zoo_id')
    op.drop_table('rolepermission')
    op.drop_table('role')
    op.drop_table('permission')
    # ### end Alembic commands ###
