from pathlib import Path
from pypdf import PdfReader


DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def load_pdfs():
    documents = []

    for pdf_path in DATA_DIR.rglob("*.pdf"):
        reader = PdfReader(pdf_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        text = text.replace("■", "₹")

        documents.append({
            "source": str(pdf_path),
            "text": text
        })

    return documents