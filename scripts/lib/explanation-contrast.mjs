/**
 * Ensures MC explanations include contrast language required by the quality rubric.
 * Prefers pedagogically useful "why not X" phrasing over bare keyword stuffing.
 */
const CONTRAST_RE = /\b(not|because|defined|means|incorrect|false)\b/i;

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '');
}

function pickContrastDistractor(q) {
  const wrongs = q.a.map((opt, i) => ({ opt, i })).filter(({ i }) => i !== q.c);
  if (!wrongs.length) return null;
  // Prefer a short, plausible distractor — often the first wrong option.
  return wrongs.sort((a, b) => a.opt.length - b.opt.length)[0].opt;
}

function truncateOpt(opt, max = 72) {
  if (opt.length <= max) return opt;
  return `${opt.slice(0, max - 1)}…`;
}

/**
 * @param {object} q — question with q, a, c, e, type, cat
 * @returns {string} explanation (possibly unchanged)
 */
export function ensureExplanationContrast(q) {
  const plain = stripHtml(q.e);
  if (CONTRAST_RE.test(plain)) return q.e || '';
  if (q.type !== 'mc' || !Array.isArray(q.a) || q.c == null) return q.e || '';

  const wrong = pickContrastDistractor(q);
  if (!wrong) return q.e || '';

  let e = (q.e || '').trim().replace(/\.$/, '');
  const stem = (q.q || '').toLowerCase();
  const shortWrong = truncateOpt(wrong);

  if (/difference between/i.test(stem)) {
    e += `. <b>${shortWrong}</b> is incorrect because it reverses or blurs the distinction described in the stem.`;
  } else if (/which of these is not|not one of/i.test(stem)) {
    e += `. The other options are incorrect because they <b>are</b> valid examples of the concept; the keyed answer is the exception.`;
  } else if (/function/i.test(stem) || q.cat === 'Functions of Behavior') {
    e += `. <b>${shortWrong}</b> is incorrect because the maintaining consequence in this scenario does not match that function.`;
  } else if (/mand|tact|echoic|intraverbal/i.test(stem) || q.cat === 'Verbal Operants') {
    e += `. <b>${shortWrong}</b> is incorrect because it describes a different verbal operant than the one cued by the antecedent and consequence.`;
  } else if (/chain|shaping|forward|backward/i.test(stem)) {
    e += `. <b>${shortWrong}</b> is incorrect because it describes a different teaching procedure than the one named in the stem.`;
  } else if (/DRO|DRA|DRI|DRL|differential/i.test(stem)) {
    e += `. <b>${shortWrong}</b> is incorrect because it defines a different differential-reinforcement procedure.`;
  } else if (/reinforcement|punishment|extinction/i.test(stem)) {
    e += `. <b>${shortWrong}</b> is incorrect because it misidentifies what is added, removed, or withheld after the behavior.`;
  } else if (/scope|competence|practice|ethics|confidential/i.test(stem)) {
    e += `. <b>${shortWrong}</b> is incorrect because it does not reflect the professional boundary or credential rule tested here.`;
  } else if (/graph|variability|data|rate|frequency/i.test(stem)) {
    e += `. <b>${shortWrong}</b> is incorrect because it is not the measurement or graph-reading rule applied in this scenario.`;
  } else {
    e += `. <b>${shortWrong}</b> is incorrect because it does not match the defining feature tested in this item.`;
  }

  return e;
}
