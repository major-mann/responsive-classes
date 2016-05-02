/**
* Monitors the document's attributes for changes, and adds / removes classes
*   from the elements based on any rc- attributes.
* This module uses a MutationObserver to watch for changes to the document's
*   structure. When changes are detected (or on initialization), each element
*   containing any "rc-" attributes will be read, and it's structure processed
*   along with all other "rc-" attributes on the element to produce a state
*   object which will represent the classes to apply at each named size.
* When an element is added or updated, or initialization is taking place, and
*   a state has been read for the element, class additions and removals are
*   added to a queue. Finally, once all elements have been processed, an
*   animation frame is requested, and all classes manipulations in the queue
*   are applied at once.
* @param {object} exports The object to expose the public API onto.
* @param {object} document The HTML document object.
* @param {object} responsive The responsive functions.
* @param {function} MutationObserver used to watch for changes to attributes
*   (Or search through added elements for attributes).
*/
(function attributeMonitorModule(exports, document, responsive,
    MutationObserver) {
    'use strict';

    // Constants
    var RCA_TEST = /^rc-/i,
        RCA_ELEMENT_ID_ATTRIBUTE = 'rcaStorageId',
        RCA_STATE_NAME_PREFIX = 'rcaStateFor',
    // Module globals
        eleCount,
        elements,
        observer,
        matcher,
        sizes,
        csize,
        queue;

    // Expose the public API
    exports.resumeMonitor = resume;
    exports.pauseMonitor = pause;

    // Perform static initializattion.
    init();

    /**
    * Called to initialize the MutationObserver which will be used to watch
    *   for changes to the document.
    */
    function init() {
        var sz;
        // Initialize the queue used to hold class changes.
        queue = [];

        // Initialize the object to hold referenced elements
        eleCount = 1;
        elements = {};

        // Configure the observer to watch the attributes.
        observer = new MutationObserver(onMutated);

        // Initialize the sizes and the matcher
        sz = responsive.sizes(onSizeChanged);
        onSizeChanged(sz);

        // Tie up the size change event, so we can re-process the elements.
        csize = responsive.currentSize(onCurrentSizeChanged);

        // This will begin observiing the document for changes
        resume();
    }

    /** Begins observing the document for attribute and element changes. */
    function resume() {
        observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeOldValue: true
        });

        // Process any existing items that will not be raised through the
        //  MutationObserver
        processAddedElement(document.documentElement);
    }

    /** Stops watching the document for changes */
    function pause() {
        observer.disconnect();
    }

    /**
    * Requests an animation frame for the queue processing code.
    */
    function triggerProcess() {
        window.requestAnimationFrame(doProcess);
    }

    /** Processes the queues */
    function doProcess() {
        if (queue.length) {
            for (var i = 0; i < queue.length; i++) {
                if (queue[i].add) {
                    queue[i].element.classList.add(queue[i].class);
                } else {
                    queue[i].element.classList.remove(queue[i].class);
                }
            }
            queue = [];
        }
    }

    /**
    * Called to process the mutations received from the mutation observer.
    * @param {array} mutations An array containing the mutations to process.
    */
    function onMutated(mutations) {
        // Get all removed elements, flatten find unique and process
        var elements = mutations.map(mutationRemovedElements);
        elements = [].concat.apply([], elements)
            .filter(elementNode);
        elements.forEach(processRemovedElement);

        // Get all added or updated elements, and process
        elements = mutations.map(mutationAddedElements);
        elements = [].concat.apply([], elements)
            .filter(elementNode);
        elements.forEach(processAddedElement);

        // All elements which have had attributes changed should re-process
        elements = mutations.map(mutationAttributeChangeElement)
            .filter(defined)
            .filter(unique);
        elements.forEach(prepareElementState);

        if (queue.length) {
            triggerProcess();
        }
    }

    /**
    * Returns all added elements associated with the
    *   specified mutation.
    * @param {object} mutation The mutation the elements is from.
    */
    function mutationAddedElements(mutation) {
        return Array.prototype.slice.call(mutation.addedNodes);
    }

    /**
    * Returns all removed elements associated with the
    *   specified mutation.
    * @param {object} mutation The mutation the elements is from.
    */
    function mutationRemovedElements(mutation) {
        return Array.prototype.slice.call(mutation.removedNodes);
    }

    /**
    * Returns the element associated with an attribute change (If the mutation
    *   is an attribute change).
    * @param {object} mutation The mutation to check
    */
    function mutationAttributeChangeElement(mutation) {
        if (mutation.type === 'attributes') {
            if (RCA_TEST.test(mutation.attributeName)) {
                return mutation.target;
            }
        }
    }

    /**
    * Adds an element to the tracked collection, and processes it
    * @param {DOMElement} ele The element to add.
    */
    function processAddedElement(ele) {
        var i, id, eles;
        eles = rcaElements(ele);
        for (i = 0; i < eles.length; i++) {
            id = eles[i].dataset[RCA_ELEMENT_ID_ATTRIBUTE];
            if (!id) {
                eles[i].dataset[RCA_ELEMENT_ID_ATTRIBUTE] = eleCount++;
            }
            if (!elements[id]) {
                elements[id] = eles[i];
            }
            prepareElementState(eles[i]);
        }
    }

    /**
    * Removes an element from the tracked element collection if it exists there.
    * @param {DOMElement} ele The element to remove.
    */
    function processRemovedElement(ele) {
        var i, id, elements;
        elements = rcaElements(ele);
        for (i = 0; i < elements.length; i++) {
            id = ele.dataset[RCA_ELEMENT_ID_ATTRIBUTE];
            if (id) {
                delete elements[id];
            }
        }
    }

    /**
    * Queues the addition and removal of classes from the element so that it
    *   has the correct classes for the current viewport size.
    * @param {DOMElement} element The element to process.
    * @param {string} old Optional old viewport size. If this is not supplied,
    *   no classes will be removed.
    */
    function processElementState(element, old) {
        if (old) {
            // Remove old class
            processClasses(element, false, readElementState(element, old));
        }

        // Add classes.
        processClasses(element, true, readElementState(element, csize));
    }

    /**
    * Reads the state values from the given element.
    * @param {DOMElement} element The element to read the state value from.
    * @param {string} code The size code to read the state value for.
    */
    function readElementState(element, code) {
        return element.dataset[RCA_STATE_NAME_PREFIX + code];
    }

    /**
    * Reads the attributes from an element, preparing the state object,
    *   and saving that state object in it's data list as a comman separated
    *   array of class names.
    * @param {DOMElement} element The DOM element to read the attributes from.
    */
    function prepareElementState(element) {
        var name, state, rcaElement;

        state = extractStateData(element);

        // Order the items by size, prepare the state object from all values,
        //  then queue the class additions and removal for later.
        for (name in state) {
            if (state.hasOwnProperty(name)) {
                rcaElement = true;
                processState(state, name);
            }
        }

        if (rcaElement) {
            // Store the state for each size on the element.
            storeState(state, element);

            // Apply te current state to the element.
            processElementState(element);
        }

        /**
        * Reads all attribute data required for rc- states.
        * @param {DOMElement} element The element to extract the state data
        *   from.
        */
        function extractStateData(element) {
            var i, match, name, state;

            state = {};
            // Extract and store the relevant attribute matches.
            for (i = 0; i < element.attributes.length; i++) {
                match = matcher.exec(element.attributes[i].name);
                if (match && match[3]) {
                    name = match[3];
                    if (!state[name]) {
                        state[name] = [];
                    }
                    state[name].push({
                        class: className(name, element.attributes[i].value),
                        match: match
                    });
                }
            }
            return state;
        }

        /**
        * Processes a named state.
        * @param {object} state The object containing the various states.
        * @param {string} name The name of the state to process.
        */
        function processState(state, name) {
            var dflt;

            // Get all non default (the notDefault function will set the
            //  dflt variable), and order by view size.
            state[name] = state[name]
                .filter(notDefault)
                .sort(bySize);

            // Remove any duplicate size directives (if we have explicit
            //  and greater than -> greater than takes preference).
            deDuplicateStates(state[name]);

            // Prepare the final state object
            state[name] = prepareNameState(name, dflt);

            /**
            * Prepares the state object for the given named state.
            * @param {string} name The name of the state.
            * @param {string} dflt The default value.
            */
            function prepareNameState(name, dflt) {
                var i, j, st, res = {};
                j = 0;
                for (i = 0; i < sizes.length; i++) {
                    st = state[name];
                    if (j < st.length && st[j].match[2] === sizes[i]) {
                        res[sizes[i]] = st[j].class;
                        if (st[j].match[1]) {
                            dflt = res[sizes[i]];
                        }
                        j++;
                    } else {
                        res[sizes[i]] = dflt;
                    }
                }
                return res;
            }

            /**
            * Reads the default value if the supplied attribute is the default,
            *   then if we have the default attribute, returns false so it can
            *   be filtered out.
            * @param {object} match The attribute match to check agains.
            */
            function notDefault(match) {
                // Match 2 is the size name.
                if (match.match[2]) {
                    return true;
                } else {
                    // Match 3 is the class name.
                    dflt = match.class;
                    return false;
                }
            }
        }
    }

    /**
    * Called when the screen size codes have been changed. Note: This will
    *   not remove or cleanup old registrations.
    * @param {array} newSizes The new size codes.
    */
    function onSizeChanged(newSizes) {
        // Note: We purposefully ignore elements containing old attributes.
        var attributeEx, names = newSizes.join('|');
        attributeEx = '^rc-(?:(gt-)?(' + names + ')-)?(.+)$';
        matcher = new RegExp(attributeEx, 'i');
        sizes = newSizes.slice();

        // Reprocess the entire document.
        prepareElementState(document.documentElement);
    }

    /**
    * Called when the current size code has changed.
    * @param {string} code The new size code.
    * @param {string} old The old size code.
    */
    function onCurrentSizeChanged(code, old) {
        csize = code;
        // For every stored element, process
        for (var ele in elements) {
            if (elements.hasOwnProperty(ele)) {
                processElementState(elements[ele], old);
            }
        }
        triggerProcess();
    }

    /**
    * Finds all RCA elements in the given element tree.
    * @param {DOMElement} ele The element to begin searching at.
    */
    function rcaElements(ele) {
        var res = [], children;
        if (isRcaElement(ele)) {
            res.push(ele);
        }
        // Process the children, flatten and concat to the result.
        children = Array.prototype.map.call(ele.children, rcaElements);
        children = [].concat.apply([], children);
        return res.concat(children);
    }

    /**
    * Checks whether the supplied element has any rc attributes.
    * @param {DOMElement} ele The element to check.
    */
    function isRcaElement(ele) {
        for (var i = 0; i < ele.attributes.length; i++) {
            if (RCA_TEST.test(ele.attributes[i].name)) {
                return true;
            }
        }
        return false;
    }

    /**
    * Ensures the supplied value is not a duplicate in the array (useful with
    *   the array filter function).
    * @param val The value to check.
    * @param {number} index The index of the value in the array.
    * @param {array} arr The array we are operating on.
    */
    function unique(val, index, arr) {
        return arr.indexOf(val) === index;
    }

    /**
    * Checks that the supplied value is not undefined.
    * @param val The value to check.
    */
    function defined(val) {
        return val !== undefined;
    }

    /**
    * Returns true if the supplied element is an ELEMENT_NODE (nodeType 1).
    * @param {DOMElement} ele The element to check.
    */
    function elementNode(ele) {
        return ele.nodeType === document.ELEMENT_NODE;
    }

    /**
    * Returns number to indicate size order.
    * @param {object} a Attribute match a
    * @param {object} b Attribute match b
    */
    function bySize(a, b) {
        var aidx, bidx;
        aidx = sizes.indexOf(a[2]);
        bidx = sizes.indexOf(b[2]);
        if (aidx === bidx) {
            // GT always takes preference.
            if (a[1] && !b[1]) {
                // A has greater than... Comes before b
                return -1;
            } else if (b[1] && !a[1]) {
                // B has greater than... Comes before a
                return 1;
            } else {
                // Both have greater than, or none have greater than.
                //  no difference.
                return -1;
            }
        }
        return aidx - bidx;
    }

    /**
    * Stores the state data on the element.
    * @param {object} state The state object containing the classes for
    *   the various sizes.
    * @param {DOMElement} element The element to store the state values on.
    */
    function storeState(state, element) {
        var i, name, estate, size;
        // Store the state for each size on the element.
        for (i = 0; i < sizes.length; i++) {
            size = sizes[i];
            estate = [];
            for (name in state) {
                if (state[name][size]) {
                    estate.push(state[name][size]);
                }
            }
            element.dataset[RCA_STATE_NAME_PREFIX + size] = estate.join(',');
        }
    }

    /**
    * Goes through a states data array, and ensures there are no duplicate
    *   instructions for a size (gt takes preference over normal)
    * @param {array} states The array of state data to remove duplicates
    *   from.
    */
    function deDuplicateStates(states) {
        var prevSize;
        // Ensure we have, at most, 1 attribute per size.
        //  Since we sorted gt before normal, gt takes preference.
        for (var i = 1; i < states.length; i++) {
            prevSize = states[i - 1].match[2];
            if (states[i].match[2] === prevSize) {
                states.splice(i, 1);
                i--;
            }
        }
    }

    /**
    * Determines the class name to use for the specified state name,
    *   and attribute value.
    * @param {string} name The state name.
    * @param {string} value The attribute value.
    */
    function className(name, value) {
        if (value) {
            return name + '-' + String(value).replace(/ /g, '-');
        } else {
            return name;
        }
    }

    /**
    * Queues the add / remove classes for the specified element.
    * @param {DOMElement} element The element to process.
    * @param {boolean} add true to queue a class add, false queue a remove.
    * @param {string} classes The comma separated classes to add or remove.
    */
    function processClasses(element, add, classes) {
        var i;
        if (classes) {
            classes = classes.split(',');
            for (i = 0; i < classes.length; i++) {
                queue.push({
                    element: element,
                    add: add,
                    class: classes[i]
                });
            }
        }
    }
}(window.rclasses, window.document, window.rclasses, window.MutationObserver));
