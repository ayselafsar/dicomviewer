/**
 * Format date using moment library
 * @param context
 * @param format
 * @param options
 * @returns {*}
 */
function formatDate(context, format, options) {
    if (!context) {
        return undefined;
    }
    const dateAsMoment = moment(context, "YYYYMMDD");
    let strFormat = "MMM D, YYYY";
    if (options) {
        strFormat = format;
    }
    return dateAsMoment.format(strFormat);
}