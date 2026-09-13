import os
import sys
import yaml
import argparse
from pathlib import Path

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except ImportError:
    HAS_ULTRALYTICS = False

def train_model(
    model_name="yolo11s.pt",
    data_yaml="ml/datasets/road_damage/data.yaml",
    epochs=100,
    imgsz=640,
    batch_size=16,
    device="auto",
    project="ml/models",
    name="checkpoints"
):
    print("=" * 60)
    print("URBANPULSE AI — ROAD DAMAGE MODEL TRAINING PIPELINE")
    print("=" * 60)

    if not HAS_ULTRALYTICS:
        print("[Error] 'ultralytics' package is not installed. Install via 'pip install ultralytics'.")
        sys.exit(1)

    if not os.path.exists(data_yaml):
        print(f"[Error] Dataset configuration '{data_yaml}' not found.")
        print("Please place training dataset at ml/datasets/road_damage/ or run validate_dataset.py.")
        sys.exit(1)

    print(f"Base Model:       {model_name}")
    print(f"Dataset YAML:     {data_yaml}")
    print(f"Epochs:           {epochs}")
    print(f"Image Size:       {imgsz}")
    print(f"Batch Size:       {batch_size}")
    print(f"Device:           {device}")

    # Load pretrained model
    try:
        model = YOLO(model_name)
    except Exception as e:
        print(f"[Warning] Loading fallback model yolov8s.pt due to: {e}")
        model = YOLO("yolov8s.pt")

    # Sensible road imagery augmentations
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        project=project,
        name=name,
        hflip=0.5,
        vflip=0.0,
        degrees=5.0,
        translate=0.1,
        scale=0.2,
        shear=2.0,
        perspective=0.0005,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        save=True,
        save_period=10,
        plots=True
    )

    # Save production model
    prod_dir = "ml/models/production"
    os.makedirs(prod_dir, exist_ok=True)
    best_weights = os.path.join(project, name, "weights", "best.pt")

    if os.path.exists(best_weights):
        prod_target = os.path.join(prod_dir, "road_damage.pt")
        import shutil
        shutil.copy(best_weights, prod_target)
        print(f"[Training Complete] Best production model saved to '{prod_target}'.")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train UrbanPulse Road Damage Model")
    parser.add_argument("--model", type=str, default="yolo11s.pt", help="Pretrained model name")
    parser.add_argument("--data", type=str, default="ml/datasets/road_damage/data.yaml", help="Dataset yaml path")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    args = parser.parse_args()

    train_model(
        model_name=args.model,
        data_yaml=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch_size=args.batch
    )
