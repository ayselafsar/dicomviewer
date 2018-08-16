import Handlebars from 'handlebars';
import { _ } from 'underscore';
import moment from 'moment';

Handlebars.registerHelper('formatPN', context => {
    if (!context) {
        return;
    }

    return context.replace('^', ', ');
});

Handlebars.registerHelper('formatDA', (context, format, options) => {
    if (!context) {
        return undefined;
    }
    var dateAsMoment = moment(context, "YYYYMMDD");
    var strFormat = "MMM D, YYYY";
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
    var dateTime = moment(context, 'HHmmss.SSS');

    var format = "HH:mm:ss";
    if (options && options.format) {
        format = options.format;
    }

    return dateTime.format(format);
});
