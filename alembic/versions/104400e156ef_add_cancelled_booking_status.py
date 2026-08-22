"""add cancelled booking status

Revision ID: 104400e156ef
Revises: 0dce7529a4e0
Create Date: 2026-08-14 12:46:17.995610

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision: str = '104400e156ef'
down_revision: Union[str, Sequence[str], None] = '0dce7529a4e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'bookings',
        'status',
        existing_type=mysql.ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'),
        type_=sa.Enum('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED', name='bookingstatus'),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'bookings',
        'status',
        existing_type=sa.Enum('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED', name='bookingstatus'),
        type_=mysql.ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'),
        existing_nullable=False,
    )
