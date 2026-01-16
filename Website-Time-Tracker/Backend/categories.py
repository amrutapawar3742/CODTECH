# categories.py

PRODUCTIVE_SITES = [
    "github.com",
    "leetcode.com",
    "stackoverflow.com",
    "hackerrank.com"
]

UNPRODUCTIVE_SITES = [
    "youtube.com",
    "instagram.com",
    "facebook.com"
]


def classify_site(site):
    if site in PRODUCTIVE_SITES:
        return "Productive"
    elif site in UNPRODUCTIVE_SITES:
        return "Unproductive"
    else:
        return "Uncategorized"
