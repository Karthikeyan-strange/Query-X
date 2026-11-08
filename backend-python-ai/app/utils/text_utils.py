"""
Text Preprocessing Utilities for QueryX AI Service.
Handles cleaning, tokenization, and normalization without heavy external models.
"""

import re
from typing import List, Set


def clean_text(text: str) -> str:
    """
    Cleans and normalizes raw customer text.
    - Converts to lowercase
    - Normalizes extra whitespaces and line breaks
    - Preserves alphanumeric characters and common punctuation
    """
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_keywords(text: str) -> Set[str]:
    """
    Extracts individual words/tokens from normalized text.
    """
    cleaned = clean_text(text)
    words = re.findall(r"\b[a-z0-9_-]+\b", cleaned)
    return set(words)
