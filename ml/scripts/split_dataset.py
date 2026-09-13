import os
import glob
import random
import shutil
from pathlib import Path

def split_dataset(source_dir, dataset_dir="ml/datasets/road_damage", train_ratio=0.8, val_ratio=0.15, test_ratio=0.05, split_by_prefix=True):
    """
    Splits image/label files into train/val/test directories.
    If split_by_prefix is True, groups files by video/source prefix to prevent data leakage.
    """
    print(f"[Split Dataset] Splitting files from '{source_dir}' into '{dataset_dir}'...")

    for split in ["train", "val", "test"]:
        os.makedirs(os.path.join(dataset_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(dataset_dir, "labels", split), exist_ok=True)

    img_files = glob.glob(os.path.join(source_dir, "*.jpg")) + glob.glob(os.path.join(source_dir, "*.png"))
    if not img_files:
        print("[Split Dataset] No image files found in source directory.")
        return

    if split_by_prefix:
        groups = {}
        for img in img_files:
            stem = Path(img).stem
            prefix = stem.split("_frame_")[0] if "_frame_" in stem else stem.split("_")[0]
            if prefix not in groups:
                groups[prefix] = []
            groups[prefix].append(img)

        group_keys = list(groups.keys())
        random.shuffle(group_keys)

        n_groups = len(group_keys)
        n_train = max(1, int(n_groups * train_ratio))
        n_val = max(1, int(n_groups * val_ratio))

        train_keys = set(group_keys[:n_train])
        val_keys = set(group_keys[n_train:n_train + n_val])
        test_keys = set(group_keys[n_train + n_val:])

        for key, files in groups.items():
            split = "train" if key in train_keys else ("val" if key in val_keys else "test")
            for img_path in files:
                move_pair(img_path, source_dir, dataset_dir, split)
    else:
        random.shuffle(img_files)
        n_total = len(img_files)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        for i, img_path in enumerate(img_files):
            split = "train" if i < n_train else ("val" if i < n_train + n_val else "test")
            move_pair(img_path, source_dir, dataset_dir, split)

    print("[Split Dataset] Dataset split completed successfully.")

def move_pair(img_path, source_dir, dataset_dir, split):
    dest_img = os.path.join(dataset_dir, "images", split, Path(img_path).name)
    shutil.copy(img_path, dest_img)

    lbl_name = Path(img_path).stem + ".txt"
    lbl_path = os.path.join(source_dir, lbl_name)
    if os.path.exists(lbl_path):
        dest_lbl = os.path.join(dataset_dir, "labels", split, lbl_name)
        shutil.copy(lbl_path, dest_lbl)

if __name__ == "__main__":
    split_dataset("ml/datasets/road_damage/raw_frames")
