import os
import json
import faiss
import numpy as np
from pathlib import Path

from .chunker import chunk_text
from .embeddings import generate_embedding


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"

VECTOR_STORE_DIR = DATA_DIR / "vector_store"

INDEX_PATH = VECTOR_STORE_DIR / "faiss.index"
METADATA_PATH = VECTOR_STORE_DIR / "metadata.json"


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

    faiss.write_index(index, str(INDEX_PATH))
    with open(METADATA_PATH,"w", encoding="utf-8") as file:
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
    index = faiss.read_index(str(INDEX_PATH))

    with open(str(METADATA_PATH), "r", encoding="utf-8") as f:
        chunks = json.load(f)

    return index, chunks


def search_similar_chunks(
    query,
    top_k=3,
    source_filter=None
):

    index, chunks = load_vector_store()

    query_embedding = generate_embedding(query)

    query_vector = np.array(
        [query_embedding]
    ).astype("float32")

    # --------------------------------
    # If no filter is provided
    # search normally
    # --------------------------------

    if source_filter is None:

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

    # --------------------------------
    # Filter chunks by source
    # --------------------------------

    filtered_chunks = []

    filtered_indices = []

    for index_position, chunk in enumerate(chunks):

        if source_filter.lower() in chunk["source"].lower():

            filtered_chunks.append(chunk)
            filtered_indices.append(index_position)

    # --------------------------------
    # No matching source
    # --------------------------------

    if not filtered_chunks:
        return []

    # --------------------------------
    # Generate embeddings for filtered
    # chunks
    # --------------------------------

    filtered_embeddings = []

    for chunk in filtered_chunks:

        embedding = generate_embedding(
            chunk["text"]
        )

        filtered_embeddings.append(
            embedding
        )

    filtered_embeddings = np.array(
        filtered_embeddings
    ).astype("float32")

    # --------------------------------
    # Search only filtered chunks
    # --------------------------------

    filtered_index = faiss.IndexFlatL2(
        filtered_embeddings.shape[1]
    )

    filtered_index.add(
        filtered_embeddings
    )

    search_k = min(
        top_k,
        len(filtered_chunks)
    )

    distances, indices = filtered_index.search(
        query_vector,
        search_k
    )

    results = []

    for distance, filtered_position in zip(
        distances[0],
        indices[0]
    ):

        if filtered_position == -1:
            continue

        original_position = filtered_indices[
            filtered_position
        ]

        results.append({
            "text": chunks[original_position]["text"],
            "source": chunks[original_position]["source"],
            "distance": float(distance)
        })

    return results