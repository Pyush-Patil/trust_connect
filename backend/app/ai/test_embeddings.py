from embeddings import generate_embedding


text = "AC is running but not cooling"

embedding = generate_embedding(text)

print("Embedding length:", len(embedding))
print("First 10 values:", embedding[:10])