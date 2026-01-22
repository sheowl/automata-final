from automata import RecruitmentProgressDFA

def test_recruitment_dfa():
    print("--- Testing RecruitmentProgressDFA ---")

    # Scenario 1: Happy Path (Applied -> Interviewing -> Hired)
    print("\n[Scenario 1] Happy Path")
    dfa1 = RecruitmentProgressDFA()
    print(f"Initial State: {dfa1.state}")
    
    dfa1.transition('invite')
    print(f"After 'invite': {dfa1.state}")
    assert dfa1.state == 'interviewing'

    dfa1.transition('offer')
    print(f"After 'offer': {dfa1.state}")
    assert dfa1.state == 'hired'
    
    print("Logs:")
    for log in dfa1.get_logs():
        print(log)

    # Scenario 2: Rejection at Application
    print("\n[Scenario 2] Immediate Rejection")
    dfa2 = RecruitmentProgressDFA()
    dfa2.transition('reject')
    print(f"After 'reject': {dfa2.state}")
    assert dfa2.state == 'rejected'

    # Scenario 3: Rejection after Interview
    print("\n[Scenario 3] Reject after Interview")
    dfa3 = RecruitmentProgressDFA()
    dfa3.transition('invite')
    dfa3.transition('reject')
    print(f"Final State: {dfa3.state}")
    assert dfa3.state == 'rejected'

    # Scenario 4: Invalid Transition (Applied -> Offer)
    print("\n[Scenario 4] Invalid Transition (Direct Offer)")
    dfa4 = RecruitmentProgressDFA()
    dfa4.transition('offer')
    print(f"After 'offer': {dfa4.state}")
    assert dfa4.state == 'applied' # Should not change

    print("\n--- All Tests Passed ---")

if __name__ == "__main__":
    test_recruitment_dfa()
