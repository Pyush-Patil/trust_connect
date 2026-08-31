from pdf_loader import load_pdfs


documents = load_pdfs()

print("Number of PDFs:", len(documents))

for document in documents:
    print("\nSOURCE:", document["source"])
    print("TEXT PREVIEW:")
    print(document["text"][:500])