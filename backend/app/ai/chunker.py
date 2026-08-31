import re


def chunk_text(text: str):
    """
    Split troubleshooting knowledge into problem-based chunks.
    Each chunk keeps:
    Problem
    Possible Causes
    Recommended Solution / Action
    Relevant Service
    """

    chunks = []

    # Service sections in the troubleshooting PDF
    services = [
        "Electrical",
        "Plumbing",
        "AC Technician",
        "Carpentry",
        "Painting",
        "Pest Management"
    ]

    # Split document by service headings
    service_pattern = r"\n(" + "|".join(services) + r")\n"
    sections = re.split(service_pattern, text)

    current_service = None

    for section in sections:

        section = section.strip()

        if not section:
            continue

        if section in services:
            current_service = section
            continue

        # Find individual troubleshooting problems.
        #
        # Problem entries usually start with a line followed by
        # the causes / solution / service information.
        lines = [
            line.strip()
            for line in section.splitlines()
            if line.strip()
        ]

        if not lines:
            continue

        # We will create smaller groups from the section.
        #
        # For now, use the table headers as boundaries and
        # group every 4 lines after the headers.
        start = 0

        # Remove table headers
        while start < len(lines):
            if lines[start] in [
                "Problem",
                "Possible Causes",
                "Recommended Solution / Action",
                "Relevant Service"
            ]:
                start += 1
            else:
                break

        data = lines[start:]

        # Each troubleshooting record contains 4 fields
        for i in range(0, len(data), 4):

            record = data[i:i + 4]

            if len(record) < 4:
                continue

            if current_service is None:
                continue

            problem = record[0]
            causes = record[1]
            solution = record[2]
            service = record[3]

            chunk = f"""
Service: {current_service}

Problem:
{problem}

Possible Causes:
{causes}

Recommended Solution / Action:
{solution}

Relevant Service:
{service}
""".strip()

            chunks.append(chunk)

    return chunks