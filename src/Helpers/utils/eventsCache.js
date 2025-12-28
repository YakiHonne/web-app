
const eventsCache = new Map();

export function getEventFromCache(id) {
    let event = eventsCache.get(id);
    if (event) {
      setEventFromCache(id, event.event);
      return event.event;
    }
    return null;
  }
  
  export function setEventFromCache(id, event) {
    eventsCache.set(id, { event, seen: Date.now() });
  
    if (eventsCache.size > 300) {
      const sorted = [...eventsCache.entries()].sort(
        (a, b) => b[1].seen - a[1].seen
      );
      const top300 = sorted.slice(0, 300);
      eventsCache.clear();
      for (const [k, v] of top300) {
        eventsCache.set(k, v);
      }
    }
  }
  
  