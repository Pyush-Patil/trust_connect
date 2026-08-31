from pdf_loader import load_pdfs
from chunker import chunk_text


documents = load_pdfs()

for document in documents:

    if "troubleshooting" not in document["source"].lower():
        continue

    chunks = chunk_text(document["text"])

    print("=" * 80)
    print("SOURCE:", document["source"])
    print("NUMBER OF CHUNKS:", len(chunks))
    print("=" * 80)

    for i, chunk in enumerate(chunks[:10]):

        print(f"\n--- CHUNK {i + 1} ---")
        print(chunk)