# merge sort algorithm implementation
# Ported from Tugma

import time

def merge_sort(data: list, sort_key: str, descending: bool = False) -> list:
    # Start timing
    start_time = time.time()
    
    # print(f"🔄 Starting merge sort on {len(data)} items by '{sort_key}' ({'descending' if descending else 'ascending'})")
    
    # Base case: if list has 1 or 0 elements, it's already sorted
    if len(data) <= 1:
        return data
    
    # Create a copy to avoid modifying the original list
    data_copy = data.copy()
    
    # Split the array into two halves
    mid = len(data_copy) // 2
    left_array = data_copy[:mid]
    right_array = data_copy[mid:]
    
    # Recursively sort both halves
    left_sorted = merge_sort(left_array, sort_key, descending)
    right_sorted = merge_sort(right_array, sort_key, descending)
    
    # Merge the sorted halves
    result = merge(left_sorted, right_sorted, sort_key, descending)
    
    # End timing and display results
    # end_time = time.time()
    # execution_time = (end_time - start_time) * 1000
    # print(f"Merge sort completed! Sorted {len(data)} items in {execution_time:.3f}ms")
    
    return result

def merge(left: list, right: list, sort_key: str, descending: bool = False) -> list:
    """
    Helper function to merge two sorted lists
    """
    merged_array = []
    left_index = right_index = 0
    
    # Merge elements while both arrays have elements
    while left_index < len(left) and right_index < len(right):
        left_value = left[left_index].get(sort_key)
        right_value = right[right_index].get(sort_key)
        
        # Handle None values (put them at the end)
        if left_value is None:
            merged_array.append(right[right_index])
            right_index += 1
        elif right_value is None:
            merged_array.append(left[left_index])
            left_index += 1
        else:
            # Compare values based on ascending/descending order
            if descending:
                # For descending order: take the larger value first
                if left_value >= right_value:
                    merged_array.append(left[left_index])
                    left_index += 1
                else:
                    merged_array.append(right[right_index])
                    right_index += 1
            else:
                # For ascending order: take the smaller value first
                if left_value <= right_value:
                    merged_array.append(left[left_index])
                    left_index += 1
                else:
                    merged_array.append(right[right_index])
                    right_index += 1
    
    # Copy leftover elements from left array
    while left_index < len(left):
        merged_array.append(left[left_index])
        left_index += 1
    
    # Copy leftover elements from right array
    while right_index < len(right):
        merged_array.append(right[right_index])
        right_index += 1
    
    return merged_array
