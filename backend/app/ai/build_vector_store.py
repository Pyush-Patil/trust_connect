from pdf_loader import load_pdfs
from vector_store import create_vector_store


documents = load_pdfs()

print(f"Loaded {len(documents)} PDFs")

create_vector_store(documents)

print("Vector store rebuilt successfully.")