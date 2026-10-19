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
/**
 * Starts tracking scroll and keeps the classes on the target in step:
 * <prefix>top | middle | bottom, and <prefix>up | down once the page has moved.
 * Dispatches a `scrolldirection` event on document when either changes.
 * @param config - Configuration options
 * @returns ScrollDirectionInstance with control methods
 */
declare const createScrollDirection: (config?: ScrollDirectionConfig) => ScrollDirectionInstance;

export { createScrollDirection, createScrollDirection as default };
export type { Offset, ScrollDirection, ScrollDirectionConfig, ScrollDirectionInstance, ScrollDirectionState, ScrollPosition };
