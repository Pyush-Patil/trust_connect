from pdf_loader import load_pdfs
from vector_store import create_vector_store


documents = load_pdfs()

create_vector_store(documents)