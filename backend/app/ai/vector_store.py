import os
import json
import faiss
import numpy as np

from chunker import chunk_text
from embeddings import generate_embedding


VECTOR_STORE_DIR = "data/vector_store"

INDEX_PATH = os.path.join(VECTOR_STORE_DIR, "faiss.index")
METADATA_PATH = os.path.join(VECTOR_STORE_DIR, "metadata.json")


def prepare_chunks(documents):
    """
    Convert loaded PDF documents into chunks
    while preserving the source PDF.
    """

    all_chunks = []

    for document in documents:

        chunks = chunk_text(document["text"])

        for chunk in chunks:

            all_chunks.append({
                "text": chunk,
                "source": document["source"]
            })

    return all_chunks


def create_vector_store(documents):
    """
    Create embeddings for all chunks and store them in FAISS.
    """

    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

    chunks = prepare_chunks(documents)

    embeddings = []

    print(f"Generating embeddings for {len(chunks)} chunks...")

    for chunk in chunks:

        embedding = generate_embedding(chunk["text"])

        embeddings.append(embedding)

    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    faiss.write_index(index, INDEX_PATH)

    with open(METADATA_PATH, "w", encoding="utf-8") as file:
        json.dump(
            chunks,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(f"Stored {len(chunks)} chunks in FAISS")
    print(f"Index saved to: {INDEX_PATH}")
    print(f"Metadata saved to: {METADATA_PATH}")


def load_vector_store():

    index = faiss.read_index(INDEX_PATH)

    with open(METADATA_PATH, "r", encoding="utf-8") as file:
        chunks = json.load(file)

    return index, chunks


def search_similar_chunks(query, top_k=3):

    index, chunks = load_vector_store()

    query_embedding = generate_embedding(query)

    query_vector = np.array(
        [query_embedding]
    ).astype("float32")

    distances, indices = index.search(
        query_vector,
        top_k
    )

    results = []

    for distance, index_position in zip(
        distances[0],
        indices[0]
    ):

        if index_position == -1:
            continue

        results.append({
            "text": chunks[index_position]["text"],
            "source": chunks[index_position]["source"],
            "distance": float(distance)
        })

    return results