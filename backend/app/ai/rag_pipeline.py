from retriever import search_similar_chunks
from generator import generate_answer

def answer_query(query):

    # 1. Retrieve relevant knowledge
    results = search_similar_chunks(query)

    # 2. Give retrieved knowledge to generator
    answer = generate_answer(query, results)

    # 3. Return final answer
    return answer