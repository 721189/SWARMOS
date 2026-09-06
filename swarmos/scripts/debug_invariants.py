from swarmos.tests.test_cbba_invariants import TestCBBAInvariants

t = TestCBBAInvariants()
agents, tasks, comm_links = t.generate_random_scenario(8)

for u, v in comm_links:
    print(f"{u} -> {v}")
