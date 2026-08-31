import re
from pathlib import Path
from pypdf import PdfReader


PRICING_PDF = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "pricing"
    / "home_maintenance_services.pdf"
)


def load_pricing_text():
    reader = PdfReader(PRICING_PDF)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def normalize(text):
    text = text.lower()

    # Normalize spaces
    text = re.sub(r"\s+", " ", text)

    # Normalize separators
    text = text.replace("-", " ")
    text = text.replace("/", " ")

    return text.strip()

def normalize_service_name(text):
    text = text.lower()

    # Remove spaces around /
    text = re.sub(r"\s*/\s*", "/", text)

    # Remove spaces around -
    text = re.sub(r"\s*-\s*", "-", text)

    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()

def extract_price(text):
    """
    Extract ₹ price from a block of pricing text.
    """

    # PDF extraction may convert ₹ to ■
    match = re.search(
        r"[₹■]\s*[\d,]+",
        text
    )

    if match:
        price = match.group(0)
        return price.replace("■", "₹")

    if "upon inspection" in text.lower():
        return "Upon Inspection"

    return None

def get_service_price(service_name):
    """
    Find service price from the pricing PDF.
    Supports aliases when RAG service names differ
    slightly from pricing PDF names.
    """

    # --------------------------------
    # SERVICE ALIASES
    # --------------------------------

    aliases = {
        "mcb / fuse fixing": "mcb/ fuse fixing",

        "wash basin installation / pipeline fixing":
            "wash basin - installation",

        "geyser installation/repair":
            "geyser installation",

    }

    target = normalize_service_name(service_name)
    
    # Wash Basin has different prices based on type
    if "wash basin installation" in target: 
        return "Price depends on basin type"

    # Convert RAG service name to PDF service name
    target = aliases.get(target, target)

    # --------------------------------
    # LOAD PRICING PDF
    # --------------------------------

    text = load_pricing_text()

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # --------------------------------
    # SEARCH SERVICE
    # --------------------------------

    for i, line in enumerate(lines):

        current_line = normalize_service_name(line)

        if target in current_line:

            nearby_lines = lines[i:i + 6]

            nearby_text = " ".join(nearby_lines)

            # PDF extraction may convert ₹ into ■
            price_match = re.search(
                r"[₹■]\s*[\d,]+",
                nearby_text
            )

            if price_match:

                price = price_match.group(0)

                # Convert square symbol to rupee
                price = price.replace("■", "₹")

                return price

    return "Price unavailable"