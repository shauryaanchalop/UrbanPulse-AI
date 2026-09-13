import os
import sys
import glob
import yaml
from pathlib import Path
from collections import Counter
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

def validate_dataset(dataset_dir="ml/datasets/road_damage"):
    print("=" * 60)
    print(f"URBANPULSE AI — ROAD DAMAGE DATASET HEALTH VALIDATION")
    print(f"Directory: {os.path.abspath(dataset_dir)}")
    print("=" * 60)

    yaml_path = os.path.join(dataset_dir, "data.yaml")
    num_classes = 8
    class_names = {}

    if os.path.exists(yaml_path):
        try:
            with open(yaml_path, "r") as f:
                data_cfg = yaml.safe_load(f)
                class_names = data_cfg.get("names", {})
                num_classes = len(class_names)
        except Exception as e:
            print(f"[Warning] Failed to parse data.yaml: {e}")

    splits = ["train", "val", "test"]
    total_images = 0
    total_annotations = 0
    missing_labels = 0
    missing_images = 0
    invalid_labels = 0
    malformed_lines = 0
    zero_area_boxes = 0
    out_of_bounds_boxes = 0
    invalid_class_ids = 0
    class_counter = Counter()

    images_by_hash = set()
    train_filenames = set()
    val_filenames = set()
    test_filenames = set()

    for split in splits:
        img_dir = os.path.join(dataset_dir, "images", split)
        lbl_dir = os.path.join(dataset_dir, "labels", split)

        if not os.path.exists(img_dir):
            print(f"[Notice] Split directory '{img_dir}' does not exist yet.")
            continue

        img_files = glob.glob(os.path.join(img_dir, "*.*"))
        img_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        valid_img_files = [f for f in img_files if Path(f).suffix.lower() in img_extensions]
        total_images += len(valid_img_files)

        for img_path in valid_img_files:
            fname = Path(img_path).name
            if split == "train":
                train_filenames.add(fname)
            elif split == "val":
                val_filenames.add(fname)
            elif split == "test":
                test_filenames.add(fname)

            # Check label match
            lbl_name = Path(img_path).stem + ".txt"
            lbl_path = os.path.join(lbl_dir, lbl_name)

            if not os.path.exists(lbl_path):
                missing_labels += 1
                continue

            try:
                with open(lbl_path, "r") as lf:
                    lines = [l.strip() for l in lf.readlines() if l.strip()]

                for line in lines:
                    parts = line.split()
                    if len(parts) != 5:
                        malformed_lines += 1
                        invalid_labels += 1
                        continue

                    try:
                        cls_id = int(parts[0])
                        x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                    except ValueError:
                        malformed_lines += 1
                        invalid_labels += 1
                        continue

                    if cls_id < 0 or (num_classes and cls_id >= num_classes):
                        invalid_class_ids += 1
                        invalid_labels += 1

                    if x < 0.0 or x > 1.0 or y < 0.0 or y > 1.0 or w < 0.0 or w > 1.0 or h < 0.0 or h > 1.0:
                        out_of_bounds_boxes += 1
                        invalid_labels += 1

                    if w * h <= 0.0:
                        zero_area_boxes += 1
                        invalid_labels += 1

                    total_annotations += 1
                    class_name = class_names.get(cls_id, f"class_{cls_id}")
                    class_counter[class_name] += 1
            except Exception as e:
                print(f"[Error] Error reading label {lbl_path}: {e}")
                invalid_labels += 1

    # Check for train/val data leakage
    train_val_leakage = len(train_filenames.intersection(val_filenames))
    train_test_leakage = len(train_filenames.intersection(test_filenames))

    print("\nDATASET HEALTH REPORT")
    print("-" * 35)
    print(f"Total Images:          {total_images}")
    print(f"Total Annotations:     {total_annotations}")
    print(f"Missing Labels:        {missing_labels}")
    print(f"Missing Images:        {missing_images}")
    print(f"Invalid Labels:        {invalid_labels}")
    print(f"Malformed Lines:       {malformed_lines}")
    print(f"Zero-Area Boxes:       {zero_area_boxes}")
    print(f"Out-of-Bounds Boxes:   {out_of_bounds_boxes}")
    print(f"Invalid Class IDs:     {invalid_class_ids}")
    print(f"Train/Val Leakage:     {train_val_leakage} files")
    print(f"Train/Test Leakage:    {train_test_leakage} files")

    print("\nCLASS DISTRIBUTION:")
    print("-" * 35)
    if not class_counter:
        print("  (No annotations found in dataset directory)")
    else:
        for cname, count in class_counter.items():
            print(f"  {cname:<25}: {count}")

    print("=" * 60)
    return {
        "total_images": total_images,
        "total_annotations": total_annotations,
        "invalid_labels": invalid_labels,
        "class_distribution": dict(class_counter)
    }

if __name__ == "__main__":
    validate_dataset()
