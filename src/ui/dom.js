// Tiny DOM helpers so the UI code stays readable without a framework.

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(node.style, v);
    } else if (v !== null && v !== undefined && v !== false) {
      node.setAttribute(k, v);
    }
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function hpBar(cur, max, accent) {
  const pct = Math.max(0, Math.round((cur / max) * 100));
  const wrap = el('div', { class: 'hpbar' });
  const fill = el('div', {
    class: 'hpbar-fill',
    style: { width: `${pct}%`, background: accent || 'var(--accent)' },
  });
  const label = el('span', { class: 'hpbar-label', text: `${cur}/${max}` });
  wrap.append(fill, label);
  return wrap;
}
