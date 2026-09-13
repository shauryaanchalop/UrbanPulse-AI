import numpy as np
from typing import Dict, Any, Tuple

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

class VisibilityProcessor:
    """
    Visibility Estimator & Dehazing Preprocessing Module for UrbanPulse AI.
    Estimates frame visibility score (0-100%) and contrast ratio.
    Applies CLAHE / contrast enhancement when fog is detected.
    Gates AI detection confidence when visibility is low.
    """

    @staticmethod
    def estimate_visibility(frame: np.ndarray) -> Dict[str, Any]:
        """
        Estimates image visibility state based on luminance variance & contrast.
        """
        if not HAS_CV2 or frame is None or frame.size == 0:
            return {"visibility_score": 94, "state": "CLEAR", "contrast_std": 45.0}

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        std_dev = float(np.std(gray))
        mean_val = float(np.mean(gray))

        # Standard deviation of luminance indicates contrast / fog density
        # Higher std_dev = higher contrast (clear weather)
        # Lower std_dev = fog/mist blurring contrast
        visibility_score = int(min(100, max(10, (std_dev / 50.0) * 100)))

        if std_dev < 22.0 or (mean_val > 190 and std_dev < 30.0):
            state = "DENSE_FOG"
        elif std_dev < 35.0:
            state = "LIGHT_FOG"
        else:
            state = "CLEAR"

        return {
            "visibility_score": visibility_score,
            "state": state,
            "contrast_std": round(std_dev, 2),
            "mean_luminance": round(mean_val, 2)
        }

    @staticmethod
    def enhance_frame(frame: np.ndarray, state: str = "LIGHT_FOG") -> np.ndarray:
        """
        Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) dehazing to frame.
        """
        if not HAS_CV2 or frame is None or state == "CLEAR":
            return frame

        try:
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
            return enhanced
        except Exception:
            return frame

    @staticmethod
    def apply_confidence_gating(confidence: float, visibility_state: str) -> Tuple[float, bool]:
        """
        Reduces AI confidence under low visibility (DENSE_FOG / MIST) to prevent false certainty.
        """
        if visibility_state == "DENSE_FOG":
            gated_conf = round(confidence * 0.65, 4)
            is_low_confidence = True
        elif visibility_state == "LIGHT_FOG":
            gated_conf = round(confidence * 0.85, 4)
            is_low_confidence = gated_conf < 0.70
        else:
            gated_conf = confidence
            is_low_confidence = False

        return gated_conf, is_low_confidence
