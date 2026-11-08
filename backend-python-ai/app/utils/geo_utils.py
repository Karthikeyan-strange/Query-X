"""
Geographical Calculation Utilities.
Implements the Haversine formula for calculating spherical distance between two coordinates.
"""

import math
from typing import Optional, Tuple

EARTH_RADIUS_KM = 6371.0


def calculate_haversine_distance(
    lat1: Optional[float],
    lon1: Optional[float],
    lat2: Optional[float],
    lon2: Optional[float]
) -> Optional[float]:
    """
    Calculates the great-circle distance between two points on the Earth
    using the Haversine formula.

    Returns:
        float: Distance in kilometers rounded to 2 decimal places, or None if coordinates are missing.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None

    # Validate coordinate ranges
    if not (-90.0 <= lat1 <= 90.0 and -90.0 <= lat2 <= 90.0):
        return None
    if not (-180.0 <= lon1 <= 180.0 and -180.0 <= lon2 <= 180.0):
        return None

    # Convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Haversine formula
    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = EARTH_RADIUS_KM * c
    return round(distance, 2)
