/* eslint import/no-extraneous-dependencies:0 */

import Handlebars from 'handlebars';
import moment from 'moment';

Handlebars.registerHelper('formatPN', (context) => {
    if (!context) {
        return;
    }

    return context.replace('^', ', ');
});

Handlebars.registerHelper('formatDA', (context, format, options) => {
    if (!context) {
        return undefined;
    }
    const dateAsMoment = moment(context, 'YYYYMMDD');
    let strFormat = 'MMM D, YYYY';
    if (options) {
        strFormat = format;
    }
    return dateAsMoment.format(strFormat);
});

Handlebars.registerHelper('formatTM', (context, options) => {
    if (!context) {
        return;
    }

    // DICOM Time is stored as HHmmss.SSS, where:
    //      HH 24 hour time:
    //      m mm    0..59   Minutes
    //      s ss    0..59   Seconds
    //      S SS SSS    0..999  Fractional seconds
    //
    // See MomentJS: http://momentjs.com/docs/#/parsing/string-format/
    const dateTime = moment(context, 'HHmmss.SSS');

    let format = 'HH:mm:ss';
    if (options && options.format) {
        ({ format } = options);
    }

    return dateTime.format(format);
});
