from tornado_ai.core.processes.manager import process_manager


def test_process_manager_lists_seeded_processes():
    processes = process_manager.list()
    assert any(proc.engine == "AAAM" for proc in processes)
    target = processes[0]
    updated = process_manager.terminate(target.id)
    assert updated.status == "terminated"
