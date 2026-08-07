from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    PROFESSIONAL = "professional"
    ADMIN = "admin"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    VERIFIED = "verified"
    REJECTED = "rejected"


class BookingStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class QuoteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"