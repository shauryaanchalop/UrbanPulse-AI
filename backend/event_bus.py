import asyncio
import json
from typing import Callable, Dict, List, Any
from datetime import datetime

class EventBus:
    """
    Abstracted EventBus for UrbanPulse AI.
    In prototype/simulation mode: dispatches in-memory events to registered listeners (e.g. WebSockets).
    In field deployment mode: adapts to an MQTT broker / Kafka cluster for edge bus telemetry.
    """
    def __init__(self):
        self._listeners: List[Callable[[Dict[str, Any]], Any]] = []
        self._mqtt_mode: bool = False
        self._total_events_dispatched: int = 0

    def subscribe(self, callback: Callable[[Dict[str, Any]], Any]):
        self._listeners.append(callback)

    def unsubscribe(self, callback: Callable[[Dict[str, Any]], Any]):
        if callback in self._listeners:
            self._listeners.remove(callback)

    async def publish(self, topic: str, payload: Dict[str, Any]):
        """
        Publishes an event. Wraps it with structured edge-to-cloud metadata.
        """
        self._total_events_dispatched += 1
        wrapped_event = {
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "protocol": "MQTT-Simulated" if self._mqtt_mode else "InternalEventBus",
            "messageId": f"EVT-MSG-{self._total_events_dispatched:06d}",
            "data": payload
        }
        
        # Dispatch asynchronously to all registered listeners
        for listener in self._listeners:
            try:
                if asyncio.iscoroutinefunction(listener):
                    await listener(wrapped_event)
                else:
                    listener(wrapped_event)
            except Exception as e:
                print(f"[EventBus] Dispatch error: {e}")

    @property
    def total_dispatched(self) -> int:
        return self._total_events_dispatched

# Global event bus singleton instance
event_bus = EventBus()
