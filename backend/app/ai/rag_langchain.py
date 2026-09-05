import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from langchain_groq import ChatGroq

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from app.ai.pricing import get_service_prices


# ============================================================
# PATHS
# ============================================================

# rag_langchain.py
#     ↓
# backend
#     ↓
# projectmain

PROJECT_DIR = Path(__file__).resolve().parents[3]

BACKEND_DIR = PROJECT_DIR / "backend"

VECTOR_STORE_DIR = (
    BACKEND_DIR
    / "data"
    / "vector_store"
)


# ============================================================
# ENVIRONMENT
# ============================================================

ENV_FILE = PROJECT_DIR / ".env"

load_dotenv(ENV_FILE)


# ============================================================
# EMBEDDING MODEL
# ============================================================

_embeddings = None


def get_embeddings():

    global _embeddings

    if _embeddings is None:

        print("Loading embedding model...")

        _embeddings = HuggingFaceEmbeddings(

            model_name=(
                "ibm-granite/"
                "granite-embedding-97m-multilingual-r2"
            ),

            model_kwargs={
                "device": "cpu"
            },

            encode_kwargs={
                "normalize_embeddings": True
            }
        )

        print("Embedding model loaded.")

    return _embeddings


# ============================================================
# VECTOR STORE
# ============================================================

_vector_store = None


def load_vector_store():

    global _vector_store

    if _vector_store is None:

        print("Loading FAISS vector store...")

        # ----------------------------------------------------
        # Check vector store directory
        # ----------------------------------------------------

        if not VECTOR_STORE_DIR.exists():

            raise RuntimeError(
                f"FAISS vector store directory not found:\n"
                f"{VECTOR_STORE_DIR}"
            )

        # ----------------------------------------------------
        # Check required FAISS files
        # ----------------------------------------------------

        index_file = VECTOR_STORE_DIR / "index.faiss"
        metadata_file = VECTOR_STORE_DIR / "index.pkl"

        if not index_file.exists():

            raise RuntimeError(
                f"FAISS index file not found:\n"
                f"{index_file}"
            )

        if not metadata_file.exists():

            raise RuntimeError(
                f"FAISS metadata file not found:\n"
                f"{metadata_file}"
            )

        # ----------------------------------------------------
        # Load embeddings
        # ----------------------------------------------------

        embeddings = get_embeddings()

        # ----------------------------------------------------
        # Load FAISS
        # ----------------------------------------------------

        _vector_store = FAISS.load_local(

            str(VECTOR_STORE_DIR),

            embeddings,

            allow_dangerous_deserialization=True
        )

        print("FAISS vector store loaded.")

    return _vector_store


# ============================================================
# RETRIEVER
# ============================================================

_retriever = None


def get_retriever():

    global _retriever

    if _retriever is None:

        vector_store = load_vector_store()

        _retriever = vector_store.as_retriever(

            search_type="similarity",

            search_kwargs={
                "k": 3
            }
        )

    return _retriever


# ============================================================
# DOCUMENT RETRIEVAL
# ============================================================

def retrieve_documents(query):

    retriever = get_retriever()

    documents = retriever.invoke(query)

    return documents


# LANGCHAIN RAG CHAIN
_rag_chain = None

def create_rag_chain():

    global _rag_chain

    if _rag_chain is not None:
        return _rag_chain

    print("Creating LangChain RAG chain...")

    # --------------------------------------------------------
    # Retriever
    # --------------------------------------------------------

    retriever = get_retriever()

    # --------------------------------------------------------
    # Groq API key
    # --------------------------------------------------------

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY not found in .env"
        )

    # --------------------------------------------------------
    # LLM
    # --------------------------------------------------------

    print("Loading Groq LLM...")

    llm = ChatGroq(
        model="openai/gpt-oss-20b",
        temperature=0,
        api_key=api_key
    )

    print("Groq LLM loaded.")

    # --------------------------------------------------------
    # Prompt
    # --------------------------------------------------------

    prompt = ChatPromptTemplate.from_template(
    """
You are a home maintenance troubleshooting assistant.

Return ONLY valid JSON. Do not use markdown fences or text outside the JSON object.

Use this exact schema:
{{
    "causes": ["short cause"],
    "actions": ["safe recommended action"],
    "services": ["exact service name from context"]
}}

Answer the user's question using ONLY the provided context.

Do not invent information.

If the context does not contain enough information, return an empty services array
and put "Professional inspection is required." in actions. Never put that sentence
or any other advice sentence in services.

IMPORTANT SERVICE RULE:

When giving the "Recommended Service" section,
use the EXACT service names mentioned in the provided context.

Do NOT create alternative names such as:
- Professional AC servicing
- Professional plumbing inspection
- Professional painting service
- Professional inspection and treatment

Use the actual service names from the context.

For example:
- If the context says "Regular Service", use "Regular Service".
- If the context says "Gas Refill", use "Gas Refill".
- If the context says "Drawer Channel Fitting", use "Drawer Channel Fitting".
- If the context says "Bed Bug Treatment", use "Bed Bug Treatment".

Do not recommend a service that is unrelated to the user's problem.

Context:
{context}

Question:
{question}
"""
)

    # --------------------------------------------------------
    # RAG chain
    # --------------------------------------------------------

    _rag_chain = (
        {
            "context": retriever,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    print("LangChain RAG chain created.")

    return _rag_chain

# ============================================================
# ADD PRICING TO RAG RESPONSE
# ============================================================

def add_pricing(answer):

    # --------------------------------------------------------
    # Find Recommended Service section
    # --------------------------------------------------------

    match = re.search(
        r"Recommended Service:\s*(.*)",
        answer,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return answer

    service_section = match.group(1)

    # --------------------------------------------------------
    # Extract bullet points
    # --------------------------------------------------------

    services = re.findall(
        r"^\s*-\s*(.+)$",
        service_section,
        re.MULTILINE
    )

    invalid_services = {
        "professional inspection is required",
        "professional inspection required",
        "price unavailable",
        "none",
        "n/a",
    }
    services = [
        service.strip()
        for service in services
        if service.strip().lower().rstrip(".") not in invalid_services
    ]

    if not services:
        return re.sub(r"\nEstimated Service Price:[\s\S]*$", "", answer).strip()

    # --------------------------------------------------------
    # Lookup prices
    # --------------------------------------------------------

    priced_services = get_service_prices(services)

    # --------------------------------------------------------
    # Build pricing section
    # --------------------------------------------------------

    pricing_lines = [
        "\nEstimated Service Price:"
    ]

    for item in priced_services:

        pricing_lines.append(
            f"- {item['service']}: {item['price']}"
        )

    pricing_section = "\n".join(pricing_lines)

    # --------------------------------------------------------
    # Append pricing
    # --------------------------------------------------------

    return answer + "\n" + pricing_section

# ============================================================
# STRUCTURED AI ANSWER
# ============================================================

def _clean_list(values):
    if not isinstance(values, list):
        return []

    cleaned = []
    for value in values:
        item = re.sub(r"^[-*\d.)\s]+", "", str(value)).strip()
        if item and item not in cleaned:
            cleaned.append(item)
    return cleaned


def _parse_structured_answer(answer):
    try:
        parsed = json.loads(answer)
    except (TypeError, json.JSONDecodeError):
        return None

    if not isinstance(parsed, dict):
        return None

    return {
        "causes": _clean_list(parsed.get("causes")),
        "actions": _clean_list(parsed.get("actions")),
        "services": _clean_list(parsed.get("services")),
    }


# ============================================================
# COMPLETE AI ANSWER
# ============================================================

def answer_query(query: str):

    global _rag_chain

    # Create chain only once
    if _rag_chain is None:

        print("Creating LangChain RAG chain...")

        _rag_chain = create_rag_chain()

        print("LangChain RAG chain ready.")

    raw_answer = _rag_chain.invoke(query)
    structured = _parse_structured_answer(raw_answer)

    if structured is None:
        return add_pricing(raw_answer)

    invalid_services = {
        "professional inspection is required",
        "price unavailable",
        "none",
        "n/a",
    }
    structured["services"] = [
        service for service in structured["services"]
        if service.lower().rstrip(".") not in invalid_services
    ]
    structured["prices"] = get_service_prices(structured["services"])
    return structured