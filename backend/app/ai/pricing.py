import re
from pathlib import Path
from functools import lru_cache
from pypdf import PdfReader


# ============================================================
# MASTER PRICING PDF
# ============================================================

PRICING_PDF = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "pricing"
    / "trustconnect_master_service_pricing_rag.pdf"
)


# ============================================================
# LOAD PRICING PDF
# ============================================================

@lru_cache(maxsize=1)
def load_pricing_text():

    if not PRICING_PDF.exists():
        raise FileNotFoundError(
            f"Pricing PDF not found: {PRICING_PDF}"
        )

    reader = PdfReader(PRICING_PDF)

    pages = []

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            pages.append(page_text)

    return "\n".join(pages)


# ============================================================
# NORMALIZATION
# ============================================================

def normalize(text: str) -> str:

    text = text.lower()

    # PDF dash variations
    text = text.replace("–", "-")
    text = text.replace("—", "-")

    # PDF sometimes extracts ₹ as ■
    text = text.replace("■", "₹")

    # Normalize slash spacing
    text = re.sub(r"\s*/\s*", "/", text)

    # Normalize spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# SERVICE ALIASES
# ============================================================

SERVICE_ALIASES = {

    # -------------------------
    # ELECTRICAL
    # -------------------------

    "mcb / fuse fixing": "mcb / fuse fixing",
    "mcb/fuse fixing": "mcb / fuse fixing",

    "tube light fixing": "tube light fixing with frame",

    "fan repair": "fan capacitor replacement",

    "fan capacitor replacement": "fan capacitor replacement",

    "electrical repair": "electrical wiring repair",

    "electrical inspection": "electrical wiring repair",

    "electrical inspection / repair":
        "electrical wiring repair",

    "geyser installation/repair":
        "geyser repair / diagnosis",

    "geyser repair":
        "geyser repair / diagnosis",

    "door bell installation/repair":
        "door bell installation",

    "television installation":
        "tv installation",

    # -------------------------
    # PLUMBING
    # -------------------------

    "cleaning of nani trap":
        "water blockage / nani trap cleaning",

    "pipeline fixing":
        "pipeline fixing / pipe fitting",

    "pipeline fixing / inspection":
        "pipeline fixing / pipe fitting",

    "western commode":
        "western commode service",

    "western commode / closet bend repair":
        "closet bend repair",

    "wash basin installation / pipeline fixing":
        "wash basin installation",

    # -------------------------
    # AC
    # -------------------------

    "ac service":
        "regular service",

    "regular service / repair":
        "ac water leakage repair",

    "gas refill":
        "gas refill r-32/r-410",

    "component repair":
        "ac not cooling diagnosis / repair",

    "fan motor replacement":
        "ac fan motor replacement",

    "pcb repair":
        "ac pcb repair",

    # -------------------------
    # CARPENTRY
    # -------------------------

    "hinges":
        "new hinges fitting",

    "channel fitting in drawer":
        "drawer channel fitting",

    "window jaali replacement":
        "jaali / mesh replacement",

    "door jaali replacement":
        "jaali / mesh replacement",

    "jaali replacement":
        "jaali / mesh replacement",

    "latch / furniture lock fitting":
        "furniture / almirah lock fitting",

    "cylindrical lock":
        "cylindrical lock fixing",

    # -------------------------
    # PAINTING
    # -------------------------

    "painting":
        "wall touch-up",

    "painting / leakage repair":
        "damp wall treatment",

    "painting / moisture inspection":
        "damp wall treatment",

    "painting / waterproofing-related inspection":
        "waterproofing inspection",

    # -------------------------
    # PEST CONTROL
    # -------------------------

    "bed bugs control":
        "bed bug treatment",

    "rat control":
        "rat / rodent control",

    # -------------------------
    # HOME REPAIR
    # -------------------------

    "crack repair":
        "wall crack repair",

    "closet bend repair":
        "closet bend repair",

    "leakage repair":
        "leakage repair",

    # -------------------------
    # RO
    # -------------------------

    "ro leakage":
        "ro leakage repair",

    "ro service":
        "ro general service",

    "ro filter":
        "ro filter replacement",

    "ro installation":
        "ro installation",
}

# ============================================================
# ADDITIONAL SERVICE ALIASES
# ============================================================

SERVICE_ALIASES.update({

    # -------------------------
    # AC
    # -------------------------

    "professional ac servicing":
        "regular service",

    "professional ac service":
        "regular service",

    "ac servicing":
        "regular service",

    "ac service / inspection":
        "regular service",

    # -------------------------
    # PLUMBING
    # -------------------------

    "professional plumbing inspection and repair":
        "pipeline fixing / pipe fitting",

    "professional plumbing inspection":
        "pipeline fixing / pipe fitting",

    "pipe fitting":
        "pipeline fixing / pipe fitting",

    "pipeline repair":
        "pipeline fixing / pipe fitting",

    "professional drain inspection and cleaning":
        "water blockage / nani trap cleaning",

    "drain inspection and cleaning":
        "water blockage / nani trap cleaning",

    "drain cleaning":
        "water blockage / nani trap cleaning",

    "pressure-machine cleaning of the drain line":
        "water blockage / nani trap cleaning",

    # -------------------------
    # CARPENTRY
    # -------------------------

    "drawer channel":
        "drawer channel fitting",

    "drawer channel repair":
        "drawer channel fitting",

    "channel fitting in drawer":
        "drawer channel fitting",

    "broken drawer channel":
        "drawer channel fitting",

    # -------------------------
    # PAINTING
    # -------------------------

    "professional painting/coating service":
        "wall touch-up",

    "professional painting service":
        "wall touch-up",

    "painting/coating service":
        "wall touch-up",

    "professional waterproofing repair":
        "damp wall treatment",

    "waterproofing repair":
        "damp wall treatment",

    # -------------------------
    # PEST CONTROL
    # -------------------------

    "professional inspection and treatment for bed bugs":
        "bed bug treatment",

    "professional bed bug treatment":
        "bed bug treatment",

    "bed bugs treatment":
        "bed bug treatment",

})

# ============================================================
# EXTRACT PRICE
# ============================================================

def extract_price(text: str):

    text = text.replace("■", "₹")

    # --------------------------------------------------------
    # Price range
    # Examples:
    # ₹300–₹800
    # ₹300 - ₹800
    # ₹300–800
    # --------------------------------------------------------

    range_match = re.search(
        r"₹\s*[\d,]+\s*[-–]\s*₹?\s*[\d,]+",
        text
    )

    if range_match:

        price = range_match.group(0)

        price = re.sub(r"\s+", "", price)

        return price

    # --------------------------------------------------------
    # Single price
    # --------------------------------------------------------

    price_match = re.search(
        r"₹\s*[\d,]+",
        text
    )

    if price_match:

        price = price_match.group(0)

        price = re.sub(r"\s+", "", price)

        return price

    # --------------------------------------------------------
    # Inspection
    # --------------------------------------------------------

    if "upon inspection" in text.lower():

        return "Upon Inspection"

    return None


# ============================================================
# BUILD PRICING LINES
# ============================================================

@lru_cache(maxsize=1)
def get_pricing_lines():

    text = load_pricing_text()

    return [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]


# ============================================================
# PRICE LOOKUP
# ============================================================

def get_service_price(service_name: str):

    if not service_name:

        return "Price unavailable"

    original = normalize(service_name)

    target = SERVICE_ALIASES.get(
        original,
        original
    )

    lines = get_pricing_lines()

    # ========================================================
    # PASS 1 — EXACT MATCH
    # ========================================================

    for i, line in enumerate(lines):

        normalized_line = normalize(line)

        if normalized_line == target:

            nearby_text = " ".join(
                lines[i:i + 5]
            )

            price = extract_price(nearby_text)

            if price:
                return price

    # ========================================================
    # PASS 2 — TARGET CONTAINED IN LINE
    # ========================================================

    for i, line in enumerate(lines):

        normalized_line = normalize(line)

        if target in normalized_line:

            nearby_text = " ".join(
                lines[i:i + 5]
            )

            price = extract_price(nearby_text)

            if price:
                return price

    # ========================================================
    # PASS 3 — LINE CONTAINED IN TARGET
    # ========================================================

    for i, line in enumerate(lines):

        normalized_line = normalize(line)

        if normalized_line in target:

            nearby_text = " ".join(
                lines[i:i + 5]
            )

            price = extract_price(nearby_text)

            if price:
                return price

    # ========================================================
    # PASS 4 — WORD-BASED MATCH
    # ========================================================

    target_words = set(
        target.replace("/", " ").replace("-", " ").split()
    )

    best_match = None
    best_score = 0

    for i, line in enumerate(lines):

        normalized_line = normalize(line)

        line_words = set(
            normalized_line
            .replace("/", " ")
            .replace("-", " ")
            .split()
        )

        if not target_words or not line_words:
            continue

        common_words = target_words.intersection(line_words)

        score = len(common_words) / len(target_words)

        if score > best_score:

            price = extract_price(
                " ".join(lines[i:i + 5])
            )

            if price:

                best_score = score
                best_match = price

    # Only accept a reasonably strong match
    if best_match and best_score >= 0.6:

        return best_match

    # ========================================================
    # FINAL FALLBACK
    # ========================================================

    return "Price unavailable"

# ============================================================
# MULTIPLE SERVICE PRICE LOOKUP
# ============================================================

def get_service_prices(services):

    results = []

    for service in services:

        if not service:
            continue

        # Remove explanatory text inside parentheses
        clean_service = re.sub(
            r"\([^)]*\)",
            "",
            service
        ).strip()

        price = get_service_price(clean_service)

        results.append({
            "service": clean_service,
            "price": price
        })

    return results
