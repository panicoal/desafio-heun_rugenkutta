import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza todas las expresiones LaTeX marcadas con el atributo [data-katex]
 */
export function renderAllMath() {
  document.querySelectorAll('[data-katex]').forEach((el) => {
    const tex = el.getAttribute('data-katex');
    const displayMode = el.getAttribute('data-display') === 'true';
    try {
      katex.render(tex, el, {
        throwOnError: false,
        displayMode
      });
    } catch (err) {
      console.error('Error renderizando KaTeX:', err);
    }
  });
}
