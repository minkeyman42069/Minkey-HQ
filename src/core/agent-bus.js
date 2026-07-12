/**
 * Agent Bus — hook registry for modular game systems.
 * Agents register handlers; the kernel emits lifecycle events.
 */
export function createAgentBus() {
  const handlers = new Map();

  function on(event, fn, agentId) {
    if (!handlers.has(event)) handlers.set(event, []);
    handlers.get(event).push({ fn, agentId });
  }

  function off(agentId) {
    handlers.forEach((list, event) => {
      handlers.set(
        event,
        list.filter((h) => h.agentId !== agentId),
      );
    });
  }

  function emit(event, ctx) {
    const list = handlers.get(event) || [];
    const out = { ...ctx };
    for (const { fn } of list) {
      const patch = fn(out) || {};
      Object.assign(out, patch);
    }
    return out;
  }

  return { on, off, emit };
}
