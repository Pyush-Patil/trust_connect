from vector_store import search_similar_chunks
from generator import generate_answer


query = input("Ask your problem: ")

results = search_similar_chunks(
    query,
    top_k=3
)

answer = generate_answer(
    query,
    results
)

print("\n")
print("=" * 70)
print("GENERATED PROMPT")
print("=" * 70)
print(answer)