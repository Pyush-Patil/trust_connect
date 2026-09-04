"""add government id path to professional profiles

Revision ID: b7c1d2e4f5a6
Revises: 4402f14c88e2
Create Date: 2026-09-03 23:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7c1d2e4f5a6"
down_revision: Union[str, Sequence[str], None] = "4402f14c88e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "professional_profiles",
        sa.Column("government_id", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("professional_profiles", "government_id")
