/**
 * Scroll direction and position as classes, for CSS to style sticky headers and the like.
 * Plain TypeScript, no dependencies; works with smooth-scroll libraries that move the window (Lenis).
 */

type ScrollPosition = 'top' | 'middle' | 'bottom';

/** 'none' until the page has moved more than directionThreshold */
type ScrollDirection = 'up' | 'down' | 'none';

/** A number of pixels, or a function read on every update (e.g. the header's current height) */
type Offset = number | (() => number);

interface ScrollDirectionConfig {
    /** Element that receives the classes. Defaults to document.body */
    target?: Element;
    /** Class prefix: is-scroll-top, is-scroll-down… Defaults to 'is-scroll-' */
    prefix?: string;
    /** Within this many pixels of the top counts as "top". Defaults to 80 */
    topOffset?: Offset;
    /** Within this many pixels of the bottom counts as "bottom". Defaults to 100 */
    bottomOffset?: Offset;
    /** Pixels to travel the other way before the direction flips; stops jitter. Defaults to 10 */
    directionThreshold?: number;
}

interface ScrollDirectionState {
    position: ScrollPosition;
    direction: ScrollDirection;
    scrollY: number;
}

interface ScrollDirectionInstance {
    /** Current position, direction and scroll offset */
    getState(): ScrollDirectionState;

    /** Read the scroll position now, e.g. after content changed the page height */
    update(): void;

    /** Remove the listeners and the classes */
    destroy(): void;
}

const resolve = (offset: Offset): number => typeof offset === 'function' ? offset() : offset;

/**
 * Starts tracking scroll and keeps the classes on the target in step:
 * <prefix>top | middle | bottom, and <prefix>up | down once the page has moved.
 * Dispatches a `scrolldirection` event on document when either changes.
 * @param config - Configuration options
 * @returns ScrollDirectionInstance with control methods
 */
export const createScrollDirection = (config: ScrollDirectionConfig = {}): ScrollDirectionInstance => {
    const options: Required<ScrollDirectionConfig> = {
        target: document.body,
        prefix: 'is-scroll-',
        topOffset: 80,
        bottomOffset: 100,
        directionThreshold: 10,
        ...config
    };
    const {target, prefix} = options;

    let position: ScrollPosition | null = null;
    let direction: ScrollDirection = 'none';
    // Where the current direction last moved forward; the threshold is measured from here
    let anchorY = window.scrollY;
    let scrollY = window.scrollY;
    let ticking = false;
    let isDestroyed = false;

    const getPosition = (y: number): ScrollPosition => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        // At the very top always counts, also with topOffset 0 (or a header not measured yet)
        if (y <= 0 || y < resolve(options.topOffset)) return 'top';
        if (maxScroll - y < resolve(options.bottomOffset)) return 'bottom';
        return 'middle';
    };

    const getDirection = (y: number): ScrollDirection => {
        const threshold = options.directionThreshold;

        // Still going the same way: move the anchor along
        if (direction === 'down' && y > anchorY) anchorY = y;
        if (direction === 'up' && y < anchorY) anchorY = y;

        if (direction !== 'down' && y - anchorY > threshold) {
            anchorY = y;
            return 'down';
        }
        if (direction !== 'up' && anchorY - y > threshold) {
            anchorY = y;
            return 'up';
        }
        return direction;
    };

    const update = () => {
        if (isDestroyed) return;
        scrollY = window.scrollY;

        const newPosition = getPosition(scrollY);
        const newDirection = getDirection(scrollY);
        if (newPosition === position && newDirection === direction) return;

        if (newPosition !== position) {
            if (position) target.classList.remove(prefix + position);
            target.classList.add(prefix + newPosition);
        }
        if (newDirection !== direction) {
            if (direction !== 'none') target.classList.remove(prefix + direction);
            if (newDirection !== 'none') target.classList.add(prefix + newDirection);
        }

        position = newPosition;
        direction = newDirection;

        const detail: ScrollDirectionState = {position, direction, scrollY};
        document.dispatchEvent(new CustomEvent('scrolldirection', {detail}));
    };

    // One read per frame, however many scroll events fire
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            ticking = false;
            update();
        });
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});

    // State on load: a page reloaded halfway down starts as "middle"
    update();

    return {
        getState() {
            return {position: position as ScrollPosition, direction, scrollY};
        },

        update,

        destroy() {
            if (isDestroyed) return;
            isDestroyed = true;
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            ['top', 'middle', 'bottom', 'up', 'down'].forEach(name => target.classList.remove(prefix + name));
        }
    };
};

export type {ScrollDirectionConfig, ScrollDirectionInstance, ScrollDirectionState, ScrollPosition, ScrollDirection, Offset};

export default createScrollDirection;
