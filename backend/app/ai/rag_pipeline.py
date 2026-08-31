from .retriever import retrieve_knowledge
from .generator import generate_answer
from .pricing import get_service_price


def answer_query(query):

    # --------------------------------
    # STEP 1
    # Retrieve troubleshooting knowledge
    # --------------------------------

    troubleshooting_results = retrieve_knowledge(
        query,
        top_k=3
    )

    # --------------------------------
    # STEP 2
    # Extract recommended services
    # --------------------------------

    services = []

    if troubleshooting_results:

        text = troubleshooting_results[0]["text"]

        marker = "Relevant Service:"

        if marker in text:

            service_text = text.split(
                marker,
                1
            )[1].strip()

            # Example:
            # "Regular Service; Deep Chemical Wash; Gas Refill"

            services = [
                service.strip()
                for service in service_text.split(";")
                if service.strip()
            ]

    # --------------------------------
    # STEP 3
    # Get price for every service
    # --------------------------------

    prices = []

    for service in services:

        price = get_service_price(service)

        prices.append({
            "service": service,
            "price": price
        })

    # --------------------------------
    # STEP 4
    # Generate final answer
    # --------------------------------

    answer = generate_answer(
        query,
        troubleshooting_results,
        prices
    )

    return answer