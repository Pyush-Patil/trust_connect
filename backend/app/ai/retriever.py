from .vector_store import search_similar_chunks

def retrieve_knowledge(query, top_k=3):
    """
    Retrieve the most relevant knowledge
    for a customer's question.
    """

    results = search_similar_chunks(
        query,
        top_k=top_k
    )

    return results