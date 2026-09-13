import os
import argparse
try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

def extract_frames(video_path, output_dir, sample_fps=1):
    if not HAS_CV2:
        print("[Error] OpenCV (cv2) is required for frame extraction.")
        return 0

    if not os.path.exists(video_path):
        print(f"[Error] Video file '{video_path}' not found.")
        return 0

    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[Error] Could not open video file '{video_path}'.")
        return 0

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_interval = max(1, int(fps / sample_fps))
    count = 0
    saved_count = 0

    base_name = os.path.splitext(os.path.basename(video_path))[0]

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if count % frame_interval == 0:
            out_name = f"{base_name}_frame_{saved_count:05d}.jpg"
            out_path = os.path.join(output_dir, out_name)
            cv2.imwrite(out_path, frame)
            saved_count += 1

        count += 1

    cap.release()
    print(f"[Extract Frames] Extracted {saved_count} frames from '{video_path}' to '{output_dir}'.")
    return saved_count

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract video frames for dataset preparation")
    parser.add_argument("--video", type=str, required=True, help="Path to input video")
    parser.add_argument("--out", type=str, default="ml/datasets/road_damage/raw_frames", help="Output directory")
    parser.add_argument("--fps", type=float, default=1.0, help="Frames per second to sample")
    args = parser.parse_args()
    extract_frames(args.video, args.out, args.fps)
