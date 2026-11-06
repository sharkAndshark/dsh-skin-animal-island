/**
 * Animal Island skin — browser half.
 *
 * Hand-written closure-factory bundle (the shape the dsh module loader hands to
 * `window.__ModuleLoader__.load`). It does three things:
 *
 *  1. thicks out the product icon sprite strokes, so the line icon set reads as
 *     a chunky hand-drawn set (ui-theme owns the sprite; we only mutate its
 *     `<symbol>` children and never replace the element);
 *  2. paints a small island scene behind the blank home via the
 *     `conversation.hero.frame` HOC;
 *  3. swaps the sidebar brand mark for a leaf.
 *
 * Colours come from the skin stylesheet (--dsw-* tokens), never from literals.
 */
window.__ModuleLoader__.load({
  id: 'dsh-skin-animal-island',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Stroke multiplier applied to the product icon sprite. */
    const ICON_STROKE_SCALE = 1.5
    /** Upper bound for one scaled stroke width. */
    const ICON_STROKE_MAX = 2.2
    /** Sprite selector published by ui-theme. */
    const SPRITE = 'svg[data-dsh-icon-sprite]'

    /**
     * Scale one symbol's stroke widths and round its joints.
     * @param {SVGSymbolElement} symbol - one product glyph.
     */
    function chunkySymbol(symbol) {
      if (symbol.dataset.dshSkinChunky === '1') return
      // The artwork declares stroke-width (and caps) on the SVG root, which the
      // sprite copies onto the <symbol>; most paths therefore carry no width of
      // their own. Scale both places so neither style of glyph is missed.
      for (const node of [symbol, ...symbol.querySelectorAll('[stroke-width]')]) {
        const width = Number.parseFloat(node.getAttribute('stroke-width'))
        if (!Number.isFinite(width)) continue
        node.setAttribute('stroke-width', String(Math.min(ICON_STROKE_MAX, width * ICON_STROKE_SCALE)))
      }
      if (symbol.getAttribute('stroke-linecap') === null) symbol.setAttribute('stroke-linecap', 'round')
      if (symbol.getAttribute('stroke-linejoin') === null) symbol.setAttribute('stroke-linejoin', 'round')
      symbol.dataset.dshSkinChunky = '1'
    }

    /**
     * Thicken every symbol already published, then keep watching: ui-theme
     * rewrites a symbol when the active theme changes and recreates the whole
     * sprite on reload.
     * @returns disposer that stops observing (already-applied widths stay).
     */
    function installChunkyIcons() {
      const visit = () => {
        const sprite = document.querySelector(SPRITE)
        if (sprite === null) return
        for (const symbol of sprite.querySelectorAll('symbol')) chunkySymbol(symbol)
      }
      visit()
      const observer = new MutationObserver(visit)
      observer.observe(document.body, { childList: true, subtree: true })
      return () => { observer.disconnect() }
    }

    /** One cloud puff group. */
    function Cloud({ x, y, s, o }) {
      return h('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity: o },
        h('ellipse', { cx: 0, cy: 0, rx: 26, ry: 15, fill: 'var(--ai-hero-cloud)' }),
        h('ellipse', { cx: 20, cy: 6, rx: 18, ry: 11, fill: 'var(--ai-hero-cloud)' }),
        h('ellipse', { cx: -18, cy: 7, rx: 16, ry: 10, fill: 'var(--ai-hero-cloud)' }))
    }

    /**
     * Blank-home decoration: a small island with a palm, grass tufts and two
     * drifting clouds. Sits below the conversation content and never takes
     * pointer events.
     * @returns the decorative layer.
     */
    function HeroIsland({ variant = 'overlay' }) {
      return h('div', { className: `ai-hero-scene ai-hero-scene--${variant}`, 'aria-hidden': 'true' },
        h('svg', { className: 'ai-hero-scene__svg', viewBox: '0 0 520 260', fill: 'none' },
          h('g', { className: 'ai-hero-cloud ai-hero-cloud--a' }, h(Cloud, { x: 96, y: 46, s: 0.9, o: 0.85 })),
          h('g', { className: 'ai-hero-cloud ai-hero-cloud--b' }, h(Cloud, { x: 400, y: 74, s: 0.7, o: 0.65 })),
          // water ripples
          h('path', { d: 'M96 218h64M104 228h48M296 212h72M306 222h56', stroke: 'var(--dsw-alias-brand-primary)', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.22 }),
          // grass mound
          h('path', { d: 'M150 208c8-38 42-62 82-62s74 24 82 62c-18 14-52 22-82 22s-64-8-82-22Z', fill: 'var(--dsw-alias-state-success-primary, #6fba2c)', opacity: 0.34 }),
          h('path', { d: 'M176 210c6-20 27-34 50-34s44 14 50 34c-12 8-31 12-50 12s-38-4-50-12Z', fill: 'var(--dsw-alias-state-success-secondary, #85cc45)', opacity: 0.22 }),
          // trunk
          h('path', { d: 'M232 150c-4-26 0-48 8-64', stroke: 'var(--dsw-alias-label-tertiary)', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.7 }),
          // fronds
          h('g', { stroke: 'var(--dsw-alias-state-success-primary, #6fba2c)', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.6 },
            h('path', { d: 'M240 86c-16-12-34-14-48-8' }),
            h('path', { d: 'M240 86c-4-18-16-30-32-34' }),
            h('path', { d: 'M240 86c14-14 32-18 48-14' }),
            h('path', { d: 'M240 86c6-18 18-28 34-30' })),
          // coconuts
          h('circle', { cx: 238, cy: 92, r: 4, fill: 'var(--dsw-alias-label-tertiary)', opacity: 0.6 }),
          // tufts
          h('g', { stroke: 'var(--dsw-alias-state-success-primary, #6fba2c)', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55 },
            h('path', { d: 'M122 206c2-10 6-16 12-20M126 206c-4-8-10-12-16-13' }),
            h('path', { d: 'M292 214c2-10 6-16 12-20M296 214c-4-8-10-12-16-13' }))))
    }

    /**
     * Frame layer wrapping the conversation scroll body.
     * @param {{ hero?: boolean, children?: unknown }} props - owner state and wrapped content.
     * @returns the layout-neutral layer.
     */
    function HeroFrame(props) {
      return h(React.Fragment, null,
        props.hero ? h(HeroIsland, { variant: 'frame' }) : null,
        props.children)
    }

    /**
     * Sidebar brand mark: a leaf, drawn in `currentColor` so it follows the row.
     * @param {{ size?: number }} props - host-supplied mark size.
     * @returns the leaf svg.
     */
    function LeafMark({ size = 20 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': 'true',
      },
      h('path', {
        d: 'M5 19c0-8 5.5-13.5 14-14 .5 8-5 14-12 14-1 0-2-.3-2-.3Z',
        fill: 'currentColor',
        opacity: 0.9,
      }),
      h('path', { d: 'M6.5 18.5C9 14 12.5 10.5 17 8', stroke: 'var(--dsw-alias-bg-base)', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.85 }))
    }

    /** Required service: the UI slot registry. */
    const inject = ['slots']

    /**
     * Install the browser-side skin.
     * @param {any} ctx - client plugin context.
     */
    function apply(ctx) {
      // The host publishes one flag row. Require an explicit `true`: with the
      // row disabled the row is absent, and an unstyled decoration layer would
      // otherwise sit in the document and swallow clicks.
      const flag = globalThis.__DSH_SKIN_ANIMAL_ISLAND__
      if (flag === undefined || flag.enabled !== true) return

      ctx.effect(() => installChunkyIcons(), 'skin-animal-island: chunky product icons')

      ctx.slots.inject('conversation.hero.frame', () => ctx.slots.register({
        name: 'conversation.hero.frame',
        id: 'animal-island-hero',
      }, HeroFrame))
      // The shipped web bundle already occupies the mark at priority 0; a lower
      // rank shadows it (ascending rank, lowest renders) without unregistering.
      ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({
        name: 'conversation.hero.brand.mark',
        id: 'animal-island-hero-mark',
        priority: -1,
      }, LeafMark))

      // Home decoration. The published 0.2.x build has no `conversation.hero.frame`
      // hoc, so the island rides the shell overlay and the stylesheet gates it on
      // the hero headline (`body:has(...)`); the frame registration below covers
      // newer compositions that do declare the hoc.
      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'animal-island-island',
        order: 50,
      }, HeroIsland))

      ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
        name: 'sidebar.brand.mark',
        id: 'animal-island-mark',
        priority: -1,
      }, LeafMark))
    }

    return { name: 'skin-animal-island', inject, apply }
  },
})
