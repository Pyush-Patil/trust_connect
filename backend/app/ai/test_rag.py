from rag_pipeline import answer_query


print("=" * 70)
print("TrustConnect AI - RAG Testing")
print("Type 'exit' to quit")
print("=" * 70)


while True:

    query = input("\nAsk your problem: ").strip()

    if query.lower() == "exit":
        print("Exiting...")
        break

    if not query:
        continue

    answer = answer_query(query)

    print("\n" + "-" * 70)
    print("FINAL ANSWER")
    print("-" * 70)

    print(answer)