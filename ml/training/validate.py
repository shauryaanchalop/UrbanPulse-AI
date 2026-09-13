import os
import sys
import json
from datetime import datetime
from pathlib import Path

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except ImportError:
    HAS_ULTRALYTICS = False

def validate_model(
    weights_path="ml/models/production/road_damage.pt",
    data_yaml="ml/datasets/road_damage/data.yaml",
    metrics_output="ml/models/production/model_metrics.json"
):
    print("=" * 60)
    print("URBANPULSE AI — ROAD DAMAGE MODEL EVALUATION")
    print("=" * 60)

    metrics_report = {
        "model": "UrbanPulse Road Damage Detector",
        "dataset": data_yaml,
        "precision": None,
        "recall": None,
        "map50": None,
        "map50_95": None,
        "inference_latency_ms": None,
        "fps": None,
        "trained_at": None,
        "per_class": {}
    }

    if not os.path.exists(weights_path):
        print(f"[Notice] Model weights '{weights_path}' do not exist yet. Metrics initialized to null.")
        os.makedirs(os.path.dirname(metrics_output), exist_ok=True)
        with open(metrics_output, "w") as f:
            json.dump(metrics_report, f, indent=2)
        return metrics_report

    if not HAS_ULTRALYTICS:
        print("[Error] 'ultralytics' is not installed for validation.")
        return metrics_report

    try:
        model = YOLO(weights_path)
        val_results = model.val(data=data_yaml, split="val", verbose=True)

        metrics_report = {
            "model": os.path.basename(weights_path),
            "dataset": data_yaml,
            "precision": round(float(val_results.results_dict.get("metrics/precision(B)", 0.0)), 4),
            "recall": round(float(val_results.results_dict.get("metrics/recall(B)", 0.0)), 4),
            "map50": round(float(val_results.results_dict.get("metrics/mAP50(B)", 0.0)), 4),
            "map50_95": round(float(val_results.results_dict.get("metrics/mAP50-95(B)", 0.0)), 4),
            "inference_latency_ms": round(float(val_results.speed.get("inference", 0.0)), 2),
            "fps": round(1000.0 / max(0.1, val_results.speed.get("inference", 1.0)), 1),
            "trained_at": datetime.now().isoformat(),
            "per_class": {}
        }

        print("\nVAL METRICS REPORT:")
        print(f"Precision:   {metrics_report['precision']}")
        print(f"Recall:      {metrics_report['recall']}")
        print(f"mAP50:       {metrics_report['map50']}")
        print(f"mAP50-95:    {metrics_report['map50_95']}")
        print(f"Inference:   {metrics_report['inference_latency_ms']} ms ({metrics_report['fps']} FPS)")

    except Exception as e:
        print(f"[Error] Validation failed: {e}")

    os.makedirs(os.path.dirname(metrics_output), exist_ok=True)
    with open(metrics_output, "w") as f:
        json.dump(metrics_report, f, indent=2)

    print(f"[Validation Complete] Metrics saved to '{metrics_output}'.")
    return metrics_report

if __name__ == "__main__":
    validate_model()
