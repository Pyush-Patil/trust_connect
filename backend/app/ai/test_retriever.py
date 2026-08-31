from retriever import retrieve_knowledge


query = input("Ask your problem: ")

results = retrieve_knowledge(
    query,
    top_k=3
)

print("\n")
print("-" * 70)
print("RETRIEVED KNOWLEDGE")
print("-" * 70)

for i, result in enumerate(results, start=1):

    print(f"\nResult {i}")
    print(f"Distance: {result['distance']}")
    print(f"Source: {result['source']}")
    print()
    print(result["text"])