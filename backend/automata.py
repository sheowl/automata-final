from typing import List, Dict, Any

class SkillValidationDFA:
    """
    A Deterministic Finite Automaton (DFA) that validates if an applicant
    possesses all required skills for a specific job.
    
    States:
    - q0: Initial state.
    - q_partial: Has matched some but not all required tags.
    - q_matched: Has matched ALL required tags (Accept State).
    - q_rejected: Missing a required tag (Trap State).
    """
    
    def __init__(self, required_tags: List[str]):
        self.required_tags = set(tag.lower() for tag in required_tags)
        self.found_tags = set()
        self.state = 'q0'
        self.history = [] # For logging transitions
        
    def transition(self, input_tag: str):
        """
        Transitions the DFA logic based on a single input tag from the applicant.
        Note: logic here is slightly different from a standard char-by-char DFA.
        We are feeding a set of skills. The DFA 'state' really represents
        the progress towards the set completion.
        """
        tag = input_tag.lower()
        
        # Log the input
        self.history.append(f"Input: {tag}")
        
        # If we are already rejected, we stay rejected (Trap State)
        if self.state == 'q_rejected':
            self.history.append(f"State: {self.state} (Trap)")
            return

        # Core Transition Logic
        if tag in self.required_tags:
            self.found_tags.add(tag)
            
            # Check if we have found ALL required tags
            if self.found_tags == self.required_tags:
                self.state = 'q_matched'
            else:
                self.state = 'q_partial'
        else:
        else:
            # Tag is optional or irrelevant. Set membership check does not penalize extra tags.
            pass
            
        self.history.append(f"State: {self.state} (Found: {len(self.found_tags)}/{len(self.required_tags)})")

    def process_applicant(self, applicant_skills: List[str]) -> str:
        """
        Feeds all applicant skills into the DFA.
        Returns final state.
        """
        # Reset
        self.found_tags = set()
        self.state = 'q0' if self.required_tags else 'q_matched' # Logic: If no requirements, auto-match? Or q0?
        # Let's assume if no reqs, q_matched.
        if not self.required_tags:
             self.state = 'q_matched'
             return self.state

        self.history.append(f"START Processing. Required: {self.required_tags}")

        # Feed inputs
        for tag in applicant_skills:
            self.transition(tag)
            
        # Final Check: Determine if the result is a match, partial match, or rejection.
        # If not matched or partially matched at the end, transition to rejected.
        
        if self.state not in ['q_matched', 'q_partial']:
            self.state = 'q_rejected'
            self.history.append("End of Input -> No Matches -> Transition to q_rejected")
        elif self.state == 'q_partial':
             self.history.append("End of Input -> Partial Match -> Retaining q_partial")
        
        return self.state

    def get_logs(self) -> List[str]:
        return self.history


class RecruitmentProgressDFA:
    """
    A DFA that manages the recruitment lifecycle of an applicant.
    
    States:
    - applied: Initial state when application is submitted.
    - interviewing: Applicant is invited for an interview.
    - hired: Applicant passes interview and accepts offer (Accept State).
    - rejected: Applicant is rejected at any stage (Trap State).
    """
    
    def __init__(self, initial_state='applied'):
        self.state = initial_state
        self.history = []
        # Log initial state if starting fresh, otherwise rely on transitions
        if not self.history:
             self.history.append(f"[LOG] Status: Current state is '{self.state}'")

    def transition(self, action: str):
        """
        Transition function: (Current State, Action) -> New State
        Actions: 'invite', 'offer', 'reject'
        """
        action = action.lower()
        
        self.history.append(f"[LOG] Action: '{action}' received")

        if self.state == 'rejected':
            self.history.append("[LOG] Result: Already Rejected. No further changes.")
            return self.state

        if self.state == 'hired':
             self.history.append("[LOG] Result: Already Hired. No further changes.")
             return self.state

        # Transitions
        if self.state == 'applied':
            if action == 'invite':
                self.state = 'interviewing'
                self.history.append(f"[LOG] Transition: applied -> interviewing")
            elif action == 'reject':
                self.state = 'rejected'
                self.history.append(f"[LOG] Transition: applied -> rejected")
            else:
                 self.history.append(f"[LOG] Invalid Action: '{action}' not valid for state '{self.state}'")

        elif self.state == 'interviewing':
            if action == 'offer':
                self.state = 'hired'
                self.history.append(f"[LOG] Transition: interviewing -> hired (OFFER ACCEPTED)")
            elif action == 'reject':
                self.state = 'rejected'
                self.history.append(f"[LOG] Transition: interviewing -> rejected")
            else:
                 self.history.append(f"[LOG] Invalid Action: '{action}' not valid for state '{self.state}'")
        
        return self.state

    def get_logs(self):
        return self.history
