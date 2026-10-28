from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


# PATHS
PROJECT_DIR = Path(__file__).resolve().parents[3]

BACKEND_DIR = PROJECT_DIR / "backend"

PDF_DIR = BACKEND_DIR / "data" / "troubleshooting"

VECTOR_STORE_DIR = BACKEND_DIR / "data" / "vector_store"


# BUILD VECTOR STORE
def build_vector_store():

    print("Starting vector store build...")

    # Find PDF files
    pdf_files = list(PDF_DIR.rglob("*.pdf"))

    if not pdf_files:

        raise RuntimeError(
            f"No PDF files found in:\n{PDF_DIR}"
        )

    print(f"Found {len(pdf_files)} PDF file(s).")


    # Load PDFs
    documents = []

    for pdf_file in pdf_files:

        print(f"Loading: {pdf_file.name}")

        loader = PyPDFLoader(str(pdf_file))

        pdf_documents = loader.load()

        documents.extend(pdf_documents)

    print(f"Loaded {len(documents)} document pages.")

    # Split documents into chunks

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )

    chunks = text_splitter.split_documents(documents)

    print(f"Created {len(chunks)} chunks.")

    # Embedding model
    print("Loading embedding model...")

    embeddings = HuggingFaceEmbeddings(
        model_name=(
            "ibm-granite/"
            "granite-embedding-97m-multilingual-r2"
        ),
        model_kwargs={
            "device": "cpu"
        },
        encode_kwargs={
            "normalize_embeddings": True
        }
    )

    print("Embedding model loaded.")

    # Create FAISS vector store
    print("Creating FAISS vector store...")

    vector_store = FAISS.from_documents(
        chunks,
        embeddings
    )

    # Create directory
    VECTOR_STORE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # Save vector store
    vector_store.save_local(
        str(VECTOR_STORE_DIR)
    )

    print("FAISS vector store created successfully.")

    print(
        f"Saved to:\n{VECTOR_STORE_DIR}"
    )


# RUN SCRIPT
if __name__ == "__main__":

    build_vector_store()