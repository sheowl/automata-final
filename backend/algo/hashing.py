# hashing algorithm for the backend

# FNV-1a Hashing Algorithm Implementation
def fnv1a_hash(data: str) -> int:
    offset_basis = 0x811c9dc5
    fnv_prime = 0x01000193
    hash_value = offset_basis

    for char in data:
        hash_value ^= ord(char)
        hash_value *= fnv_prime
        hash_value &= 0xffffffff  # keep 32-bit
    return hash_value

# Hash Table with Separate Chaining (Linked List Implementation)
class Node:
    def __init__(self, info):
        self.info = info
        self.link = None

class HashTable:
    def __init__(self, size=101):
        self.size = size
        self.buckets = [None] * size

    def _hash(self, key: str) -> int:
        return fnv1a_hash(key) % self.size

    def insert(self, key: str):
        index = self._hash(key)
        new_node = Node(key)
        new_node.link = self.buckets[index]
        self.buckets[index] = new_node

    def contains(self, key: str) -> bool:
        index = self._hash(key)
        current = self.buckets[index]
        while current:
            if current.info == key:
                return True
            current = current.link
        return False

# TagMatcher Class for Matching Applicant Tags with Job Tags
class TagMatcher:
    def __init__(self, applicant_tags: list[str], job_tags: list[str]):
        self.applicant_tags = applicant_tags  # A
        self.job_tags = job_tags              # J

        # Build hash table for fast O(1) lookups
        self.job_table = HashTable()
        for tag in job_tags:
            self.job_table.insert(tag)

    def calculate_score(self):
        # Handle edge cases
        if not self.job_tags or not self.applicant_tags:
            return 0.0

        # Calculate intersection |A ∩ J|
        intersection = 0
        for tag in self.applicant_tags:
            if self.job_table.contains(tag):  # O(1) lookup using hash table
                intersection += 1

        # Apply the weighted formula
        # Match Score = (|A ∩ J| / |J|) * 70% + (|A ∩ J| / |A|) * 30%
        score = (
            (intersection / len(self.job_tags)) * 70 +
            (intersection / len(self.applicant_tags)) * 30
        )
        
        return round(score, 2)
