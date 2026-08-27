"""add professional availability

Revision ID: 93fc717a54bc
Revises: 488ca4ae349f
Create Date: 2026-08-26 23:28:38.990567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '93fc717a54bc'
down_revision: Union[str, Sequence[str], None] = '488ca4ae349f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'professional_profiles',
        sa.Column(
            'is_available',
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        'professional_profiles',
        sa.Column(
            'available_from',
            sa.DateTime(),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        'professional_profiles',
        'available_from'
    )

    op.drop_column(
        'professional_profiles',
        'is_available'
    )