from transformers import pipeline
from .pricing import get_service_price

# Load the language model once
generator = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-0.5B-Instruct"
)


def extract_field(text, field_name, next_fields):
    """
    Extract a field from a structured troubleshooting chunk.
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


def extract_price(text):
    """
    Extract price information from a pricing chunk.

    Example:
    Installation Tap Washer / Jumper
    Unit: One
    Price: ₹150
    """

    # Look for explicit price markers first
    for marker in ["Price:", "price:", "₹"]:
        if marker in text:
            if marker == "₹":
                value = text.split("₹", 1)[1]

                # Keep only the numeric/range portion
                result = ""

                for char in value:
                    if char.isdigit() or char in "-–,.":
                        result += char
                    else:
                        break

                if result:
                    return f"₹{result}"

            else:
                value = text.split(marker, 1)[1].strip()

                result = ""

                for char in value:
                    if char.isdigit() or char in "-–,.":
                        result += char
                    else:
                        break

                if result:
                    return f"₹{result}"

    # Pricing document may say "Upon Inspection"
    if "Upon Inspection" in text:
        return "Upon Inspection"

    return ""


def generate_answer(query, results, price=None):
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
            "No relevant information available.\n\n"
            "Estimated Price:\n"
            "Price unavailable"
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

    if price is None:
        price = []

    # Format multiple service prices
    if price:
        price_lines = []

        for item in price:
            service_name = item["service"]
            service_price = item["price"]

            price_lines.append(
                f"{service_name}: {service_price}"
            )

        formatted_price = "\n".join(price_lines)
    else:
        formatted_price = "Price unavailable"


    answer = f"""Problem:
   {query}

Possible Causes:
{causes}

Recommended Action:
{action}

Recommended Service:
{service}

Estimated Price:
{formatted_price}"""

    return answer
