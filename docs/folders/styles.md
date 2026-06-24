# src/styles

Estilos globais da aplicação.

---

## `global.css`

CSS global importado pelo layout `src/components/_layout/Main.astro`.

Define a identidade visual do Gugugram: uma interface com estética **Windows 98/95**, incluindo:

- Reset e base tipográfica usando a fonte **MS Sans Serif** (carregada de `public/fonts/`)
- Variáveis CSS de cores do sistema Windows 98 (cinza, azul escuro, bordas em relevo)
- Classes utilitárias de layout (`flex`, `grid`, `gap`, `p`, `m`, etc.)
- Estilos de componentes base: `.window`, `.title-bar`, `.window-body`, `.status-bar`
- Estilos de formulário: `fieldset`, `legend`, `.label`, `.helper-error`, `.helper-text`
- Estilos de botão com efeito de relevo 3D (bordas claras/escuras simulando profundidade)
- Estilos de input com efeito sunken (afundado)
- Classes de tipografia: `.text-sm`, `.text-xs`, `.text-center`, `.underline`
- Estilos responsivos para o header (grid layout)
- Animações e transições sutis

A fonte MS Sans Serif é carregada com `preload` no `<head>` para evitar FOUT (Flash of Unstyled Text).
