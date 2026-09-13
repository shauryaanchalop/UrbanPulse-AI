import os
import sys
import time
import json
from datetime import datetime
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

# Add ml/inference to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "inference")))
from detector import RoadDamageDetector

def run_benchmark():
    print("=" * 60)
    print("URBANPULSE AI — ROAD DAMAGE MODEL PERFORMANCE BENCHMARK")
    print("=" * 60)

    mem_before = 0.0
    if HAS_PSUTIL:
        process = psutil.Process(os.getpid())
        mem_before = process.memory_info().rss / (1024 * 1024)

    # 1. Model Loading Latency
    t0 = time.time()
    detector = RoadDamageDetector()
    loaded = detector.load_model()
    t1 = time.time()
    load_time_sec = round(t1 - t0, 3)

    mem_after = process.memory_info().rss / (1024 * 1024) if HAS_PSUTIL else 0.0
    mem_delta_mb = round(mem_after - mem_before, 2) if HAS_PSUTIL else 0.0

    model_info = detector.get_model_info()
    device = model_info.get("device", "cpu")

    print(f"Model Name:        {model_info.get('name')}")
    print(f"Model Architecture:{model_info.get('architecture')}")
    print(f"Status:            {model_info.get('status')}")
    print(f"Device:            {device}")
    print(f"Loading Time:      {load_time_sec} s")
    print(f"RAM Usage Delta:   {mem_delta_mb} MB")

    # 2. Simulated Synthetic Frame Inference Latency & Throughput Benchmark
    print("\nRunning Frame Inference Benchmark (50 iterations)...")
    latencies_ms = []

    # Simple synthetic 640x640 frame (zeros if no image)
    import numpy as np
    dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)

    for i in range(50):
        start = time.time()
        _ = detector.predict_frame(dummy_frame)
        end = time.time()
        latencies_ms.append((end - start) * 1000.0)

    avg_latency_ms = round(sum(latencies_ms) / len(latencies_ms), 2)
    p95_latency_ms = round(sorted(latencies_ms)[int(len(latencies_ms) * 0.95)], 2)
    fps = round(1000.0 / avg_latency_ms, 1) if avg_latency_ms > 0 else 0.0

    cpu_usage_pct = psutil.cpu_percent(interval=0.5) if HAS_PSUTIL else 0.0

    print(f"Avg Latency:       {avg_latency_ms} ms")
    print(f"P95 Latency:       {p95_latency_ms} ms")
    print(f"Inference FPS:     {fps} FPS")
    print(f"CPU Utilization:   {cpu_usage_pct}%")

    report = {
        "timestamp": datetime.now().isoformat(),
        "model_status": model_info.get("status"),
        "device": device,
        "load_time_sec": load_time_sec,
        "avg_latency_ms": avg_latency_ms,
        "p95_latency_ms": p95_latency_ms,
        "fps": fps,
        "memory_delta_mb": mem_delta_mb,
        "cpu_usage_pct": cpu_usage_pct
    }

    print("\nBenchmark Complete.")
    print("=" * 60)
    return report

if __name__ == "__main__":
    run_benchmark()
