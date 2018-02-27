//add printf
(function() {

    //// Export the API
    var namespace;

    // CommonJS / Node module
    if (typeof module !== 'undefined') {
        namespace = module.exports = format;
    }

    // Browsers and other environments
    else {
        // Get the global object. Works in ES3, ES5, and ES5 strict mode.
        namespace = (function(){ return this || (1,eval)('this') }());
    }

    namespace.format = format;

    if (typeof console !== 'undefined' && typeof console.log === 'function') {
        namespace.printf = printf;
    }

    function printf(/* ... */) {
        return format.apply(null, arguments);
    }
    function format(fmt) {
        var argIndex = 1 // skip initial format argument
            , args = [].slice.call(arguments)
            , i = 0
            , n = fmt.length
            , result = ''
            , c
            , escaped = false
            , arg
            , precision
            , nextArg = function() { return args[argIndex++]; }
            , slurpNumber = function() {
                var digits = '';
                while (fmt[i].match(/\d/))
                    digits += fmt[i++];
                return digits.length > 0 ? parseInt(digits) : null;
            }
            ;
        for (; i < n; ++i) {
            c = fmt[i];
            if (escaped) {
                escaped = false;
                precision = slurpNumber();
                switch (c) {
                    case 'b': // number in binary
                        result += parseInt(nextArg(), 10).toString(2);
                        break;
                    case 'c': // character
                        arg = nextArg();
                        if (typeof arg === 'string' || arg instanceof String)
                            result += arg;
                        else
                            result += String.fromCharCode(parseInt(arg, 10));
                        break;
                    case 'd': // number in decimal
                        result += parseInt(nextArg(), 10);
                        break;
                    case 'f': // floating point number
                        result += parseFloat(nextArg()).toFixed(precision || 6);
                        break;
                    case 'o': // number in octal
                        result += '0' + parseInt(nextArg(), 10).toString(8);
                        break;
                    case 's': // string
                        result += nextArg();
                        break;
                    case 'x': // lowercase hexadecimal
                        result += '0x' + parseInt(nextArg(), 10).toString(16);
                        break;
                    case 'X': // uppercase hexadecimal
                        result += '0x' + parseInt(nextArg(), 10).toString(16).toUpperCase();
                        break;
                    default:
                        result += c;
                        break;
                }
            } else if (c === '%') {
                escaped = true;
            } else {
                result += c;
            }
        }
        return result;
    }

}());
function _t(){
    var args = arguments;
    var getText = function( key ){
        if( Planes ){
            var locale = Planes.Config.locale || 'en';
            if( Planes && Planes._locales && Planes._locales[locale]){
                return Planes._locales[locale][key] || key;
            }
        }
        return key;
    }
    if( args.length ){
        args[0] =  getText(args[0]);
        return  printf.apply( null, args );
    }else{
        return false;
    }
}
