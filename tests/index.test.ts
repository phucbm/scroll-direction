import createScrollDirectionDefault, {createScrollDirection} from '../src';

// jsdom does not scroll: set the scroll offset and page height by hand
const setPage = (scrollHeight: number, innerHeight = 800) => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {configurable: true, value: scrollHeight});
    Object.defineProperty(window, 'innerHeight', {configurable: true, writable: true, value: innerHeight});
};
const scrollTo = (y: number) => {
    Object.defineProperty(window, 'scrollY', {configurable: true, writable: true, value: y});
};
const classes = (el: Element = document.body) => Array.from(el.classList).sort();

describe('createScrollDirection', () => {
    beforeEach(() => {
        setPage(5000);
        scrollTo(0);
    });

    afterEach(() => {
        document.body.className = '';
        document.body.innerHTML = '';
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe('Position', () => {
        test('should start as top with no direction', () => {
            const sd = createScrollDirection();

            expect(classes()).toEqual(['is-scroll-top']);
            expect(sd.getState()).toEqual({position: 'top', direction: 'none', scrollY: 0});

            sd.destroy();
        });

        test('should start as middle when the page loads scrolled down', () => {
            scrollTo(2000);
            const sd = createScrollDirection();

            expect(classes()).toEqual(['is-scroll-middle']);

            sd.destroy();
        });

        test('should move between top, middle and bottom', () => {
            const sd = createScrollDirection();

            scrollTo(500);
            sd.update();
            expect(sd.getState().position).toBe('middle');

            // max scroll 4200; within 100px of it is bottom
            scrollTo(4150);
            sd.update();
            expect(sd.getState().position).toBe('bottom');
            expect(document.body.classList.contains('is-scroll-middle')).toBe(false);

            scrollTo(20);
            sd.update();
            expect(sd.getState().position).toBe('top');

            sd.destroy();
        });

        test('should count a page shorter than the window as top', () => {
            setPage(600);
            const sd = createScrollDirection();

            expect(sd.getState().position).toBe('top');

            sd.destroy();
        });

        test('should read topOffset from a function on every update', () => {
            let headerHeight = 80;
            const sd = createScrollDirection({topOffset: () => headerHeight});

            scrollTo(100);
            sd.update();
            expect(sd.getState().position).toBe('middle');

            headerHeight = 150;
            sd.update();
            expect(sd.getState().position).toBe('top');

            sd.destroy();
        });
    });

    describe('Direction', () => {
        test('should go down, then up, past the threshold', () => {
            const sd = createScrollDirection();

            scrollTo(300);
            sd.update();
            expect(sd.getState().direction).toBe('down');
            expect(document.body.classList.contains('is-scroll-down')).toBe(true);

            scrollTo(250);
            sd.update();
            expect(sd.getState().direction).toBe('up');
            expect(document.body.classList.contains('is-scroll-down')).toBe(false);
            expect(document.body.classList.contains('is-scroll-up')).toBe(true);

            sd.destroy();
        });

        test('should ignore movements smaller than the threshold', () => {
            const sd = createScrollDirection({directionThreshold: 10});

            scrollTo(8);
            sd.update();
            expect(sd.getState().direction).toBe('none');

            scrollTo(500);
            sd.update();
            expect(sd.getState().direction).toBe('down');

            // a 6px wobble back up is not "up"
            scrollTo(494);
            sd.update();
            expect(sd.getState().direction).toBe('down');

            sd.destroy();
        });

        test('should measure the threshold from where the direction last moved forward', () => {
            const sd = createScrollDirection({directionThreshold: 10});

            [100, 400, 1000].forEach(y => {
                scrollTo(y);
                sd.update();
            });
            expect(sd.getState().direction).toBe('down');

            // 1000 -> 992: 8px back, still down; -> 989: 11px back from 1000, up
            scrollTo(992);
            sd.update();
            expect(sd.getState().direction).toBe('down');
            scrollTo(989);
            sd.update();
            expect(sd.getState().direction).toBe('up');

            sd.destroy();
        });
    });

    describe('Options', () => {
        test('should use a custom target and prefix', () => {
            document.body.innerHTML = `<div id="root"></div>`;
            const root = document.getElementById('root') as HTMLElement;
            const sd = createScrollDirection({target: root, prefix: 'scroll-'});

            scrollTo(300);
            sd.update();
            expect(classes(root)).toEqual(['scroll-down', 'scroll-middle']);
            expect(classes()).toEqual([]);

            sd.destroy();
        });

        test('should export the factory as default too', () => {
            expect(createScrollDirectionDefault).toBe(createScrollDirection);
        });
    });

    describe('Events', () => {
        test('should dispatch scrolldirection only when position or direction changes', () => {
            const listener = jest.fn();
            document.addEventListener('scrolldirection', listener);
            const sd = createScrollDirection();
            expect(listener).toHaveBeenCalledTimes(1); // state on load

            scrollTo(300);
            sd.update();
            scrollTo(400);
            sd.update(); // still middle, still down
            expect(listener).toHaveBeenCalledTimes(2);
            expect((listener.mock.calls[1][0] as CustomEvent).detail).toEqual({
                position: 'middle',
                direction: 'down',
                scrollY: 300
            });

            document.removeEventListener('scrolldirection', listener);
            sd.destroy();
        });
    });

    describe('Listeners', () => {
        test('should update once per frame from scroll events', () => {
            jest.useFakeTimers();
            const raf = jest.spyOn(window, 'requestAnimationFrame');
            const sd = createScrollDirection();

            scrollTo(300);
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('scroll'));
            expect(raf).toHaveBeenCalledTimes(1);

            jest.runAllTimers();
            expect(sd.getState()).toEqual({position: 'middle', direction: 'down', scrollY: 300});

            sd.destroy();
        });

        test('should remove classes and stop listening after destroy', () => {
            jest.useFakeTimers();
            const sd = createScrollDirection();
            sd.destroy();
            expect(classes()).toEqual([]);

            scrollTo(300);
            window.dispatchEvent(new Event('scroll'));
            jest.runAllTimers();
            expect(classes()).toEqual([]);
        });
    });
});
