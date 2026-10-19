# scroll-direction
Scroll direction and position as classes (`is-scroll-up`, `is-scroll-down`, `is-scroll-top`…), so CSS can hide a sticky header on the way down and bring it back on the way up. No dependencies, no jQuery.

[![npm version](https://badgen.net/npm/v/@phucbm/scroll-direction?icon=npm)](https://www.npmjs.com/package/@phucbm/scroll-direction)
[![npm downloads](https://badgen.net/npm/dm/@phucbm/scroll-direction?icon=npm)](https://www.npmjs.com/package/@phucbm/scroll-direction)
[![npm dependents](https://badgen.net/npm/dependents/@phucbm/scroll-direction?icon=npm)](https://www.npmjs.com/package/@phucbm/scroll-direction)
[![github stars](https://badgen.net/github/stars/phucbm/scroll-direction?icon=github)](https://github.com/phucbm/scroll-direction/)
[![github license](https://badgen.net/github/license/phucbm/scroll-direction?icon=github)](https://github.com/phucbm/scroll-direction/blob/main/LICENSE)

The successor of [jquery-scroll-direction-plugin](https://github.com/phucbm/jquery-scroll-direction-plugin).

## Installation
```bash
npm i @phucbm/scroll-direction
```
```bash
pnpm add @phucbm/scroll-direction
```

## Usage
```typescript
import {createScrollDirection} from '@phucbm/scroll-direction'
// or
import createScrollDirection from '@phucbm/scroll-direction'

createScrollDirection();
```

`<body>` then always has one position class and, once the page has moved, one direction class:

| Class | When |
|-------|------|
| `is-scroll-top` | within `topOffset` of the top (also on load at the top) |
| `is-scroll-middle` | between top and bottom |
| `is-scroll-bottom` | within `bottomOffset` of the bottom |
| `is-scroll-down` | last moved down by more than `directionThreshold` |
| `is-scroll-up` | last moved up by more than `directionThreshold` |

A sticky header that hides on the way down:
```css
.site-header {
  position: sticky;
  top: 0;
  transition: transform .3s ease;
}
.is-scroll-down:not(.is-scroll-top) .site-header {
  transform: translateY(-100%);
}
```

With Tailwind v4, as variants:
```css
@custom-variant scroll-up (&:is(.is-scroll-up *));
@custom-variant scroll-down (&:is(.is-scroll-down *));
@custom-variant scroll-top (&:is(.is-scroll-top *));
```

Use the header's height as "top", read on every update:
```typescript
const header = document.querySelector('.site-header')!;
createScrollDirection({topOffset: () => header.getBoundingClientRect().height});
```

Works with smooth-scroll libraries that move the window, such as [Lenis](https://lenis.darkroom.engineering/). Libraries that fake scrolling with transforms on a wrapper (Locomotive Scroll v4) are not supported: they leave `window.scrollY` at 0.

## Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `Element` | `document.body` | Element that receives the classes |
| `prefix` | `string` | `'is-scroll-'` | Class prefix; `'scroll-'` gives the jQuery plugin's class names |
| `topOffset` | `number \| () => number` | `80` | Within this many pixels of the top counts as top |
| `bottomOffset` | `number \| () => number` | `100` | Within this many pixels of the bottom counts as bottom |
| `directionThreshold` | `number` | `10` | Pixels to travel the other way before the direction flips; measured from where the page last moved forward, so small wobbles never flip it |

## Events
| Event | Dispatched on | `event.detail` |
|-------|---------------|----------------|
| `scrolldirection` | `document` | `{position: 'top' \| 'middle' \| 'bottom', direction: 'up' \| 'down' \| 'none', scrollY: number}` |

Fired on load and whenever the position or the direction changes, not on every scroll.

```typescript
document.addEventListener('scrolldirection', (e) => {
  const {position, direction} = (e as CustomEvent).detail;
});
```

## API
### `createScrollDirection(config?: ScrollDirectionConfig): ScrollDirectionInstance`
Starts tracking (scroll and resize, one read per animation frame) and sets the classes for the current scroll position right away.

**Instance methods:**

| Method | Description |
|--------|-------------|
| `getState()` | `{position, direction, scrollY}` now |
| `update()` | Read the scroll position now, e.g. after content changed the page height |
| `destroy()` | Remove the listeners and the classes |

## Development
```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm run build

# Type-check src and tests
pnpm typecheck

# Run tests in watch mode
pnpm run test:watch
```

## Release
Releases are published to npm by `.github/workflows/publish.yml` with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC): no npm token is stored anywhere.

Publish a GitHub release with a tag like `v1.2.3`. The workflow runs the tests, builds, sets `package.json` to that version, commits the build back to `main` and publishes to npm. The trusted publisher on npmjs.com names the workflow `publish.yml`.

## License
MIT © [phucbm](https://github.com/phucbm)
