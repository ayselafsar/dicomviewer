/* eslint import/no-extraneous-dependencies:0 */

import Handlebars from 'handlebars';
import { _ } from 'underscore';

// Convert any value into a boolean value
Handlebars.registerHelper('bool', value => !!value);

// Check if two values are identical
Handlebars.registerHelper('eq', (a, b) => a === b);

// Check if two values are different
Handlebars.registerHelper('ne', (a, b) => a !== b);

// Check if the first value is greater than the second one
Handlebars.registerHelper('gt', (a, b) => a > b);

// Check if the first value is lesser than the second one
Handlebars.registerHelper('lt', (a, b) => a < b);

// Check if the first value is greater than or equals the second one
Handlebars.registerHelper('gte', (a, b) => a >= b);

// Check if the first value is lesser than or equals the second one
Handlebars.registerHelper('lte', (a, b) => a <= b);

// Get the boolean negation for the given value
Handlebars.registerHelper('not', value => !value);

// Check if all the given values are true
Handlebars.registerHelper('and', (...values) => {
    let result = true;
    _.each(_.initial(values, 1), (value) => {
        if (!value) result = false;
    });
    return result;
});

// Check if one of the given values is true
Handlebars.registerHelper('or', (...values) => {
    let result = false;
    _.each(_.initial(values, 1), (value) => {
        if (value) result = true;
    });
    return result;
});

// Return the second parameter if the first is true or the third if it's false
Handlebars.registerHelper('valueIf', (condition, valueIfTrue, valueIfFalse) => {
    if (condition) {
        return valueIfTrue;
    }

    return valueIfFalse;
});
