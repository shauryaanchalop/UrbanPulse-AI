import os
import sys
from pathlib import Path

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except ImportError:
    HAS_ULTRALYTICS = False

try:
    import onnxruntime as ort
    HAS_ONNX = True
except ImportError:
    HAS_ONNX = False

def export_model(
    weights_path="ml/models/production/road_damage.pt",
    onnx_output="ml/models/production/road_damage.onnx",
    imgsz=640
):
    print("=" * 60)
    print("URBANPULSE AI — MODEL ONNX EXPORTER & VERIFIER")
    print("=" * 60)

    if not os.path.exists(weights_path):
        print(f"[Notice] Weights file '{weights_path}' not found. Cannot export unconfigured model.")
        return False

    if not HAS_ULTRALYTICS:
        print("[Error] 'ultralytics' package required for export.")
        return False

    try:
        model = YOLO(weights_path)
        print(f"Exporting PyTorch weights '{weights_path}' to ONNX (imgsz: {imgsz})...")
        exported_path = model.export(format="onnx", imgsz=imgsz, dynamic=True)
        print(f"[Export Complete] Exported ONNX model to '{exported_path}'.")

        # Verify exported ONNX model session loading
        if HAS_ONNX and os.path.exists(onnx_output):
            print("Verifying ONNX Runtime session loading...")
            session = ort.InferenceSession(onnx_output)
            inputs = session.get_inputs()
            print(f"[ONNX Verified] Session loaded cleanly. Input shape: {inputs[0].shape}")
            return True
    except Exception as e:
        print(f"[Export Error] Failed to export ONNX model: {e}")
        return False

    return False

if __name__ == "__main__":
    export_model()
