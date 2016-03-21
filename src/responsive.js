/**
* The module responsible for defining responsive layouts. This module is
*   responsible for watching the window being resized, and supplying the
*   correct code to consumers.
* @param {object} exports The object to export the public API onto.
*/
(function responsiveModule(exports) {
    'use strict';

    var changeHandlers = [],
        sizesHandlers = [],
        sizeNames, // Size ordered list of names (By min)
        current,
        sizes;

    // Expose the public API
    exports.registerSizes = registerSizes;
    exports.sizes = watchSizes;
    exports.currentSize = watchChange;

    // Perform static initialization.
    init();

    /** Intiializes the module */
    function init() {
        // Register the default sizes, which will initialize the global
        //   variables "sizes", "sizeNames" and "attrContainerName".
        registerSizes({
            'xs': { max: 600 },
            'sm': { min: 600, max: 960 },
            'md': { min: 960, max: 1280 },
            'lg': { min: 1280, max: 1920 },
            'xl': { min: 1920 }
        });

        // Get the current size.
        current = determineSize(window.innerWidth);

        // Watch the window for changes in size.
        window.addEventListener('resize', onWindowResized);
    }

    /**
    * Determines which size the supplied width is.
    * @param {number} width The width to check.
    * @returns {string} The size code.
    */
    function determineSize(width) {
        var code, min, max;
        for (code in sizes) {
            if (sizes.hasOwnProperty(code)) {
                min = sizes[code].min;
                if (typeof sizes[code].min !== 'number') {
                    min = 0;
                }
                max = sizes[code].max;
                if (typeof sizes[code].max !== 'number') {
                    max = Number.Infinity;
                }

                if (width >= min && width <= max) {
                    return code;
                }
            }
        }
        throw new Error('Incomplete sizes definition!');
    }

    /**
    * Registers a function to be called back to with the current sizes, every
    *   time the sizes change, and return the current sizes.
    * @param {function} handler The handler to call with the sizes.
    * @param {boolean} remove Whether to try to remove the supplied handler
    *   rather than add it.
    */
    function watchSizes(handler, remove) {
        var idx;
        if (typeof handler === 'function') {
            if (remove) {
                idx = sizesHandlers.indexOf(handler);
                sizesHandlers.splice(idx, 1);
            } else {
                sizesHandlers.push(handler);
            }
        }
        return sizeNames.slice();
    }

    /**
    * Registers a function to be called back to with the current time the
    *   code changes, and return the current code.
    * @param {function} handler The handler to call with the sizes.
    * @param {boolean} remove Whether to try to remove the supplied handler
    *   rather than add it.
    */
    function watchChange(handler, remove) {
        var idx;
        if (typeof handler === 'function') {
            if (remove) {
                idx = changeHandlers.indexOf(handler);
                changeHandlers.splice(idx, 1);
            } else {
                changeHandlers.push(handler);
            }
        }
        return current;
    }

    /**
    * Replaces the default sizes.
    * @param {object} newSizes An object containing size names as property names
    *   and objects as values containing min and max properties (numbers
    *   greater than or equal to 0, at least 1 of the 2 are required)
    */
    function registerSizes(newSizes) {
        var sncpy;
        if (newSizes && typeof newSizes === 'object') {
            Object.keys(newSizes).forEach(checkSize);
            sizes = {};
            Object.keys(newSizes).forEach(copySize);
            sizeNames = Object.keys(newSizes).sort(bySizesMin);
            sncpy = sizeNames.slice();
            sizesHandlers.forEach(exec);
        }

        /**
        * Executes a size handler function.
        * @param {function} func The function to execute.
        */
        function exec(func) {
            return func(sncpy);
        }

        /**
        * Checks a received size object is valid.
        * @param {object} sz The size object to check.
        */
        function checkSize(sz) {
            var one = false;
            sz = newSizes[sz];
            if (sz.min >= 0) {
                one = true;
            }
            if (sz.max >= 0) {
                one = true;
            }
            if (!one) {
                throw new Error('Supplied size MUST have at least 1 ' +
                    'min or max value that is a positive number');
            }
        }

        /**
        * Copies the size to the sizes object.
        * @param {object} sz The size object to copy.
        */
        function copySize(sz) {
            if (/[a-z][a-z0-9_\-]/i.test(sz)) {
                sizes[sz] = {
                    min: newSizes[sz].min >= 0 ?
                        newSizes[sz].min :
                        undefined,
                    max: newSizes[sz].max >= 0 ?
                        newSizes[sz].max :
                        undefined
                };
            }
        }
    }

    /** Called when the window has been resized */
    function onWindowResized() {
        var curr = determineSize(window.innerWidth),
            old;
        if (curr !== current) {
            old = current;
            current = curr;
            changeHandlers.forEach(exec);
        }

        /**
        * Executes a change handler function.
        * @param {function} func The function to execute.
        */
        function exec(func) {
            return func(current, old);
        }
    }

    /**
    * Orders by the min property.
    * @param {string} a Size name a to compare.
    * @param {string} b Size name b to compare.
    * @returns {number} The ordering index.
    */
    function bySizesMin(a, b) {
        a = sizes[a].min || 0;
        b = sizes[b].min || 0;
        return a - b;
    }
}(window.rclasses));
