# Responsive classes
The goal of this library is to provide a way of adding and removing classes from
elements at different viewport sizes according to attributes defined on the
elements. The attributes allow size specific values to be set, or greater than
or equal to values. The ideas are mainly based on Angular Material's responsive
attributes, though without the requirement of Angular.

Note: This library expects, and uses HTML5 features (e.g. MutationObserver,
requestAnimationFrame). It should work in all real browsers, and IE 11+.

## Getting started
Simply include the pre-built `build\responsive.classes.js`. To customize
viewport size breakpoints, call `window.rclasses.registerSizes` providing the
`min` and `max` pixel values (as measured with `window.innerWidth`) to apply
the various sizes. The default size registration is shown below as an example:

    window.rclasses.registerSizes({
        'xs': { max: 600 },
        'sm': { min: 600, max: 960 },
        'md': { min: 960, max: 1280 },
        'lg': { min: 1280, max: 1920 },
        'xl': { min: 1920 }
    });

Then, in your `HTML`, you can do something like the following:

    <div rc-bg='red' rc-xs-bg='blue' rc-gt-lg-bg='green'></div>

This will result in the following at various viewport sizes (Note that in
all cases, all classes from other size groups are also removed):

* From `0px` to `599px` a class `bg-blue` will be added to the element.
    This is due to the `rc-xs-bg='blue'` attribute.
* From `600px` to `1279px` a class  `bg-red` will be added to the element.
    This is due to the `rc-bg='red'` attribute.
* From `1280px` a class  `bg-green` will be added to the element.
    This is due to the `rc-gt-lg-bg='green'` attribute.

## API
The following public functions are available:

* `window.rclasses.registerSizes(sizes)` - Registers the various viewport
    sizes. The `sizes` object should contain properties containing the size
    names, along with their minimum and maximum pixel values. Note: An
    exception will be thrown in the internal window resize handler if the
    size definition is incomplete, and the size code cannot be determined.
* `window.rclasses.sizes([onSizesChangedHandler], [remove])` - Returns the
    current sizes object, and optionally assigns or unassigns a handler
    which will be called if `registerSizes` is called. Setting `remove` to
    true will remove the handler.
* `window.rclasses.currentSize([onSizeChangedHandler], [remove])` - Returns
    the current viewport size code, and optionally assigns or unassigns a
    handler which will be called if the window size crosses any of the
    thresholds defined when calling `registerSizes`.
* `window.rclasses.pauseMonitor()` - Will disconnect the `MutationObserver`
    from the document. If this has been called, modifying any responsive
    attributes will have no effect.
* `window.rclasses.resumeMonitor()` - Will connect the `MutationObserver`
    to the document. If this has been called, modifying any responsive
    attributes will add / remove the appropriate classes. When this is
    called, `document.documentElement` will be checked recursively for
    elements containing responsive attributes, and those attributes will be
    applied.
