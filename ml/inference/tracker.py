import math
from typing import List, Dict, Any

class ObjectTracker:
    """
    IoU & Centroid-based Object Tracker for frame-to-frame persistent defect tracking.
    Assigns stable track_id values (e.g. 'Pothole Track #42') across video frames.
    """
    def __init__(self, iou_threshold: float = 0.3, max_disappeared: int = 10):
        self.next_track_id: int = 100
        self.active_tracks: Dict[int, Dict[str, Any]] = {}
        self.iou_threshold: float = iou_threshold
        self.max_disappeared: int = max_disappeared

    @staticmethod
    def calculate_iou(boxA: Dict[str, int], boxB: Dict[str, int]) -> float:
        xA = max(boxA["x1"], boxB["x1"])
        yA = max(boxA["y1"], boxB["y1"])
        xB = min(boxA["x2"], boxB["x2"])
        yB = min(boxA["y2"], boxB["y2"])

        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = (boxA["x2"] - boxA["x1"]) * (boxA["y2"] - boxA["y1"])
        boxBArea = (boxB["x2"] - boxB["x1"]) * (boxB["y2"] - boxB["y1"])

        unionArea = boxAArea + boxBArea - interArea
        if unionArea <= 0:
            return 0.0
        return interArea / float(unionArea)

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Updates persistent tracks with incoming frame detections.
        Returns detections augmented with persistent 'track_id' field.
        """
        tracked_detections = []
        matched_track_ids = set()

        for det in detections:
            bbox = det["bbox"]
            best_match_id = None
            best_iou = 0.0

            for track_id, track_data in self.active_tracks.items():
                if track_id in matched_track_ids:
                    continue
                # Only match same defect class
                if track_data["class_name"] == det["class_name"]:
                    iou = self.calculate_iou(bbox, track_data["bbox"])
                    if iou > self.iou_threshold and iou > best_iou:
                        best_iou = iou
                        best_match_id = track_id

            if best_match_id is not None:
                # Update existing track
                matched_track_ids.add(best_match_id)
                self.active_tracks[best_match_id]["bbox"] = bbox
                self.active_tracks[best_match_id]["disappeared"] = 0
                self.active_tracks[best_match_id]["confidence"] = max(self.active_tracks[best_match_id]["confidence"], det["confidence"])
                self.active_tracks[best_match_id]["observation_count"] += 1
                assigned_id = best_match_id
            else:
                # Create new track
                assigned_id = self.next_track_id
                self.next_track_id += 1
                self.active_tracks[assigned_id] = {
                    "track_id": assigned_id,
                    "class_name": det["class_name"],
                    "bbox": bbox,
                    "confidence": det["confidence"],
                    "disappeared": 0,
                    "observation_count": 1
                }
                matched_track_ids.add(assigned_id)

            det_copy = dict(det)
            det_copy["track_id"] = assigned_id
            det_copy["observation_count"] = self.active_tracks[assigned_id]["observation_count"]
            tracked_detections.append(det_copy)

        # Increment disappeared counter for unmatched tracks
        unmatched_ids = set(self.active_tracks.keys()) - matched_track_ids
        for tid in list(unmatched_ids):
            self.active_tracks[tid]["disappeared"] += 1
            if self.active_tracks[tid]["disappeared"] > self.max_disappeared:
                del self.active_tracks[tid]

        return tracked_detections
