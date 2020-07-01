'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var events = require('events');
var firebase = _interopDefault(require('firebase-admin'));

class FireError extends Error {
    constructor(message, 
    /**
     * a type/subtype of the error or you can just state the "subtype"
     * and it will
     */
    classification = 'UniversalFire/error', statusCode = 400) {
        super(message);
        this.universalFire = true;
        this.kind = 'FireError';
        const parts = classification.split('/');
        const klass = this.constructor.name;
        this.name = parts.length === 2 ? classification : `${klass}/${parts[0]}`;
        this.code = parts.length === 2 ? parts[1] : parts[0];
        this.kind = parts[0];
        this.statusCode = statusCode;
    }
}

function isMockConfig(config) {
    return config && config.mocking === true;
}
function isAdminConfig(config) {
    return config &&
        config.mocking !== true &&
        config.apiKey === undefined &&
        config.databaseURL !== undefined
        ? true
        : false;
}

var RealQueryOrderType;
(function (RealQueryOrderType) {
    RealQueryOrderType["orderByChild"] = "orderByChild";
    RealQueryOrderType["orderByKey"] = "orderByKey";
    RealQueryOrderType["orderByValue"] = "orderByValue";
})(RealQueryOrderType || (RealQueryOrderType = {}));

/**
 * Takes as input a variety of possible formats and converts it into
 * a Firebase service account (`IServiceAccount`). The input formats
 * which it accepts are:
 *
 * - an `IServiceAccount` object (_in which case nothing to be done_)
 * - a JSON encoded string of the `IServiceAccount` object
 * - a base64 encoded string of a `IServiceAccount` object (_possible but not recommended
 * as an ENV variable may run out of room to encode_)
 * - a base64 encoded GZIP of a `IServiceAccount` object (_this is ideal for ENV vars
 * which have limited length and must be string_)
 */
function extractServiceAccount(config) {
    if (isMockConfig(config)) {
        return {};
    }
    const serviceAccount = config && config.mocking !== true && config.serviceAccount
        ? config.serviceAccount
        : process.env['FIREBASE_SERVICE_ACCOUNT'];
    if (!serviceAccount) {
        throw new FireError(`There was no service account defined (either passed in or in the FIREBASE_SERVICE_ACCOUNT ENV variable)!`, 'invalid-configuration');
    }
    switch (typeof serviceAccount) {
        case 'object':
            if (serviceAccount.privateKey && serviceAccount.projectId) {
                return serviceAccount;
            }
            else {
                throw new FireError(`An attempt to use the Admin SDK failed because a service account object was passed in but it did NOT have the required properties of "privateKey" and "projectId".`, 'invalid-configuration');
            }
        case 'string':
            // JSON
            if (looksLikeJson(serviceAccount)) {
                try {
                    const data = JSON.parse(serviceAccount);
                    if (data.private_key && data.type === 'service_account') {
                        return data;
                    }
                    else {
                        throw new FireError(`The configuration appeared to contain a JSON encoded representation of the service account but after decoding it the private_key and/or the type property were not correctly set.`, 'invalid-configuration');
                    }
                }
                catch (e) {
                    throw new FireError(`The configuration appeared to contain a JSOn encoded representation but was unable to be parsed: ${e.message}`, 'invalid-configuration');
                }
            }
            // BASE 64
            try {
                const buffer = Buffer.from(serviceAccount, 'base64');
                return JSON.parse(buffer.toString());
            }
            catch (e) {
                throw new FireError(`Failed to convert a string based service account to IServiceAccount! The error was: ${e.message}`, 'invalid-configuration');
            }
        default:
            throw new FireError(`Couldn't extract the serviceAccount from ENV variables! The configuration was:\n${(2)}`, 'invalid-configuration');
    }
}

/**
 * extracts the Firebase **databaseURL** property either from the passed in
 * configuration or via the FIREBASE_DATABASE_URL environment variable.
 */
function extractDataUrl(config) {
    if (isMockConfig(config)) {
        return 'https://mocking.com';
    }
    const dataUrl = config && config.databaseURL
        ? config.databaseURL
        : process.env['FIREBASE_DATABASE_URL'];
    if (!dataUrl) {
        throw new FireError(`There was no DATABASE URL provided! This needs to be passed in as part of the configuration or as the FIREBASE_DATABASE_URL environment variable.`, 'invalid-configuration');
    }
    return dataUrl;
}

/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
function getRunningApps(apps) {
    return apps.filter((i) => i !== null).map((i) => i.name);
}

/** Gets the  */
function getRunningFirebaseApp(name, apps) {
    const result = name
        ? apps.find((i) => i && i.name === name)
        : undefined;
    if (!result) {
        throw new FireError(`Attempt to get the Firebase app named "${name}" failed`, 'invalid-app-name');
    }
    return result;
}

function looksLikeJson(data) {
    return data.trim().slice(0, 1) === '{' && data.trim().slice(-1) === '}'
        ? true
        : false;
}

function determineDefaultAppName(config) {
    if (!config) {
        return '[DEFAULT]';
    }
    return config.name
        ? config.name
        : config.databaseURL
            ? config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
            : '[DEFAULT]';
}

/**
 * Provides a logical test to see if the passed in event is a LambdaProxy request or just a
 * straight JS object response. This is useful when you have both an HTTP event and a Lambda-to-Lambda
 * or Step-Function-to-Lambda interaction.
 *
 * @param message the body of the request (which is either of type T or a LambdaProxy event)
 */

var HttpStatusCodes;
(function (HttpStatusCodes) {
    /**
     * The client SHOULD continue with its request. This interim response is used to inform
     * the client that the initial part of the request has been received and has not yet
     * been rejected by the server. The client SHOULD continue by sending the remainder
     * of the request or, if the request has already been completed, ignore this response.
     * The server MUST send a final response after the request has been completed.
     */
    HttpStatusCodes[HttpStatusCodes["Continue"] = 100] = "Continue";
    /** The request has succeeded. */
    HttpStatusCodes[HttpStatusCodes["Success"] = 200] = "Success";
    /**
     * The request has been fulfilled and resulted in a new resource being created. The newly
     * created resource can be referenced by the URI(s) returned in the entity of the response,
     * with the most specific URI for the resource given by a Location header field. The response
     * SHOULD include an entity containing a list of resource characteristics and location(s) from
     * which the user or user agent can choose the one most appropriate. The entity format is
     * specified by the media type given in the Content-Type header field. The origin server MUST
     * create the resource before returning the `201` status code. If the action cannot be carried
     * out immediately, the server SHOULD respond with `202` (Accepted) response instead.
     *
     * A `201` response MAY contain an ETag response header field indicating the current value of
     * the entity tag for the requested variant just created.
  
     */
    HttpStatusCodes[HttpStatusCodes["Created"] = 201] = "Created";
    /**
     * The request has been accepted for processing, but the processing has not been completed.
     * The request might or might not eventually be acted upon, as it might be disallowed when
     * processing actually takes place. There is no facility for re-sending a status code from an
     * asynchronous operation such as this.
     *
     * The 202 response is intentionally non-committal. Its purpose is to allow a server to accept
     * a request for some other process (perhaps a batch-oriented process that is only run once
     * per day) without requiring that the user agent's connection to the server persist until the
     * process is completed. The entity returned with this response SHOULD include an indication
     * of the request's current status and either a pointer to a status monitor or some estimate
     * of when the user can expect the request to be fulfilled.
     */
    HttpStatusCodes[HttpStatusCodes["Accepted"] = 202] = "Accepted";
    /**
     * The server has fulfilled the request but does not need to return an entity-body, and might
     * want to return updated meta-information. The response MAY include new or updated
     * meta-information in the form of entity-headers, which if present SHOULD be associated with
     * the requested variant.
     *
     * If the client is a _user agent_, it **SHOULD NOT** change its document view from that which
     * caused the request to be sent. This response is primarily intended to allow input for
     * actions to take place without causing a change to the user agent's active document view,
     * although any new or updated metainformation **SHOULD** be applied to the document
     * currently in the user agent's active view.
     *
     * The `204` response **MUST NOT** include a `message-body`, and thus is always terminated
     * by the first empty line after the header fields.
     */
    HttpStatusCodes[HttpStatusCodes["NoContent"] = 204] = "NoContent";
    HttpStatusCodes[HttpStatusCodes["MovedPermenantly"] = 301] = "MovedPermenantly";
    HttpStatusCodes[HttpStatusCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    /**
     * If the client has performed a conditional GET request and access is allowed, but the
     * document has not been modified, the server SHOULD respond with this status code. The
     * `304` response MUST NOT contain a _message-body_, and thus is always terminated by the
     * first empty line after the header fields.
     */
    HttpStatusCodes[HttpStatusCodes["NotModified"] = 304] = "NotModified";
    /**
     * The request could not be understood by the server due to malformed syntax.
     * The client SHOULD NOT repeat the request without modifications.
     */
    HttpStatusCodes[HttpStatusCodes["BadRequest"] = 400] = "BadRequest";
    /**
     * The request requires user authentication. The response MUST include a WWW-Authenticate
     * header field containing a challenge applicable to the requested resource.
     * The client MAY repeat the request with a suitable Authorization header field. If the
     * request already included Authorization credentials, then the `401`
     * response indicates that authorization has been refused for those credentials. If the `401`
     * response contains the same challenge as the prior response, and the user agent has already
     * attempted authentication at least once, then the user SHOULD be presented the entity that
     * was given in the response, since that entity might include relevant diagnostic information.
     */
    HttpStatusCodes[HttpStatusCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpStatusCodes[HttpStatusCodes["PaymentRequired"] = 402] = "PaymentRequired";
    /**
     * The request could not be understood by the server due to malformed syntax. The client
     * SHOULD NOT repeat the request without modifications.
     */
    HttpStatusCodes[HttpStatusCodes["Forbidden"] = 403] = "Forbidden";
    /**
     * The server has not found anything matching the Request-URI. No indication is given of
     * whether the condition is temporary or permanent. The `410` (Gone) status code SHOULD be
     * used if the server knows, through some internally configurable mechanism, that an old
     * resource is permanently unavailable and has no forwarding address.
     *
     * This status code is commonly used when the server does not wish to reveal exactly
     * why the request has been refused, or when no other response is applicable.
     */
    HttpStatusCodes[HttpStatusCodes["NotFound"] = 404] = "NotFound";
    /**
     * The method specified in the Request-Line is not allowed for the resource identified
     * by the Request-URI. The response MUST include an Allow header containing a list of
     * valid methods for the requested resource.
     */
    HttpStatusCodes[HttpStatusCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    /**
     * The client did not produce a request within the time that the server was
     * prepared to wait. The client MAY repeat the request without modifications
     * at any later time.
     */
    HttpStatusCodes[HttpStatusCodes["RequestTimeout"] = 408] = "RequestTimeout";
    /**
     * The request could not be completed due to a conflict with the current state of the
     * resource. This code is only allowed in situations where it is expected that the
     * user might be able to resolve the conflict and resubmit the request. The response
     * body SHOULD include enough information for the user to recognize the source of the
     * conflict. Ideally, the response entity would include enough information for the
     * user or user agent to fix the problem; however, that might not be possible and
     * is not required.
     *
     * Conflicts are most likely to occur in response to a PUT request. For example,
     * if versioning were being used and the entity being PUT included changes to a resource
     * which conflict with those made by an earlier (third-party) request, the server might
     * use the 409 response to indicate that it can't complete the request. In this case,
     * the response entity would likely contain a list of the differences between the
     * two versions in a format defined by the response Content-Type.
     */
    HttpStatusCodes[HttpStatusCodes["Conflict"] = 409] = "Conflict";
    /**
     * The requested resource is no longer available at the server and no forwarding address
     * is known. This condition is expected to be considered permanent. Clients with link
     * editing capabilities SHOULD delete references to the Request-URI after user approval.
     * If the server does not know, or has no facility to determine, whether or not the
     * condition is permanent, the status code 404 (Not Found) SHOULD be used instead.
     * This response is cacheable unless indicated otherwise.
     *
     * The 410 response is primarily intended to assist the task of web maintenance by
     * notifying the recipient that the resource is intentionally unavailable and that
     * the server owners desire that remote links to that resource be removed. Such an
     * event is common for limited-time, promotional services and for resources belonging
     * to individuals no longer working at the server's site. It is not necessary to mark
     * all permanently unavailable resources as "gone" or to keep the mark for any length
     * of time -- that is left to the discretion of the server owner.
     */
    HttpStatusCodes[HttpStatusCodes["Gone"] = 410] = "Gone";
    /**
     * Indicates that the server refuses to brew coffee because it is, permanently, a teapot.
     * A combined coffee/tea pot that is temporarily out of coffee should instead return 503.
     * This error is a reference to Hyper Text Coffee Pot Control Protocol defined in April
     * Fools' jokes in 1998 and 2014.
     */
    HttpStatusCodes[HttpStatusCodes["IAmATeapot"] = 418] = "IAmATeapot";
    HttpStatusCodes[HttpStatusCodes["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    /**
     * The 429 status code indicates that the user has sent too many requests in a given
     * amount of time ("rate limiting").
     */
    HttpStatusCodes[HttpStatusCodes["TooManyRequests"] = 429] = "TooManyRequests";
    /**
     * The server encountered an unexpected condition which prevented it from fulfilling
     * the request.
     */
    HttpStatusCodes[HttpStatusCodes["InternalServerError"] = 500] = "InternalServerError";
    /**
     * The server does not support the functionality required to fulfill the request. This
     * is the appropriate response when the server does not recognize the request method
     * and is not capable of supporting it for any resource.
     */
    HttpStatusCodes[HttpStatusCodes["NotImplemented"] = 501] = "NotImplemented";
    /**
     * The server, while acting as a gateway or proxy, received an invalid response from
     * the upstream server it accessed in attempting to fulfill the request.
     */
    HttpStatusCodes[HttpStatusCodes["BadGateway"] = 502] = "BadGateway";
    /**
     * Indicates that the server is not ready to handle the request.
     *
     * Common causes are a server that is down for maintenance or that is overloaded.
     * This response should be used for temporary conditions and the `Retry-After` HTTP
     * header should, if possible, contain the estimated time for the recovery of the
     * service.
     */
    HttpStatusCodes[HttpStatusCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpStatusCodes[HttpStatusCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
    /**
     * The 511 status code indicates that the client needs to authenticate to gain
     * network access.
     *
     * The response representation SHOULD contain a link to a resource that allows
     * the user to submit credentials (e.g. with a HTML form).
     *
     * Note that the 511 response SHOULD NOT contain a challenge or the login interface
     * itself, because browsers would show the login interface as being associated with
     * the originally requested URL, which may cause confusion.
     */
    HttpStatusCodes[HttpStatusCodes["AuthenticationRequired"] = 511] = "AuthenticationRequired";
})(HttpStatusCodes || (HttpStatusCodes = {}));

class ParseStackError extends Error {
    constructor(code, message, originalString, structuredString) {
        super();
        this.originalString = originalString;
        this.structuredString = structuredString;
        this.message = `[parseStack/${code}] ` + message;
        this.code = code;
        this.name = `parseStack/${code}`;
    }
}

function separateFileAndFilepath(fileinfo) {
    const parts = fileinfo.split("/");
    return parts.length < 2
        ? { file: fileinfo, filePath: "" }
        : { file: parts.pop(), filePath: parts.slice(0, parts.length - 1).join("/") };
}
function fileMapper(i) {
    const { file, filePath } = separateFileAndFilepath(i.file);
    i.file = file;
    if (filePath) {
        i.filePath = filePath;
        i.shortPath = filePath
            .split("/")
            .slice(-3)
            .join("/");
    }
    return i;
}
/**
 * parses an Error's `stack` property into a structured
 * object. Optionally allowing for filtering and size limiting
 */
function parseStack(
/** the default stack trace string */
stack, options = {}) {
    const ignorePatterns = options.ignorePatterns || [];
    const limit = options.limit;
    const structured = stack
        .replace(/Error.*\n.*?at/, " at")
        .replace(/at (\S*) \(([^\0]*?)\:([0-9]*?)\:([0-9]*)\)| at (\/.*?)\:([0-9]*?)\:([0-9]*)/g, '{ "fn": "$1", "line": $3$6, "col": $4$7, "file": "$2$5" },');
    let parsed;
    try {
        parsed = JSON.parse(`[ ${structured.replace(/\,$/, "")} ]`)
            .filter((i) => {
            let result = true;
            ignorePatterns.forEach(pattern => {
                if (i.fn.includes(pattern) || i.file.includes(pattern)) {
                    result = false;
                }
            });
            return result;
        })
            .map(fileMapper);
        if (limit) {
            parsed = parsed.slice(0, limit);
        }
    }
    catch (e) {
        throw new ParseStackError("parsing-error", e.message, stack, structured);
    }
    return parsed;
}
// polyfill Array.isArray if necessary
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root, 'Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$1 || ListCache),
    'string': new Hash
  };
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});
/**
 * hashToArray
 *
 * Converts a hash data structure of {key: value, key2: value2} to an
 * array of [ {id, value}, {id2, value2} ]. This should happen regardless
 * to whether the values are themselves hashes (which they often are) or
 * scalar values.
 *
 * The one edge case is where all the hashes passed in have a value of "true"
 * which indicates that this really just a simple value based array encoded as
 * a hash (as is often the case in Firebase for FK relationships).
 *
 * @param hashObj an object of keys that point to some data payload
 * @param ___key__ the property name on the converted array-of-hashes which will contain the key value; by default this is "id"
 */
function hashToArray(hashObj, __key__ = "id") {
    if (hashObj && typeof hashObj !== "object") {
        throw new Error("Cant convert hash-to-array because hash was not passed in: " + hashObj);
    }
    const hash = Object.assign({}, hashObj);
    const results = [];
    const isHashArray = Object.keys(hash).every((i) => hash[i] === true);
    const isHashValue = Object.keys(hash).every((i) => typeof hash[i] !== "object");
    Object.keys(hash).map((id) => {
        const obj = typeof hash[id] === "object"
            ? Object.assign(Object.assign({}, hash[id]), { [__key__]: id }) : isHashArray
            ? id
            : { [__key__]: id, value: hash[id] };
        results.push(obj);
    });
    return results;
}
/**
 * Snapshot to Array (unordered)
 *
 * converts snapshot directly to JS and then converts hash to an
 * array structure but any sorting that came from the server query
 * will be ignored.
 */
function snapshotToArray(snap, idProp = "id") {
    const hash = snap.val() || {};
    return hashToArray(hash, idProp);
}

class FireError$1 extends Error {
    constructor(message, 
    /**
     * a type/subtype of the error or you can just state the "subtype"
     * and it will
     */
    classification = 'UniversalFire/error', statusCode = 400) {
        super(message);
        this.universalFire = true;
        this.kind = 'FireError';
        const parts = classification.split('/');
        const klass = this.constructor.name;
        this.name = parts.length === 2 ? classification : `${klass}/${parts[0]}`;
        this.code = parts.length === 2 ? parts[1] : parts[0];
        this.kind = parts[0];
        this.statusCode = statusCode;
    }
}

var RealQueryOrderType$1;
(function (RealQueryOrderType) {
    RealQueryOrderType["orderByChild"] = "orderByChild";
    RealQueryOrderType["orderByKey"] = "orderByKey";
    RealQueryOrderType["orderByValue"] = "orderByValue";
})(RealQueryOrderType$1 || (RealQueryOrderType$1 = {}));

function slashNotation(path) {
    return path.replace(/\./g, '/');
}

class AbstractedDatabase {
    constructor() {
        /**
         * Indicates if the database is using the admin SDK.
         */
        this._isAdminApi = false;
        /**
         * Indicates if the database is connected.
         */
        this._isConnected = false;
    }
    /**
     * Returns key characteristics about the Firebase app being managed.
     */
    get app() {
        if (this.config.mocking) {
            throw new FireError$1(`The "app" object is provided as direct access to the Firebase API when using a real database but not when using a Mock DB!`, 'not-allowed');
        }
        if (this._app) {
            return {
                name: this._app.name,
                databaseURL: this._app.options.databaseURL
                    ? this._app.options.databaseURL
                    : '',
                projectId: this._app.options.projectId
                    ? this._app.options.projectId
                    : '',
                storageBucket: this._app.options.storageBucket
                    ? this._app.options.storageBucket
                    : '',
            };
        }
        throw new FireError$1('Attempt to access Firebase App without having instantiated it');
    }
    /**
     * Provides a set of API's that are exposed by the various "providers". Examples
     * include "emailPassword", "github", etc.
     *
     * > **Note:** this is only really available on the Client SDK's
     */
    get authProviders() {
        throw new FireError$1(`Only the client SDK's have a authProviders property`);
    }
    /**
     * Indicates if the database is using the admin SDK.
     */
    get isAdminApi() {
        return this._isAdminApi;
    }
    /**
     * Indicates if the database is a mock database or not
     */
    get isMockDb() {
        return this._config.mocking;
    }
    /**
     * The configuration used to setup/configure the database.
     */
    get config() {
        return this._config;
    }
    /**
     * Returns the mock API provided by **firemock**
     * which in turn gives access to the actual database _state_ off of the
     * `db` property.
     *
     * This is only available if the database has been configured as a mocking database; if it is _not_
     * a mocked database a `AbstractedDatabase/not-allowed` error will be thrown.
     */
    get mock() {
        if (!this.isMockDb) {
            throw new FireError$1(`Attempt to access the "mock" property on an abstracted is not allowed unless the database is configured as a Mock database!`, 'AbstractedDatabase/not-allowed');
        }
        if (!this._mock) {
            throw new FireError$1(`Attempt to access the "mock" property on a configuration which IS a mock database but the Mock API has not been initialized yet!`);
        }
        return this._mock;
    }
    /**
     * Returns true if the database is connected, false otherwis.
     */
    get isConnected() {
        return this._isConnected;
    }
}

class BaseSerializer {
    constructor(path = '/') {
        this._path = slashNotation$1(path);
    }
    static async create(constructor, path = '/') {
        return new constructor(path);
    }
    get db() {
        if (this._db) {
            return this._db;
        }
        throw new Error('Attempt to use SerializedQuery without setting database');
    }
    get path() {
        return this._path;
    }
    get identity() {
        return {
            endAtKey: this._endAtKey,
            endAt: this._endAt,
            equalToKey: this._equalToKey,
            equalTo: this._equalTo,
            limitToFirst: this._limitToFirst,
            limitToLast: this._limitToLast,
            orderByKey: this._orderKey,
            orderBy: this._orderBy,
            path: this._path,
            startAtKey: this._startAtKey,
            startAt: this._startAt,
        };
    }
    /**
     * Allows the DB interface to be setup early, allowing clients
     * to call execute without any params.
     */
    setDB(db) {
        this._db = db;
        return this;
    }
    setPath(path) {
        this._path = slashNotation$1(path);
        return this;
    }
    /**
     * Returns a unique numeric hashcode for this query
     */
    hashCode() {
        const identity = JSON.stringify(this.identity);
        let hash = 0;
        if (identity.length === 0) {
            return hash;
        }
        for (let i = 0; i < identity.length; i++) {
            const char = identity.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            // Convert to 32bit integer.
            hash = hash & hash;
        }
        return hash;
    }
    limitToFirst(value) {
        this._limitToFirst = value;
        return this;
    }
    limitToLast(value) {
        this._limitToLast = value;
        return this;
    }
    orderByChild(child) {
        this._orderBy = 'orderByChild';
        this._orderKey = child;
        return this;
    }
    orderByValue() {
        this._orderBy = 'orderByValue';
        return this;
    }
    orderByKey() {
        this._orderBy = 'orderByKey';
        return this;
    }
    startAt(value, key) {
        this._startAt = value;
        this._startAtKey = key;
        return this;
    }
    endAt(value, key) {
        this._endAt = value;
        this._endAtKey = key;
        return this;
    }
    equalTo(value, key) {
        this._equalTo = value;
        this._equalToKey = key;
        return this;
    }
    toJSON() {
        return this.identity;
    }
    toString() {
        return JSON.stringify(this.identity, null, 2);
    }
}
function slashNotation$1(path) {
    return path.replace(/\./g, '/');
}

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
class SerializedRealTimeQuery extends BaseSerializer {
    constructor() {
        super(...arguments);
        this._orderBy = 'orderByKey';
    }
    static path(path = '/') {
        return new SerializedRealTimeQuery(path);
    }
    startAt(value, key) {
        this.validateKey('startAt', key, [
            RealQueryOrderType$1.orderByChild,
            RealQueryOrderType$1.orderByValue,
        ]);
        super.startAt(value, key);
        return this;
    }
    endAt(value, key) {
        this.validateKey('endAt', key, [
            RealQueryOrderType$1.orderByChild,
            RealQueryOrderType$1.orderByValue,
        ]);
        super.endAt(value, key);
        return this;
    }
    equalTo(value, key) {
        super.equalTo(value, key);
        this.validateKey('equalTo', key, [
            RealQueryOrderType$1.orderByChild,
            RealQueryOrderType$1.orderByValue,
        ]);
        return this;
    }
    deserialize(db) {
        const database = db || this.db;
        let q = database.ref(this.path);
        switch (this._orderBy) {
            case 'orderByKey':
                q = q.orderByKey();
                break;
            case 'orderByValue':
                q = q.orderByValue();
                break;
            case 'orderByChild':
                q = q.orderByChild(this.identity.orderByKey);
                break;
        }
        if (this.identity.limitToFirst) {
            q = q.limitToFirst(this.identity.limitToFirst);
        }
        if (this.identity.limitToLast) {
            q = q.limitToLast(this.identity.limitToLast);
        }
        if (this.identity.startAt) {
            q = q.startAt(this.identity.startAt, this.identity.startAtKey);
        }
        if (this.identity.endAt) {
            q = q.endAt(this.identity.endAt, this.identity.endAtKey);
        }
        if (this.identity.equalTo) {
            q = this.identity.equalToKey
                ? q.equalTo(this.identity.equalTo, this.identity.equalToKey)
                : q.equalTo(this.identity.equalTo);
        }
        return q;
    }
    async execute(db) {
        const database = db || this.db;
        const snapshot = await this.deserialize(database).once('value');
        return snapshot;
    }
    where(operation, value, key) {
        switch (operation) {
            case '=':
                return this.equalTo(value, key);
            case '>':
                return this.startAt(value, key);
            case '<':
                return this.endAt(value, key);
            default:
                const err = new Error(`Unknown comparison operator: ${operation}`);
                err.code = 'invalid-operator';
                throw err;
        }
    }
    /**
     * Ensures that when a `key` is passed in as part of the query modifiers --
     * such as "startAt", "endAt", etc. -- that the sorting strategy is valid.
     *
     * @param caller gives a simple string name for the method
     * which is currently being called to modify the search filters
     * @param key the key value that _might_ have been erroneously passed in
     */
    validateKey(caller, key, allowed) {
        const isNotAllowed = allowed.includes(this._orderBy) === false;
        if (key && isNotAllowed) {
            throw new Error(`You can not use the "key" parameter with ${caller}() when using a "${this._orderBy}" sort. Valid ordering strategies are: ${allowed.join(', ')}`);
        }
    }
}
class RealTimeDb extends AbstractedDatabase {
    constructor() {
        super();
        this._isAdminApi = false;
        /** how many miliseconds before the attempt to connect to DB is timed out */
        this.CONNECTION_TIMEOUT = 5000;
        this._isConnected = false;
        this._mockLoadingState = 'not-applicable';
        this._waitingForConnection = [];
        this._debugging = false;
        this._mocking = false;
        this._allowMocking = false;
        this._onConnected = [];
        this._onDisconnected = [];
    }
    get isMockDb() {
        return this._config.mocking;
    }
    get isAdminApi() {
        return this._isAdminApi;
    }
    /**
     * **getPushKey**
     *
     * Get's a push-key from the server at a given path. This ensures that multiple
     * client's who are writing to the database will use the server's time rather than
     * their own local time.
     *
     * @param path the path in the database where the push-key will be pushed to
     */
    async getPushKey(path) {
        const key = await this.ref(path).push().key;
        return key;
    }
    get isConnected() {
        return this._isConnected;
    }
    get database() {
        if (!this._database) {
            throw new RealTimeDbError(`Attempt to use the RealTimeDB.database getter prior to the database being set!`, `not-ready`);
        }
        return this._database;
    }
    set database(value) {
        this._database = value;
    }
    /**
     * watch
     *
     * Watch for firebase events based on a DB path or `SerializedQuery` (path plus query elements)
     *
     * @param target a database path or a SerializedQuery
     * @param events an event type or an array of event types (e.g., "value", "child_added")
     * @param cb the callback function to call when event triggered
     */
    watch(target, events, cb) {
        if (!Array.isArray(events)) {
            events = [events];
        }
        if (events && !isRealTimeEvent(events)) {
            throw new RealTimeDbError(`An attempt to watch an event which is not valid for the Real Time database (but likely is for the Firestore database). Events passed in were: ${JSON.stringify(events)}\n. In contrast, the valid events in Firestore are: ${VALID_REAL_TIME_EVENTS.join(', ')}`, 'invalid-event');
        }
        try {
            events.map((evt) => {
                const dispatch = WatcherEventWrapper({
                    eventType: evt,
                    targetType: 'path',
                })(cb);
                if (typeof target === 'string') {
                    this.ref(slashNotation(target)).on(evt, dispatch);
                }
                else {
                    target
                        .setDB(this)
                        .deserialize(this)
                        .on(evt, dispatch);
                }
            });
        }
        catch (e) {
            console.warn(`RealTimeDb: failure trying to watch event ${JSON.stringify(events)}`);
            throw new AbstractedProxyError(e);
        }
    }
    unWatch(events, cb) {
        if (events && !isRealTimeEvent(events)) {
            throw new RealTimeDbError(`An attempt was made to unwatch an event type which is not valid for the Real Time database. Events passed in were: ${JSON.stringify(events)}\nIn contrast, the valid events in Firestore are: ${VALID_REAL_TIME_EVENTS.join(', ')}`, 'invalid-event');
        }
        try {
            if (!events) {
                this.ref().off();
                return;
            }
            if (!Array.isArray(events)) {
                events = [events];
            }
            events.map((evt) => {
                if (cb) {
                    this.ref().off(evt, cb);
                }
                else {
                    this.ref().off(evt);
                }
            });
        }
        catch (e) {
            e.name = e.code.includes('RealTimeDb') ? 'AbstractedFirebase' : e.code;
            e.code = 'RealTimeDb/unWatch';
            throw e;
        }
    }
    /**
     * Get a Firebase SerializedQuery reference
     *
     * @param path path for query
     */
    query(path) {
        return SerializedRealTimeQuery.path(path);
    }
    /** Get a DB reference for a given path in Firebase */
    ref(path = '/') {
        return this.isMockDb ? this.mock.ref(path) : this._database.ref(path);
    }
    /**
     * get a notification when DB is connected; returns a unique id
     * which can be used to remove the callback. You may, optionally,
     * state a unique id of your own.
     *
     * By default the callback will receive the database connection as it's
     * `this`/context. This means that any locally defined variables will be
     * dereferenced an unavailable. If you want to retain a connection to this
     * state you should include the optional _context_ parameter and your
     * callback will get a parameter passed back with this context available.
     */
    notifyWhenConnected(cb, id, 
    /**
     * additional context/pointers for your callback to use when activated
     */
    ctx) {
        if (!id) {
            id = Math.random().toString(36).substr(2, 10);
        }
        else {
            if (this._onConnected.map((i) => i.id).includes(id)) {
                throw new RealTimeDbError(`Request for onConnect() notifications was done with an explicit key [ ${id} ] which is already in use!`, `duplicate-listener`);
            }
        }
        this._onConnected = this._onConnected.concat({ id, cb, ctx });
        return id;
    }
    /**
     * removes a callback notification previously registered
     */
    removeNotificationOnConnection(id) {
        this._onConnected = this._onConnected.filter((i) => i.id !== id);
        return this;
    }
    /** set a "value" in the database at a given path */
    async set(path, value) {
        // return new Promise((resolve, reject))
        try {
            const results = await this.ref(path).set(value);
            return results;
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new PermissionDenied(e, `The attempt to set a value at path "${path}" failed due to incorrect permissions.`);
            }
            if (e.message.indexOf('path specified exceeds the maximum depth that can be written') !== -1) {
                throw new FileDepthExceeded(e);
            }
            if (e.message.indexOf('First argument includes undefined in property') !==
                -1) {
                e.name = 'FirebaseUndefinedValueAssignment';
                throw new UndefinedAssignment(e);
            }
            throw new AbstractedProxyError(e, 'unknown', JSON.stringify({ path, value }));
        }
    }
    /**
     * **multiPathSet**
     *
     * Equivalent to Firebase's traditional "multi-path updates" which are
     * in behaviour are really "multi-path SETs". The basic idea is that
     * all the _keys_ are database paths and the _values_ are **destructive** values.
     *
     * An example of
     * what you might might look like:
     *
     * ```json
     * {
     *  "path/to/my/data": "my destructive data",
     *  "another/path/to/write/to": "everyone loves monkeys"
     * }
     * ```
     *
     * When we say "destructive" we mean that whatever value you put at the give path will
     * _overwrite_ the data that was there rather than "update" it. This not hard to
     * understand because we've given this function a name with "SET" in the name but
     * in the real-time database this actual translates into an alternative use of the
     * "update" command which is described here:
     * [Introducing Multi-Location Updates.](https://firebase.googleblog.com/2015/09/introducing-multi-location-updates-and_86.html)
     *
     * This functionality, in the end, is SUPER useful as it provides a means to achieve
     * transactional functionality (aka, either all paths are written to or none are).
     *
     * **Note:** because _dot notation_ for paths is not uncommon you can notate
     * the paths with `.` instead of `/`
     */
    async multiPathSet(updates) {
        const fixed = Object.keys(updates).reduce((acc, path) => {
            const slashPath = path.replace(/\./g, '/').slice(0, 1) === '/'
                ? path.replace(/\./g, '/')
                : '/' + path.replace(/\./g, '/');
            acc[slashPath] = updates[path];
            return acc;
        }, {});
        await this.ref('/').update(fixed);
    }
    /**
     * **update**
     *
     * Update the database at a given path. Note that this operation is
     * **non-destructive**, so assuming that the value you are passing in
     * a POJO/object then the properties sent in will be updated but if
     * properties that exist in the DB, but not in the value passed in,
     * then these properties will _not_ be changed.
     *
     * [API Docs](https://firebase.google.com/docs/reference/js/firebase.database.Reference#update)
     */
    async update(path, value) {
        try {
            await this.ref(path).update(value);
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new PermissionDenied(e, `The attempt to update a value at path "${path}" failed due to incorrect permissions.`);
            }
            else {
                throw new AbstractedProxyError(e, undefined, `While updating the path "${path}", an error occurred`);
            }
        }
    }
    /**
     * **remove**
     *
     * Removes a path from the database. By default if you attempt to
     * remove a path in the database which _didn't_ exist it will throw
     * a `RealTimeDb/remove` error. If you'd prefer for this
     * error to be ignored than you can pass in **true** to the `ignoreMissing`
     * parameter.
     *
     * [API  Docs](https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove)
     */
    async remove(path, ignoreMissing = false) {
        const ref = this.ref(path);
        try {
            const result = await ref.remove();
            return result;
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new PermissionDenied(e, `The attempt to remove a value at path "${path}" failed due to incorrect permissions.`);
            }
            else {
                throw new AbstractedProxyError(e, undefined, `While removing the path "${path}", an error occurred`);
            }
        }
    }
    /**
     * **getSnapshot**
     *
     * returns the Firebase snapshot at a given path in the database
     */
    async getSnapshot(path) {
        try {
            const response = await (typeof path === 'string'
                ? this.ref(slashNotation(path)).once('value')
                : path.setDB(this).execute());
            return response;
        }
        catch (e) {
            console.warn(`There was a problem trying to get a snapshot from the database [ path parameter was of type "${typeof path}", fn: "getSnapshot()" ]:`, e.message);
            throw new AbstractedProxyError(e);
        }
    }
    /**
     * **getValue**
     *
     * Returns the JS value at a given path in the database. This method is a
     * typescript _generic_ which defaults to `any` but you can set the type to
     * whatever value you expect at that path in the database.
     */
    async getValue(path) {
        try {
            const snap = await this.getSnapshot(path);
            return snap.val();
        }
        catch (e) {
            throw new AbstractedProxyError(e);
        }
    }
    /**
     * **getRecord**
     *
     * Gets a snapshot from a given path in the Firebase DB
     * and converts it to a JS object where the snapshot's key
     * is included as part of the record (as `id` by default)
     */
    async getRecord(path, idProp = 'id') {
        try {
            const snap = await this.getSnapshot(path);
            let object = snap.val();
            if (typeof object !== 'object') {
                object = { value: snap.val() };
            }
            return { ...object, ...{ [idProp]: snap.key } };
        }
        catch (e) {
            throw new AbstractedProxyError(e);
        }
    }
    /**
     * **getList**
     *
     * Get a list of a given type (defaults to _any_). Assumes that the
     * "key" for the record is the `id` property but that can be changed
     * with the optional `idProp` parameter.
     *
     * @param path the path in the database to
     * @param idProp
     */
    async getList(path, idProp = 'id') {
        try {
            const snap = await this.getSnapshot(path);
            return snap.val() ? snapshotToArray(snap, idProp) : [];
        }
        catch (e) {
            throw new AbstractedProxyError(e);
        }
    }
    /**
     * **push**
     *
     * Pushes a value (typically a hash) under a given path in the
     * database but allowing Firebase to insert a unique "push key"
     * to ensure the value is placed into a Dictionary/Hash structure
     * of the form of `/{path}/{pushkey}/{value}`
     *
     * Note, the pushkey will be generated on the Firebase side and
     * Firebase keys are guarenteed to be unique and embedded into the
     * UUID is precise time-based information so you _can_ count on
     * the keys to have a natural time based sort order.
     */
    async push(path, value) {
        try {
            this.ref(path).push(value);
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new PermissionDenied(e, `The attempt to push a value to path "${path}" failed due to incorrect permissions.`);
            }
            else {
                throw new AbstractedProxyError(e, undefined, `While pushing to the path "${path}", an error occurred`);
            }
        }
    }
    /**
     * **exists**
     *
     * Validates the existance of a path in the database
     */
    async exists(path) {
        return this.getSnapshot(path).then((snap) => (snap.val() ? true : false));
    }
    /**
     * Sets up an emitter based listener for database connection
     * status. The Client SDK needs this but we will fake this with
     * the Mock DB as well.
     */
    _setupConnectionListener() {
        this._eventManager.on('connection', (isConnected) => {
            if (isConnected) {
                this._onConnected.forEach((listener) => listener.cb(this, listener.ctx || {}));
            }
            else {
                this._onDisconnected.forEach((listener) => {
                    listener.cb(this, listener.ctx || {});
                });
            }
        });
    }
    /**
     * Connects the **Firebase** connection events into the general event listener; this only
     * applies to the RTDB Client SDK.
     */
    _monitorConnection(snap) {
        this._isConnected = snap.val();
        this._eventManager.connection(this._isConnected);
    }
    /**
     * When using the **Firebase** Authentication solution, the primary API
     * resides off the `db.auth()` call but each _provider_ also has an API
     * that can be useful and this has links to various providers.
     */
    get authProviders() {
        throw new RealTimeDbError(`The authProviders getter is intended to provide access to various auth providers but it is NOT implemented in the connection library you are using!`, 'missing-auth-providers');
    }
    /**
     * **getFireMock**
     *
     * Asynchronously imports both `FireMock` and the `Faker` libraries
     * then sets `isConnected` to **true**
     */
    async getFireMock(config = {}) {
        const FireMock = await Promise.resolve().then(function () { return index; });
        this._mock = await FireMock.Mock.prepare(config);
    }
}

class FileDepthExceeded extends Error {
    constructor(e) {
        super(e.message);
        this.stack = e.stack;
        const name = 'RealTimeDb/depth-exceeded';
        if (e.name === 'Error') {
            this.name = name;
        }
        this.code = name.split('/')[1];
        this.stack = e.stack;
    }
}

class PermissionDenied extends Error {
    constructor(e, context) {
        super(context ? context + '.\n' + e.message : e.message);
        this.stack = e.stack;
        const name = 'RealTimeDb/permission-denied';
        if (e.name === 'Error') {
            this.name = name;
        }
        this.code = name.split('/')[1];
        this.stack = e.stack;
    }
}

class UndefinedAssignment extends Error {
    constructor(e) {
        super(e.message);
        this.stack = e.stack;
        if (e.name === "Error") {
            e.name = "AbstractedFirebase";
        }
    }
}

class RealTimeDbError extends FireError$1 {
    constructor(
    /** a human friendly error message */
    message, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    classification, 
    /**
     * A numeric HTTP status code; defaults to 400 if not stated
     */
    httpStatusCode = HttpStatusCodes.BadRequest) {
        super(message, classification.includes('/')
            ? classification
            : `RealTimeDb/${classification}`, httpStatusCode);
    }
}

class AbstractedProxyError extends Error {
    constructor(e, typeSubtype = null, context) {
        super('');
        this.stack = e.stack;
        const parts = (typeSubtype || `RealTimeDb/${e.name || e.code || e.type || 'unknown'}`).split('/');
        const [type, subType] = parts.length === 2 ? parts : ['RealTimeDb', parts[0]];
        this.name = `${type}/${subType}`;
        this.code = `${subType}`;
        this.stack = e.stack;
        try {
            this.stackFrames = parseStack(this.stack, {
                ignorePatterns: ['timers.js', 'mocha/lib', 'runners/node'],
            });
        }
        catch (e) {
            // ignore if there was an error parsing
        }
        const shortStack = this.stackFrames
            ? this.stackFrames
                .slice(0, Math.min(3, this.stackFrames.length - 1))
                .map((i) => `${i.shortPath}/${i.fn}::${i.line}`)
            : '';
        this.message = context
            ? `${e.name ? `[Proxy of ${e.name}]` : ''}` +
                context +
                '.\n' +
                e.message +
                `\n${shortStack}`
            : `${e.name ? `[Proxy of ${e.name}]` : ''}[ ${type}/${subType}]: ${e.message}\n${shortStack}`;
    }
}

var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean || (FirebaseBoolean = {}));
const VALID_REAL_TIME_EVENTS = [
    'value',
    'child_changed',
    'child_added',
    'child_removed',
    'child_moved',
];
/**
 * Validates that all events passed in are valid events for
 * the **Real Time** database.
 *
 * @param events the event or events which are being tested
 */
function isRealTimeEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => (VALID_REAL_TIME_EVENTS.includes(e) ? true : false));
}

const WatcherEventWrapper = (context) => (handler) => {
    return (snapshot, previousChildKey) => {
        const value = snapshot.val();
        const key = snapshot.key;
        const kind = 'server-event';
        const fullEvent = {
            ...context,
            value,
            key,
            kind,
            previousChildKey,
        };
        return handler(fullEvent);
    };
};

class EventManager extends events.EventEmitter {
    connection(state) {
        this.emit('connection', state);
    }
}

class RealTimeAdminError extends FireError {
    constructor(message, classification = 'RealTimeAdmin/error', statusCode = 400) {
        super(message, classification, statusCode);
        this.kind = 'RealTimeAdminError';
    }
}

/** named network delays */
var Delays;
(function (Delays) {
    Delays["random"] = "random";
    Delays["weak"] = "weak-mobile";
    Delays["mobile"] = "mobile";
    Delays["WiFi"] = "WIFI";
})(Delays || (Delays = {}));

var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["asc"] = 0] = "asc";
    SortOrder[SortOrder["desc"] = 1] = "desc";
})(SortOrder || (SortOrder = {}));

var RealQueryOrderType$2;
(function (RealQueryOrderType) {
    RealQueryOrderType["orderByChild"] = "orderByChild";
    RealQueryOrderType["orderByKey"] = "orderByKey";
    RealQueryOrderType["orderByValue"] = "orderByValue";
})(RealQueryOrderType$2 || (RealQueryOrderType$2 = {}));

function atRandom(things, excluding = []) {
    things = things.filter((i) => !excluding.includes(i));
    const random = Math.floor(Math.random() * things.length);
    return things[random];
}

const dotify = (path) => {
    const dotPath = path.replace(/[\\\/]/g, '.');
    return removeDotsAtExtremes(dotPath.slice(0, 1) === '.' ? dotPath.slice(1) : dotPath);
};
function dotifyKeys(obj) {
    const result = {};
    Object.keys(obj).forEach((key) => {
        result[dotify(key)] = obj[key];
    });
    return result;
}
function removeDotsAtExtremes(path) {
    const front = path.slice(0, 1) === '.' ? path.slice(1) : path;
    return front.slice(-1) === '.' ? front.slice(0, front.length - 1) : front;
}

/** an filter function for queries with a `limitToFirst` value */
function limitToFirst(query) {
    const value = query.identity.limitToFirst;
    return (list) => {
        if (value === undefined) {
            return list;
        }
        return list.slice(0, value);
    };
}
/** an filter function for queries with a `limitToLast` value */
function limitToLast(query) {
    const value = query.identity.limitToLast;
    return (list) => {
        if (value === undefined) {
            return list;
        }
        return list.slice(-1 * value);
    };
}

/**
 * Provides a logical test to see if the passed in event is a LambdaProxy request or just a
 * straight JS object response. This is useful when you have both an HTTP event and a Lambda-to-Lambda
 * or Step-Function-to-Lambda interaction.
 *
 * @param message the body of the request (which is either of type T or a LambdaProxy event)
 */

/** provides a friendly way to pause execution when using async/await symantics */
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var HttpStatusCodes$1;
(function (HttpStatusCodes) {
    /**
     * The client SHOULD continue with its request. This interim response is used to inform
     * the client that the initial part of the request has been received and has not yet
     * been rejected by the server. The client SHOULD continue by sending the remainder
     * of the request or, if the request has already been completed, ignore this response.
     * The server MUST send a final response after the request has been completed.
     */
    HttpStatusCodes[HttpStatusCodes["Continue"] = 100] = "Continue";
    /** The request has succeeded. */
    HttpStatusCodes[HttpStatusCodes["Success"] = 200] = "Success";
    /**
     * The request has been fulfilled and resulted in a new resource being created. The newly
     * created resource can be referenced by the URI(s) returned in the entity of the response,
     * with the most specific URI for the resource given by a Location header field. The response
     * SHOULD include an entity containing a list of resource characteristics and location(s) from
     * which the user or user agent can choose the one most appropriate. The entity format is
     * specified by the media type given in the Content-Type header field. The origin server MUST
     * create the resource before returning the `201` status code. If the action cannot be carried
     * out immediately, the server SHOULD respond with `202` (Accepted) response instead.
     *
     * A `201` response MAY contain an ETag response header field indicating the current value of
     * the entity tag for the requested variant just created.
  
     */
    HttpStatusCodes[HttpStatusCodes["Created"] = 201] = "Created";
    /**
     * The request has been accepted for processing, but the processing has not been completed.
     * The request might or might not eventually be acted upon, as it might be disallowed when
     * processing actually takes place. There is no facility for re-sending a status code from an
     * asynchronous operation such as this.
     *
     * The 202 response is intentionally non-committal. Its purpose is to allow a server to accept
     * a request for some other process (perhaps a batch-oriented process that is only run once
     * per day) without requiring that the user agent's connection to the server persist until the
     * process is completed. The entity returned with this response SHOULD include an indication
     * of the request's current status and either a pointer to a status monitor or some estimate
     * of when the user can expect the request to be fulfilled.
     */
    HttpStatusCodes[HttpStatusCodes["Accepted"] = 202] = "Accepted";
    /**
     * The server has fulfilled the request but does not need to return an entity-body, and might
     * want to return updated meta-information. The response MAY include new or updated
     * meta-information in the form of entity-headers, which if present SHOULD be associated with
     * the requested variant.
     *
     * If the client is a _user agent_, it **SHOULD NOT** change its document view from that which
     * caused the request to be sent. This response is primarily intended to allow input for
     * actions to take place without causing a change to the user agent's active document view,
     * although any new or updated metainformation **SHOULD** be applied to the document
     * currently in the user agent's active view.
     *
     * The `204` response **MUST NOT** include a `message-body`, and thus is always terminated
     * by the first empty line after the header fields.
     */
    HttpStatusCodes[HttpStatusCodes["NoContent"] = 204] = "NoContent";
    HttpStatusCodes[HttpStatusCodes["MovedPermenantly"] = 301] = "MovedPermenantly";
    HttpStatusCodes[HttpStatusCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    /**
     * If the client has performed a conditional GET request and access is allowed, but the
     * document has not been modified, the server SHOULD respond with this status code. The
     * `304` response MUST NOT contain a _message-body_, and thus is always terminated by the
     * first empty line after the header fields.
     */
    HttpStatusCodes[HttpStatusCodes["NotModified"] = 304] = "NotModified";
    /**
     * The request could not be understood by the server due to malformed syntax.
     * The client SHOULD NOT repeat the request without modifications.
     */
    HttpStatusCodes[HttpStatusCodes["BadRequest"] = 400] = "BadRequest";
    /**
     * The request requires user authentication. The response MUST include a WWW-Authenticate
     * header field containing a challenge applicable to the requested resource.
     * The client MAY repeat the request with a suitable Authorization header field. If the
     * request already included Authorization credentials, then the `401`
     * response indicates that authorization has been refused for those credentials. If the `401`
     * response contains the same challenge as the prior response, and the user agent has already
     * attempted authentication at least once, then the user SHOULD be presented the entity that
     * was given in the response, since that entity might include relevant diagnostic information.
     */
    HttpStatusCodes[HttpStatusCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpStatusCodes[HttpStatusCodes["PaymentRequired"] = 402] = "PaymentRequired";
    /**
     * The request could not be understood by the server due to malformed syntax. The client
     * SHOULD NOT repeat the request without modifications.
     */
    HttpStatusCodes[HttpStatusCodes["Forbidden"] = 403] = "Forbidden";
    /**
     * The server has not found anything matching the Request-URI. No indication is given of
     * whether the condition is temporary or permanent. The `410` (Gone) status code SHOULD be
     * used if the server knows, through some internally configurable mechanism, that an old
     * resource is permanently unavailable and has no forwarding address.
     *
     * This status code is commonly used when the server does not wish to reveal exactly
     * why the request has been refused, or when no other response is applicable.
     */
    HttpStatusCodes[HttpStatusCodes["NotFound"] = 404] = "NotFound";
    /**
     * The method specified in the Request-Line is not allowed for the resource identified
     * by the Request-URI. The response MUST include an Allow header containing a list of
     * valid methods for the requested resource.
     */
    HttpStatusCodes[HttpStatusCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    /**
     * The client did not produce a request within the time that the server was
     * prepared to wait. The client MAY repeat the request without modifications
     * at any later time.
     */
    HttpStatusCodes[HttpStatusCodes["RequestTimeout"] = 408] = "RequestTimeout";
    /**
     * The request could not be completed due to a conflict with the current state of the
     * resource. This code is only allowed in situations where it is expected that the
     * user might be able to resolve the conflict and resubmit the request. The response
     * body SHOULD include enough information for the user to recognize the source of the
     * conflict. Ideally, the response entity would include enough information for the
     * user or user agent to fix the problem; however, that might not be possible and
     * is not required.
     *
     * Conflicts are most likely to occur in response to a PUT request. For example,
     * if versioning were being used and the entity being PUT included changes to a resource
     * which conflict with those made by an earlier (third-party) request, the server might
     * use the 409 response to indicate that it can't complete the request. In this case,
     * the response entity would likely contain a list of the differences between the
     * two versions in a format defined by the response Content-Type.
     */
    HttpStatusCodes[HttpStatusCodes["Conflict"] = 409] = "Conflict";
    /**
     * The requested resource is no longer available at the server and no forwarding address
     * is known. This condition is expected to be considered permanent. Clients with link
     * editing capabilities SHOULD delete references to the Request-URI after user approval.
     * If the server does not know, or has no facility to determine, whether or not the
     * condition is permanent, the status code 404 (Not Found) SHOULD be used instead.
     * This response is cacheable unless indicated otherwise.
     *
     * The 410 response is primarily intended to assist the task of web maintenance by
     * notifying the recipient that the resource is intentionally unavailable and that
     * the server owners desire that remote links to that resource be removed. Such an
     * event is common for limited-time, promotional services and for resources belonging
     * to individuals no longer working at the server's site. It is not necessary to mark
     * all permanently unavailable resources as "gone" or to keep the mark for any length
     * of time -- that is left to the discretion of the server owner.
     */
    HttpStatusCodes[HttpStatusCodes["Gone"] = 410] = "Gone";
    /**
     * Indicates that the server refuses to brew coffee because it is, permanently, a teapot.
     * A combined coffee/tea pot that is temporarily out of coffee should instead return 503.
     * This error is a reference to Hyper Text Coffee Pot Control Protocol defined in April
     * Fools' jokes in 1998 and 2014.
     */
    HttpStatusCodes[HttpStatusCodes["IAmATeapot"] = 418] = "IAmATeapot";
    HttpStatusCodes[HttpStatusCodes["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    /**
     * The 429 status code indicates that the user has sent too many requests in a given
     * amount of time ("rate limiting").
     */
    HttpStatusCodes[HttpStatusCodes["TooManyRequests"] = 429] = "TooManyRequests";
    /**
     * The server encountered an unexpected condition which prevented it from fulfilling
     * the request.
     */
    HttpStatusCodes[HttpStatusCodes["InternalServerError"] = 500] = "InternalServerError";
    /**
     * The server does not support the functionality required to fulfill the request. This
     * is the appropriate response when the server does not recognize the request method
     * and is not capable of supporting it for any resource.
     */
    HttpStatusCodes[HttpStatusCodes["NotImplemented"] = 501] = "NotImplemented";
    /**
     * The server, while acting as a gateway or proxy, received an invalid response from
     * the upstream server it accessed in attempting to fulfill the request.
     */
    HttpStatusCodes[HttpStatusCodes["BadGateway"] = 502] = "BadGateway";
    /**
     * Indicates that the server is not ready to handle the request.
     *
     * Common causes are a server that is down for maintenance or that is overloaded.
     * This response should be used for temporary conditions and the `Retry-After` HTTP
     * header should, if possible, contain the estimated time for the recovery of the
     * service.
     */
    HttpStatusCodes[HttpStatusCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpStatusCodes[HttpStatusCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
    /**
     * The 511 status code indicates that the client needs to authenticate to gain
     * network access.
     *
     * The response representation SHOULD contain a link to a resource that allows
     * the user to submit credentials (e.g. with a HTML form).
     *
     * Note that the 511 response SHOULD NOT contain a challenge or the login interface
     * itself, because browsers would show the login interface as being associated with
     * the originally requested URL, which may cause confusion.
     */
    HttpStatusCodes[HttpStatusCodes["AuthenticationRequired"] = 511] = "AuthenticationRequired";
})(HttpStatusCodes$1 || (HttpStatusCodes$1 = {}));

class PathJoinError extends Error {
    constructor(code, message) {
        super();
        this.message = `[pathJoin/${code}] ` + message;
        this.code = code;
        this.name = `pathJoin/${code}`;
    }
}

var moreThanThreePeriods = /\.{3,}/g;
// polyfill Array.isArray if necessary
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}
/**
 * An ISO-morphic path join that works everywhere;
 * all paths are separated by the `/` character and both
 * leading and trailing delimiters are stripped
 */
function pathJoin(...args) {
    // strip undefined segments
    if (!args.every(i => !["undefined"].includes(typeof i))) {
        args = args.filter(a => a);
    }
    // remaining invalid types
    if (!args.every(i => ["string", "number"].includes(typeof i))) {
        throw new PathJoinError("invalid-path-part", `Attempt to use pathJoin() failed because some of the path parts were of the wrong type. Path parts must be either a string or an number: ${args.map(i => typeof i)}`);
    }
    // JOIN paths
    try {
        const reducer = function (agg, pathPart) {
            let { protocol, parts } = pullOutProtocols(agg);
            parts.push(typeof pathPart === "number"
                ? String(pathPart)
                : stripSlashesAtExtremities(pathPart));
            return protocol + parts.filter(i => i).join("/");
        };
        const result = removeSingleDotExceptToStart(doubleDotOnlyToStart(args.reduce(reducer, "").replace(moreThanThreePeriods, "..")));
        return result;
    }
    catch (e) {
        if (e.name.includes("pathJoin")) {
            throw e;
        }
        else {
            throw new PathJoinError(e.name || "unknown", e.message);
        }
    }
}
function pullOutProtocols(content) {
    const protocols = ["https://", "http://", "file://", "tel://"];
    let protocol = "";
    protocols.forEach(p => {
        if (content.includes(p)) {
            protocol = p;
            content = content.replace(p, "");
        }
    });
    return { protocol, parts: content.split("/") };
}
function stripSlashesAtExtremities(pathPart) {
    const front = pathPart.slice(0, 1) === "/" ? pathPart.slice(1) : pathPart;
    const back = front.slice(-1) === "/" ? front.slice(0, front.length - 1) : front;
    return back.slice(0, 1) === "/" || back.slice(-1) === "/"
        ? stripSlashesAtExtremities(back)
        : back;
}
/**
 * checks to ensure that a ".." path notation is only employed at the
 * very start of the path or else throws an error
 */
function doubleDotOnlyToStart(path) {
    if (path.slice(2).includes("..")) {
        throw new PathJoinError("not-allowed", `The path "${path}" is not allowed because it  has ".." in it. This notation is fine at the beginning of a path but no where else.`);
    }
    return path;
}
/**
 * removes `./` in path parts other than leading segment
 */
function removeSingleDotExceptToStart(path) {
    let parts = path.split("/");
    return (parts[0] +
        "/" +
        parts
            .slice(1)
            .filter(i => i !== ".")
            .join("/"));
}

function stackTrace(trace) {
    return trace ? trace.split("\n") : [];
}

function createError(fullName, message, priorError) {
    const messagePrefix = `[${fullName}] `;
    const e = new AppError(!priorError
        ? messagePrefix + message
        : messagePrefix + priorError.message + message);
    e.name = priorError ? priorError.code || priorError.name : fullName;
    const parts = fullName.split("/");
    e.code = [...parts].pop();
    e.stack = priorError
        ? priorError.stack ||
            stackTrace(e.stack)
                .slice(2)
                .join("\n")
        : stackTrace(e.stack)
            .slice(2)
            .join("\n");
    return e;
}
class AppError extends Error {
}

function normalizeRef(r) {
    r = r.replace('/', '.');
    r = r.slice(0, 1) === '.' ? r.slice(1) : r;
    return r;
}
function parts(r) {
    return normalizeRef(r).split('.');
}
/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */
function leafNode(r) {
    return parts(r).pop();
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */
function join(...paths) {
    return paths
        .map((p) => {
        return p.replace(/[\/\\]/gm, '.');
    })
        .map((p) => (p.slice(-1) === '.' ? p.slice(0, p.length - 1) : p))
        .map((p) => (p.slice(0, 1) === '.' ? p.slice(1) : p))
        .join('.');
}
/**
 * Given a path, returns the parent path and child key
 */
function keyAndParent(dotPath) {
    const sections = dotPath.split('.');
    const changeKey = sections.pop();
    const parent = sections.join('.');
    return { parent, key: changeKey };
}
/** converts a '/' delimited path to a '.' delimited one */
function dotNotation(path) {
    path = path.slice(0, 1) === '/' ? path.slice(1) : path;
    return path ? path.replace(/\//g, '.') : undefined;
}
function slashNotation$2(path) {
    return path.replace(/\./g, '/');
}
/** Get the parent DB path */
function getParent(dotPath) {
    return keyAndParent(dotPath).parent;
}
/** Get the Key from the end of a path string */
function getKey(dotPath) {
    return keyAndParent(dotPath).key;
}
let _delay = 5;
function setNetworkDelay(value) {
    _delay = value;
}
async function networkDelay(returnValue) {
    await wait(calcDelay());
    return returnValue;
}
function calcDelay() {
    const delay = _delay;
    if (typeof delay === 'number') {
        return delay;
    }
    if (Array.isArray(delay)) {
        const [min, max] = delay;
        return getRandomInt(min, max);
    }
    if (typeof delay === 'object' && !Array.isArray(delay)) {
        const { min, max } = delay;
        return getRandomInt(min, max);
    }
    // these numbers need some reviewing
    if (delay === 'random') {
        return getRandomInt(10, 300);
    }
    // if (delay === "weak") {
    //   return getRandomInt(400, 900);
    // }
    if (delay === 'mobile') {
        return getRandomInt(300, 500);
    }
    if (delay === 'WIFI') {
        return getRandomInt(10, 100);
    }
    throw new Error('Delay property is of unknown format: ' + delay);
}
function stripLeadingDot(str) {
    return str.slice(0, 1) === '.' ? str.slice(1) : str;
}
function removeDots(str) {
    return str ? str.replace(/\./g, '') : undefined;
}

const exceptions = {
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    mouse: 'mice',
    person: 'people',
    company: 'companies',
};
function pluralize(singular) {
    const rules = [
        { find: /(.*)(ch|sh|ax|ss)$/, replace: '$1$2es' },
        { find: /(.*)(fe|f)$/, replace: '$1ves' },
        { find: /(.*)us$/, replace: '$1i' },
    ];
    for (const r of rules) {
        if (r.find.test(singular)) {
            return singular.replace(r.find, r.replace);
        }
    }
    return exceptions[singular] ? exceptions[singular] : `${singular}s`;
}
const addException = (singular, plural) => {
    exceptions[singular] = plural;
};

function startAt(query) {
    const key = query.identity.startAtKey || query.identity.orderByKey;
    const value = query.identity.startAt;
    return (record) => {
        if (value === undefined) {
            return true;
        }
        return key ? record[key] >= value : record >= value;
    };
}
function endAt(query) {
    const key = query.identity.endAtKey || query.identity.orderByKey;
    const value = query.identity.endAt;
    return (record) => {
        if (value === undefined) {
            return true;
        }
        return key ? record[key] <= value : record <= value;
    };
}
/** a filter function for queries with a `equalTo` value */
function equalTo(query) {
    const key = query.identity.equalToKey || query.identity.orderByKey;
    const value = query.identity.equalTo;
    return (record) => {
        if (value === undefined) {
            return true;
        }
        return key ? record[key] === value : record === value;
    };
}

const orderByChild = (child) => {
    return (a, b) => {
        return a[child] > b[child] ? -1 : a[child] === b[child] ? 0 : 1;
    };
};
const orderByKey = (a, b) => {
    return a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
};
const orderByValue = (a, b) => {
    return a.value > b.value ? -1 : a.value === b.value ? 0 : 1;
};
function isOrderByChild(query, fn) {
    return query.identity.orderBy === RealQueryOrderType$2.orderByChild;
}

var sortFns = /*#__PURE__*/Object.freeze({
  __proto__: null,
  orderByChild: orderByChild,
  orderByKey: orderByKey,
  orderByValue: orderByValue,
  isOrderByChild: isOrderByChild
});

/** Detect free variable `global` from Node.js. */
var freeGlobal$1 = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$1 = freeGlobal$1 || freeSelf$1 || Function('return this')();

/** Built-in value references. */
var Symbol$1$1 = root$1.Symbol;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$2 = objectProto$5.toString;

/** Built-in value references. */
var symToStringTag$2 = Symbol$1$1 ? Symbol$1$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$4.call(value, symToStringTag$2),
      tag = value[symToStringTag$2];

  try {
    value[symToStringTag$2] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$2.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$2] = tag;
    } else {
      delete value[symToStringTag$2];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1$1 = objectProto$1$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString$1(value) {
  return nativeObjectToString$1$1.call(value);
}

/** `Object#toString` result references. */
var nullTag$1 = '[object Null]',
    undefinedTag$1 = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1$1 = Symbol$1$1 ? Symbol$1$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag$1(value) {
  if (value == null) {
    return value === undefined ? undefinedTag$1 : nullTag$1;
  }
  return (symToStringTag$1$1 && symToStringTag$1$1 in Object(value))
    ? getRawTag$1(value)
    : objectToString$1(value);
}

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol$1$1 ? Symbol$1$1.prototype : undefined,
    symbolToString$1 = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** `Object#toString` result references. */
var asyncTag$1 = '[object AsyncFunction]',
    funcTag$1 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    proxyTag$1 = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$1(value) {
  if (!isObject$1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag$1(value);
  return tag == funcTag$1 || tag == genTag$1 || tag == asyncTag$1 || tag == proxyTag$1;
}

/** Used to detect overreaching core-js shims. */
var coreJsData$1 = root$1['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey$1 = (function() {
  var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$1(func) {
  return !!maskSrcKey$1 && (maskSrcKey$1 in func);
}

/** Used for built-in method references. */
var funcProto$2 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource$1(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor$1 = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1$1 = Function.prototype,
    objectProto$2$1 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1$1 = funcProto$1$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1$1 = objectProto$2$1.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative$1 = RegExp('^' +
  funcToString$1$1.call(hasOwnProperty$1$1).replace(reRegExpChar$1, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$1(value) {
  if (!isObject$1(value) || isMasked$1(value)) {
    return false;
  }
  var pattern = isFunction$1(value) ? reIsNative$1 : reIsHostCtor$1;
  return pattern.test(toSource$1(value));
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue$1(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$1(object, key) {
  var value = getValue$1(object, key);
  return baseIsNative$1(value) ? value : undefined;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq$1(value, other) {
  return value === other || (value !== value && other !== other);
}

/* Built-in method references that are verified to be native. */
var nativeCreate$1 = getNative$1(Object, 'create');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear$1() {
  this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2$1 = objectProto$3$1.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$1) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? undefined : result;
  }
  return hasOwnProperty$2$1.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto$4$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3$1 = objectProto$4$1.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$3$1.call(data, key);
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet$1(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED$1$1 : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash$1(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash$1.prototype.clear = hashClear$1;
Hash$1.prototype['delete'] = hashDelete$1;
Hash$1.prototype.get = hashGet$1;
Hash$1.prototype.has = hashHas$1;
Hash$1.prototype.set = hashSet$1;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf$1(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto$1 = Array.prototype;

/** Built-in value references. */
var splice$1 = arrayProto$1.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete$1(key) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice$1.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet$1(key) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet$1(key, value) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache$1(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache$1.prototype.clear = listCacheClear$1;
ListCache$1.prototype['delete'] = listCacheDelete$1;
ListCache$1.prototype.get = listCacheGet$1;
ListCache$1.prototype.has = listCacheHas$1;
ListCache$1.prototype.set = listCacheSet$1;

/* Built-in method references that are verified to be native. */
var Map$1$1 = getNative$1(root$1, 'Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash$1,
    'map': new (Map$1$1 || ListCache$1),
    'string': new Hash$1
  };
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable$1(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData$1(map, key) {
  var data = map.__data__;
  return isKeyable$1(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete$1(key) {
  var result = getMapData$1(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet$1(key) {
  return getMapData$1(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet$1(key, value) {
  var data = getMapData$1(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache$1(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache$1.prototype.clear = mapCacheClear$1;
MapCache$1.prototype['delete'] = mapCacheDelete$1;
MapCache$1.prototype.get = mapCacheGet$1;
MapCache$1.prototype.has = mapCacheHas$1;
MapCache$1.prototype.set = mapCacheSet$1;

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize$1(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache$1);
  return memoized;
}

// Expose `MapCache`.
memoize$1.Cache = MapCache$1;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE$1 = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped$1(func) {
  var result = memoize$1(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE$1) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

/** Used to match property names within property paths. */
var rePropName$1 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar$1 = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath$1 = memoizeCapped$1(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName$1, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar$1, '$1') : (number || match));
  });
  return result;
});

function removeIdPropertyFromHash(hash, idProp = "id") {
    const output = {};
    Object.keys(hash).map((objId) => {
        const input = hash[objId];
        output[objId] = {};
        Object.keys(input).map((prop) => {
            if (prop !== idProp) {
                output[objId][prop] = input[prop];
            }
        });
    });
    return output;
}
/**
 * hashToArray
 *
 * Converts a hash data structure of {key: value, key2: value2} to an
 * array of [ {id, value}, {id2, value2} ]. This should happen regardless
 * to whether the values are themselves hashes (which they often are) or
 * scalar values.
 *
 * The one edge case is where all the hashes passed in have a value of "true"
 * which indicates that this really just a simple value based array encoded as
 * a hash (as is often the case in Firebase for FK relationships).
 *
 * @param hashObj an object of keys that point to some data payload
 * @param ___key__ the property name on the converted array-of-hashes which will contain the key value; by default this is "id"
 */
function hashToArray$1(hashObj, __key__ = "id") {
    if (hashObj && typeof hashObj !== "object") {
        throw new Error("Cant convert hash-to-array because hash was not passed in: " + hashObj);
    }
    const hash = Object.assign({}, hashObj);
    const results = [];
    const isHashArray = Object.keys(hash).every((i) => hash[i] === true);
    const isHashValue = Object.keys(hash).every((i) => typeof hash[i] !== "object");
    Object.keys(hash).map((id) => {
        const obj = typeof hash[id] === "object"
            ? Object.assign(Object.assign({}, hash[id]), { [__key__]: id }) : isHashArray
            ? id
            : { [__key__]: id, value: hash[id] };
        results.push(obj);
    });
    return results;
}
/**
 * arrayToHash
 *
 * Converts an array of things into a hash/dictionary where "things" is a consistent
 * type of data structure (can be either object or primitive)
 *
 * @param arr an array of a particular type
 * @param keyProperty the property that will be used as the dictionaries key; if false
 * then will assign a firebase pushkey
 * @param removeIdProperty allow you to optionally exclude the `id` from the object
 * as it is redundant to the `key` of the hash. By default though, this is _not_ done as
 * Firemodel benefits (and expects) from this duplication.
 */
function arrayToHash(arr, keyProperty, removeIdProperty = false) {
    if (arr.length === 0) {
        return {};
    }
    const isScalar = typeof arr[0] === "object" ? false : true;
    if (isScalar && keyProperty) {
        const e = new Error(`You can not have an array of primitive values AND set a keyProperty!`);
        e.name = "NotAllowed";
        throw e;
    }
    if (!keyProperty && !isScalar) {
        if (arr[0].hasOwnProperty("id")) {
            keyProperty = "id";
        }
        else {
            const e = new Error(`Tried to default to a keyProperty of "id" but that property does not appear to be in the array passed in`);
            e.name = "NotAllowed";
            throw e;
        }
    }
    if (!Array.isArray(arr)) {
        const e = new Error(`arrayToHash: input was not an array!`);
        e.name = "NotAllowed";
        throw e;
    }
    const output = arr.reduce((prev, curr) => {
        const key = isScalar
            ? curr
            : typeof keyProperty === "function"
                ? keyProperty(curr)
                : curr[keyProperty];
        return isScalar
            ? Object.assign(Object.assign({}, prev), { [key]: true }) : Object.assign(Object.assign({}, prev), { [key]: curr });
    }, {});
    return removeIdProperty ? removeIdPropertyFromHash(output) : output;
}

const orderByKey$1 = (list) => {
    const keys = Object.keys(list).sort();
    let hash = {};
    keys.forEach((k) => {
        hash[k] = list[k];
    });
    return hash;
};
const orderByValue$1 = (list, direction = SortOrder.asc) => {
    const A = direction === SortOrder.asc ? 1 : -1;
    const values = hashToArray$1(list).sort((a, b) => (a.value > b.value ? 1 : -1));
    return values.reduce((agg, curr) => {
        agg[curr.id] = curr.value;
        return agg;
    }, {});
};
const sortFn = (query) => query.identity.orderBy === RealQueryOrderType$2.orderByChild
    ? orderByChild(query.identity.orderByKey)
    : sortFns[query.identity.orderBy];
function runQuery(query, data) {
    /**
     * A boolean _flag_ to indicate whether the path is of the query points to a Dictionary
     * of Objects. This is indicative of a **Firemodel** list node.
     */
    const isListOfObjects = typeof data === 'object' &&
        Object.keys(data).every((i) => typeof data[i] === 'object');
    const dataIsAScalar = ['string', 'boolean', 'number'].includes(typeof data);
    if (dataIsAScalar) {
        return data;
    }
    const anArrayOfScalar = Array.isArray(data) && data.every((i) => typeof i !== 'object');
    const dataIsAnObject = !Array.isArray(data) && typeof data === 'object';
    if (dataIsAnObject && !isListOfObjects) {
        data =
            query.identity.orderBy === 'orderByKey'
                ? orderByKey$1(data)
                : orderByValue$1(data);
        // allows non-array data that can come from a 'value' listener
        // to pass through at this point
        const limitToKeys = query.identity.limitToFirst
            ? Object.keys(data).slice(0, query.identity.limitToFirst)
            : query.identity.limitToLast
                ? Object.keys(data).slice(-1 * query.identity.limitToLast)
                : false;
        if (limitToKeys) {
            Object.keys(data).forEach((k) => {
                if (!limitToKeys.includes(k)) {
                    delete data[k];
                }
            });
        }
        return data;
    }
    const dataList = isListOfObjects || dataIsAnObject ? hashToArray$1(data) : data;
    if (!dataList) {
        return undefined;
    }
    const limitFilter = _limitFilter(query);
    const queryFilter = _queryFilter(query);
    const list = limitFilter(queryFilter(dataList.sort(sortFn(query))));
    return isListOfObjects
        ? // this is list of records to convert back to hash for Firebase compatability
            arrayToHash(list)
        : dataIsAnObject
            ? // if it was an Object but values weren't objects then this is probably
                // a key/value pairing
                list.reduce((agg, curr) => {
                    if (curr.id && curr.value) {
                        // definitely looks like a id/value pairing
                        agg[curr.id] = curr.value;
                    }
                    else if (curr.id) {
                        // has an ID so offset using the id but use the remainder of the hash
                        // as the value
                        const hash = Object.assign({}, curr);
                        delete hash.id;
                        agg[curr.id] = hash;
                    }
                    else {
                        console.log({
                            message: `Unsure what to do with part of a data structure resulting from the the query: ${query.identity}.\n\nThe item in question was: "${curr}".`,
                            severity: 0,
                        });
                    }
                    return agg;
                }, {})
            : list;
}
function _limitFilter(query) {
    const first = limitToFirst(query);
    const last = limitToLast(query);
    return (list) => {
        return first(last(list));
    };
}
function _queryFilter(query) {
    return (list) => {
        return list
            .filter(equalTo(query))
            .filter(startAt(query))
            .filter(endAt(query));
    };
}

/**
 * **first**
 *
 * Returns the _first_ item in an array or dictionary. This
 * is intended as a direct replacement for `lodash.first()`
 *
 * @param items either an array (typically) or an object
 */
function first(items) {
    if (Array.isArray(items)) {
        return items.slice(0, 1).pop();
    }
    if (typeof items === 'object') {
        const key = Object.keys(items).slice(0, 1).pop();
        return key ? items[key] : undefined;
    }
    return undefined;
}

/**
 * Gets a value in a deeply nested object. This is a replacement to `lodash.get`
 *
 * @param obj the base object to get the value from
 * @param dotPath the path to the object, using "." as a delimiter
 * @param defaultValue optionally you may state a default value if the operation results in `undefined`
 */
function get(obj, dotPath, defaultValue) {
    const parts = dotPath.split('.');
    let value = obj;
    parts.forEach((p) => {
        value =
            typeof value === 'object' && Object.keys(value).includes(p)
                ? value[p]
                : undefined;
    });
    return value ? value : defaultValue;
}

class FireMockError extends Error {
    constructor(message, classification = 'firemock/error') {
        super(message);
        this.firemodel = true;
        const [cat, subcat] = classification.split('/');
        this.code = subcat || 'error';
        this.name = classification;
    }
}

/**
 * Sets a value at a nested point within base object passed in. This is meant as a
 * replacement to use of `lodash.set()`.
 *
 * @param obj the base object which is being mutated
 * @param dotPath the path into the object where the mutation will take place, delimited by `.`
 * @param value The value to set at the _dotPath_
 * @param createIfNonExistant by default, if the path to the object does not exist then an error is thrown but if you want you can state the desire to have the full path created
 */
function set(obj, dotPath, value, createIfNonExistant = true) {
    if (!dotPath) {
        throw new FireMockError(`Attempt to set value into a dotPath but the dotPath was empty!`, 'not-allowed');
    }
    const parts = dotPath.split(/\??\./);
    const allButLast = parts.slice(0, parts.length - 1);
    const key = parts.pop();
    let ref = obj;
    // iterate the ref to the leaf node
    allButLast.forEach((p) => {
        if (!ref[p]) {
            if (createIfNonExistant) {
                ref[p] = {};
            }
            else {
                throw new FireMockError(`The dotPath -- ${dotPath} -- does not exist in the passed in object. You must either expressly state that you want the object structure created or this a real error that must be addressed otherwise. The part of the path which this failed on was "${p}".`);
            }
        }
        else if (typeof ref[p] !== 'object') {
            throw new FireMockError(`Failed to set the path of "${dotPath}" of the passed in base object because the base object had a scalar value along that path and setting this would have changed the object's data structure in way which is not allowed! The scalar value was found in the "${p}" component of the path.`);
        }
        ref = ref[p];
    });
    ref[key] = value;
}

class BaseSerializer$1 {
    constructor(path = '/') {
        this._path = slashNotation$1$1(path);
    }
    static async create(constructor, path = '/') {
        return new constructor(path);
    }
    get db() {
        if (this._db) {
            return this._db;
        }
        throw new Error('Attempt to use SerializedQuery without setting database');
    }
    get path() {
        return this._path;
    }
    get identity() {
        return {
            endAtKey: this._endAtKey,
            endAt: this._endAt,
            equalToKey: this._equalToKey,
            equalTo: this._equalTo,
            limitToFirst: this._limitToFirst,
            limitToLast: this._limitToLast,
            orderByKey: this._orderKey,
            orderBy: this._orderBy,
            path: this._path,
            startAtKey: this._startAtKey,
            startAt: this._startAt,
        };
    }
    /**
     * Allows the DB interface to be setup early, allowing clients
     * to call execute without any params.
     */
    setDB(db) {
        this._db = db;
        return this;
    }
    setPath(path) {
        this._path = slashNotation$1$1(path);
        return this;
    }
    /**
     * Returns a unique numeric hashcode for this query
     */
    hashCode() {
        const identity = JSON.stringify(this.identity);
        let hash = 0;
        if (identity.length === 0) {
            return hash;
        }
        for (let i = 0; i < identity.length; i++) {
            const char = identity.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            // Convert to 32bit integer.
            hash = hash & hash;
        }
        return hash;
    }
    limitToFirst(value) {
        this._limitToFirst = value;
        return this;
    }
    limitToLast(value) {
        this._limitToLast = value;
        return this;
    }
    orderByChild(child) {
        this._orderBy = 'orderByChild';
        this._orderKey = child;
        return this;
    }
    orderByValue() {
        this._orderBy = 'orderByValue';
        return this;
    }
    orderByKey() {
        this._orderBy = 'orderByKey';
        return this;
    }
    startAt(value, key) {
        this._startAt = value;
        this._startAtKey = key;
        return this;
    }
    endAt(value, key) {
        this._endAt = value;
        this._endAtKey = key;
        return this;
    }
    equalTo(value, key) {
        this._equalTo = value;
        this._equalToKey = key;
        return this;
    }
    toJSON() {
        return this.identity;
    }
    toString() {
        return JSON.stringify(this.identity, null, 2);
    }
}
function slashNotation$1$1(path) {
    return path.replace(/\./g, '/');
}

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
class SerializedRealTimeQuery$1 extends BaseSerializer$1 {
    constructor() {
        super(...arguments);
        this._orderBy = 'orderByKey';
    }
    static path(path = '/') {
        return new SerializedRealTimeQuery$1(path);
    }
    startAt(value, key) {
        this.validateKey('startAt', key, [
            RealQueryOrderType$2.orderByChild,
            RealQueryOrderType$2.orderByValue,
        ]);
        super.startAt(value, key);
        return this;
    }
    endAt(value, key) {
        this.validateKey('endAt', key, [
            RealQueryOrderType$2.orderByChild,
            RealQueryOrderType$2.orderByValue,
        ]);
        super.endAt(value, key);
        return this;
    }
    equalTo(value, key) {
        super.equalTo(value, key);
        this.validateKey('equalTo', key, [
            RealQueryOrderType$2.orderByChild,
            RealQueryOrderType$2.orderByValue,
        ]);
        return this;
    }
    deserialize(db) {
        const database = db || this.db;
        let q = database.ref(this.path);
        switch (this._orderBy) {
            case 'orderByKey':
                q = q.orderByKey();
                break;
            case 'orderByValue':
                q = q.orderByValue();
                break;
            case 'orderByChild':
                q = q.orderByChild(this.identity.orderByKey);
                break;
        }
        if (this.identity.limitToFirst) {
            q = q.limitToFirst(this.identity.limitToFirst);
        }
        if (this.identity.limitToLast) {
            q = q.limitToLast(this.identity.limitToLast);
        }
        if (this.identity.startAt) {
            q = q.startAt(this.identity.startAt, this.identity.startAtKey);
        }
        if (this.identity.endAt) {
            q = q.endAt(this.identity.endAt, this.identity.endAtKey);
        }
        if (this.identity.equalTo) {
            q = this.identity.equalToKey
                ? q.equalTo(this.identity.equalTo, this.identity.equalToKey)
                : q.equalTo(this.identity.equalTo);
        }
        return q;
    }
    async execute(db) {
        const database = db || this.db;
        const snapshot = await this.deserialize(database).once('value');
        return snapshot;
    }
    where(operation, value, key) {
        switch (operation) {
            case '=':
                return this.equalTo(value, key);
            case '>':
                return this.startAt(value, key);
            case '<':
                return this.endAt(value, key);
            default:
                const err = new Error(`Unknown comparison operator: ${operation}`);
                err.code = 'invalid-operator';
                throw err;
        }
    }
    /**
     * Ensures that when a `key` is passed in as part of the query modifiers --
     * such as "startAt", "endAt", etc. -- that the sorting strategy is valid.
     *
     * @param caller gives a simple string name for the method
     * which is currently being called to modify the search filters
     * @param key the key value that _might_ have been erroneously passed in
     */
    validateKey(caller, key, allowed) {
        const isNotAllowed = allowed.includes(this._orderBy) === false;
        if (key && isNotAllowed) {
            throw new Error(`You can not use the "key" parameter with ${caller}() when using a "${this._orderBy}" sort. Valid ordering strategies are: ${allowed.join(', ')}`);
        }
    }
}

/** tslint:ignore:member-ordering */
class Query {
    constructor(path, delay = 5) {
        this.path = (typeof path === 'string'
            ? path
            : SerializedRealTimeQuery$1.path);
        this._delay = delay;
        this._query =
            typeof path === 'string' ? SerializedRealTimeQuery$1.path(path) : path;
    }
    get ref() {
        return this;
    }
    limitToLast(num) {
        this._query.limitToLast(num);
        return this;
    }
    limitToFirst(num) {
        this._query.limitToFirst(num);
        return this;
    }
    equalTo(value, key) {
        if (key && this._query.identity.orderBy === RealQueryOrderType$2.orderByKey) {
            throw new Error(`You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`);
        }
        this._query.equalTo(value, key);
        return this;
    }
    /** Creates a Query with the specified starting point. */
    startAt(value, key) {
        this._query.startAt(value, key);
        return this;
    }
    endAt(value, key) {
        this._query.endAt(value, key);
        return this;
    }
    /**
     * Setup an event listener for a given eventType
     */
    on(eventType, callback, cancelCallbackOrContext, context) {
        this.addListener(this._query, eventType, callback, cancelCallbackOrContext, context);
        return null;
    }
    async once(eventType) {
        await networkDelay();
        return this.getQuerySnapShot();
    }
    off() {
        console.log('off() not implemented yet on Firemock');
    }
    /**
     * Returns a boolean flag based on whether the two queries --
     * _this_ query and the one passed in -- are equivalen in scope.
     */
    isEqual(other) {
        return this._query.hashCode() === other._query.hashCode();
    }
    /**
     * When the children of a query are all objects, then you can sort them by a
     * specific property. Note: if this happens a lot then it's best to explicitly
     * index on this property in the database's config.
     */
    orderByChild(prop) {
        this._query.orderByChild(prop);
        return this;
    }
    /**
     * When the children of a query are all scalar values (string, number, boolean), you
     * can order the results by their (ascending) values
     */
    orderByValue() {
        this._query.orderByValue();
        return this;
    }
    /**
     * order is based on the order of the
     * "key" which is time-based if you are using Firebase's
     * _push-keys_.
     *
     * **Note:** this is the default sort if no sort is specified
     */
    orderByKey() {
        this._query.orderByKey();
        return this;
    }
    /** NOT IMPLEMENTED */
    orderByPriority() {
        return this;
    }
    toJSON() {
        return {
            identity: this.toString(),
            query: this._query.identity,
        };
    }
    toString() {
        return `FireMock::Query@${process.env.FIREBASE_DATA_ROOT_URL}/${this.path}`;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    getKey() {
        return null;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    getParent() {
        return null;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    getRoot() {
        return null;
    }
    /**
     * Reduce the dataset using _filters_ (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */
    getQuerySnapShot() {
        const path = this._query.path || this.path;
        const data = getDb(path);
        const results = runQuery(this._query, data);
        return new SnapShot(leafNode(this._query.path), results ? results : null);
    }
}

function isMultiPath(data) {
    Object.keys(data).map((d) => {
        if (!d) {
            data[d] = '/';
        }
    });
    const indexesAreStrings = Object.keys(data).every((i) => typeof i === 'string');
    const indexesLookLikeAPath = Object.keys(data).every((i) => i.indexOf('/') !== -1);
    return indexesAreStrings && indexesLookLikeAPath ? true : false;
}
class Reference extends Query {
    static createQuery(query, delay = 5) {
        if (typeof query === 'string') {
            query = new SerializedRealTimeQuery$1(query);
        }
        const obj = new Reference(query.path, delay);
        obj._query = query;
        return obj;
    }
    static create(path) {
        return new Reference(path);
    }
    constructor(path, _delay = 5) {
        super(path, _delay);
    }
    get key() {
        return this.path.split('.').pop();
    }
    get parent() {
        const r = parts(this.path).slice(-1).join('.');
        return new Reference(r, getDb(r));
    }
    child(path) {
        const r = parts(this.path).concat([path]).join('.');
        return new Reference(r, getDb(r));
    }
    get root() {
        return new Reference('/', getDb('/'));
    }
    push(value, onComplete) {
        const id = pushDB(this.path, value);
        this.path = join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        const ref = networkDelay(this);
        return ref;
    }
    remove(onComplete) {
        removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    set(value, onComplete) {
        setDB(this.path, value);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    update(values, onComplete) {
        if (isMultiPath(values)) {
            multiPathUpdateDB(values);
        }
        else {
            updateDB(this.path, values);
        }
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    setPriority(priority, onComplete) {
        return networkDelay();
    }
    setWithPriority(newVal, newPriority, onComplete) {
        return networkDelay();
    }
    transaction(transactionUpdate, onComplete, applyLocally) {
        return Promise.resolve({
            committed: true,
            snapshot: null,
            toJSON() {
                return {};
            },
        });
    }
    onDisconnect() {
        return {};
    }
    toString() {
        return this.path
            ? slashNotation$2(join('FireMock::Reference@', this.path, this.key))
            : 'FireMock::Reference@uninitialized (aka, no path) mock Reference object';
    }
    getSnapshot(key, value) {
        return new SnapShot(key, value);
    }
    addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context) {
        return addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context);
    }
}

class SnapShot {
    constructor(_key, _value) {
        this._key = _key;
        this._value = _value;
    }
    get key() {
        return getKey(join(this._key));
    }
    get ref() {
        return new Reference(this._key);
    }
    val() {
        return Array.isArray(this._value) ? arrayToHash(this._value) : this._value;
    }
    toJSON() {
        return JSON.stringify(this._value);
    }
    child(path) {
        const value = get(this._value, path, null);
        return value ? new SnapShot(path, value) : null;
    }
    hasChild(path) {
        if (typeof this._value === 'object') {
            return Object.keys(this._value).indexOf(path) !== -1;
        }
        return false;
    }
    hasChildren() {
        if (typeof this._value === 'object') {
            return Object.keys(this._value).length > 0;
        }
        return false;
    }
    numChildren() {
        if (typeof this._value === 'object') {
            return Object.keys(this._value).length;
        }
        return 0;
    }
    exists() {
        return this._value !== null;
    }
    forEach(actionCb) {
        const cloned = this._value.slice(0);
        const sorted = cloned.sort(this._sortingFunction);
        sorted.map((item) => {
            const noId = Object.assign({}, item);
            delete noId.id;
            const halt = actionCb(new SnapShot(item.id, noId));
            if (halt) {
                return true;
            }
        });
        return false;
    }
    /** NOTE: mocking proxies this call through to val(), no use of "priority" */
    exportVal() {
        return this.val();
    }
    getPriority() {
        return null;
    }
    /**
     * Used by Query objects to instruct the snapshot the sorting function to use
     */
    sortingFunction(fn) {
        this._sortingFunction = fn;
        return this;
    }
}

var toStringFunction = Function.prototype.toString;
var create = Object.create, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, getOwnPropertyNames = Object.getOwnPropertyNames, getOwnPropertySymbols = Object.getOwnPropertySymbols, getPrototypeOf = Object.getPrototypeOf;
var _a = Object.prototype, hasOwnProperty$4$1 = _a.hasOwnProperty, propertyIsEnumerable = _a.propertyIsEnumerable;
/**
 * @enum
 *
 * @const {Object} SUPPORTS
 *
 * @property {boolean} SYMBOL_PROPERTIES are symbol properties supported
 * @property {boolean} WEAKMAP is WeakMap supported
 */
var SUPPORTS = {
    SYMBOL_PROPERTIES: typeof getOwnPropertySymbols === 'function',
    WEAKMAP: typeof WeakMap === 'function',
};
/**
 * @function createCache
 *
 * @description
 * get a new cache object to prevent circular references
 *
 * @returns the new cache object
 */
var createCache = function () {
    if (SUPPORTS.WEAKMAP) {
        return new WeakMap();
    }
    // tiny implementation of WeakMap
    var object = create({
        has: function (key) { return !!~object._keys.indexOf(key); },
        set: function (key, value) {
            object._keys.push(key);
            object._values.push(value);
        },
        get: function (key) { return object._values[object._keys.indexOf(key)]; },
    });
    object._keys = [];
    object._values = [];
    return object;
};
/**
 * @function getCleanClone
 *
 * @description
 * get an empty version of the object with the same prototype it has
 *
 * @param object the object to build a clean clone from
 * @param realm the realm the object resides in
 * @returns the empty cloned object
 */
var getCleanClone = function (object, realm) {
    if (!object.constructor) {
        return create(null);
    }
    var Constructor = object.constructor;
    var prototype = object.__proto__ || getPrototypeOf(object);
    if (Constructor === realm.Object) {
        return prototype === realm.Object.prototype ? {} : create(prototype);
    }
    if (~toStringFunction.call(Constructor).indexOf('[native code]')) {
        try {
            return new Constructor();
        }
        catch (_a) { }
    }
    return create(prototype);
};
/**
 * @function getObjectCloneLoose
 *
 * @description
 * get a copy of the object based on loose rules, meaning all enumerable keys
 * and symbols are copied, but property descriptors are not considered
 *
 * @param object the object to clone
 * @param realm the realm the object resides in
 * @param handleCopy the function that handles copying the object
 * @returns the copied object
 */
var getObjectCloneLoose = function (object, realm, handleCopy, cache) {
    var clone = getCleanClone(object, realm);
    // set in the cache immediately to be able to reuse the object recursively
    cache.set(object, clone);
    for (var key in object) {
        if (hasOwnProperty$4$1.call(object, key)) {
            clone[key] = handleCopy(object[key], cache);
        }
    }
    if (SUPPORTS.SYMBOL_PROPERTIES) {
        var symbols = getOwnPropertySymbols(object);
        var length_1 = symbols.length;
        if (length_1) {
            for (var index = 0, symbol = void 0; index < length_1; index++) {
                symbol = symbols[index];
                if (propertyIsEnumerable.call(object, symbol)) {
                    clone[symbol] = handleCopy(object[symbol], cache);
                }
            }
        }
    }
    return clone;
};
/**
 * @function getObjectCloneStrict
 *
 * @description
 * get a copy of the object based on strict rules, meaning all keys and symbols
 * are copied based on the original property descriptors
 *
 * @param object the object to clone
 * @param realm the realm the object resides in
 * @param handleCopy the function that handles copying the object
 * @returns the copied object
 */
var getObjectCloneStrict = function (object, realm, handleCopy, cache) {
    var clone = getCleanClone(object, realm);
    // set in the cache immediately to be able to reuse the object recursively
    cache.set(object, clone);
    var properties = SUPPORTS.SYMBOL_PROPERTIES
        ? getOwnPropertyNames(object).concat(getOwnPropertySymbols(object))
        : getOwnPropertyNames(object);
    var length = properties.length;
    if (length) {
        for (var index = 0, property = void 0, descriptor = void 0; index < length; index++) {
            property = properties[index];
            if (property !== 'callee' && property !== 'caller') {
                descriptor = getOwnPropertyDescriptor(object, property);
                if (descriptor) {
                    // Only clone the value if actually a value, not a getter / setter.
                    if (!descriptor.get && !descriptor.set) {
                        descriptor.value = handleCopy(object[property], cache);
                    }
                    try {
                        defineProperty(clone, property, descriptor);
                    }
                    catch (error) {
                        // Tee above can fail on node in edge cases, so fall back to the loose assignment.
                        clone[property] = descriptor.value;
                    }
                }
                else {
                    // In extra edge cases where the property descriptor cannot be retrived, fall back to
                    // the loose assignment.
                    clone[property] = handleCopy(object[property], cache);
                }
            }
        }
    }
    return clone;
};
/**
 * @function getRegExpFlags
 *
 * @description
 * get the flags to apply to the copied regexp
 *
 * @param regExp the regexp to get the flags of
 * @returns the flags for the regexp
 */
var getRegExpFlags = function (regExp) {
    var flags = '';
    if (regExp.global) {
        flags += 'g';
    }
    if (regExp.ignoreCase) {
        flags += 'i';
    }
    if (regExp.multiline) {
        flags += 'm';
    }
    if (regExp.unicode) {
        flags += 'u';
    }
    if (regExp.sticky) {
        flags += 'y';
    }
    return flags;
};

// utils
var isArray = Array.isArray;
var GLOBAL_THIS = (function () {
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    if (console && console.error) {
        console.error('Unable to locate global object, returning "this".');
    }
})();
/**
 * @function copy
 *
 * @description
 * copy an object deeply as much as possible
 *
 * If `strict` is applied, then all properties (including non-enumerable ones)
 * are copied with their original property descriptors on both objects and arrays.
 *
 * The object is compared to the global constructors in the `realm` provided,
 * and the native constructor is always used to ensure that extensions of native
 * objects (allows in ES2015+) are maintained.
 *
 * @param object the object to copy
 * @param [options] the options for copying with
 * @param [options.isStrict] should the copy be strict
 * @param [options.realm] the realm (this) object the object is copied from
 * @returns the copied object
 */
function copy(object, options) {
    // manually coalesced instead of default parameters for performance
    var isStrict = !!(options && options.isStrict);
    var realm = (options && options.realm) || GLOBAL_THIS;
    var getObjectClone = isStrict
        ? getObjectCloneStrict
        : getObjectCloneLoose;
    /**
     * @function handleCopy
     *
     * @description
     * copy the object recursively based on its type
     *
     * @param object the object to copy
     * @returns the copied object
     */
    var handleCopy = function (object, cache) {
        if (!object || typeof object !== 'object') {
            return object;
        }
        if (cache.has(object)) {
            return cache.get(object);
        }
        var Constructor = object.constructor;
        // plain objects
        if (Constructor === realm.Object) {
            return getObjectClone(object, realm, handleCopy, cache);
        }
        var clone;
        // arrays
        if (isArray(object)) {
            // if strict, include non-standard properties
            if (isStrict) {
                return getObjectCloneStrict(object, realm, handleCopy, cache);
            }
            var length_1 = object.length;
            clone = new Constructor();
            cache.set(object, clone);
            for (var index = 0; index < length_1; index++) {
                clone[index] = handleCopy(object[index], cache);
            }
            return clone;
        }
        // dates
        if (object instanceof realm.Date) {
            return new Constructor(object.getTime());
        }
        // regexps
        if (object instanceof realm.RegExp) {
            clone = new Constructor(object.source, object.flags || getRegExpFlags(object));
            clone.lastIndex = object.lastIndex;
            return clone;
        }
        // maps
        if (realm.Map && object instanceof realm.Map) {
            clone = new Constructor();
            cache.set(object, clone);
            object.forEach(function (value, key) {
                clone.set(key, handleCopy(value, cache));
            });
            return clone;
        }
        // sets
        if (realm.Set && object instanceof realm.Set) {
            clone = new Constructor();
            cache.set(object, clone);
            object.forEach(function (value) {
                clone.add(handleCopy(value, cache));
            });
            return clone;
        }
        // blobs
        if (realm.Blob && object instanceof realm.Blob) {
            clone = new Blob([object], { type: object.type });
            return clone;
        }
        // buffers (node-only)
        if (realm.Buffer && realm.Buffer.isBuffer(object)) {
            clone = realm.Buffer.allocUnsafe
                ? realm.Buffer.allocUnsafe(object.length)
                : new Constructor(object.length);
            cache.set(object, clone);
            object.copy(clone);
            return clone;
        }
        // arraybuffers / dataviews
        if (realm.ArrayBuffer) {
            // dataviews
            if (realm.ArrayBuffer.isView(object)) {
                clone = new Constructor(object.buffer.slice(0));
                cache.set(object, clone);
                return clone;
            }
            // arraybuffers
            if (object instanceof realm.ArrayBuffer) {
                clone = object.slice(0);
                cache.set(object, clone);
                return clone;
            }
        }
        // if the object cannot / should not be cloned, don't
        if (
        // promise-like
        typeof object.then === 'function' ||
            // errors
            object instanceof Error ||
            // weakmaps
            (realm.WeakMap && object instanceof realm.WeakMap) ||
            // weaksets
            (realm.WeakSet && object instanceof realm.WeakSet)) {
            return object;
        }
        // assume anything left is a custom constructor
        return getObjectClone(object, realm, handleCopy, cache);
    };
    return handleCopy(object, createCache());
}
/**
 * @function strictCopy
 *
 * @description
 * copy the object with `strict` option pre-applied
 *
 * @param object the object to copy
 * @param [options] the options for copying with
 * @param [options.realm] the realm (this) object the object is copied from
 * @returns the copied object
 */
copy.strict = function strictCopy(object, options) {
    return copy(object, {
        isStrict: true,
        realm: options ? options.realm : void 0,
    });
};

var HAS_WEAKSET_SUPPORT = typeof WeakSet === 'function';
var keys = Object.keys;
/**
 * @function addToCache
 *
 * add object to cache if an object
 *
 * @param value the value to potentially add to cache
 * @param cache the cache to add to
 */
function addToCache(value, cache) {
    if (value && typeof value === 'object') {
        cache.add(value);
    }
}
/**
 * @function hasPair
 *
 * @description
 * does the `pairToMatch` exist in the list of `pairs` provided based on the
 * `isEqual` check
 *
 * @param pairs the pairs to compare against
 * @param pairToMatch the pair to match
 * @param isEqual the equality comparator used
 * @param meta the meta provided
 * @returns does the pair exist in the pairs provided
 */
function hasPair(pairs, pairToMatch, isEqual, meta) {
    var length = pairs.length;
    var pair;
    for (var index = 0; index < length; index++) {
        pair = pairs[index];
        if (isEqual(pair[0], pairToMatch[0], meta) &&
            isEqual(pair[1], pairToMatch[1], meta)) {
            return true;
        }
    }
    return false;
}
/**
 * @function hasValue
 *
 * @description
 * does the `valueToMatch` exist in the list of `values` provided based on the
 * `isEqual` check
 *
 * @param values the values to compare against
 * @param valueToMatch the value to match
 * @param isEqual the equality comparator used
 * @param meta the meta provided
 * @returns does the value exist in the values provided
 */
function hasValue(values, valueToMatch, isEqual, meta) {
    var length = values.length;
    for (var index = 0; index < length; index++) {
        if (isEqual(values[index], valueToMatch, meta)) {
            return true;
        }
    }
    return false;
}
/**
 * @function sameValueZeroEqual
 *
 * @description
 * are the values passed strictly equal or both NaN
 *
 * @param a the value to compare against
 * @param b the value to test
 * @returns are the values equal by the SameValueZero principle
 */
function sameValueZeroEqual(a, b) {
    return a === b || (a !== a && b !== b);
}
/**
 * @function isPlainObject
 *
 * @description
 * is the value a plain object
 *
 * @param value the value to test
 * @returns is the value a plain object
 */
function isPlainObject(value) {
    return value.constructor === Object || value.constructor == null;
}
/**
 * @function isPromiseLike
 *
 * @description
 * is the value promise-like (meaning it is thenable)
 *
 * @param value the value to test
 * @returns is the value promise-like
 */
function isPromiseLike(value) {
    return !!value && typeof value.then === 'function';
}
/**
 * @function isReactElement
 *
 * @description
 * is the value passed a react element
 *
 * @param value the value to test
 * @returns is the value a react element
 */
function isReactElement(value) {
    return !!(value && value.$$typeof);
}
/**
 * @function getNewCacheFallback
 *
 * @description
 * in cases where WeakSet is not supported, creates a new custom
 * object that mimics the necessary API aspects for cache purposes
 *
 * @returns the new cache object
 */
function getNewCacheFallback() {
    return Object.create({
        _values: [],
        add: function (value) {
            this._values.push(value);
        },
        has: function (value) {
            return this._values.indexOf(value) !== -1;
        },
    });
}
/**
 * @function getNewCache
 *
 * @description
 * get a new cache object to prevent circular references
 *
 * @returns the new cache object
 */
var getNewCache = (function (canUseWeakMap) {
    if (canUseWeakMap) {
        return function _getNewCache() {
            return new WeakSet();
        };
    }
    return getNewCacheFallback;
})(HAS_WEAKSET_SUPPORT);
/**
 * @function createCircularEqualCreator
 *
 * @description
 * create a custom isEqual handler specific to circular objects
 *
 * @param [isEqual] the isEqual comparator to use instead of isDeepEqual
 * @returns the method to create the `isEqual` function
 */
function createCircularEqualCreator(isEqual) {
    return function createCircularEqual(comparator) {
        var _comparator = isEqual || comparator;
        return function circularEqual(a, b, cache) {
            if (cache === void 0) { cache = getNewCache(); }
            var hasA = cache.has(a);
            var hasB = cache.has(b);
            if (hasA || hasB) {
                return hasA && hasB;
            }
            addToCache(a, cache);
            addToCache(b, cache);
            return _comparator(a, b, cache);
        };
    };
}
/**
 * @function toPairs
 *
 * @description
 * convert the map passed into pairs (meaning an array of [key, value] tuples)
 *
 * @param map the map to convert to [key, value] pairs (entries)
 * @returns the [key, value] pairs
 */
function toPairs(map) {
    var pairs = new Array(map.size);
    var index = 0;
    map.forEach(function (value, key) {
        pairs[index++] = [key, value];
    });
    return pairs;
}
/**
 * @function toValues
 *
 * @description
 * convert the set passed into values
 *
 * @param set the set to convert to values
 * @returns the values
 */
function toValues(set) {
    var values = new Array(set.size);
    var index = 0;
    set.forEach(function (value) {
        values[index++] = value;
    });
    return values;
}
/**
 * @function areArraysEqual
 *
 * @description
 * are the arrays equal in value
 *
 * @param a the array to test
 * @param b the array to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the arrays equal
 */
function areArraysEqual(a, b, isEqual, meta) {
    var length = a.length;
    if (b.length !== length) {
        return false;
    }
    for (var index = 0; index < length; index++) {
        if (!isEqual(a[index], b[index], meta)) {
            return false;
        }
    }
    return true;
}
/**
 * @function areMapsEqual
 *
 * @description
 * are the maps equal in value
 *
 * @param a the map to test
 * @param b the map to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta map to pass through
 * @returns are the maps equal
 */
function areMapsEqual(a, b, isEqual, meta) {
    if (a.size !== b.size) {
        return false;
    }
    var pairsA = toPairs(a);
    var pairsB = toPairs(b);
    var length = pairsA.length;
    for (var index = 0; index < length; index++) {
        if (!hasPair(pairsB, pairsA[index], isEqual, meta) ||
            !hasPair(pairsA, pairsB[index], isEqual, meta)) {
            return false;
        }
    }
    return true;
}
var OWNER = '_owner';
var hasOwnProperty$5 = Function.prototype.bind.call(Function.prototype.call, Object.prototype.hasOwnProperty);
/**
 * @function areObjectsEqual
 *
 * @description
 * are the objects equal in value
 *
 * @param a the object to test
 * @param b the object to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the objects equal
 */
function areObjectsEqual(a, b, isEqual, meta) {
    var keysA = keys(a);
    var length = keysA.length;
    if (keys(b).length !== length) {
        return false;
    }
    var key;
    for (var index = 0; index < length; index++) {
        key = keysA[index];
        if (!hasOwnProperty$5(b, key)) {
            return false;
        }
        if (key === OWNER && isReactElement(a)) {
            if (!isReactElement(b)) {
                return false;
            }
        }
        else if (!isEqual(a[key], b[key], meta)) {
            return false;
        }
    }
    return true;
}
/**
 * @function areRegExpsEqual
 *
 * @description
 * are the regExps equal in value
 *
 * @param a the regExp to test
 * @param b the regExp to test agains
 * @returns are the regExps equal
 */
function areRegExpsEqual(a, b) {
    return (a.source === b.source &&
        a.global === b.global &&
        a.ignoreCase === b.ignoreCase &&
        a.multiline === b.multiline &&
        a.unicode === b.unicode &&
        a.sticky === b.sticky &&
        a.lastIndex === b.lastIndex);
}
/**
 * @function areSetsEqual
 *
 * @description
 * are the sets equal in value
 *
 * @param a the set to test
 * @param b the set to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta set to pass through
 * @returns are the sets equal
 */
function areSetsEqual(a, b, isEqual, meta) {
    if (a.size !== b.size) {
        return false;
    }
    var valuesA = toValues(a);
    var valuesB = toValues(b);
    var length = valuesA.length;
    for (var index = 0; index < length; index++) {
        if (!hasValue(valuesB, valuesA[index], isEqual, meta) ||
            !hasValue(valuesA, valuesB[index], isEqual, meta)) {
            return false;
        }
    }
    return true;
}

var isArray$1 = Array.isArray;
var HAS_MAP_SUPPORT = typeof Map === 'function';
var HAS_SET_SUPPORT = typeof Set === 'function';
var OBJECT_TYPEOF = 'object';
function createComparator(createIsEqual) {
    var isEqual = 
    /* eslint-disable no-use-before-define */
    typeof createIsEqual === 'function'
        ? createIsEqual(comparator)
        : comparator;
    /* eslint-enable */
    /**
     * @function comparator
     *
     * @description
     * compare the value of the two objects and return true if they are equivalent in values
     *
     * @param a the value to test against
     * @param b the value to test
     * @param [meta] an optional meta object that is passed through to all equality test calls
     * @returns are a and b equivalent in value
     */
    function comparator(a, b, meta) {
        if (sameValueZeroEqual(a, b)) {
            return true;
        }
        if (a && b && typeof a === OBJECT_TYPEOF && typeof b === OBJECT_TYPEOF) {
            if (isPlainObject(a) && isPlainObject(b)) {
                return areObjectsEqual(a, b, isEqual, meta);
            }
            var arrayA = isArray$1(a);
            var arrayB = isArray$1(b);
            if (arrayA || arrayB) {
                return arrayA === arrayB && areArraysEqual(a, b, isEqual, meta);
            }
            var aDate = a instanceof Date;
            var bDate = b instanceof Date;
            if (aDate || bDate) {
                return aDate === bDate && sameValueZeroEqual(a.getTime(), b.getTime());
            }
            var aRegExp = a instanceof RegExp;
            var bRegExp = b instanceof RegExp;
            if (aRegExp || bRegExp) {
                return aRegExp === bRegExp && areRegExpsEqual(a, b);
            }
            if (isPromiseLike(a) || isPromiseLike(b)) {
                return a === b;
            }
            if (HAS_MAP_SUPPORT) {
                var aMap = a instanceof Map;
                var bMap = b instanceof Map;
                if (aMap || bMap) {
                    return aMap === bMap && areMapsEqual(a, b, isEqual, meta);
                }
            }
            if (HAS_SET_SUPPORT) {
                var aSet = a instanceof Set;
                var bSet = b instanceof Set;
                if (aSet || bSet) {
                    return aSet === bSet && areSetsEqual(a, b, isEqual, meta);
                }
            }
            return areObjectsEqual(a, b, isEqual, meta);
        }
        return false;
    }
    return comparator;
}

// comparator
var deepEqual = createComparator();
var shallowEqual = createComparator(function () { return sameValueZeroEqual; });
var circularDeepEqual = createComparator(createCircularEqualCreator());
var circularShallowEqual = createComparator(createCircularEqualCreator(sameValueZeroEqual));

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement$1(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement$1(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return target.propertyIsEnumerable(symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

var cjs = deepmerge_1;

var alphabet = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

function randomString(alphabet, length) {
    var buffer = [];
    length = length | 0;
    while (length) {
        var r = (Math.random() * alphabet.length) | 0;
        buffer.push(alphabet.charAt(r));
        length -= 1;
    }
    return buffer.join("");
}

var lastTimestamp = 0;
function key(timestamp, as) {
    if (timestamp === undefined) {
        timestamp = Date.now();
        if (timestamp <= lastTimestamp) {
            timestamp = lastTimestamp + 1;
        }
        lastTimestamp = timestamp;
    }
    if (timestamp instanceof Date) {
        timestamp = timestamp.getTime();
    }
    var result = new Array(9);
    for (var i = 7; i >= 0; --i) {
        result[i] = alphabet.charAt(timestamp % 64);
        timestamp = Math.floor(timestamp / 64);
    }
    if (timestamp !== 0) {
        throw new Error("Unexpected timestamp.");
    }
    switch (as) {
        case "max":
            result[8] = "zzzzzzzzzzzz";
            break;
        case "min":
            result[8] = "------------";
            break;
        default:
            result[8] = randomString(alphabet, 12);
    }
    return result.join("");
}

const notImplemented = {
    /** Deletes and signs out the user. */
    async delete() {
        throw new Error('the Mock Auth feature for delete() is not yet implemented');
    },
    async linkAndRetrieveDataWithCredential(credential) {
        throw new Error(`linkAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async linkWithCredential(credential) {
        throw new Error(`linkWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async linkWithPhoneNumber(phoneNUmber, applicationVerificer) {
        return fakeApplicationVerifier;
    },
    async linkWithPopup(provider) {
        throw new Error(`linkWithPopup() is not implemented yet in the client-sdk's mock auth`);
    },
    async linkWithRedirect(provider) {
        return;
    },
    async reauthenticateAndRetrieveDataWithCredential(credential) {
        throw new Error(`reauthenticateAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async reauthenticateWithCredential(credential) {
        throw new Error(`reauthenticateWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async reauthenticateWithPhoneNumber(phoneNumber, applicationVerifier) {
        return fakeApplicationVerifier;
    },
    async reauthenticateWithPopup(provider) {
        throw new Error(`reauthenticateWithPopup() is not implemented yet in the client-sdk's mock auth`);
    },
    async reauthenticateWithRedirect(provider) {
        throw new Error(`reauthenticateWithRedirect() is not implemented yet in the client-sdk's mock auth`);
    },
    async reload() {
        return;
    },
    async sendEmailVerification(actionCodeSettings) {
        throw new Error(`sendEmailVerification() is not implemented yet in the client-sdk's mock auth`);
    },
    toJSON() {
        return {};
    },
    async unlink(provider) {
        throw new Error(`unlink() is not implemented yet in the client-sdk's mock auth`);
    },
    async updatePhoneNumber(phoneCredential) {
        throw new Error(`updatePhoneNumber() is not implemented yet in the client-sdk's mock auth`);
    },
};

/**
 * The recognized users in the mock Auth system
 */
let _users = [];
/**
 * The `uid` of the user which is currently logged in.
 *
 * > **Note:** this only applies to client-sdk usages
 */
let _currentUser;
/** the full `UserCredential` object for the current user */
let _currentUserCredential;
/**
 * callbacks sent in for callback when the
 * _auth_ state changes.
 */
let _authObservers = [];
/**
 * The _providers_ which have been enabled
 * for this mock Auth API
 */
let _providers = [];
function getAuthObservers() {
    return _authObservers;
}
function addAuthObserver(ob) {
    _authObservers.push(ob);
}
function initializeAuth(config) {
    const baseUser = () => ({
        emailVerified: false,
        uid: getRandomMockUid(),
        providerData: [],
    });
    _users =
        (config.users || []).map((u) => (Object.assign(Object.assign({}, baseUser()), u))) ||
            [];
    _providers = config.providers || [];
}
function isUser(user) {
    return user.uid !== undefined ? true : false;
}
/** sets the current user based on a given `UserCredential` */
function setCurrentUser(user) {
    if (isUser(user)) {
        _currentUser = user.uid;
        _currentUserCredential = {
            user,
            additionalUserInfo: {
                isNewUser: false,
                profile: {},
                providerId: 'mock',
                username: user.email,
            },
            credential: {
                signInMethod: 'mock',
                providerId: 'mock',
                toJSON: () => user,
            },
        };
    }
    else {
        _currentUser = user.user.uid;
        _currentUserCredential = user;
    }
    // It should notify all auth observers on `setCurrentUser` call method
    getAuthObservers().map((o) => o(_currentUserCredential.user));
}
/**
 * Returns the `IMockUser` record for the currently logged in user
 */
function currentUser() {
    return _currentUser ? _users.find((u) => u.uid === _currentUser) : undefined;
}
/**
 * Clears the `currentUser` and `currentUserCredential` as would be
 * typical of what happens at the point a user is logged out.
 */
function clearCurrentUser() {
    _currentUser = undefined;
    _currentUserCredential = undefined;
    // It should notify all auth observers on `clearCurrentUser` call method
    getAuthObservers().map((o) => o(undefined));
}
/**
 * Clears all known mock users
 */
function clearAuthUsers() {
    _users = [];
}
function getAnonymousUid() {
    return  getRandomMockUid();
}
function addUser(user) {
    const defaultUser = {
        uid: getRandomMockUid(),
        disabled: false,
        emailVerified: false,
    };
    const fullUser = Object.assign(Object.assign({}, defaultUser), user);
    if (_users.find((u) => u.uid === fullUser.uid)) {
        throw new FireMockError(`Attempt to add user with UID of "${fullUser.uid}" failed as the user already exists!`);
    }
    _users = _users.concat(fullUser);
}
function getUserById(uid) {
    return _users.find((u) => u.uid === uid);
}
function getUserByEmail(email) {
    return _users.find((u) => u.email === email);
}
function updateUser(uid, update) {
    const existing = _users.find((u) => u.uid === uid);
    if (!existing) {
        throw new FireMockError(`Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`);
    }
    _users = _users.map((u) => u.uid === uid ? Object.assign(Object.assign({}, u), update) : u);
}
function allUsers() {
    return _users;
}
function removeUser(uid) {
    if (!_users.find((u) => u.uid === uid)) {
        throw new FireMockError(`Attempt to remove the user with UID of "${uid}" failed because this user was NOT in the mock Auth instance!`);
    }
    _users = _users.filter((u) => u.uid !== uid);
}
function authProviders() {
    return _providers;
}
function getRandomMockUid() {
    return `mock-uid-${Math.random().toString(36).substr(2, 10)}`;
}

/**
 * **updateEmail**
 *
 * Gives a logged in user the ability to update their email address.
 *
 * Possible Errors:
 *
 * - auth/invalid-email
 * - auth/email-already-in-use
 * - auth/requires-recent-login
 *
 * [Documentation](https://firebase.google.com/docs/reference/js/firebase.User#update-email)
 *
 * > Note: The `forceLogin` is not part of Firebase API but allows mock user to force the
 * error condition associated with a user who's been logged in a long time.
 */
async function updateEmail(newEmail, forceLogin) {
    if (forceLogin) {
        throw new FireMockError("updating a user's email address requires that the user have recently logged in; use 'reauthenticateWithCredential' to address this error.", 'auth/requires-recent-login');
    }
    await networkDelay();
    updateUser(currentUser().uid, { email: newEmail });
}

/**
 * **updatePassword**
 *
 * Updates the password for a logged in user. For security reasons, this operations
 * requires the user to have recently signed in.
 *
 * Errors:
 *
 * - auth/weak-password
 * - auth/required-recent-login ( can use `reauthenticateWithCredential` to resolve this )
 *
 * > Note: the `notRecentLogin` is NOT part of the normal API but allows mock users to force
 * the `auth/required-recent-login` error.
 *
 * [Docs](https://firebase.google.com/docs/reference/js/firebase.User#updatepassword)
 */
async function updatePassword(newPassword, notRecentLogin) {
    if (notRecentLogin) {
        throw new FireMockError("updating a user's password requires that the user have recently logged in; use 'reauthenticateWithCredential' to address this error.", 'auth/required-recent-login');
    }
    updateUser(currentUser().uid, {
        password: newPassword,
    });
}

/**
 * Updates a user's profile data.
 *
 * Example:
 *
 * ```typescript
 * user.updateProfile({
      displayName: "Jane Q. User",
      photoURL: "https://example.com/jane-q-user/profile.jpg"
  })
 * ```

 [Documentation](https://firebase.google.com/docs/reference/js/firebase.User#updateprofile)
 */
async function updateProfile(profile) {
    updateUser(currentUser().uid, profile);
}

console.log(getAnonymousUid);
const userProperties = () => ({
    displayName: '',
    email: '',
    isAnonymous: true,
    metadata: {},
    phoneNumber: '',
    photoURL: '',
    providerData: [],
    providerId: '',
    refreshToken: '',
    uid: getAnonymousUid(),
});

async function getIdToken() {
    const user = currentUser();
    const userConfig = allUsers().find((i) => i.email === user.email);
    if (!user) {
        throw new Error('not logged in');
    }
    if (userConfig.tokenIds) {
        return atRandom(userConfig.tokenIds);
    }
    else {
        return Math.random().toString(36).substr(2, 10);
    }
}

async function getIdTokenResult(forceRefresh) {
    return {
        authTime: '',
        claims: {},
        expirationTime: '',
        issuedAtTime: '',
        signInProvider: '',
        signInSecondFactor: '',
        token: await getIdToken(),
    };
}

const clientApiUser = Object.assign(Object.assign(Object.assign({}, notImplemented), userProperties()), { getIdToken,
    getIdTokenResult,
    updateEmail,
    updatePassword,
    updateProfile });

/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
function completeUserCredential(partial) {
    const fakeUserCredential = {
        user: Object.assign(Object.assign({}, clientApiUser), { displayName: '', email: '', isAnonymous: true, metadata: {}, phoneNumber: '', photoURL: '', providerData: [], providerId: '', refreshToken: '', uid: getRandomMockUid() }),
        additionalUserInfo: {
            isNewUser: false,
            profile: '',
            providerId: '',
            username: 'fake',
        },
        operationType: '',
        credential: {
            signInMethod: 'fake',
            providerId: 'fake',
            toJSON: () => '',
        },
    };
    return cjs(fakeUserCredential, partial);
}
const fakeApplicationVerifier = {
    async confirm(verificationCode) {
        return completeUserCredential({});
    },
    verificationId: 'verification',
};

var tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
// Thanks to:
// http://fightingforalostcause.net/misc/2006/compare-email-regex.php
// http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
// http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
var validate = function(email)
{
	if (!email)
		return false;
		
	if(email.length>254)
		return false;

	var valid = tester.test(email);
	if(!valid)
		return false;

	// Further checking of some things regex can't handle
	var parts = email.split("@");
	if(parts[0].length>64)
		return false;

	var domainParts = parts[1].split(".");
	if(domainParts.some(function(part) { return part.length>63; }))
		return false;

	return true;
};

function emailExistsAsUserInAuth(email) {
    const emails = allUsers().map((i) => i.email);
    return emails.includes(email);
}
function emailIsValidFormat(email) {
    return validate(email);
}
function emailHasCorrectPassword(email, password) {
    const config = allUsers().find((i) => i.email === email);
    return config ? config.password === password : false;
}
function userUid(email) {
    const config = allUsers().find((i) => i.email === email);
    return config ? config.uid || getRandomMockUid() : getRandomMockUid();
}
function emailValidationAllowed() {
    return authProviders().includes('emailPassword');
}

const implemented = {
    app: {
        name: 'mocked-app',
        options: {},
        async delete() {
            return;
        },
        automaticDataCollectionEnabled: false,
    },
    onAuthStateChanged(observer) {
        addAuthObserver(observer);
    },
    async setPersistence() {
        console.warn(`currently firemock accepts calls to setPersistence() but it doesn't support it.`);
    },
    signInAnonymously: async () => {
        await networkDelay();
        if (authProviders().includes('anonymous')) {
            const user = Object.assign(Object.assign({}, clientApiUser), { isAnonymous: true, uid: getAnonymousUid() });
            const credential = {
                signInMethod: 'anonymous',
                providerId: 'anonymous',
                toJSON: () => '',
            };
            const credentials = {
                user,
                credential,
            };
            const userCredential = completeUserCredential(credentials);
            addUser(userCredential.user);
            setCurrentUser(userCredential);
            return userCredential;
        }
        else {
            throw new FireMockError('you must enable anonymous auth in the Firebase Console', 'auth/operation-not-allowed');
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError('email authentication not allowed', 'auth/operation-not-allowed');
        }
        if (!emailIsValidFormat(email)) {
            throw new FireMockError(`invalid email: ${email}`, 'auth/invalid-email');
        }
        const found = allUsers().find((i) => i.email === email);
        if (!found) {
            throw new FireMockError(`The email "${email}" was not found`, `auth/user-not-found`);
        }
        if (!emailHasCorrectPassword(email, password)) {
            throw new FireMockError(`Invalid password for ${email}`, 'auth/wrong-password');
        }
        const partial = {
            user: {
                email: found.email,
                isAnonymous: false,
                emailVerified: found.emailVerified,
                uid: userUid(email),
                displayName: found.displayName,
            },
            credential: {
                signInMethod: 'signInWithEmailAndPassword',
                providerId: '',
            },
            additionalUserInfo: {
                username: email,
            },
        };
        const u = completeUserCredential(partial);
        setCurrentUser(u);
        return u;
    },
    /**
     * Add a new user with the Email/Password provider
     */
    async createUserWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError('email authentication not allowed', 'auth/operation-not-allowed');
        }
        if (emailExistsAsUserInAuth(email)) {
            throw new FireMockError(`"${email}" user already exists`, 'auth/email-already-in-use');
        }
        if (!emailIsValidFormat(email)) {
            throw new FireMockError(`"${email}" is not a valid email format`, 'auth/invalid-email');
        }
        const partial = {
            user: {
                email,
                isAnonymous: false,
                emailVerified: false,
                uid: userUid(email),
            },
            credential: {
                signInMethod: 'signInWithEmailAndPassword',
                providerId: '',
            },
            additionalUserInfo: {
                username: email,
            },
        };
        const u = completeUserCredential(partial);
        addUser({ uid: partial.user.uid, email, password });
        setCurrentUser(u);
        return u;
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        clearCurrentUser();
    },
    get currentUser() {
        return completeUserCredential({}).user;
    },
    languageCode: '',
    async updateCurrentUser() {
        return;
    },
    settings: {
        appVerificationDisabledForTesting: false,
    },
};

let hasConnectedToAuthService = false;
const auth = async () => {
    if (hasConnectedToAuthService) {
        return authApi;
    }
    await networkDelay();
    hasConnectedToAuthService = true;
    return authApi;
};
// tslint:disable-next-line:no-object-literal-type-assertion
const authApi = Object.assign({}, implemented);

// tslint:disable:no-implicit-dependencies
/**
 * The in-memory dictionary/hash mantained by the mock RTDB to represent
 * the state of the database
 */
let db = {};
let _silenceEvents = false;
/**
 * silences the database from sending events;
 * this is not typically done but can be done
 * as part of the Mocking process to reduce noise
 */
function silenceEvents() {
    _silenceEvents = true;
}
/**
 * returns the database to its default state of sending
 * events out.
 */
function restoreEvents() {
    _silenceEvents = false;
}
function shouldSendEvents() {
    return !_silenceEvents;
}
/** clears the DB without losing reference to DB object */
function clearDatabase() {
    const keys = Object.keys(db);
    keys.forEach((key) => delete db[key]);
}
/**
 * updates the state of the database based on a
 * non-descructive update.
 */
function updateDatabase(updatedState) {
    db = cjs(db, updatedState);
}
async function auth$1() {
    return auth();
}
function getDb(path) {
    return path ? get(db, dotify(path)) : db;
}
/**
 * **setDB**
 *
 * sets the database at a given path
 */
function setDB(path, value, silent = false) {
    const dotPath = join(path);
    const oldRef = get(db, dotPath);
    const oldValue = typeof oldRef === 'object' ? Object.assign(Object.assign({}, oldRef), {}) : oldRef;
    const isReference = ['object', 'array'].includes(typeof value);
    const dbSnapshot = copy(Object.assign({}, db));
    // ignore if no change
    if ((isReference && deepEqual(oldValue, value)) ||
        (!isReference && oldValue === value)) {
        return;
    }
    if (value === null) {
        const parentValue = get(db, getParent(dotPath));
        if (typeof parentValue === 'object') {
            delete parentValue[getKey(dotPath)];
            set(db, getParent(dotPath), parentValue);
        }
        else {
            set(db, dotPath, undefined);
        }
    }
    else {
        set(db, dotPath, value);
    }
    if (!silent) {
        notify({ [dotPath]: value }, dbSnapshot);
    }
}
/**
 * **updateDB**
 *
 * single-path, non-destructive update to database
 */
function updateDB(path, value) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    let changed = true;
    if (typeof value === 'object' &&
        Object.keys(value).every((k) => (oldValue ? oldValue[k] : null) ===
            value[k])) {
        changed = false;
    }
    if (typeof value !== 'object' && value === oldValue) {
        changed = false;
    }
    if (!changed) {
        return;
    }
    const newValue = typeof oldValue === 'object' ? Object.assign(Object.assign({}, oldValue), value) : value;
    setDB(dotPath, newValue);
}
/**
 * **multiPathUpdateDB**
 *
 * Emulates a Firebase multi-path update. The keys of the dictionary
 * are _paths_ in the DB, the value is the value to set at that path.
 *
 * **Note:** dispatch notifations must not be done at _path_ level but
 * instead grouped up by _watcher_ level.
 */
function multiPathUpdateDB(data) {
    const snapshot = copy(db);
    Object.keys(data).map((key) => {
        const value = data[key];
        const path = key;
        if (get(db, path) !== value) {
            // silent set
            setDB(path, value, true);
        }
    });
    notify(data, snapshot);
}
const slashify = (path) => {
    const slashPath = path.replace(/\./g, '/');
    return slashPath.slice(0, 1) === '/' ? slashPath.slice(1) : slashPath;
};
/**
 * Will aggregate the data passed in to dictionary objects of paths
 * which fire at the root of the listeners/watchers that are currently
 * on the database.
 */
function groupEventsByWatcher(data, dbSnapshot) {
    data = dotifyKeys(data);
    const eventPaths = Object.keys(data).map((i) => dotify(i));
    const response = [];
    const relativePath = (full, partial) => {
        return full.replace(partial, '');
    };
    const justKey = (obj) => (obj ? Object.keys(obj)[0] : null);
    const justValue = (obj) => justKey(obj) ? obj[justKey(obj)] : null;
    getListeners().forEach((listener) => {
        const eventPathsUnderListener = eventPaths.filter((path) => path.includes(dotify(listener.query.path)));
        if (eventPathsUnderListener.length === 0) {
            // if there are no listeners then there's nothing to do
            return;
        }
        const paths = [];
        const listenerPath = dotify(listener.query.path);
        const changeObject = eventPathsUnderListener.reduce((changes, path) => {
            paths.push(path);
            if (dotify(listener.query.path) === path) {
                changes = data[path];
            }
            else {
                set(changes, dotify(relativePath(path, listenerPath)), data[path]);
            }
            return changes;
        }, {});
        const key = listener.eventType === 'value'
            ? changeObject
                ? justKey(changeObject)
                : listener.query.path.split('.').pop()
            : dotify(pathJoin(slashify(listener.query.path), justKey(changeObject)));
        const newResponse = {
            listenerId: listener.id,
            listenerPath,
            listenerEvent: listener.eventType,
            callback: listener.callback,
            eventPaths: paths,
            key,
            changes: justValue(changeObject),
            value: listener.eventType === 'value'
                ? getDb(listener.query.path)
                : getDb(key),
            priorValue: listener.eventType === 'value'
                ? get(dbSnapshot, listener.query.path)
                : justValue(get(dbSnapshot, listener.query.path)),
        };
        response.push(newResponse);
    });
    return response;
}
function removeDB(path) {
    if (!getDb(path)) {
        return;
    }
    setDB(path, null);
}
/**
 * **pushDB**
 *
 * Push a new record into the mock database. Uses the
 * `firebase-key` library to generate the key which
 * attempts to use the same algorithm as Firebase
 * itself.
 */
function pushDB(path, value) {
    const pushId = key();
    const fullPath = join(path, pushId);
    const valuePlusId = typeof value === 'object' ? Object.assign(Object.assign({}, value), { id: pushId }) : value;
    setDB(fullPath, valuePlusId);
    return pushId;
}
/** Clears the DB and removes all listeners */
function reset() {
    removeAllListeners();
    clearDatabase();
}

let _listeners = [];
/**
 * **addListener**
 *
 * Adds a listener for watched events; setup by
 * the `query.on()` API call.
 *
 * This listener is
 * pushed onto a private stack but can be interogated
 * with a call to `getListeners()` or if you're only
 * interested in the _paths_ which are being watched
 * you can call `listenerPaths()`.
 */
async function addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context) {
    const query = (typeof pathOrQuery === 'string'
        ? new SerializedRealTimeQuery$1(join(pathOrQuery))
        : pathOrQuery);
    pathOrQuery = (typeof pathOrQuery === 'string'
        ? join(pathOrQuery)
        : query.path);
    _listeners.push({
        id: Math.random().toString(36).substr(2, 10),
        query,
        eventType,
        callback,
        cancelCallbackOrContext,
        context,
    });
    function ref(dbPath) {
        return new Reference(dbPath);
    }
    const snapshot = await query
        .deserialize({ ref })
        .once(eventType === 'value' ? 'value' : 'child_added');
    if (eventType === 'value') {
        callback(snapshot);
    }
    else {
        const list = hashToArray$1(snapshot.val());
        if (eventType === 'child_added') {
            list.forEach((i) => callback(new SnapShot(join(query.path, i.id), i)));
        }
    }
    return snapshot;
}
/**
 * **removeListener**
 *
 * Removes an active listener (or multiple if the info provided matches more
 * than one).
 *
 * If you provide the `context` property it will use this to identify
 * the listener, if not then it will use `eventType` (if available) as
 * well as `callback` (if available) to identify the callback(s)
 */
function removeListener(eventType, callback, context) {
    if (!eventType) {
        return removeAllListeners();
    }
    if (!callback) {
        const removed = _listeners.filter((l) => l.eventType === eventType);
        _listeners = _listeners.filter((l) => l.eventType !== eventType);
        return cancelCallback(removed);
    }
    if (!context) {
        // use eventType and callback to identify
        const removed = _listeners
            .filter((l) => l.callback === callback)
            .filter((l) => l.eventType === eventType);
        _listeners = _listeners.filter((l) => l.eventType !== eventType || l.callback !== callback);
        return cancelCallback(removed);
    }
    else {
        // if we have context then we can ignore other params
        const removed = _listeners
            .filter((l) => l.callback === callback)
            .filter((l) => l.eventType === eventType)
            .filter((l) => l.context === context);
        _listeners = _listeners.filter((l) => l.context !== context ||
            l.callback !== callback ||
            l.eventType !== eventType);
        return cancelCallback(removed);
    }
}
/**
 * internal function responsible for the actual removal of
 * a listener.
 */
function cancelCallback(removed) {
    let count = 0;
    removed.forEach((l) => {
        if (typeof l.cancelCallbackOrContext === 'function') {
            l.cancelCallbackOrContext();
            count++;
        }
    });
    return count;
}
function removeAllListeners() {
    const howMany = cancelCallback(_listeners);
    _listeners = [];
    return howMany;
}
/**
 * **listenerCount**
 *
 * Provides a numberic count of listeners on the database.
 * Optionally you can state the `EventType` and get a count
 * of only this type of event.
 */
function listenerCount(type) {
    return type
        ? _listeners.filter((l) => l.eventType === type).length
        : _listeners.length;
}
/**
 * **listenerPaths**
 *
 * Provides a list of _paths_ in the database which have listeners
 * attached to them. Optionally you can state the `EventType` and filter down to
 * only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
function listenerPaths(lookFor) {
    if (lookFor && !Array.isArray(lookFor)) {
        lookFor =
            lookFor === 'child'
                ? ['child_added', 'child_changed', 'child_removed', 'child_moved']
                : [lookFor];
    }
    return lookFor
        ? _listeners
            .filter((l) => lookFor.includes(l.eventType))
            .map((l) => l.query.path)
        : _listeners.map((l) => l.query.path);
}
/**
 * **getListeners**
 *
 * Returns the list of listeners.Optionally you can state the `EventType` and
 * filter down to only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
function getListeners(lookFor) {
    const childEvents = [
        'child_added',
        'child_changed',
        'child_removed',
        'child_moved',
    ];
    const allEvents = childEvents.concat(['value']);
    const events = !lookFor
        ? allEvents
        : lookFor === 'child'
            ? childEvents
            : lookFor;
    return _listeners.filter((l) => events.includes(l.eventType));
}
function keyDidNotPreviouslyExist(e, dbSnapshot) {
    return get(dbSnapshot, e.key) === undefined ? true : false;
}
/**
 * **notify**
 *
 * Based on a dictionary of paths/values it reduces this to events to
 * send to zero or more listeners.
 */
function notify(data, dbSnapshot) {
    if (!shouldSendEvents()) {
        return;
    }
    const events = groupEventsByWatcher(data, dbSnapshot);
    events.forEach((evt) => {
        const isDeleteEvent = evt.value === null || evt.value === undefined;
        switch (evt.listenerEvent) {
            case 'child_removed':
                if (isDeleteEvent) {
                    evt.callback(new SnapShot(evt.key, evt.priorValue));
                }
                return;
            case 'child_added':
                if (!isDeleteEvent && keyDidNotPreviouslyExist(evt, dbSnapshot)) {
                    evt.callback(new SnapShot(evt.key, evt.value));
                }
                return;
            case 'child_changed':
                if (!isDeleteEvent) {
                    evt.callback(new SnapShot(evt.key, evt.value));
                }
                return;
            case 'child_moved':
                if (!isDeleteEvent && keyDidNotPreviouslyExist(evt, dbSnapshot)) {
                    // TODO: if we implement sorting then add the previousKey value
                    evt.callback(new SnapShot(evt.key, evt.value));
                }
                return;
            case 'value':
                const snapKey = new SnapShot(evt.listenerPath, evt.value).key;
                if (snapKey === evt.key) {
                    // root set
                    evt.callback(new SnapShot(evt.listenerPath, evt.value === null || evt.value === undefined
                        ? undefined
                        : { [evt.key]: evt.value }));
                }
                else {
                    // property set
                    const value = evt.value === null ? getDb(evt.listenerPath) : evt.value;
                    evt.callback(new SnapShot(evt.listenerPath, value));
                }
        } // end switch
    });
}
/**
 * **findChildListeners**
 *
 * Finds "child events" listening to a given _parent path_; optionally
 * allowing for specification of the specific `EventType` or `EventType(s)`.
 *
 * @param changePath the _parent path_ that children are detected off of
 * @param eventTypes <optional> the specific child event (or events) to filter down to; if you have more than one then you should be aware that this property is destructured so the calling function should pass in an array of parameters rather than an array as the second parameter
 */
function findChildListeners(changePath, ...eventTypes) {
    changePath = stripLeadingDot(changePath.replace(/\//g, '.'));
    eventTypes =
        eventTypes.length !== 0
            ? eventTypes
            : ['child_added', 'child_changed', 'child_moved', 'child_removed'];
    const decendants = _listeners
        .filter((l) => eventTypes.includes(l.eventType))
        .filter((l) => changePath.startsWith(dotify(l.query.path)))
        .reduce((acc, listener) => {
        const id = removeDots(changePath
            .replace(listener.query.path, '')
            .split('.')
            .filter((i) => i)[0]);
        const remainingPath = stripLeadingDot(changePath.replace(stripLeadingDot(listener.query.path), ''));
        const changeIsAtRoot = id === remainingPath;
        acc.push(Object.assign(Object.assign({}, listener), { id, changeIsAtRoot }));
        return acc;
    }, []);
    return decendants;
}
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
function findValueListeners(path) {
    return _listeners.filter((l) => join(path).indexOf(join(l.query.path)) !== -1 && l.eventType === 'value');
}

class SchemaHelper {
    constructor(context, faker) {
        this.context = context;
        if (faker) {
            this._faker = faker;
        }
    }
    /**
     * static initializer which allows the **faker** library
     * to be instantiated asynchronously. Alternatively,
     * you can pass in an instance of faker to this function
     * to avoid any need for delay.
     *
     * Note: the _constructor_ also allows passing the faker
     * library in so this initializer's main "value" is to
     * ensure that faker is ready before the faker getter is
     * used.
     */
    static async create(context, faker) {
    }
    get faker() {
        return this._faker;
    }
}

class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        const faker = getFakerLibrary();
        if (!faker) {
            throw createError(`firemock/not-ready`, `The mock helper can not provide the MockHelper object until after the faker library has been imported with a 'await importFakerLibrary()' call.`);
        }
        return faker;
    }
}

class Auth {
    constructor() {
        throw new Error('You should not call this constructor directly! Instead use the auth() accessor to get to this API.');
    }
}

const data = {
    providerId: 'mock-provider-id-for-EmailAuthProvider',
    signInMethod: 'email-and-password',
};
/**
 * **EmailAuthProvider** API mocking. Details on the API can be found
 * here: https://firebase.google.com/docs/reference/js/firebase.auth.EmailAuthProvider
 */
class EmailAuthProvider {
    constructor() {
        this.providerId = data.providerId;
    }
    /**
     * Produces a `credential` to a user account (typically an anonymous account)
     * which can then be linked to the account using `linkWithCredential`.
     */
    static credential(email, password) {
        return Object.assign(Object.assign({}, data), { toJSON() {
                return JSON.stringify(data);
            } });
    }
    /**
     * Initialize an EmailAuthProvider credential using an email and an email link after
     * a sign in with email link operation.
     */
    static credentialWithLink(email, emailLink) {
        return Object.assign(Object.assign({}, data), { toJSON() {
                return JSON.stringify(data);
            } });
    }
}

class FacebookAuthProvider {
    static credential(token) {
        throw new Error('FacebookAuthProvider not implemented yet');
    }
    addScope(scope) {
        throw new Error('not implemented');
    }
    setCustomParameters(params) {
        throw new Error('not implemented');
    }
}

class GithubAuthProvider {
    static credential(idToken, accessToken) {
        throw new Error('not implemented');
    }
    addScope(scope) {
        throw new Error('not implemented');
    }
    setCustomParameters(params) {
        throw new Error('not implemented');
    }
}

class GoogleAuthProvider {
    static credential(idToken, accessToken) {
        throw new Error('not implemented');
    }
    addScope(scope) {
        throw new Error('not implemented');
    }
    setCustomParameters(params) {
        throw new Error('not implemented');
    }
}

class TwitterAuthProvider {
    static credential(idToken, accessToken) {
        throw new Error('not implemented');
    }
    addScope(scope) {
        throw new Error('not implemented');
    }
    setCustomParameters(params) {
        throw new Error('not implemented');
    }
}

class SAMLAuthProvider {
}

class OAuthProvider {
    // tslint:disable-next-line: no-empty
    constructor(providerId) { }
    addScope(scope) {
        throw new Error('not implemented');
    }
    credential(idToken, accessToken) {
        throw new Error('not implemented');
    }
    // tslint:disable-next-line: ban-types
    setCustomParameters(customOAuthParameters) {
        throw new Error('not implemented');
    }
}

class PhoneAuthProvider {
    static credential(verificationId, verificationCode) {
        throw new Error('not implemented');
    }
    async verifyPhoneNumber(phoneNumber, applicationVerifier) {
        throw new Error('not-implemented');
    }
}

class RecaptchaVerifier {
    clear() {
        //
    }
    async render() {
        throw new Error('not-implemented');
    }
    async verify() {
        throw new Error('not-implemented');
    }
}

// tslint:disable-next-line: no-object-literal-type-assertion
const api = {
    Auth: Auth,
    EmailAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    TwitterAuthProvider,
    SAMLAuthProvider,
    OAuthProvider,
    PhoneAuthProvider,
    RecaptchaVerifier,
};
const fn = () => {
    throw new Error('not allowed');
};
var authProviders$1 = (api || fn);

const users = {
    // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
    async createUser(properties) {
        addUser(Object.assign({ password: Math.random().toString(36).substr(2, 10), multiFactor: null }, properties));
        return Object.assign(Object.assign({}, properties), { metadata: {
                lastSignInTime: null,
                creationTime: String(new Date()),
                toJSON() {
                    return {};
                },
            }, multiFactor: null, toJSON: () => null, providerData: null });
    },
    /** Updates an existing user. */
    async updateUser(uid, properties) {
        updateUser(uid, properties);
        return getUserById(uid);
    },
    async deleteUser(uid) {
        await networkDelay();
        removeUser(uid);
    },
    async getUserByEmail(email) {
        await networkDelay();
        return getUserByEmail(email);
    },
    async getUserByPhoneNumber(phoneNumber) {
        return;
    },
    async listUsers(maxResults, pageToken) {
        await networkDelay();
        return { users: maxResults ? allUsers().slice(0, maxResults) : allUsers() };
    },
};

const claims = {
    /**
     * Sets additional developer claims on an existing user identified by the provided uid,
     * typically used to define user roles and levels of access.
     */
    async setCustomUserClaims(uid, customUserClaims) {
        updateUser(uid, { customClaims: customUserClaims });
    },
};

const tokens = {
    /**
     * Verifies a Firebase ID token (JWT). If the token is valid, the promise is fulfilled
     * with the token's decoded claims; otherwise, the promise is rejected. An optional
     * flag can be passed to additionally check whether the ID token was revoked.
     *
     * @param idToken The ID token to verify
     * @param checkRevoked Whether to check if the ID token was revoked. This requires an
     * extra request to the Firebase Auth backend to check the tokensValidAfterTime time
     * for the corresponding user. When not specified, this additional check is not applied.
     */
    async verifyIdToken(idToken, checkRevoked) {
        return;
    },
};

const implemented$1 = Object.assign(Object.assign(Object.assign({}, users), claims), tokens);

const notImplemented$1 = {
//
};

const adminAuthSdk = Object.assign(Object.assign({}, implemented$1), notImplemented$1);

/* tslint:disable:max-classes-per-file */
class Mock {
    constructor(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock, authConfig = {
        providers: ['anonymous'],
        users: [],
    }) {
        // TODO: should these attributes be removed?
        this._schemas = new Queue('schemas').clear();
        this._relationships = new Queue('relationships').clear();
        this._queues = new Queue('queues').clear();
        Queue.clearAll();
        clearDatabase();
        clearAuthUsers();
        if (dataOrMock && typeof dataOrMock === 'object') {
            this.updateDB(dataOrMock);
        }
        if (dataOrMock && typeof dataOrMock === 'function') {
            this._mockInitializer = dataOrMock(this);
        }
        initializeAuth(authConfig);
    }
    /**
     * returns a Mock object while also ensuring that the
     * Faker library has been asynchronously imported.
     */
    static async prepare(options = {}
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    ) {
        const defaultDbConfig = {};
        await importFakerLibrary();
        const obj = new Mock(options.db
            ? typeof options.db === 'function'
                ? {}
                : options.db || defaultDbConfig
            : defaultDbConfig, options.auth);
        if (typeof options.db === 'function') {
            obj.updateDB(await options.db(obj));
        }
        return obj;
    }
    get db() {
        return getDb();
    }
    get deploy() {
        return new Deployment();
    }
    /**
     * Update -- _non-desctructively_ -- the mock DB with a JS object/hash
     */
    updateDB(
    /** the _new_ state that will be updated with the old */
    stateUpdate, 
    /** optionally clear the DB before applying the update */
    clearFirst) {
        if (clearFirst) {
            clearDatabase();
        }
        updateDatabase(stateUpdate);
    }
    /**
     * silences the database from sending events;
     * this is not typically done but can be done
     * as part of the Mocking process to reduce noise
     */
    silenceEvents() {
        silenceEvents();
    }
    /**
     * returns the database to its default state of sending
     * events out.
     */
    restoreEvents() {
        restoreEvents();
    }
    /**
     * Gives access to a mocked version of the Client Auth SDK
     */
    async auth() {
        return auth();
    }
    async adminSdk() {
        return adminAuthSdk;
    }
    get authProviders() {
        return authProviders$1;
    }
    /**
     * returns an instance static FakerJS libraray
     */
    get faker() {
        return getFakerLibrary();
    }
    // /**
    //  * **getMockHelper**
    //  *
    //  * returns a MockHelper class which should always contain
    //  * access to the faker library off the `faker` property exposed;
    //  * you can also set some additional `context` where desirable.
    //  */
    // public getMockHelper(context?: IDictionary) {
    //   if (!faker && !faker.address) {
    //     throw new FireMockError(
    //       `The Faker library must be loaded before a MockHelper can be returned`,
    //       "firemock/faker-not-ready"
    //     );
    //   }
    //   return new MockHelper(context);
    // }
    addSchema(schema, mock) {
        return new Schema(schema, mock);
    }
    /** Set the network delay for queries with "once" */
    setDelay(d) {
        setNetworkDelay(d);
    }
    queueSchema(schemaId, quantity = 1, overrides = {}) {
        const d = new Deployment();
        d.queueSchema(schemaId, quantity, overrides);
        return d;
    }
    generate() {
        const faker = getFakerLibrary();
        if (!faker && !faker.address) {
            throw new FireMockError(`The Faker library must be loaded before you can generate mocked data can be returned`, 'firemock/faker-not-ready');
        }
        return new Deployment().generate();
    }
    ref(dbPath) {
        return new Reference(dbPath);
    }
}

class Deployment {
    constructor() {
        this._queue = new Queue('queue');
        this._schemas = new Queue('schemas');
        this._relationships = new Queue('relationships');
    }
    /**
     * Queue a schema for deployment to the mock DB
     */
    queueSchema(
    /** A unique reference to the schema being queued for generation */
    schemaId, 
    /** The number of this schema to generate */
    quantity = 1, 
    /** Properties in the schema template which should be overriden with a static value */
    overrides = {}) {
        this.schemaId = schemaId;
        this.queueId = key();
        const schema = this._schemas.find(schemaId);
        if (!schema) {
            console.log(`Schema "${schema}" does not exist; will SKIP.`);
        }
        else {
            const newQueueItem = {
                id: this.queueId,
                schema: schemaId,
                prefix: schema.prefix,
                quantity,
                overrides,
            };
            this._queue.enqueue(newQueueItem);
        }
        return this;
    }
    /**
     * Provides specificity around how many of a given
     * "hasMany" relationship should be fulfilled of
     * the schema currently being queued.
     */
    quantifyHasMany(targetSchema, quantity) {
        const hasMany = this._relationships.filter((r) => r.type === 'hasMany' && r.source === this.schemaId);
        const targetted = hasMany.filter((r) => r.target === targetSchema);
        if (hasMany.length === 0) {
            console.log(`Attempt to quantify "hasMany" relationships with schema "${this.schemaId}" is not possible; no such relationships exist`);
        }
        else if (targetted.length === 0) {
            console.log(`The "${targetSchema}" schema does not have a "hasMany" relationship with the "${this.schemaId}" model`);
        }
        else {
            const queue = this._queue.find(this.queueId);
            this._queue.update(this.queueId, {
                hasMany: Object.assign(Object.assign({}, queue.hasMany), { [pluralize(targetSchema)]: quantity }),
            });
        }
        return this;
    }
    /**
     * Indicates the a given "belongsTo" should be fulfilled with a
     * valid FK reference when this queue is generated.
     */
    fulfillBelongsTo(targetSchema) {
        const schema = this._schemas.find(this.schemaId);
        const relationship = first(this._relationships
            .filter((r) => r.source === this.schemaId)
            .filter((r) => r.target === targetSchema));
        const sourceProperty = schema.path();
        const queue = this._queue.find(this.queueId);
        this._queue.update(this.queueId, {
            belongsTo: Object.assign(Object.assign({}, queue.belongsTo), { [`${targetSchema}Id`]: true }),
        });
        return this;
    }
    generate() {
        // iterate over each schema that has been queued
        // for generation
        this._queue.map((q) => {
            for (let i = q.quantity; i > 0; i--) {
                this.insertMockIntoDB(q.schema, q.overrides);
            }
        });
        this._queue.map((q) => {
            for (let i = q.quantity; i > 0; i--) {
                this.insertRelationshipLinks(q);
            }
        });
        this._queue.clear();
    }
    /**
     * Adds in a given record/mock into the mock database
     */
    insertMockIntoDB(schemaId, overrides) {
        const schema = this._schemas.find(schemaId);
        const mock = schema.fn();
        const path = schema.path();
        const key$1 = overrides.id || key();
        const dbPath = dotNotation(path) + `.${key$1}`;
        const payload = typeof mock === 'object'
            ? Object.assign(Object.assign({}, mock), overrides) : overrides && typeof overrides !== 'object'
            ? overrides
            : mock;
        // set(db, dbPath, payload);
        setDB(dbPath, payload);
        return key$1;
    }
    insertRelationshipLinks(queue) {
        const relationships = this._relationships.filter((r) => r.source === queue.schema);
        const belongsTo = relationships.filter((r) => r.type === 'belongsTo');
        const hasMany = relationships.filter((r) => r.type === 'hasMany');
        const db = getDb();
        belongsTo.forEach((r) => {
            const fulfill = Object.keys(queue.belongsTo || {})
                .filter((v) => queue.belongsTo[v] === true)
                .indexOf(r.sourceProperty) !== -1;
            const source = this._schemas.find(r.source);
            const target = this._schemas.find(r.target);
            let getID;
            if (fulfill) {
                const mockAvailable = this._schemas.find(r.target) ? true : false;
                const available = Object.keys(db[pluralize(r.target)] || {});
                const generatedAvailable = available.length > 0;
                const numChoices = (db[r.target] || []).length;
                const choice = () => generatedAvailable
                    ? available[getRandomInt(0, available.length - 1)]
                    : this.insertMockIntoDB(r.target, {});
                getID = () => mockAvailable
                    ? generatedAvailable
                        ? choice()
                        : this.insertMockIntoDB(r.target, {})
                    : key();
            }
            else {
                getID = () => '';
            }
            const property = r.sourceProperty;
            const path = source.path();
            const recordList = get(db, dotNotation(source.path()), {});
            Object.keys(recordList).forEach((key) => {
                set(db, `${dotNotation(source.path())}.${key}.${property}`, getID());
            });
        });
        hasMany.forEach((r) => {
            const fulfill = Object.keys(queue.hasMany || {}).indexOf(r.sourceProperty) !== -1;
            const howMany = fulfill ? queue.hasMany[r.sourceProperty] : 0;
            const source = this._schemas.find(r.source);
            const target = this._schemas.find(r.target);
            let getID;
            if (fulfill) {
                const mockAvailable = this._schemas.find(r.target) ? true : false;
                const available = Object.keys(db[pluralize(r.target)] || {});
                const used = [];
                const generatedAvailable = available.length > 0;
                const numChoices = (db[pluralize(r.target)] || []).length;
                const choice = (pool) => {
                    if (pool.length > 0) {
                        const chosen = pool[getRandomInt(0, pool.length - 1)];
                        used.push(chosen);
                        return chosen;
                    }
                    return this.insertMockIntoDB(r.target, {});
                };
                getID = () => mockAvailable
                    ? choice(available.filter((a) => used.indexOf(a) === -1))
                    : key();
            }
            else {
                getID = () => undefined;
            }
            const property = r.sourceProperty;
            const path = source.path();
            const sourceRecords = get(db, dotNotation(source.path()), {});
            Object.keys(sourceRecords).forEach((key) => {
                for (let i = 1; i <= howMany; i++) {
                    set(db, `${dotNotation(source.path())}.${key}.${property}.${getID()}`, true);
                }
            });
        });
    }
}

let faker;
/**
 * **importFakerLibrary**
 *
 * The **faker** library is a key part of effective mocking but
 * it is a large library so we only want to import it when
 * it's required. Calling this _async_ method will ensure that
 * before you're mocking with faker available.
 */
async function importFakerLibrary() {
    if (!faker) {
        faker = await Promise.resolve().then(function () { return require(/* webpackChunkName: "faker-lib" */ './index-62be410f-33575af1.js'); }).then(function (n) { return n.i; });
    }
    return faker;
}
/**
 * Assuming you've already loaded the faker library, this returns the library
 * synchronously
 */
function getFakerLibrary() {
    if (!faker) {
        throw new FireMockError(`The faker library has not been loaded yet! Use the importFakerLibrary() directly to ensure this happens first;or altnernatively you can use Mock.prepare().`, 'not-ready');
    }
    return faker;
}
/**
 * Returns a Mock Helper object which includes the faker library.
 *
 * **Note:** calling this function will asynchronously load the faker library
 * so that the MockHelper is "made whole". This dependency has some heft to it
 * so should be avoided unless needed.
 */
async function getMockHelper(db) {
    faker = await importFakerLibrary();
    const obj = new MockHelper();
    return obj;
}

class Schema {
    constructor(schemaId, mockFn) {
        this.schemaId = schemaId;
        this._schemas = new Queue('schemas');
        this._relationships = new Queue('relationships');
        if (mockFn) {
            this.mock(mockFn);
        }
    }
    /**
     * Add a mocking function to be used to generate the schema in mock DB
     */
    mock(cb) {
        this._schemas.enqueue({
            id: this.schemaId,
            fn: cb(new SchemaHelper({}, getFakerLibrary())),
            path: () => {
                const schema = this._schemas.find(this.schemaId);
                return [
                    schema.prefix,
                    schema.modelName
                        ? pluralize(schema.modelName)
                        : pluralize(this.schemaId),
                ].join('/');
            },
        });
        return this;
    }
    /**
     * There are times where it's appropriate to have multiple schemas for
     * the same entity/model, in this case you'll want to state what model
     * your schema is emulating. If you don't state this property it assumes
     * the schema name IS the model name
     */
    modelName(value) {
        this._schemas.update(this.schemaId, { modelName: value });
        return this;
    }
    /** prefixes a static path to the beginning of the  */
    pathPrefix(prefix) {
        prefix = prefix.replace(/\./g, '/'); // slash reference preferred over dot
        prefix =
            prefix.slice(-1) === '/' ? prefix.slice(0, prefix.length - 1) : prefix;
        this._schemas.update(this.schemaId, { prefix });
        return this;
    }
    /**
     * The default pluralizer is quite simple so if you find that
     * it is pluralizing incorrectly then you can manually state
     * the plural name.
     */
    pluralName(plural) {
        const model = this._schemas.find(this.schemaId).modelName
            ? this._schemas.find(this.schemaId).modelName
            : this.schemaId;
        addException(model, plural);
        return this;
    }
    /**
     * Configures a "belongsTo" relationship with another schema/entity
     */
    belongsTo(target, sourceProperty) {
        this._relationships.push({
            type: 'belongsTo',
            source: this.schemaId,
            target,
            sourceProperty: sourceProperty ? sourceProperty : `${target}Id`,
        });
        return this;
    }
    /**
     * Configures a "hasMany" relationship with another schema/entity
     */
    hasMany(target, sourceProperty) {
        this._relationships.push({
            type: 'hasMany',
            source: this.schemaId,
            target,
            sourceProperty: sourceProperty ? sourceProperty : pluralize(target),
        });
        return this;
    }
    /** Add another schema */
    addSchema(schema, mock) {
        const s = new Schema(schema);
        if (mock) {
            s.mock(mock);
        }
        return new Schema(schema);
    }
}

/**
 * Queue Class
 *
 * A generic class for building singleton queues;
 * this is used as a container for schemas, deployment queues,
 * and relationships
 */
class Queue {
    constructor(_name) {
        this._name = _name;
        this.pkProperty = 'id';
        if (!_name) {
            throw new Error('A queue MUST have a named passed in to be managed');
        }
        if (!Queue._queues[_name]) {
            Queue._queues[_name] = [];
        }
    }
    static clearAll() {
        Queue._queues = {};
    }
    get name() {
        return this._name;
    }
    /**
     * Allows adding another item to the queue. It is expected
     * that this item WILL have the primary key included ('id' by
     * default)
     */
    enqueue(queueItem) {
        Queue._queues[this._name].push(queueItem);
        return this;
    }
    /**
     * Similar to enqueue but the primary key is generated and passed
     * back to the caller.
     */
    push(queueItem) {
        const id = key();
        if (typeof queueItem !== 'object') {
            throw new Error('Using push() requires that the payload is an object');
        }
        queueItem[this.pkProperty] = id;
        this.enqueue(queueItem);
        return id;
    }
    /**
     * By passing in the key you will remove the given item from the queue
     */
    dequeue(key) {
        const queue = Queue._queues[this._name];
        if (queue.length === 0) {
            throw new Error(`Queue ${this._name} is empty. Can not dequeue ${key}.`);
        }
        Queue._queues[this._name] =
            typeof first(queue) === 'object'
                ? queue.filter((item) => item[this.pkProperty] !== key)
                : queue.filter((item) => item !== key);
        return this;
    }
    fromArray(payload) {
        Queue._queues[this._name] = payload;
        return this;
    }
    clear() {
        Queue._queues[this._name] = [];
        return this;
    }
    find(key) {
        const [obj, index] = this._find(key);
        return obj;
    }
    indexOf(key) {
        const [obj, index] = this._find(key);
        return index;
    }
    includes(key) {
        return this.find(key) ? true : false;
    }
    replace(key, value) {
        value[this.pkProperty] = key;
        this.dequeue(key).enqueue(value);
        return this;
    }
    update(key, value) {
        const currently = this.find(key);
        if (currently) {
            this.dequeue(key);
        }
        if (typeof currently === 'object' && typeof value === 'object') {
            value[this.pkProperty] = key;
            const updated = Object.assign(Object.assign({}, currently), value);
            this.enqueue(updated);
        }
        else {
            throw new Error(`Current and updated values must be objects!`);
        }
        return this;
    }
    get length() {
        return Queue._queues[this._name].length;
    }
    /** returns the Queue as a JS array */
    toArray() {
        return Queue._queues && Queue._queues[this._name]
            ? Queue._queues[this._name]
            : [];
    }
    /** returns the Queue as a JS Object */
    toHash() {
        const queue = Queue._queues[this._name];
        if (!queue || queue.length === 0) {
            return new Object();
        }
        return typeof first(queue) === 'object'
            ? queue.reduce((obj, item) => {
                const pk = item[this.pkProperty];
                // tslint:disable-next-line
                const o = Object.assign({}, item);
                delete o[this.pkProperty];
                return Object.assign(Object.assign({}, obj), { [pk]: o });
            }, new Object())
            : queue.reduce((obj, item) => (obj = Object.assign(Object.assign({}, obj), { [item]: true })), new Object());
    }
    map(fn) {
        const queuedSchemas = Queue._queues[this._name];
        return queuedSchemas ? queuedSchemas.map(fn) : [];
    }
    filter(fn) {
        const queue = Queue._queues[this._name];
        return queue ? queue.filter(fn) : [];
    }
    toJSON() {
        return JSON.stringify(Queue._queues);
    }
    toObject() {
        return Queue._queues;
    }
    _find(key) {
        const queue = Queue._queues[this._name];
        const objectPayload = typeof first(queue) === 'object';
        let index = 0;
        let result = [null, -1];
        for (const item of queue) {
            const condition = objectPayload
                ? item[this.pkProperty] === key
                : item === key;
            if (condition) {
                result = [item, index];
                break;
            }
            index++;
        }
        return result;
    }
}
Queue._queues = {};

const notImplemented$2 = {
    async applyActionCode(code) {
        return;
    },
    async checkActionCode(code) {
        return {
            data: {},
            operation: '',
        };
    },
    // async createUserAndRetrieveDataWithEmailAndPassword(
    //   email: string,
    //   password: string
    // ): Promise<UserCredential> {
    //   return completeUserCredential({});
    // },
    // async fetchProvidersForEmail(email: string) {
    //   return [];
    // },
    // async signInAnonymouslyAndRetrieveData() {
    //   return completeUserCredential({});
    // },
    // async signInAndRetrieveDataWithCustomToken(token: string) {
    //   return completeUserCredential({});
    // },
    // async signInAndRetrieveDataWithEmailAndPassword(email: string, password: string) {
    //   return completeUserCredential({});
    // },
    async fetchSignInMethodsForEmail() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async getRedirectResult() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    isSignInWithEmailLink() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    onIdTokenChanged() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async sendSignInLinkToEmail() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInAndRetrieveDataWithCredential() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInWithCredential() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInWithCustomToken() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInWithEmailLink() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInWithPhoneNumber() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInWithPopup() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async signInWithRedirect() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async useDeviceLanguage() {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
    async verifyPasswordResetCode(code) {
        throw createError('auth/not-implemented', 'This feature is not implemented yet in FireMock auth module');
    },
};

// tslint:disable-next-line:no-object-literal-type-assertion
const authMockApi = Object.assign(Object.assign({}, notImplemented$2), implemented);

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get Delays () { return Delays; },
    Deployment: Deployment,
    Mock: Mock,
    MockHelper: MockHelper,
    Query: Query,
    Queue: Queue,
    Reference: Reference,
    Schema: Schema,
    SchemaHelper: SchemaHelper,
    SnapShot: SnapShot,
    get SortOrder () { return SortOrder; },
    addListener: addListener,
    adminAuthSdk: adminAuthSdk,
    auth: auth$1,
    authMockApi: authMockApi,
    clearDatabase: clearDatabase,
    findChildListeners: findChildListeners,
    findValueListeners: findValueListeners,
    getDb: getDb,
    getFakerLibrary: getFakerLibrary,
    getListeners: getListeners,
    getMockHelper: getMockHelper,
    groupEventsByWatcher: groupEventsByWatcher,
    importFakerLibrary: importFakerLibrary,
    listenerCount: listenerCount,
    listenerPaths: listenerPaths,
    multiPathUpdateDB: multiPathUpdateDB,
    notify: notify,
    pushDB: pushDB,
    removeAllListeners: removeAllListeners,
    removeDB: removeDB,
    removeListener: removeListener,
    reset: reset,
    restoreEvents: restoreEvents,
    setDB: setDB,
    shouldSendEvents: shouldSendEvents,
    silenceEvents: silenceEvents,
    updateDB: updateDB,
    updateDatabase: updateDatabase
});

function debug(msg, stack) {
    if (process.env.DEBUG) {
        console.log(msg);
        if (stack) {
            console.log(JSON.stringify(stack));
        }
    }
}

let RealTimeAdmin = /** @class */ (() => {
    class RealTimeAdmin extends RealTimeDb {
        constructor(config) {
            super();
            this.sdk = "RealTimeAdmin" /* RealTimeAdmin */;
            this._clientType = 'admin';
            this._isAuthorized = true;
            this._isAdminApi = true;
            this._eventManager = new EventManager();
            this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
            config = {
                ...config,
                serviceAccount: extractServiceAccount(config),
                databaseURL: extractDataUrl(config),
                name: determineDefaultAppName(config),
            };
            if (isAdminConfig(config)) {
                this._config = config;
                const runningApps = getRunningApps(firebase.apps);
                RealTimeAdmin._connections = firebase.apps;
                const credential = firebase.credential.cert(config.serviceAccount);
                this._app = runningApps.includes(this._config.name)
                    ? getRunningFirebaseApp(config.name, firebase.apps)
                    : firebase.initializeApp({
                        credential,
                        databaseURL: config.databaseURL,
                    }, config.name);
            }
            else if (isMockConfig(config)) {
                this._config = config;
            }
            else {
                throw new FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
            }
        }
        /**
         * Instantiates a DB and then waits for the connection
         * to finish before resolving the promise.
         */
        static async connect(config) {
            const obj = new RealTimeAdmin(config);
            await obj.connect();
            return obj;
        }
        static get connections() {
            return RealTimeAdmin._connections.map((i) => i.name);
        }
        get database() {
            if (this.config.mocking) {
                throw new RealTimeAdminError(`The "database" provides direct access to the Firebase database API when using a real database but not when using a Mock DB!`, 'not-allowed');
            }
            if (!this._database) {
                throw new RealTimeAdminError(`The "database" object was accessed before it was established as part of the "connect()" process!`, 'not-allowed');
            }
            return this._database;
        }
        /**
         * Provides access to the Firebase Admin Auth API.
         *
         * > If using a _mocked_ database then the Auth API will be redirected to **firemock**
         * instead of the real Admin SDK for Auth. Be aware that this mocked API may not be fully implemented
         * but PR's are welcome if the part you need is not yet implemented. If you want to explicitly state
         * whether to use the _real_ or _mock_ Auth SDK then you can state this by passing in a `auth` parameter
         * as part of the configuration (using either "real" or "mocked" as a value)
         *
         * References:
         * - [Introduction](https://firebase.google.com/docs/auth/admin)
         * - [API](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth)
         */
        async auth() {
            if (this._config.mocking) {
                return adminAuthSdk;
            }
            return firebase.auth(this._app);
        }
        goOnline() {
            if (this._database) {
                try {
                    this._database.goOnline();
                }
                catch (e) {
                    debug('There was an error going online:' + e);
                }
            }
            else {
                console.warn('Attempt to use goOnline() prior to having a database connection!');
            }
        }
        goOffline() {
            if (this._database) {
                this._database.goOffline();
            }
            else {
                console.warn('Attempt to use goOffline() prior to having a database connection!');
            }
        }
        get isConnected() {
            if (this.isMockDb) {
                return this._isConnected;
            }
            return (this._app &&
                this.config &&
                this.config.name &&
                getRunningApps(firebase.apps).includes(this.config.name));
        }
        async connect() {
            if (isMockConfig(this._config)) {
                await this._connectMockDb(this._config);
            }
            else if (isAdminConfig(this._config)) {
                await this._connectRealDb(this._config);
            }
            else {
                throw new RealTimeAdminError('The configuation passed is not valid for an admin SDK!', 'invalid-configuration');
            }
            return this;
        }
        async _connectMockDb(config) {
            await this.getFireMock({
                db: config.mockData || {},
                auth: { providers: [], ...config.mockAuth },
            });
            this._isConnected = true;
            return this;
        }
        async _connectRealDb(config) {
            const found = firebase.apps.find((i) => i.name === this.config.name);
            this._database = (found &&
                found.database &&
                typeof found.database !== 'function'
                ? found.database
                : this._app.database());
            this.enableDatabaseLogging = firebase.database.enableLogging.bind(firebase.database);
            this.goOnline();
            this._eventManager.connection(true);
            await this._listenForConnectionStatus();
            if (this.isConnected) {
                console.info(`Database ${this.app.name} was already connected. Reusing connection.`);
            }
        }
        /**
         * listenForConnectionStatus
         *
         * in the admin interface we assume that ONCE connected
         * we remain connected; this is unlike the client API
         * which provides an endpoint to lookup
         */
        async _listenForConnectionStatus() {
            this._setupConnectionListener();
            this._eventManager.connection(true);
        }
    }
    RealTimeAdmin._connections = [];
    return RealTimeAdmin;
})();

exports.RealTimeAdmin = RealTimeAdmin;
//# sourceMappingURL=index.js.map
