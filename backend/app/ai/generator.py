from transformers import pipeline, GenerationConfig

# Load the language model once
generator = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-0.5B-Instruct"
)

from transformers import pipeline, GenerationConfig


generator = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-0.5B-Instruct"
)


def extract_field(text, field_name, next_fields):
    """
    Extract a field from our structured troubleshooting chunk.
    """

    start_marker = f"{field_name}:"

    if start_marker not in text:
        return ""

    value = text.split(start_marker, 1)[1]

    for next_field in next_fields:
        marker = f"{next_field}:"

        if marker in value:
            value = value.split(marker, 1)[0]

    return value.strip()


def generate_answer(query, results):
    """
    Generate a reliable structured answer
    from the most relevant retrieved chunk.
    """

    if not results:
        return (
            "Problem:\n"
            f"{query}\n\n"
            "Possible Causes:\n"
            "No relevant information available.\n\n"
            "Recommended Action:\n"
            "No relevant information available.\n\n"
            "Recommended Service:\n"
            "No relevant information available."
        )

    # Best retrieved result
    best_result = results[0]

    text = best_result["text"]

    problem = extract_field(
        text,
        "Problem",
        [
            "Possible Causes",
            "Recommended Solution / Action",
            "Relevant Service"
        ]
    )

    causes = extract_field(
        text,
        "Possible Causes",
        [
            "Recommended Solution / Action",
            "Relevant Service"
        ]
    )

    action = extract_field(
        text,
        "Recommended Solution / Action",
        [
            "Relevant Service"
        ]
    )

    service = extract_field(
        text,
        "Relevant Service",
        []
    )

    # If extraction fails, don't invent anything
    if not problem:
        problem = query

    if not causes:
        causes = "No relevant information available."

    if not action:
        action = "No relevant information available."

    if not service:
        service = "No relevant information available."

    answer = f"""Problem:
{query}

Possible Causes:
{causes}

Recommended Action:
{action}

Recommended Service:
{service}"""

    return answer