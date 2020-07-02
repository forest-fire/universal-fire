import { EventEmitter } from 'events';
import { adminAuthSdk } from 'firemock';

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
var Symbol = root.Symbol;

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
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

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
var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

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
var symbolProto = Symbol ? Symbol.prototype : undefined,
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
var Map = getNative(root, 'Map');

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
    'map': new (Map || ListCache),
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
    /**
     * **getFireMock**
     *
     * Asynchronously imports both `FireMock` and the `Faker` libraries
     * then sets `isConnected` to **true**
     */
    async getFireMock(config = {}) {
        const FireMock = await import(
        /* webpackChunkName: "firemock" */ 'firemock');
        this._mock = await FireMock.Mock.prepare(config);
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

class EventManager extends EventEmitter {
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
            this._config = config;
            // if (isAdminConfig(config)) {
            //   this._config = config;
            //   const runningApps = getRunningApps(firebase.apps);
            //   RealTimeAdmin._connections = firebase.apps;
            //   const credential = firebase.credential.cert(config.serviceAccount);
            //   this._app = runningApps.includes(this._config.name)
            //     ? getRunningFirebaseApp<IAdminApp>(
            //         config.name,
            //         (firebase.apps as unknown) as IAdminApp[]
            //       )
            //     : firebase.initializeApp(
            //         {
            //           credential,
            //           databaseURL: config.databaseURL,
            //         },
            //         config.name
            //       );
            // } else if (isMockConfig(config)) {
            //   this._config = config;
            // } else {
            //   throw new FireError(
            //     `The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(
            //       config,
            //       null,
            //       2
            //     )}`,
            //     'invalid-configuration'
            //   );
            // }
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
            //TODO: check this typing
            return this._admin.auth(this._app);
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
                getRunningApps(this._admin.apps).includes(this.config.name));
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
        async _loadAdminApi() {
            const api = (await import('firebase-admin'));
            return api;
        }
        async _connectRealDb(config) {
            if (!this._admin) {
                this._admin = (await import('firebase-admin'));
            }
            const found = this._admin.apps.find((i) => i.name === this.config.name);
            this._database = (found &&
                found.database &&
                typeof found.database !== 'function'
                ? found.database
                : this._app.database());
            // this.enableDatabaseLogging = this._admin.database.enableLogging.bind(
            //   this._admin.database
            // );
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

export { RealTimeAdmin };
//# sourceMappingURL=index.js.map
