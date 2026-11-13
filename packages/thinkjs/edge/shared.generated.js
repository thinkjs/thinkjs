var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/lodash.merge@4.6.2/node_modules/lodash.merge/index.js
var require_lodash = __commonJS({
  "node_modules/.pnpm/lodash.merge@4.6.2/node_modules/lodash.merge/index.js"(exports, module) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var asyncTag = "[object AsyncFunction]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var nullTag = "[object Null]";
    var objectTag = "[object Object]";
    var proxyTag = "[object Proxy]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var undefinedTag = "[object Undefined]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = globalThis;
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil;
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    var nativeObjectToString = objectProto.toString;
    var objectCtorString = funcToString.call(Object);
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    var objectCreate = Object.create;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var defineProperty = (function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    })();
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeMax = Math.max;
    var nativeNow = Date.now;
    var Map = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var baseCreate = /* @__PURE__ */ (function() {
      function object() {
      }
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    })();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
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
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    var baseFor = createBaseFor();
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
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
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
        return eq(object[index], value);
      }
      return false;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    var setToString = shortOut(baseSetToString);
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    function constant(value) {
      return function() {
        return value;
      };
    }
    function identity(value) {
      return value;
    }
    function stubFalse() {
      return false;
    }
    module.exports = merge;
  }
});

// node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// packages/thinkjs/edge/helper.cjs
var require_helper = __commonJS({
  "packages/thinkjs/edge/helper.cjs"(exports, module) {
    var merge = require_lodash();
    var ms = require_ms();
    var isObject = (value) => Object.prototype.toString.call(value) === "[object Object]";
    var isTrueEmpty = (value) => value == null || value === "" || typeof value === "number" && Number.isNaN(value);
    module.exports = {
      extend: merge,
      ms,
      isObject,
      isTrueEmpty,
      isArray: Array.isArray,
      isString: (value) => typeof value === "string",
      isNumber: (value) => typeof value === "number",
      isInt: (value) => typeof value === "number" && (value | 0) === value,
      isBoolean: (value) => typeof value === "boolean",
      isFunction: (value) => typeof value === "function",
      isRegExp: (value) => value instanceof RegExp,
      isError: (value) => value instanceof Error,
      isEmpty(value) {
        if (isTrueEmpty(value)) return true;
        if (Array.isArray(value) || typeof value === "string")
          return value.length === 0;
        if (isObject(value)) return Object.keys(value).length === 0;
        return value === false || value === 0;
      }
    };
  }
});

// packages/thinkjs/edge/debug.cjs
var require_debug = __commonJS({
  "packages/thinkjs/edge/debug.cjs"(exports, module) {
    module.exports = () => () => {
    };
  }
});

// packages/thinkjs/edge/querystring.cjs
var require_querystring = __commonJS({
  "packages/thinkjs/edge/querystring.cjs"(exports) {
    exports.parse = (value) => {
      const result = /* @__PURE__ */ Object.create(null);
      for (const [key, item] of new URLSearchParams(value)) {
        if (Object.hasOwn(result, key)) {
          result[key] = [].concat(result[key], item);
        } else {
          result[key] = item;
        }
      }
      return result;
    };
  }
});

// packages/thinkjs/edge/assert.cjs
var require_assert = __commonJS({
  "packages/thinkjs/edge/assert.cjs"(exports, module) {
    module.exports = function assert(value, message) {
      if (!value) throw new Error(message || "Assertion failed");
    };
  }
});

// packages/think-router/router.js
var require_router = __commonJS({
  "packages/think-router/router.js"(exports, module) {
    var helper = require_helper();
    var debug = require_debug()("think-router");
    var querystring = require_querystring();
    var assert = require_assert();
    var Router = class {
      /**
       * constructor
       * @param {Object} ctx koa ctx
       * @param {Function} next  koa next
       * @param {Object} options middleware options
       */
      constructor(ctx, next, options) {
        this.ctx = ctx;
        this.next = next;
        this.options = options;
        this.modules = this.ctx.app.modules;
        this.controllers = this.ctx.app.controllers;
        this.pathname = this.getPathname();
        this.rules = this.ctx.app.routers;
        this.ctxMethod = ctx.method.toUpperCase();
      }
      /**
       * get pathname, remove prefix & suffix
       */
      getPathname() {
        let pathname = this.ctx.path || "";
        const prefix = this.options.prefix;
        if (prefix && prefix.length) {
          prefix.some((item) => {
            if (helper.isString(item) && pathname.indexOf(item) === 0) {
              pathname = pathname.slice(item.length);
              return true;
            }
            if (helper.isRegExp(item) && item.test(pathname)) {
              pathname = pathname.replace(item, "");
              return true;
            }
          });
        }
        const suffix = this.options.suffix;
        if (suffix && suffix.length) {
          suffix.some((item) => {
            if (helper.isString(item) && pathname.endsWith(item)) {
              pathname = pathname.slice(0, pathname.length - item.length);
              return true;
            }
            if (helper.isRegExp(item) && item.test(pathname)) {
              pathname = pathname.replace(item, "");
              return true;
            }
          });
        }
        const subdomain = this.options.subdomain;
        if (!helper.isEmpty(subdomain)) {
          const subdomainStr = this.ctx.subdomains.join(",");
          if (subdomainStr && subdomain[subdomainStr]) {
            if (pathname[0] === "/") {
              pathname = "/" + subdomain[subdomainStr] + pathname;
            } else {
              pathname = subdomain[subdomainStr] + "/" + pathname;
            }
          }
        }
        return pathname;
      }
      /**
       * get router rules
       */
      getRules() {
        const rules = this.rules;
        if (this.modules.length === 0) {
          return this.rules;
        } else if (this.modules.length && helper.isObject(rules)) {
          for (const m in rules) {
            const match = rules[m].match;
            if (match) {
              assert(helper.isRegExp(match), "router.match must be a RegExp");
              if (match.test(this.pathname)) {
                this.ctx.module = m;
                return rules[m].rules || [];
              }
            }
          }
          return [];
        }
        return rules;
      }
      /**
       * detect rule match
       */
      getMatchedRule(rules) {
        let rule;
        const specialMethods = ["REDIRECT", "REST"];
        rules.some((item) => {
          if (!item.rules) {
            const itemMethod = item.method;
            if (itemMethod && specialMethods.indexOf(itemMethod) === -1) {
              if (itemMethod.indexOf(this.ctxMethod) === -1) return;
            }
            assert(helper.isRegExp(item.match), "router.match must be a RegExp");
            const match = item.match.exec(this.pathname);
            if (!match) return;
            assert(helper.isArray(item.query), "router.query must be an array");
            const query = {};
            let pathname = item.path || this.pathname;
            item.query.forEach((queryItem, index) => {
              if (/^\d+$/.test(queryItem.name)) {
                const index2 = parseInt(queryItem.name) + 1;
                pathname = pathname.replace(new RegExp(`:${index2}`, "g"), match[index2] || "");
              } else {
                query[queryItem.name] = match[index + 1];
                pathname = pathname.replace(new RegExp(`:${queryItem.name}`, "g"), query[queryItem.name]);
              }
            });
            rule = Object.assign({}, item, { query, path: pathname });
            return true;
          } else {
            const multiMatch = item.match.exec(this.pathname);
            if (!multiMatch) return;
            rule = this.getMatchedRule(item.rules);
          }
        });
        return rule;
      }
      /**
        parse module
       */
      parseModule({ pathname, controllers }) {
        let m = "";
        if (this.modules.length) {
          const pos = pathname.indexOf("/");
          m = pos === -1 ? pathname : pathname.slice(0, pos);
          if (this.modules.indexOf(m) > -1 && m !== "common" && this.options.denyModules.indexOf(m) === -1) {
            pathname = pos === -1 ? "" : pathname.slice(pos + 1);
          } else {
            m = this.options.defaultModule;
          }
          controllers = controllers[m] || {};
        }
        return { m, controllers, pathname };
      }
      /**
        parse controller
       */
      parseController({ pathname, controllers }) {
        let controller = "";
        for (const name in controllers) {
          if (name.indexOf("/") === -1) break;
          if (name === pathname || pathname.indexOf(`${name}/`) === 0) {
            controller = name;
            pathname = pathname.slice(name.length + 1);
            break;
          }
        }
        if (controller === "") {
          const pos = pathname.indexOf("/");
          controller = pos === -1 ? pathname : pathname.slice(0, pos);
          pathname = pos === -1 ? "" : pathname.slice(pos + 1);
        }
        controller = controller || this.options.defaultController;
        return { controller, pathname };
      }
      /**
       * parse action
       */
      parseAction({ pathname, ruleMethod }) {
        let action = "";
        pathname = pathname.split("/");
        action = ruleMethod === "REST" ? this.ctxMethod.toLowerCase() : pathname[0];
        action = action || this.options.defaultAction;
        return { action };
      }
      /**
       * parser item rule
       */
      parseRule(rule) {
        const ruleMethod = rule.method;
        if (ruleMethod === "REDIRECT") {
          if (rule.options && rule.options.statusCode) {
            this.ctx.status = rule.options.statusCode;
          }
          return this.ctx.redirect(rule.path);
        }
        let pathname = rule.path.replace(/^\/|\/$/g, "").replace(/\/{2,}/g, "/");
        let query = rule.query || {};
        const queryPos = pathname.indexOf("?");
        if (queryPos > -1) {
          query = Object.assign(query, querystring.parse(pathname.slice(queryPos + 1)));
          pathname = pathname.slice(0, queryPos);
        }
        for (const name in query) {
          const isUndefind = query[name] === void 0;
          const isEmptyString = helper.isString(query[name]) && query[name].trim() === "";
          const isEmptyArray = helper.isArray(query[name]) && query[name].every((val) => !val);
          if (isUndefind || isEmptyString || isEmptyArray) {
            delete query[name];
          }
        }
        const parseModuleResult = this.parseModule({ pathname, controllers: this.controllers });
        const { m, controllers } = parseModuleResult;
        pathname = parseModuleResult.pathname;
        const parseControllerResult = this.parseController({ pathname, controllers });
        const { controller } = parseControllerResult;
        pathname = parseControllerResult.pathname;
        const { action } = this.parseAction({ pathname, ruleMethod });
        this.ctx.module = m;
        this.ctx.controller = controller;
        this.ctx.action = action;
        this.ctx.param(query);
        debug(`RouterParser: path=${this.ctx.path}, module=${this.ctx.module}, controller=${this.ctx.controller}, action=${this.ctx.action}, query=${JSON.stringify(query)}`);
        return this.next();
      }
      /**
       * parse router
       */
      run() {
        const pathname = this.pathname;
        if (this.options.optimizeHomepageRouter && (pathname === "" || pathname === "/")) {
          this.ctx.module = this.modules.length ? this.options.defaultModule : "";
          this.ctx.controller = this.options.defaultController;
          this.ctx.action = this.options.defaultAction;
          debug(`RouterParser: path=${this.ctx.path}, module=${this.ctx.module}, controller=${this.ctx.controller}, action=${this.ctx.action}`);
          return this.next();
        }
        const rules = this.getRules();
        const matchedRule = this.getMatchedRule(rules);
        if (matchedRule) {
          debug(`matchedRule: ${JSON.stringify(matchedRule)}`);
          return this.parseRule(matchedRule);
        }
        if (this.options.enableDefaultRouter) {
          return this.parseRule({ path: this.pathname });
        }
        return this.next();
      }
    };
    module.exports = Router;
  }
});

// node_modules/.pnpm/isarray@0.0.1/node_modules/isarray/index.js
var require_isarray = __commonJS({
  "node_modules/.pnpm/isarray@0.0.1/node_modules/isarray/index.js"(exports, module) {
    module.exports = Array.isArray || function(arr) {
      return Object.prototype.toString.call(arr) == "[object Array]";
    };
  }
});

// node_modules/.pnpm/path-to-regexp@1.9.0/node_modules/path-to-regexp/index.js
var require_path_to_regexp = __commonJS({
  "node_modules/.pnpm/path-to-regexp@1.9.0/node_modules/path-to-regexp/index.js"(exports, module) {
    var isarray = require_isarray();
    module.exports = pathToRegexp;
    module.exports.parse = parse;
    module.exports.compile = compile;
    module.exports.tokensToFunction = tokensToFunction;
    module.exports.tokensToRegExp = tokensToRegExp;
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      "(\\\\.)",
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      "([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"
    ].join("|"), "g");
    function parse(str, options) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = "";
      var defaultDelimiter = options && options.delimiter || "/";
      var res;
      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        if (escaped) {
          path += escaped[1];
          continue;
        }
        var next = str[index];
        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var modifier = res[6];
        var asterisk = res[7];
        if (path) {
          tokens.push(path);
          path = "";
        }
        var partial = prefix != null && next != null && next !== prefix;
        var repeat = modifier === "+" || modifier === "*";
        var optional = modifier === "?" || modifier === "*";
        var delimiter = prefix || defaultDelimiter;
        var pattern = capture || group;
        var prevText = prefix || (typeof tokens[tokens.length - 1] === "string" ? tokens[tokens.length - 1] : "");
        tokens.push({
          name: name || key++,
          prefix: prefix || "",
          delimiter,
          optional,
          repeat,
          partial,
          asterisk: !!asterisk,
          pattern: pattern ? escapeGroup(pattern) : asterisk ? ".*" : restrictBacktrack(delimiter, prevText)
        });
      }
      if (index < str.length) {
        path += str.substr(index);
      }
      if (path) {
        tokens.push(path);
      }
      return tokens;
    }
    function restrictBacktrack(delimiter, prevText) {
      if (!prevText || prevText.indexOf(delimiter) > -1) {
        return "[^" + escapeString(delimiter) + "]+?";
      }
      return escapeString(prevText) + "|(?:(?!" + escapeString(prevText) + ")[^" + escapeString(delimiter) + "])+?";
    }
    function compile(str, options) {
      return tokensToFunction(parse(str, options), options);
    }
    function encodeURIComponentPretty(str) {
      return encodeURI(str).replace(/[\/?#]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    function encodeAsterisk(str) {
      return encodeURI(str).replace(/[?#]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    function tokensToFunction(tokens, options) {
      var matches = new Array(tokens.length);
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === "object") {
          matches[i] = new RegExp("^(?:" + tokens[i].pattern + ")$", flags(options));
        }
      }
      return function(obj, opts) {
        var path = "";
        var data = obj || {};
        var options2 = opts || {};
        var encode = options2.pretty ? encodeURIComponentPretty : encodeURIComponent;
        for (var i2 = 0; i2 < tokens.length; i2++) {
          var token = tokens[i2];
          if (typeof token === "string") {
            path += token;
            continue;
          }
          var value = data[token.name];
          var segment;
          if (value == null) {
            if (token.optional) {
              if (token.partial) {
                path += token.prefix;
              }
              continue;
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined');
            }
          }
          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + "`");
            }
            if (value.length === 0) {
              if (token.optional) {
                continue;
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty');
              }
            }
            for (var j = 0; j < value.length; j++) {
              segment = encode(value[j]);
              if (!matches[i2].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + "`");
              }
              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }
            continue;
          }
          segment = token.asterisk ? encodeAsterisk(value) : encode(value);
          if (!matches[i2].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"');
          }
          path += token.prefix + segment;
        }
        return path;
      };
    }
    function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, "\\$1");
    }
    function escapeGroup(group) {
      return group.replace(/([=!:$\/()])/g, "\\$1");
    }
    function attachKeys(re, keys) {
      re.keys = keys;
      return re;
    }
    function flags(options) {
      return options && options.sensitive ? "" : "i";
    }
    function regexpToRegexp(path, keys) {
      var groups = path.source.match(/\((?!\?)/g);
      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            partial: false,
            asterisk: false,
            pattern: null
          });
        }
      }
      return attachKeys(path, keys);
    }
    function arrayToRegexp(path, keys, options) {
      var parts = [];
      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }
      var regexp = new RegExp("(?:" + parts.join("|") + ")", flags(options));
      return attachKeys(regexp, keys);
    }
    function stringToRegexp(path, keys, options) {
      return tokensToRegExp(parse(path, options), keys, options);
    }
    function tokensToRegExp(tokens, keys, options) {
      if (!isarray(keys)) {
        options = /** @type {!Object} */
        keys || options;
        keys = [];
      }
      options = options || {};
      var strict = options.strict;
      var end = options.end !== false;
      var route = "";
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === "string") {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = "(?:" + token.pattern + ")";
          keys.push(token);
          if (token.repeat) {
            capture += "(?:" + prefix + capture + ")*";
          }
          if (token.optional) {
            if (!token.partial) {
              capture = "(?:" + prefix + "(" + capture + "))?";
            } else {
              capture = prefix + "(" + capture + ")?";
            }
          } else {
            capture = prefix + "(" + capture + ")";
          }
          route += capture;
        }
      }
      var delimiter = escapeString(options.delimiter || "/");
      var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;
      if (!strict) {
        route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + "(?:" + delimiter + "(?=$))?";
      }
      if (end) {
        route += "$";
      } else {
        route += strict && endsWithDelimiter ? "" : "(?=" + delimiter + "|$)";
      }
      return attachKeys(new RegExp("^" + route, flags(options)), keys);
    }
    function pathToRegexp(path, keys, options) {
      if (!isarray(keys)) {
        options = /** @type {!Object} */
        keys || options;
        keys = [];
      }
      options = options || {};
      if (path instanceof RegExp) {
        return regexpToRegexp(
          path,
          /** @type {!Array} */
          keys
        );
      }
      if (isarray(path)) {
        return arrayToRegexp(
          /** @type {!Array} */
          path,
          /** @type {!Array} */
          keys,
          options
        );
      }
      return stringToRegexp(
        /** @type {string} */
        path,
        /** @type {!Array} */
        keys,
        options
      );
    }
  }
});

// packages/think-router/index.js
var require_think_router = __commonJS({
  "packages/think-router/index.js"(exports, module) {
    var Router = require_router();
    var helper = require_helper();
    var pathToRegexp = require_path_to_regexp();
    var defaultOptions = {
      defaultModule: "home",
      // default module name, is enable in multi module mode
      defaultController: "index",
      // default controller name
      defaultAction: "index",
      // default action name
      prefix: [],
      // url prefix
      suffix: [".html"],
      // url suffix
      enableDefaultRouter: true,
      optimizeHomepageRouter: true,
      subdomainOffset: 2,
      subdomain: {},
      // subdomain
      denyModules: []
      // deny module, enable in multi module mode
    };
    var formatRule = (rule) => {
      const query = [];
      const match = pathToRegexp(rule[0], query);
      if (rule.length === 2 && rule[1].toUpperCase() === "REST") {
        rule[2] = rule[1];
        rule[1] = null;
      }
      return {
        match,
        path: rule[1],
        method: rule[2] && rule[2].toUpperCase(),
        options: rule[3] || {},
        query
      };
    };
    var formatRouters = (routers) => {
      if (helper.isArray(routers)) {
        return routers.map((item) => {
          if (item.isFormatted) return item;
          if (item.rules) {
            item.match = pathToRegexp(item.match);
            item.rules = item.rules.map((rule) => {
              return formatRule(rule);
            });
          } else {
            item = formatRule(item);
          }
          item.isFormatted = 1;
          return item;
        });
      }
      for (const m in routers) {
        if (routers[m].isFormatted) continue;
        if (routers[m].match) {
          routers[m].match = pathToRegexp(routers[m].match);
        }
        routers[m].rules = formatRouters(routers[m].rules);
        routers[m].isFormatted = 1;
      }
      return routers;
    };
    module.exports = function parseRouter(options, app) {
      options = Object.assign({}, defaultOptions, options);
      if (options.subdomainOffset) {
        app.subdomainOffset = options.subdomainOffset;
      }
      if (helper.isArray(options.subdomain)) {
        const subdomain = {};
        options.subdomain.forEach((item) => {
          subdomain[item] = item;
        });
        options.subdomain = subdomain;
      }
      app.on("routerChange", (routers) => {
        app.routers = formatRouters(routers);
      });
      app.once("appReady", () => {
        app.routers = formatRouters(app.routers);
      });
      return function router(ctx, next) {
        const instance = new Router(ctx, next, options);
        return instance.run();
      };
    };
  }
});

// packages/think-controller/index.js
var require_think_controller = __commonJS({
  "packages/think-controller/index.js"(exports, module) {
    var helper = require_helper();
    var defaultOptions = {
      emptyModule: "",
      emptyController: "",
      preSetStatus: 200
    };
    function invokeController(options, app) {
      options = Object.assign({}, defaultOptions, options);
      return (ctx, next) => {
        const isMultiModule = app.modules.length;
        let controllers = app.controllers || {};
        if (isMultiModule && !ctx.module || !ctx.controller || !ctx.action) {
          return ctx.throw(404);
        }
        if (controllers && isMultiModule) {
          if (!controllers[ctx.module]) {
            ctx.module = options.emptyModule;
          }
          controllers = controllers[ctx.module] || {};
        }
        let Controller = controllers[ctx.controller];
        if (helper.isEmpty(Controller)) {
          const emptyController = options.emptyController;
          if (emptyController && controllers[emptyController]) {
            Controller = controllers[emptyController];
          } else {
            return next();
          }
        }
        const instance = new Controller(ctx);
        let promise = Promise.resolve();
        if (instance.__before) {
          promise = Promise.resolve(instance.__before());
        }
        return promise.then((data) => {
          if (data === false) return false;
          let method = `${ctx.action}Action`;
          if (!instance[method]) {
            method = "__call";
          }
          if (instance[method]) {
            if (ctx.body === void 0 && options.preSetStatus) {
              ctx.status = options.preSetStatus;
            }
            return instance[method]();
          }
        }).then((data) => {
          if (data === false) return false;
          if (instance.__after) return instance.__after();
        }).then((data) => {
          if (data !== false) return next();
        });
      };
    }
    module.exports = invokeController;
  }
});

// packages/think-logic/index.js
var require_think_logic = __commonJS({
  "packages/think-logic/index.js"(exports, module) {
    var helper = require_helper();
    function invokeLogic(options, app) {
      return (ctx, next) => {
        const isMultiModule = app.modules.length;
        let logics = app.logics;
        if (isMultiModule && !ctx.module || !ctx.controller || !ctx.action) {
          return ctx.throw(404);
        }
        if (logics && isMultiModule) {
          logics = logics[ctx.module];
        }
        if (helper.isEmpty(logics)) {
          return next();
        }
        const Logic = logics[ctx.controller];
        if (helper.isEmpty(Logic)) {
          return next();
        }
        const instance = new Logic(ctx);
        let promise = Promise.resolve();
        if (instance.__before) {
          promise = Promise.resolve(instance.__before());
        }
        return promise.then((data) => {
          if (data === false) return false;
          let method = `${ctx.action}Action`;
          if (!instance[method]) {
            method = "__call";
          }
          if (instance[method]) {
            const ret = instance[method]();
            let allowMethods = instance.allowMethods;
            if (!helper.isEmpty(allowMethods)) {
              if (helper.isString(allowMethods)) {
                allowMethods = allowMethods.split(",").map((e) => {
                  return e.trim().toUpperCase();
                });
              }
              if (allowMethods.indexOf(ctx.method) === -1) {
                return ctx.fail(ctx.config("validateDefaultErrno"), "METHOD_NOT_ALLOWED");
              }
            }
            return ret;
          }
        }).then((data) => {
          if (data === false) return false;
          if (instance.__after) {
            return instance.__after();
          } else {
            const rules = helper.extend({}, instance.scope, instance.rules);
            if (!helper.isEmpty(rules) && !instance.validate(rules)) {
              return ctx.fail(ctx.config("validateDefaultErrno"), instance.validateErrors);
            }
          }
        }).then((data) => {
          if (data !== false) {
            return next();
          }
        });
      };
    }
    module.exports = invokeLogic;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/assertString.js
var require_assertString = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/assertString.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = assertString;
    function assertString(input) {
      if (input === void 0 || input === null) throw new TypeError("Expected a string but received a ".concat(input));
      if (input.constructor.name !== "String") throw new TypeError("Expected a string but received a ".concat(input.constructor.name));
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toDate.js
var require_toDate = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toDate.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toDate;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function toDate(date) {
      (0, _assertString.default)(date);
      date = Date.parse(date);
      return !isNaN(date) ? new Date(date) : null;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/nullUndefinedCheck.js
var require_nullUndefinedCheck = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/nullUndefinedCheck.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isNullOrUndefined;
    function isNullOrUndefined(value) {
      return value === null || value === void 0;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/alpha.js
var require_alpha = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/alpha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.farsiLocales = exports.englishLocales = exports.dotDecimal = exports.decimal = exports.commaDecimal = exports.bengaliLocales = exports.arabicLocales = exports.alphanumeric = exports.alpha = void 0;
    var alpha = exports.alpha = {
      "en-US": /^[A-Z]+$/i,
      "az-AZ": /^[A-VXYZÇƏĞİıÖŞÜ]+$/i,
      "bg-BG": /^[А-Я]+$/i,
      "cs-CZ": /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
      "da-DK": /^[A-ZÆØÅ]+$/i,
      "de-DE": /^[A-ZÄÖÜß]+$/i,
      "el-GR": /^[Α-ώ]+$/i,
      "es-ES": /^[A-ZÁÉÍÑÓÚÜ]+$/i,
      "fa-IR": /^[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+$/i,
      "fi-FI": /^[A-ZÅÄÖ]+$/i,
      "fr-FR": /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
      "it-IT": /^[A-ZÀÉÈÌÎÓÒÙ]+$/i,
      "ja-JP": /^[ぁ-んァ-ヶｦ-ﾟ一-龠ー・。、]+$/i,
      "nb-NO": /^[A-ZÆØÅ]+$/i,
      "nl-NL": /^[A-ZÁÉËÏÓÖÜÚ]+$/i,
      "nn-NO": /^[A-ZÆØÅ]+$/i,
      "hu-HU": /^[A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
      "pl-PL": /^[A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
      "pt-PT": /^[A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
      "ru-RU": /^[А-ЯЁ]+$/i,
      "kk-KZ": /^[А-ЯЁ\u04D8\u04B0\u0406\u04A2\u0492\u04AE\u049A\u04E8\u04BA]+$/i,
      "sl-SI": /^[A-ZČĆĐŠŽ]+$/i,
      "sk-SK": /^[A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
      "sr-RS@latin": /^[A-ZČĆŽŠĐ]+$/i,
      "sr-RS": /^[А-ЯЂЈЉЊЋЏ]+$/i,
      "sv-SE": /^[A-ZÅÄÖ]+$/i,
      "th-TH": /^[ก-๐\s]+$/i,
      "tr-TR": /^[A-ZÇĞİıÖŞÜ]+$/i,
      "uk-UA": /^[А-ЩЬЮЯЄIЇҐі]+$/i,
      "vi-VN": /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i,
      "ko-KR": /^[ㄱ-ㅎㅏ-ㅣ가-힣]*$/,
      "ku-IQ": /^[ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
      ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
      he: /^[א-ת]+$/,
      fa: /^['آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی']+$/i,
      bn: /^['ঀঁংঃঅআইঈউঊঋঌএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ়ঽািীুূৃৄেৈোৌ্ৎৗড়ঢ়য়ৠৡৢৣৰৱ৲৳৴৵৶৷৸৹৺৻']+$/,
      eo: /^[ABCĈD-GĜHĤIJĴK-PRSŜTUŬVZ]+$/i,
      "hi-IN": /^[\u0900-\u0961]+[\u0972-\u097F]*$/i,
      "si-LK": /^[\u0D80-\u0DFF]+$/,
      "ta-IN": /^[\u0B80-\u0BFF]+$/i,
      "te-IN": /^[\u0C00-\u0C7F]+$/i,
      "kn-IN": /^[\u0C80-\u0CFF]+$/i,
      "ml-IN": /^[\u0D00-\u0D7F]+$/i,
      "gu-IN": /^[\u0A80-\u0AFF]+$/i,
      "pa-IN": /^[\u0A00-\u0A7F]+$/i,
      "or-IN": /^[\u0B00-\u0B7F]+$/i
    };
    var alphanumeric = exports.alphanumeric = {
      "en-US": /^[0-9A-Z]+$/i,
      "az-AZ": /^[0-9A-VXYZÇƏĞİıÖŞÜ]+$/i,
      "bg-BG": /^[0-9А-Я]+$/i,
      "cs-CZ": /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
      "da-DK": /^[0-9A-ZÆØÅ]+$/i,
      "de-DE": /^[0-9A-ZÄÖÜß]+$/i,
      "el-GR": /^[0-9Α-ω]+$/i,
      "es-ES": /^[0-9A-ZÁÉÍÑÓÚÜ]+$/i,
      "fi-FI": /^[0-9A-ZÅÄÖ]+$/i,
      "fr-FR": /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
      "it-IT": /^[0-9A-ZÀÉÈÌÎÓÒÙ]+$/i,
      "ja-JP": /^[0-9０-９ぁ-んァ-ヶｦ-ﾟ一-龠ー・。、]+$/i,
      "hu-HU": /^[0-9A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
      "nb-NO": /^[0-9A-ZÆØÅ]+$/i,
      "nl-NL": /^[0-9A-ZÁÉËÏÓÖÜÚ]+$/i,
      "nn-NO": /^[0-9A-ZÆØÅ]+$/i,
      "pl-PL": /^[0-9A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
      "pt-PT": /^[0-9A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
      "ru-RU": /^[0-9А-ЯЁ]+$/i,
      "kk-KZ": /^[0-9А-ЯЁ\u04D8\u04B0\u0406\u04A2\u0492\u04AE\u049A\u04E8\u04BA]+$/i,
      "sl-SI": /^[0-9A-ZČĆĐŠŽ]+$/i,
      "sk-SK": /^[0-9A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
      "sr-RS@latin": /^[0-9A-ZČĆŽŠĐ]+$/i,
      "sr-RS": /^[0-9А-ЯЂЈЉЊЋЏ]+$/i,
      "sv-SE": /^[0-9A-ZÅÄÖ]+$/i,
      "th-TH": /^[ก-๙\s]+$/i,
      "tr-TR": /^[0-9A-ZÇĞİıÖŞÜ]+$/i,
      "uk-UA": /^[0-9А-ЩЬЮЯЄIЇҐі]+$/i,
      "ko-KR": /^[0-9ㄱ-ㅎㅏ-ㅣ가-힣]*$/,
      "ku-IQ": /^[٠١٢٣٤٥٦٧٨٩0-9ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
      "vi-VN": /^[0-9A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i,
      ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
      he: /^[0-9א-ת]+$/,
      fa: /^['0-9آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی۱۲۳۴۵۶۷۸۹۰']+$/i,
      bn: /^['ঀঁংঃঅআইঈউঊঋঌএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ়ঽািীুূৃৄেৈোৌ্ৎৗড়ঢ়য়ৠৡৢৣ০১২৩৪৫৬৭৮৯ৰৱ৲৳৴৵৶৷৸৹৺৻']+$/,
      eo: /^[0-9ABCĈD-GĜHĤIJĴK-PRSŜTUŬVZ]+$/i,
      "hi-IN": /^[\u0900-\u0963]+[\u0966-\u097F]*$/i,
      "si-LK": /^[0-9\u0D80-\u0DFF]+$/,
      "ta-IN": /^[0-9\u0B80-\u0BFF.]+$/i,
      "te-IN": /^[0-9\u0C00-\u0C7F.]+$/i,
      "kn-IN": /^[0-9\u0C80-\u0CFF.]+$/i,
      "ml-IN": /^[0-9\u0D00-\u0D7F.]+$/i,
      "gu-IN": /^[0-9\u0A80-\u0AFF.]+$/i,
      "pa-IN": /^[0-9\u0A00-\u0A7F.]+$/i,
      "or-IN": /^[0-9\u0B00-\u0B7F.]+$/i
    };
    var decimal = exports.decimal = {
      "en-US": ".",
      ar: "\u066B"
    };
    var englishLocales = exports.englishLocales = ["AU", "GB", "HK", "IN", "NZ", "ZA", "ZM"];
    for (i = 0; i < englishLocales.length; i++) {
      locale = "en-".concat(englishLocales[i]);
      alpha[locale] = alpha["en-US"];
      alphanumeric[locale] = alphanumeric["en-US"];
      decimal[locale] = decimal["en-US"];
    }
    var locale;
    var i;
    var arabicLocales = exports.arabicLocales = ["AE", "BH", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA", "QM", "QA", "SA", "SD", "SY", "TN", "YE"];
    for (_i = 0; _i < arabicLocales.length; _i++) {
      _locale = "ar-".concat(arabicLocales[_i]);
      alpha[_locale] = alpha.ar;
      alphanumeric[_locale] = alphanumeric.ar;
      decimal[_locale] = decimal.ar;
    }
    var _locale;
    var _i;
    var farsiLocales = exports.farsiLocales = ["IR", "AF"];
    for (_i2 = 0; _i2 < farsiLocales.length; _i2++) {
      _locale2 = "fa-".concat(farsiLocales[_i2]);
      alphanumeric[_locale2] = alphanumeric.fa;
      decimal[_locale2] = decimal.ar;
    }
    var _locale2;
    var _i2;
    var bengaliLocales = exports.bengaliLocales = ["BD", "IN"];
    for (_i3 = 0; _i3 < bengaliLocales.length; _i3++) {
      _locale3 = "bn-".concat(bengaliLocales[_i3]);
      alpha[_locale3] = alpha.bn;
      alphanumeric[_locale3] = alphanumeric.bn;
      decimal[_locale3] = decimal["en-US"];
    }
    var _locale3;
    var _i3;
    var dotDecimal = exports.dotDecimal = ["ar-EG", "ar-LB", "ar-LY"];
    var commaDecimal = exports.commaDecimal = ["bg-BG", "cs-CZ", "da-DK", "de-DE", "el-GR", "en-ZM", "eo", "es-ES", "fr-CA", "fr-FR", "gu-IN", "hi-IN", "hu-HU", "id-ID", "it-IT", "kk-KZ", "kn-IN", "ku-IQ", "ml-IN", "nb-NO", "nl-NL", "nn-NO", "or-IN", "pa-IN", "pl-PL", "pt-PT", "ru-RU", "si-LK", "sl-SI", "sr-RS", "sr-RS@latin", "sv-SE", "ta-IN", "te-IN", "tr-TR", "uk-UA", "vi-VN"];
    for (_i4 = 0; _i4 < dotDecimal.length; _i4++) {
      decimal[dotDecimal[_i4]] = decimal["en-US"];
    }
    var _i4;
    for (_i5 = 0; _i5 < commaDecimal.length; _i5++) {
      decimal[commaDecimal[_i5]] = ",";
    }
    var _i5;
    alpha["fr-CA"] = alpha["fr-FR"];
    alphanumeric["fr-CA"] = alphanumeric["fr-FR"];
    alpha["pt-BR"] = alpha["pt-PT"];
    alphanumeric["pt-BR"] = alphanumeric["pt-PT"];
    decimal["pt-BR"] = decimal["pt-PT"];
    alpha["pl-Pl"] = alpha["pl-PL"];
    alphanumeric["pl-Pl"] = alphanumeric["pl-PL"];
    decimal["pl-Pl"] = decimal["pl-PL"];
    alpha["fa-AF"] = alpha.fa;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isFloat.js
var require_isFloat = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isFloat.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFloat;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _nullUndefinedCheck = _interopRequireDefault(require_nullUndefinedCheck());
    var _alpha = require_alpha();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isFloat(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var float = new RegExp("^(?:[-+])?(?:[0-9]+)?(?:\\".concat(options.locale ? _alpha.decimal[options.locale] : ".", "[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?$"));
      if (str === "" || str === "." || str === "," || str === "-" || str === "+") {
        return false;
      }
      var value = parseFloat(str.replace(",", "."));
      return float.test(str) && (!options.hasOwnProperty("min") || (0, _nullUndefinedCheck.default)(options.min) || value >= options.min) && (!options.hasOwnProperty("max") || (0, _nullUndefinedCheck.default)(options.max) || value <= options.max) && (!options.hasOwnProperty("lt") || (0, _nullUndefinedCheck.default)(options.lt) || value < options.lt) && (!options.hasOwnProperty("gt") || (0, _nullUndefinedCheck.default)(options.gt) || value > options.gt);
    }
    var locales = exports.locales = Object.keys(_alpha.decimal);
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toFloat.js
var require_toFloat = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toFloat.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toFloat;
    var _isFloat = _interopRequireDefault(require_isFloat());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function toFloat(str) {
      if (!(0, _isFloat.default)(str)) return NaN;
      return parseFloat(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toInt.js
var require_toInt = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toInt.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toInt;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function toInt(str, radix) {
      (0, _assertString.default)(str);
      return parseInt(str, radix || 10);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toBoolean.js
var require_toBoolean = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/toBoolean.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toBoolean;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function toBoolean(str, strict) {
      (0, _assertString.default)(str);
      if (strict) {
        return str === "1" || /^true$/i.test(str);
      }
      return str !== "0" && !/^false$/i.test(str) && str !== "";
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/equals.js
var require_equals = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/equals.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = equals;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function equals(str, comparison) {
      (0, _assertString.default)(str);
      return str === comparison;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/toString.js
var require_toString = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/toString.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toString2;
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function toString2(input) {
      if (_typeof(input) === "object" && input !== null) {
        if (typeof input.toString === "function") {
          input = input.toString();
        } else {
          input = "[object Object]";
        }
      } else if (input === null || typeof input === "undefined" || isNaN(input) && !input.length) {
        input = "";
      }
      return String(input);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/merge.js
var require_merge = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/merge.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = merge;
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function merge() {
      var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      var defaults = arguments.length > 1 ? arguments[1] : void 0;
      if (_typeof(obj) !== "object" || obj === null) {
        obj = {};
      }
      for (var key in defaults) {
        if (typeof obj[key] === "undefined") {
          obj[key] = defaults[key];
        }
      }
      return obj;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/contains.js
var require_contains = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/contains.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = contains;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toString = _interopRequireDefault(require_toString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var defaultContainsOptions = {
      ignoreCase: false,
      minOccurrences: 1
    };
    function contains(str, elem, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultContainsOptions);
      if (options.ignoreCase) {
        return str.toLowerCase().split((0, _toString.default)(elem).toLowerCase()).length > options.minOccurrences;
      }
      return str.split((0, _toString.default)(elem)).length > options.minOccurrences;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/matches.js
var require_matches = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/matches.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = matches;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function matches(str, pattern, modifiers) {
      (0, _assertString.default)(str);
      if (Object.prototype.toString.call(pattern) !== "[object RegExp]") {
        pattern = new RegExp(pattern, modifiers);
      }
      return !!str.match(pattern);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/checkHost.js
var require_checkHost = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/checkHost.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = checkHost;
    function isRegExp(obj) {
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    }
    function checkHost(host, matches) {
      for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        if (host === match || isRegExp(match) && match.test(host)) {
          return true;
        }
      }
      return false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isByteLength.js
var require_isByteLength = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isByteLength.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isByteLength;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function isByteLength(str, options) {
      (0, _assertString.default)(str);
      var min;
      var max;
      if (_typeof(options) === "object") {
        min = options.min || 0;
        max = options.max;
      } else {
        min = arguments[1];
        max = arguments[2];
      }
      var len = encodeURI(str).split(/%..|./).length - 1;
      return len >= min && (typeof max === "undefined" || len <= max);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isFQDN.js
var require_isFQDN = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isFQDN.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFQDN;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var default_fqdn_options = {
      require_tld: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_numeric_tld: false,
      allow_wildcard: false,
      ignore_max_length: false
    };
    function isFQDN(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_fqdn_options);
      if (options.allow_trailing_dot && str[str.length - 1] === ".") {
        str = str.substring(0, str.length - 1);
      }
      if (options.allow_wildcard === true && str.indexOf("*.") === 0) {
        str = str.substring(2);
      }
      var parts = str.split(".");
      var tld = parts[parts.length - 1];
      if (options.require_tld) {
        if (parts.length < 2) {
          return false;
        }
        if (!options.allow_numeric_tld && !/^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
          return false;
        }
        if (/\s/.test(tld)) {
          return false;
        }
      }
      if (!options.allow_numeric_tld && /^\d+$/.test(tld)) {
        return false;
      }
      return parts.every(function(part) {
        if (part.length > 63 && !options.ignore_max_length) {
          return false;
        }
        if (!/^[a-z_\u00a1-\uffff0-9-]+$/i.test(part)) {
          return false;
        }
        if (/[\uff01-\uff5e]/.test(part)) {
          return false;
        }
        if (/^-|-$/.test(part)) {
          return false;
        }
        if (!options.allow_underscores && /_/.test(part)) {
          return false;
        }
        return true;
      });
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIP.js
var require_isIP = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIP.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIP;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    var IPv4AddressFormat = "(".concat(IPv4SegmentFormat, "[.]){3}").concat(IPv4SegmentFormat);
    var IPv4AddressRegExp = new RegExp("^".concat(IPv4AddressFormat, "$"));
    var IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
    var IPv6AddressRegExp = new RegExp("^(" + "(?:".concat(IPv6SegmentFormat, ":){7}(?:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){6}(?:").concat(IPv4AddressFormat, "|:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){5}(?::").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,2}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){4}(?:(:").concat(IPv6SegmentFormat, "){0,1}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,3}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){3}(?:(:").concat(IPv6SegmentFormat, "){0,2}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,4}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){2}(?:(:").concat(IPv6SegmentFormat, "){0,3}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,5}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){1}(?:(:").concat(IPv6SegmentFormat, "){0,4}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,6}|:)|") + "(?::((?::".concat(IPv6SegmentFormat, "){0,5}:").concat(IPv4AddressFormat, "|(?::").concat(IPv6SegmentFormat, "){1,7}|:))") + ")(%[0-9a-zA-Z.]{1,})?$");
    function isIP(ipAddress) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(ipAddress);
      var version = (_typeof(options) === "object" ? options.version : arguments[1]) || "";
      if (!version) {
        return isIP(ipAddress, {
          version: 4
        }) || isIP(ipAddress, {
          version: 6
        });
      }
      if (version.toString() === "4") {
        return IPv4AddressRegExp.test(ipAddress);
      }
      if (version.toString() === "6") {
        return IPv6AddressRegExp.test(ipAddress);
      }
      return false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEmail.js
var require_isEmail = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEmail.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEmail;
    var _assertString = _interopRequireDefault(require_assertString());
    var _checkHost = _interopRequireDefault(require_checkHost());
    var _isByteLength = _interopRequireDefault(require_isByteLength());
    var _isFQDN = _interopRequireDefault(require_isFQDN());
    var _isIP = _interopRequireDefault(require_isIP());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var default_email_options = {
      allow_display_name: false,
      allow_underscores: false,
      require_display_name: false,
      allow_utf8_local_part: true,
      require_tld: true,
      blacklisted_chars: "",
      ignore_max_length: false,
      host_blacklist: [],
      host_whitelist: []
    };
    var splitNameAddress = /^([^\x00-\x1F\x7F-\x9F\cX]+)</i;
    var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
    var gmailUserPart = /^[a-z\d]+$/;
    var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
    var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A1-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
    var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
    var defaultMaxEmailLength = 254;
    function validateDisplayName(display_name) {
      var display_name_without_quotes = display_name.replace(/^"(.+)"$/, "$1");
      if (!display_name_without_quotes.trim()) {
        return false;
      }
      var contains_illegal = /[\.";<>]/.test(display_name_without_quotes);
      if (contains_illegal) {
        if (display_name_without_quotes === display_name) {
          return false;
        }
        var all_start_with_back_slash = display_name_without_quotes.split('"').length === display_name_without_quotes.split('\\"').length;
        if (!all_start_with_back_slash) {
          return false;
        }
      }
      return true;
    }
    function isEmail(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_email_options);
      if (options.require_display_name || options.allow_display_name) {
        var display_email = str.match(splitNameAddress);
        if (display_email) {
          var display_name = display_email[1];
          str = str.replace(display_name, "").replace(/(^<|>$)/g, "");
          if (display_name.endsWith(" ")) {
            display_name = display_name.slice(0, -1);
          }
          if (!validateDisplayName(display_name)) {
            return false;
          }
        } else if (options.require_display_name) {
          return false;
        }
      }
      if (!options.ignore_max_length && str.length > defaultMaxEmailLength) {
        return false;
      }
      var parts = str.split("@");
      var domain = parts.pop();
      var lower_domain = domain.toLowerCase();
      if (options.host_blacklist.length > 0 && (0, _checkHost.default)(lower_domain, options.host_blacklist)) {
        return false;
      }
      if (options.host_whitelist.length > 0 && !(0, _checkHost.default)(lower_domain, options.host_whitelist)) {
        return false;
      }
      var user = parts.join("@");
      if (options.domain_specific_validation && (lower_domain === "gmail.com" || lower_domain === "googlemail.com")) {
        user = user.toLowerCase();
        var username = user.split("+")[0];
        if (!(0, _isByteLength.default)(username.replace(/\./g, ""), {
          min: 6,
          max: 30
        })) {
          return false;
        }
        var _user_parts = username.split(".");
        for (var i = 0; i < _user_parts.length; i++) {
          if (!gmailUserPart.test(_user_parts[i])) {
            return false;
          }
        }
      }
      if (options.ignore_max_length === false && (!(0, _isByteLength.default)(user, {
        max: 64
      }) || !(0, _isByteLength.default)(domain, {
        max: 254
      }))) {
        return false;
      }
      if (!(0, _isFQDN.default)(domain, {
        require_tld: options.require_tld,
        ignore_max_length: options.ignore_max_length,
        allow_underscores: options.allow_underscores
      })) {
        if (!options.allow_ip_domain) {
          return false;
        }
        if (!(0, _isIP.default)(domain)) {
          if (!domain.startsWith("[") || !domain.endsWith("]")) {
            return false;
          }
          var noBracketdomain = domain.slice(1, -1);
          if (noBracketdomain.length === 0 || !(0, _isIP.default)(noBracketdomain)) {
            return false;
          }
        }
      }
      if (options.blacklisted_chars) {
        if (user.search(new RegExp("[".concat(options.blacklisted_chars, "]+"), "g")) !== -1) return false;
      }
      if (user[0] === '"' && user[user.length - 1] === '"') {
        user = user.slice(1, user.length - 1);
        return options.allow_utf8_local_part ? quotedEmailUserUtf8.test(user) : quotedEmailUser.test(user);
      }
      var pattern = options.allow_utf8_local_part ? emailUserUtf8Part : emailUserPart;
      var user_parts = user.split(".");
      for (var _i = 0; _i < user_parts.length; _i++) {
        if (!pattern.test(user_parts[_i])) {
          return false;
        }
      }
      return true;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/includesString.js
var require_includesString = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/includesString.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var includes = function includes2(str, val) {
      return str.indexOf(val) !== -1;
    };
    var _default = exports.default = includes;
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isURL.js
var require_isURL = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isURL.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isURL;
    var _assertString = _interopRequireDefault(require_assertString());
    var _checkHost = _interopRequireDefault(require_checkHost());
    var _includesString = _interopRequireDefault(require_includesString());
    var _isFQDN = _interopRequireDefault(require_isFQDN());
    var _isIP = _interopRequireDefault(require_isIP());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _slicedToArray(r, e) {
      return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
        var e, n, i, u, a = [], f = true, o = false;
        try {
          if (i = (t = t.call(r)).next, 0 === l) {
            if (Object(t) !== t) return;
            f = false;
          } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
        } catch (r2) {
          o = true, n = r2;
        } finally {
          try {
            if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
          } finally {
            if (o) throw n;
          }
        }
        return a;
      }
    }
    function _arrayWithHoles(r) {
      if (Array.isArray(r)) return r;
    }
    var default_url_options = {
      protocols: ["http", "https", "ftp"],
      require_tld: true,
      require_protocol: false,
      require_host: true,
      require_port: false,
      require_valid_protocol: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
      allow_fragments: true,
      allow_query_components: true,
      validate_length: true,
      max_allowed_length: 2084
    };
    var wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;
    function isURL(url, options) {
      (0, _assertString.default)(url);
      if (!url || /[\s<>]/.test(url)) {
        return false;
      }
      if (url.indexOf("mailto:") === 0) {
        return false;
      }
      options = (0, _merge.default)(options, default_url_options);
      if (options.validate_length && url.length > options.max_allowed_length) {
        return false;
      }
      if (!options.allow_fragments && (0, _includesString.default)(url, "#")) {
        return false;
      }
      if (!options.allow_query_components && ((0, _includesString.default)(url, "?") || (0, _includesString.default)(url, "&"))) {
        return false;
      }
      var protocol, auth, host, hostname, port, port_str, split, ipv6;
      split = url.split("#");
      url = split.shift();
      split = url.split("?");
      url = split.shift();
      var protocol_match = url.match(/^([a-z][a-z0-9+\-.]*):/i);
      var had_explicit_protocol = false;
      var cleanUpProtocol = function cleanUpProtocol2(potential_protocol2) {
        had_explicit_protocol = true;
        protocol = potential_protocol2.toLowerCase();
        if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
          return false;
        }
        return url.substring(protocol_match[0].length);
      };
      if (protocol_match) {
        var potential_protocol = protocol_match[1];
        var after_colon = url.substring(protocol_match[0].length);
        var starts_with_slashes = after_colon.slice(0, 2) === "//";
        if (!starts_with_slashes) {
          var first_slash_position = after_colon.indexOf("/");
          var before_slash = first_slash_position === -1 ? after_colon : after_colon.substring(0, first_slash_position);
          var at_position = before_slash.indexOf("@");
          if (at_position !== -1) {
            var before_at = before_slash.substring(0, at_position);
            var valid_auth_regex = /^[a-zA-Z0-9\-_.%:]*$/;
            var is_valid_auth = valid_auth_regex.test(before_at);
            var has_encoded_content = /%[0-9a-fA-F]{2}/.test(before_at);
            if (is_valid_auth && !has_encoded_content) {
              if (options.require_protocol) {
                return false;
              }
            } else {
              url = cleanUpProtocol(potential_protocol);
              if (url === false) {
                return false;
              }
            }
          } else {
            var looks_like_port = /^[0-9]/.test(after_colon);
            if (looks_like_port) {
              if (options.require_protocol) {
                return false;
              }
            } else {
              url = cleanUpProtocol(potential_protocol);
              if (url === false) {
                return false;
              }
            }
          }
        } else {
          url = cleanUpProtocol(potential_protocol);
          if (url === false) {
            return false;
          }
        }
      } else if (options.require_protocol) {
        return false;
      }
      if (url.slice(0, 2) === "//") {
        if (!had_explicit_protocol && !options.allow_protocol_relative_urls) {
          return false;
        }
        url = url.slice(2);
      }
      if (url === "") {
        return false;
      }
      split = url.split("/");
      url = split.shift();
      if (url === "" && !options.require_host) {
        return true;
      }
      split = url.split("@");
      if (split.length > 1) {
        if (options.disallow_auth) {
          return false;
        }
        if (split[0] === "") {
          return false;
        }
        auth = split.shift();
        if (auth.indexOf(":") >= 0 && auth.split(":").length > 2) {
          return false;
        }
        var _auth$split = auth.split(":"), _auth$split2 = _slicedToArray(_auth$split, 2), user = _auth$split2[0], password = _auth$split2[1];
        if (user === "" && password === "") {
          return false;
        }
      }
      hostname = split.join("@");
      port_str = null;
      ipv6 = null;
      var ipv6_match = hostname.match(wrapped_ipv6);
      if (ipv6_match) {
        host = "";
        ipv6 = ipv6_match[1];
        port_str = ipv6_match[2] || null;
      } else {
        split = hostname.split(":");
        host = split.shift();
        if (split.length) {
          port_str = split.join(":");
        }
      }
      if (port_str !== null && port_str.length > 0) {
        port = parseInt(port_str, 10);
        if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
          return false;
        }
      } else if (options.require_port) {
        return false;
      }
      if (options.host_whitelist) {
        return (0, _checkHost.default)(host, options.host_whitelist);
      }
      if (host === "" && !options.require_host) {
        return true;
      }
      if (!(0, _isIP.default)(host) && !(0, _isFQDN.default)(host, options) && (!ipv6 || !(0, _isIP.default)(ipv6, 6))) {
        return false;
      }
      host = host || ipv6;
      if (options.host_blacklist && (0, _checkHost.default)(host, options.host_blacklist)) {
        return false;
      }
      return true;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMACAddress.js
var require_isMACAddress = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMACAddress.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMACAddress;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var macAddress48 = /^(?:[0-9a-fA-F]{2}([-:\s]))([0-9a-fA-F]{2}\1){4}([0-9a-fA-F]{2})$/;
    var macAddress48NoSeparators = /^([0-9a-fA-F]){12}$/;
    var macAddress48WithDots = /^([0-9a-fA-F]{4}\.){2}([0-9a-fA-F]{4})$/;
    var macAddress64 = /^(?:[0-9a-fA-F]{2}([-:\s]))([0-9a-fA-F]{2}\1){6}([0-9a-fA-F]{2})$/;
    var macAddress64NoSeparators = /^([0-9a-fA-F]){16}$/;
    var macAddress64WithDots = /^([0-9a-fA-F]{4}\.){3}([0-9a-fA-F]{4})$/;
    function isMACAddress(str, options) {
      (0, _assertString.default)(str);
      if (options !== null && options !== void 0 && options.eui) {
        options.eui = String(options.eui);
      }
      if (options !== null && options !== void 0 && options.no_colons || options !== null && options !== void 0 && options.no_separators) {
        if (options.eui === "48") {
          return macAddress48NoSeparators.test(str);
        }
        if (options.eui === "64") {
          return macAddress64NoSeparators.test(str);
        }
        return macAddress48NoSeparators.test(str) || macAddress64NoSeparators.test(str);
      }
      if ((options === null || options === void 0 ? void 0 : options.eui) === "48") {
        return macAddress48.test(str) || macAddress48WithDots.test(str);
      }
      if ((options === null || options === void 0 ? void 0 : options.eui) === "64") {
        return macAddress64.test(str) || macAddress64WithDots.test(str);
      }
      return isMACAddress(str, {
        eui: "48"
      }) || isMACAddress(str, {
        eui: "64"
      });
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIPRange.js
var require_isIPRange = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIPRange.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIPRange;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isIP = _interopRequireDefault(require_isIP());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var subnetMaybe = /^\d{1,3}$/;
    var v4Subnet = 32;
    var v6Subnet = 128;
    function isIPRange(str) {
      var version = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      (0, _assertString.default)(str);
      var parts = str.split("/");
      if (parts.length !== 2) {
        return false;
      }
      if (!subnetMaybe.test(parts[1])) {
        return false;
      }
      if (parts[1].length > 1 && parts[1].startsWith("0")) {
        return false;
      }
      var isValidIP = (0, _isIP.default)(parts[0], version);
      if (!isValidIP) {
        return false;
      }
      var expectedSubnet = null;
      switch (String(version)) {
        case "4":
          expectedSubnet = v4Subnet;
          break;
        case "6":
          expectedSubnet = v6Subnet;
          break;
        default:
          expectedSubnet = (0, _isIP.default)(parts[0], "6") ? v6Subnet : v4Subnet;
      }
      return parts[1] <= expectedSubnet && parts[1] >= 0;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDate.js
var require_isDate = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDate.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDate;
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _slicedToArray(r, e) {
      return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
        var e, n, i, u, a = [], f = true, o = false;
        try {
          if (i = (t = t.call(r)).next, 0 === l) {
            if (Object(t) !== t) return;
            f = false;
          } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
        } catch (r2) {
          o = true, n = r2;
        } finally {
          try {
            if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
          } finally {
            if (o) throw n;
          }
        }
        return a;
      }
    }
    function _arrayWithHoles(r) {
      if (Array.isArray(r)) return r;
    }
    function _createForOfIteratorHelper(r, e) {
      var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
          t && (r = t);
          var _n = 0, F = function F2() {
          };
          return { s: F, n: function n() {
            return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
          }, e: function e2(r2) {
            throw r2;
          }, f: F };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var o, a = true, u = false;
      return { s: function s() {
        t = t.call(r);
      }, n: function n() {
        var r2 = t.next();
        return a = r2.done, r2;
      }, e: function e2(r2) {
        u = true, o = r2;
      }, f: function f() {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      } };
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    var default_date_options = {
      format: "YYYY/MM/DD",
      delimiters: ["/", "-"],
      strictMode: false
    };
    function isValidFormat(format) {
      return /(^(y{4}|y{2})[.\/-](m{1,2})[.\/-](d{1,2})$)|(^(m{1,2})[.\/-](d{1,2})[.\/-]((y{4}|y{2})$))|(^(d{1,2})[.\/-](m{1,2})[.\/-]((y{4}|y{2})$))/gi.test(format);
    }
    function zip(date, format) {
      var zippedArr = [], len = Math.max(date.length, format.length);
      for (var i = 0; i < len; i++) {
        zippedArr.push([date[i], format[i]]);
      }
      return zippedArr;
    }
    function isDate(input, options) {
      if (typeof options === "string") {
        options = (0, _merge.default)({
          format: options
        }, default_date_options);
      } else {
        options = (0, _merge.default)(options, default_date_options);
      }
      if (typeof input === "string" && isValidFormat(options.format)) {
        if (options.strictMode && input.length !== options.format.length) return false;
        var formatDelimiter = options.delimiters.find(function(delimiter) {
          return options.format.indexOf(delimiter) !== -1;
        });
        var dateDelimiter = options.strictMode ? formatDelimiter : options.delimiters.find(function(delimiter) {
          return input.indexOf(delimiter) !== -1;
        });
        var dateAndFormat = zip(input.split(dateDelimiter), options.format.toLowerCase().split(formatDelimiter));
        var dateObj = {};
        var _iterator = _createForOfIteratorHelper(dateAndFormat), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var _step$value = _slicedToArray(_step.value, 2), dateWord = _step$value[0], formatWord = _step$value[1];
            if (!dateWord || !formatWord || dateWord.length !== formatWord.length) {
              return false;
            }
            dateObj[formatWord.charAt(0)] = dateWord;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        var fullYear = dateObj.y;
        if (fullYear.startsWith("-")) {
          return false;
        }
        if (dateObj.y.length === 2) {
          var parsedYear = parseInt(dateObj.y, 10);
          if (isNaN(parsedYear)) {
            return false;
          }
          var currentYearLastTwoDigits = (/* @__PURE__ */ new Date()).getFullYear() % 100;
          if (parsedYear < currentYearLastTwoDigits) {
            fullYear = "20".concat(dateObj.y);
          } else {
            fullYear = "19".concat(dateObj.y);
          }
        }
        var month = dateObj.m;
        if (dateObj.m.length === 1) {
          month = "0".concat(dateObj.m);
        }
        var day = dateObj.d;
        if (dateObj.d.length === 1) {
          day = "0".concat(dateObj.d);
        }
        return new Date("".concat(fullYear, "-").concat(month, "-").concat(day, "T00:00:00.000Z")).getUTCDate() === +dateObj.d;
      }
      if (!options.strictMode) {
        return Object.prototype.toString.call(input) === "[object Date]" && isFinite(input);
      }
      return false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isTime.js
var require_isTime = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isTime.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isTime;
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var default_time_options = {
      hourFormat: "hour24",
      mode: "default"
    };
    var formats = {
      hour24: {
        default: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
        withSeconds: /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/,
        withOptionalSeconds: /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/
      },
      hour12: {
        default: /^(0?[1-9]|1[0-2]):([0-5][0-9]) (A|P)M$/,
        withSeconds: /^(0?[1-9]|1[0-2]):([0-5][0-9]):([0-5][0-9]) (A|P)M$/,
        withOptionalSeconds: /^(0?[1-9]|1[0-2]):([0-5][0-9])(?::([0-5][0-9]))? (A|P)M$/
      }
    };
    function isTime(input, options) {
      options = (0, _merge.default)(options, default_time_options);
      if (typeof input !== "string") return false;
      return formats[options.hourFormat][options.mode].test(input);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/includesArray.js
var require_includesArray = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/includesArray.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var includes = function includes2(arr, val) {
      return arr.some(function(arrVal) {
        return val === arrVal;
      });
    };
    var _default = exports.default = includes;
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBoolean.js
var require_isBoolean = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBoolean.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBoolean;
    var _assertString = _interopRequireDefault(require_assertString());
    var _includesArray = _interopRequireDefault(require_includesArray());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var defaultOptions = {
      loose: false
    };
    var strictBooleans = ["true", "false", "1", "0"];
    var looseBooleans = [].concat(strictBooleans, ["yes", "no"]);
    function isBoolean(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultOptions;
      (0, _assertString.default)(str);
      if (options.loose) {
        return (0, _includesArray.default)(looseBooleans, str.toLowerCase());
      }
      return (0, _includesArray.default)(strictBooleans, str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLocale.js
var require_isLocale = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLocale.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLocale;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var extlang = "([A-Za-z]{3}(-[A-Za-z]{3}){0,2})";
    var language = "(([a-zA-Z]{2,3}(-".concat(extlang, ")?)|([a-zA-Z]{5,8}))");
    var script = "([A-Za-z]{4})";
    var region = "([A-Za-z]{2}|\\d{3})";
    var variant = "([A-Za-z0-9]{5,8}|(\\d[A-Z-a-z0-9]{3}))";
    var singleton = "(\\d|[A-W]|[Y-Z]|[a-w]|[y-z])";
    var extension = "(".concat(singleton, "(-[A-Za-z0-9]{2,8})+)");
    var privateuse = "(x(-[A-Za-z0-9]{1,8})+)";
    var irregular = "((en-GB-oed)|(i-ami)|(i-bnn)|(i-default)|(i-enochian)|(i-hak)|(i-klingon)|(i-lux)|(i-mingo)|(i-navajo)|(i-pwn)|(i-tao)|(i-tay)|(i-tsu)|(sgn-BE-FR)|(sgn-BE-NL)|(sgn-CH-DE))";
    var regular = "((art-lojban)|(cel-gaulish)|(no-bok)|(no-nyn)|(zh-guoyu)|(zh-hakka)|(zh-min)|(zh-min-nan)|(zh-xiang))";
    var grandfathered = "(".concat(irregular, "|").concat(regular, ")");
    var delimiter = "(-|_)";
    var langtag = "".concat(language, "(").concat(delimiter).concat(script, ")?(").concat(delimiter).concat(region, ")?(").concat(delimiter).concat(variant, ")*(").concat(delimiter).concat(extension, ")*(").concat(delimiter).concat(privateuse, ")?");
    var languageTagRegex = new RegExp("(^".concat(privateuse, "$)|(^").concat(grandfathered, "$)|(^").concat(langtag, "$)"));
    function isLocale(str) {
      (0, _assertString.default)(str);
      return languageTagRegex.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAbaRouting.js
var require_isAbaRouting = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAbaRouting.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAbaRouting;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var isRoutingReg = /^(?!(1[3-9])|(20)|(3[3-9])|(4[0-9])|(5[0-9])|(60)|(7[3-9])|(8[1-9])|(9[0-2])|(9[3-9]))[0-9]{9}$/;
    function isAbaRouting(str) {
      (0, _assertString.default)(str);
      if (!isRoutingReg.test(str)) return false;
      var checkSumVal = 0;
      for (var i = 0; i < str.length; i++) {
        if (i % 3 === 0) checkSumVal += str[i] * 3;
        else if (i % 3 === 1) checkSumVal += str[i] * 7;
        else checkSumVal += str[i] * 1;
      }
      return checkSumVal % 10 === 0;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAlpha.js
var require_isAlpha = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAlpha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAlpha;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isAlpha(_str) {
      var locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "en-US";
      var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      (0, _assertString.default)(_str);
      var str = _str;
      var ignore = options.ignore;
      if (ignore) {
        if (ignore instanceof RegExp) {
          str = str.replace(ignore, "");
        } else if (typeof ignore === "string") {
          str = str.replace(new RegExp("[".concat(ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&"), "]"), "g"), "");
        } else {
          throw new Error("ignore should be instance of a String or RegExp");
        }
      }
      if (locale in _alpha.alpha) {
        return _alpha.alpha[locale].test(str);
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    var locales = exports.locales = Object.keys(_alpha.alpha);
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAlphanumeric.js
var require_isAlphanumeric = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAlphanumeric.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAlphanumeric;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isAlphanumeric(_str) {
      var locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "en-US";
      var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      (0, _assertString.default)(_str);
      var str = _str;
      var ignore = options.ignore;
      if (ignore) {
        if (ignore instanceof RegExp) {
          str = str.replace(ignore, "");
        } else if (typeof ignore === "string") {
          str = str.replace(new RegExp("[".concat(ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&"), "]"), "g"), "");
        } else {
          throw new Error("ignore should be instance of a String or RegExp");
        }
      }
      if (locale in _alpha.alphanumeric) {
        return _alpha.alphanumeric[locale].test(str);
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    var locales = exports.locales = Object.keys(_alpha.alphanumeric);
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isNumeric.js
var require_isNumeric = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isNumeric.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isNumeric;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var numericNoSymbols = /^[0-9]+$/;
    function isNumeric(str, options) {
      (0, _assertString.default)(str);
      if (options && options.no_symbols) {
        return numericNoSymbols.test(str);
      }
      return new RegExp("^[+-]?([0-9]*[".concat((options || {}).locale ? _alpha.decimal[options.locale] : ".", "])?[0-9]+$")).test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isPassportNumber.js
var require_isPassportNumber = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isPassportNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPassportNumber;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var passportRegexByCountryCode = {
      AM: /^[A-Z]{2}\d{7}$/,
      // ARMENIA
      AR: /^[A-Z]{3}\d{6}$/,
      // ARGENTINA
      AT: /^[A-Z]\d{7}$/,
      // AUSTRIA
      AU: /^[A-Z]\d{7}$/,
      // AUSTRALIA
      AZ: /^[A-Z]{1}\d{8}$/,
      // AZERBAIJAN
      BE: /^[A-Z]{2}\d{6}$/,
      // BELGIUM
      BG: /^\d{9}$/,
      // BULGARIA
      BR: /^[A-Z]{2}\d{6}$/,
      // BRAZIL
      BY: /^[A-Z]{2}\d{7}$/,
      // BELARUS
      CA: /^[A-Z]{2}\d{6}$|^[A-Z]\d{6}[A-Z]{2}$/,
      // CANADA
      CH: /^[A-Z]\d{7}$/,
      // SWITZERLAND
      CN: /^G\d{8}$|^E(?![IO])[A-Z0-9]\d{7}$/,
      // CHINA [G=Ordinary, E=Electronic] followed by 8-digits, or E followed by any UPPERCASE letter (except I and O) followed by 7 digits
      CY: /^[A-Z](\d{6}|\d{8})$/,
      // CYPRUS
      CZ: /^\d{8}$/,
      // CZECH REPUBLIC
      DE: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/,
      // GERMANY
      DK: /^\d{9}$/,
      // DENMARK
      DZ: /^\d{9}$/,
      // ALGERIA
      EE: /^([A-Z]\d{7}|[A-Z]{2}\d{7})$/,
      // ESTONIA (K followed by 7-digits), e-passports have 2 UPPERCASE followed by 7 digits
      ES: /^[A-Z0-9]{2}([A-Z0-9]?)\d{6}$/,
      // SPAIN
      FI: /^[A-Z]{2}\d{7}$/,
      // FINLAND
      FR: /^\d{2}[A-Z]{2}\d{5}$/,
      // FRANCE
      GB: /^\d{9}$/,
      // UNITED KINGDOM
      GR: /^[A-Z]{2}\d{7}$/,
      // GREECE
      HR: /^\d{9}$/,
      // CROATIA
      HU: /^[A-Z]{2}(\d{6}|\d{7})$/,
      // HUNGARY
      IE: /^[A-Z0-9]{2}\d{7}$/,
      // IRELAND
      IN: /^[A-Z]{1}-?\d{7}$/,
      // INDIA
      ID: /^[A-C]\d{7}$/,
      // INDONESIA
      IR: /^[A-Z]\d{8}$/,
      // IRAN
      IS: /^(A)\d{7}$/,
      // ICELAND
      IT: /^[A-Z0-9]{2}\d{7}$/,
      // ITALY
      JM: /^[Aa]\d{7}$/,
      // JAMAICA
      JP: /^[A-Z]{2}\d{7}$/,
      // JAPAN
      KR: /^[MS]\d{8}$/,
      // SOUTH KOREA, REPUBLIC OF KOREA, [S=PS Passports, M=PM Passports]
      KZ: /^[a-zA-Z]\d{7}$/,
      // KAZAKHSTAN
      LI: /^[a-zA-Z]\d{5}$/,
      // LIECHTENSTEIN
      LT: /^[A-Z0-9]{8}$/,
      // LITHUANIA
      LU: /^[A-Z0-9]{8}$/,
      // LUXEMBURG
      LV: /^[A-Z0-9]{2}\d{7}$/,
      // LATVIA
      LY: /^[A-Z0-9]{8}$/,
      // LIBYA
      MT: /^\d{7}$/,
      // MALTA
      MZ: /^([A-Z]{2}\d{7})|(\d{2}[A-Z]{2}\d{5})$/,
      // MOZAMBIQUE
      MY: /^[AHK]\d{8}$/,
      // MALAYSIA
      MX: /^[A-Z]\d{8}$/,
      // MEXICO
      NL: /^[A-Z]{2}[A-Z0-9]{6}\d$/,
      // NETHERLANDS
      NZ: /^([Ll]([Aa]|[Dd]|[Ff]|[Hh])|[Ee]([Aa]|[Pp])|[Nn])\d{6}$/,
      // NEW ZEALAND
      PH: /^([A-Z](\d{6}|\d{7}[A-Z]))|([A-Z]{2}(\d{6}|\d{7}))$/,
      // PHILIPPINES
      PK: /^[A-Z]{2}\d{7}$/,
      // PAKISTAN
      PL: /^[A-Z]{2}\d{7}$/,
      // POLAND
      PT: /^[A-Z]\d{6}$/,
      // PORTUGAL
      RO: /^\d{8,9}$/,
      // ROMANIA
      RU: /^\d{9}$/,
      // RUSSIAN FEDERATION
      SE: /^\d{8}$/,
      // SWEDEN
      SL: /^(P)[A-Z]\d{7}$/,
      // SLOVENIA
      SK: /^[0-9A-Z]\d{7}$/,
      // SLOVAKIA
      TH: /^[A-Z]{1,2}\d{6,7}$/,
      // THAILAND
      TR: /^[A-Z]\d{8}$/,
      // TURKEY
      UA: /^[A-Z]{2}\d{6}$/,
      // UKRAINE
      US: /^\d{9}$|^[A-Z]\d{8}$/,
      // UNITED STATES
      ZA: /^[TAMD]\d{8}$/
      // SOUTH AFRICA
    };
    var locales = exports.locales = Object.keys(passportRegexByCountryCode);
    function isPassportNumber(str, countryCode) {
      (0, _assertString.default)(str);
      var normalizedStr = str.replace(/\s/g, "").toUpperCase();
      return countryCode.toUpperCase() in passportRegexByCountryCode && passportRegexByCountryCode[countryCode].test(normalizedStr);
    }
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isInt.js
var require_isInt = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isInt.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isInt;
    var _assertString = _interopRequireDefault(require_assertString());
    var _nullUndefinedCheck = _interopRequireDefault(require_nullUndefinedCheck());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
    var intLeadingZeroes = /^[-+]?[0-9]+$/;
    function isInt(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var regex = options.allow_leading_zeroes === false ? int : intLeadingZeroes;
      var minCheckPassed = !options.hasOwnProperty("min") || (0, _nullUndefinedCheck.default)(options.min) || str >= options.min;
      var maxCheckPassed = !options.hasOwnProperty("max") || (0, _nullUndefinedCheck.default)(options.max) || str <= options.max;
      var ltCheckPassed = !options.hasOwnProperty("lt") || (0, _nullUndefinedCheck.default)(options.lt) || str < options.lt;
      var gtCheckPassed = !options.hasOwnProperty("gt") || (0, _nullUndefinedCheck.default)(options.gt) || str > options.gt;
      return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isPort.js
var require_isPort = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isPort.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPort;
    var _isInt = _interopRequireDefault(require_isInt());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isPort(str) {
      return (0, _isInt.default)(str, {
        allow_leading_zeroes: false,
        min: 0,
        max: 65535
      });
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLowercase.js
var require_isLowercase = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLowercase.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLowercase;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isLowercase(str) {
      (0, _assertString.default)(str);
      return str === str.toLowerCase();
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isUppercase.js
var require_isUppercase = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isUppercase.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isUppercase;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isUppercase(str) {
      (0, _assertString.default)(str);
      return str === str.toUpperCase();
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIMEI.js
var require_isIMEI = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIMEI.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIMEI;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var imeiRegexWithoutHyphens = /^[0-9]{15}$/;
    var imeiRegexWithHyphens = /^\d{2}-\d{6}-\d{6}-\d{1}$/;
    function isIMEI(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var imeiRegex = imeiRegexWithoutHyphens;
      if (options.allow_hyphens) {
        imeiRegex = imeiRegexWithHyphens;
      }
      if (!imeiRegex.test(str)) {
        return false;
      }
      str = str.replace(/-/g, "");
      var sum = 0, mul = 2, l = 14;
      for (var i = 0; i < l; i++) {
        var digit = str.substring(l - i - 1, l - i);
        var tp = parseInt(digit, 10) * mul;
        if (tp >= 10) {
          sum += tp % 10 + 1;
        } else {
          sum += tp;
        }
        if (mul === 1) {
          mul += 1;
        } else {
          mul -= 1;
        }
      }
      var chk = (10 - sum % 10) % 10;
      if (chk !== parseInt(str.substring(14, 15), 10)) {
        return false;
      }
      return true;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAscii.js
var require_isAscii = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAscii.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAscii;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var ascii = /^[\x00-\x7F]+$/;
    function isAscii(str) {
      (0, _assertString.default)(str);
      return ascii.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isFullWidth.js
var require_isFullWidth = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isFullWidth.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFullWidth;
    exports.fullWidth = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var fullWidth = exports.fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
    function isFullWidth(str) {
      (0, _assertString.default)(str);
      return fullWidth.test(str);
    }
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHalfWidth.js
var require_isHalfWidth = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHalfWidth.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHalfWidth;
    exports.halfWidth = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var halfWidth = exports.halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
    function isHalfWidth(str) {
      (0, _assertString.default)(str);
      return halfWidth.test(str);
    }
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isVariableWidth.js
var require_isVariableWidth = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isVariableWidth.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isVariableWidth;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isFullWidth = require_isFullWidth();
    var _isHalfWidth = require_isHalfWidth();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isVariableWidth(str) {
      (0, _assertString.default)(str);
      return _isFullWidth.fullWidth.test(str) && _isHalfWidth.halfWidth.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMultibyte.js
var require_isMultibyte = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMultibyte.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMultibyte;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var multibyte = /[^\x00-\x7F]/;
    function isMultibyte(str) {
      (0, _assertString.default)(str);
      return multibyte.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/multilineRegex.js
var require_multilineRegex = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/multilineRegex.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = multilineRegexp;
    function multilineRegexp(parts, flags) {
      var regexpAsStringLiteral = parts.join("");
      return new RegExp(regexpAsStringLiteral, flags);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isSemVer.js
var require_isSemVer = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isSemVer.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSemVer;
    var _assertString = _interopRequireDefault(require_assertString());
    var _multilineRegex = _interopRequireDefault(require_multilineRegex());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var semanticVersioningRegex = (0, _multilineRegex.default)(["^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)", "(?:-((?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*))*))", "?(?:\\+([0-9a-z-]+(?:\\.[0-9a-z-]+)*))?$"], "i");
    function isSemVer(str) {
      (0, _assertString.default)(str);
      return semanticVersioningRegex.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isSurrogatePair.js
var require_isSurrogatePair = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isSurrogatePair.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSurrogatePair;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
    function isSurrogatePair(str) {
      (0, _assertString.default)(str);
      return surrogatePair.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDecimal.js
var require_isDecimal = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDecimal.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDecimal;
    var _merge = _interopRequireDefault(require_merge());
    var _assertString = _interopRequireDefault(require_assertString());
    var _includesArray = _interopRequireDefault(require_includesArray());
    var _alpha = require_alpha();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function decimalRegExp(options) {
      var regExp = new RegExp("^[-+]?([0-9]+)?(\\".concat(_alpha.decimal[options.locale], "[0-9]{").concat(options.decimal_digits, "})").concat(options.force_decimal ? "" : "?", "$"));
      return regExp;
    }
    var default_decimal_options = {
      force_decimal: false,
      decimal_digits: "1,",
      locale: "en-US"
    };
    var blacklist = ["", "-", "+"];
    function isDecimal(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_decimal_options);
      if (options.locale in _alpha.decimal) {
        return !(0, _includesArray.default)(blacklist, str.replace(/ /g, "")) && decimalRegExp(options).test(str);
      }
      throw new Error("Invalid locale '".concat(options.locale, "'"));
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHexadecimal.js
var require_isHexadecimal = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHexadecimal.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHexadecimal;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;
    function isHexadecimal(str) {
      (0, _assertString.default)(str);
      return hexadecimal.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isOctal.js
var require_isOctal = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isOctal.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isOctal;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var octal = /^(0o)?[0-7]+$/i;
    function isOctal(str) {
      (0, _assertString.default)(str);
      return octal.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDivisibleBy.js
var require_isDivisibleBy = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDivisibleBy.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDivisibleBy;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toFloat = _interopRequireDefault(require_toFloat());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isDivisibleBy(str, num) {
      (0, _assertString.default)(str);
      return (0, _toFloat.default)(str) % parseInt(num, 10) === 0;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHexColor.js
var require_isHexColor = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHexColor.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHexColor;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
    var hexcolor_with_prefix = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
    var default_is_hexcolor_options = {
      require_hashtag: false
    };
    function isHexColor(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_is_hexcolor_options);
      var hexcolor_regex = options.require_hashtag ? hexcolor_with_prefix : hexcolor;
      return hexcolor_regex.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isRgbColor.js
var require_isRgbColor = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isRgbColor.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isRgbColor;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var rgbColor = /^rgb\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){2}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\)$/;
    var rgbaColor = /^rgba\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){3}(0?\.\d\d?|1(\.0)?|0(\.0)?)\)$/;
    var rgbColorPercent = /^rgb\((([0-9]%|[1-9][0-9]%|100%),){2}([0-9]%|[1-9][0-9]%|100%)\)$/;
    var rgbaColorPercent = /^rgba\((([0-9]%|[1-9][0-9]%|100%),){3}(0?\.\d\d?|1(\.0)?|0(\.0)?)\)$/;
    var startsWithRgb = /^rgba?/;
    function isRgbColor(str, options) {
      (0, _assertString.default)(str);
      var allowSpaces = false;
      var includePercentValues = true;
      if (_typeof(options) !== "object") {
        if (arguments.length >= 2) {
          includePercentValues = arguments[1];
        }
      } else {
        allowSpaces = options.allowSpaces !== void 0 ? options.allowSpaces : allowSpaces;
        includePercentValues = options.includePercentValues !== void 0 ? options.includePercentValues : includePercentValues;
      }
      if (allowSpaces) {
        if (!startsWithRgb.test(str)) {
          return false;
        }
        str = str.replace(/\s/g, "");
      }
      if (!includePercentValues) {
        return rgbColor.test(str) || rgbaColor.test(str);
      }
      return rgbColor.test(str) || rgbaColor.test(str) || rgbColorPercent.test(str) || rgbaColorPercent.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHSL.js
var require_isHSL = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHSL.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHSL;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var hslComma = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(,(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}(,((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?))?\)$/i;
    var hslSpace = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(\s(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}\s?(\/\s((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?)\s?)?\)$/i;
    function isHSL(str) {
      (0, _assertString.default)(str);
      var strippedStr = str.replace(/\s+/g, " ").replace(/\s?(hsla?\(|\)|,)\s?/ig, "$1");
      if (strippedStr.indexOf(",") !== -1) {
        return hslComma.test(strippedStr);
      }
      return hslSpace.test(strippedStr);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISRC.js
var require_isISRC = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISRC.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISRC;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var isrc = /^[A-Z]{2}[0-9A-Z]{3}\d{2}\d{5}$/;
    function isISRC(str) {
      (0, _assertString.default)(str);
      return isrc.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIBAN.js
var require_isIBAN = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIBAN.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIBAN;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _includesArray = _interopRequireDefault(require_includesArray());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var ibanRegexThroughCountryCode = {
      AD: /^(AD[0-9]{2})\d{8}[A-Z0-9]{12}$/,
      AE: /^(AE[0-9]{2})\d{3}\d{16}$/,
      AL: /^(AL[0-9]{2})\d{8}[A-Z0-9]{16}$/,
      AT: /^(AT[0-9]{2})\d{16}$/,
      AZ: /^(AZ[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      BA: /^(BA[0-9]{2})\d{16}$/,
      BE: /^(BE[0-9]{2})\d{12}$/,
      BG: /^(BG[0-9]{2})[A-Z]{4}\d{6}[A-Z0-9]{8}$/,
      BH: /^(BH[0-9]{2})[A-Z]{4}[A-Z0-9]{14}$/,
      BR: /^(BR[0-9]{2})\d{23}[A-Z]{1}[A-Z0-9]{1}$/,
      BY: /^(BY[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      CH: /^(CH[0-9]{2})\d{5}[A-Z0-9]{12}$/,
      CR: /^(CR[0-9]{2})\d{18}$/,
      CY: /^(CY[0-9]{2})\d{8}[A-Z0-9]{16}$/,
      CZ: /^(CZ[0-9]{2})\d{20}$/,
      DE: /^(DE[0-9]{2})\d{18}$/,
      DK: /^(DK[0-9]{2})\d{14}$/,
      DO: /^(DO[0-9]{2})[A-Z]{4}\d{20}$/,
      DZ: /^(DZ\d{24})$/,
      EE: /^(EE[0-9]{2})\d{16}$/,
      EG: /^(EG[0-9]{2})\d{25}$/,
      ES: /^(ES[0-9]{2})\d{20}$/,
      FI: /^(FI[0-9]{2})\d{14}$/,
      FO: /^(FO[0-9]{2})\d{14}$/,
      FR: /^(FR[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
      GB: /^(GB[0-9]{2})[A-Z]{4}\d{14}$/,
      GE: /^(GE[0-9]{2})[A-Z0-9]{2}\d{16}$/,
      GI: /^(GI[0-9]{2})[A-Z]{4}[A-Z0-9]{15}$/,
      GL: /^(GL[0-9]{2})\d{14}$/,
      GR: /^(GR[0-9]{2})\d{7}[A-Z0-9]{16}$/,
      GT: /^(GT[0-9]{2})[A-Z0-9]{4}[A-Z0-9]{20}$/,
      HR: /^(HR[0-9]{2})\d{17}$/,
      HU: /^(HU[0-9]{2})\d{24}$/,
      IE: /^(IE[0-9]{2})[A-Z]{4}\d{14}$/,
      IL: /^(IL[0-9]{2})\d{19}$/,
      IQ: /^(IQ[0-9]{2})[A-Z]{4}\d{15}$/,
      IR: /^(IR[0-9]{2})\d{22}$/,
      IS: /^(IS[0-9]{2})\d{22}$/,
      IT: /^(IT[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
      JO: /^(JO[0-9]{2})[A-Z]{4}\d{22}$/,
      KW: /^(KW[0-9]{2})[A-Z]{4}[A-Z0-9]{22}$/,
      KZ: /^(KZ[0-9]{2})\d{3}[A-Z0-9]{13}$/,
      LB: /^(LB[0-9]{2})\d{4}[A-Z0-9]{20}$/,
      LC: /^(LC[0-9]{2})[A-Z]{4}[A-Z0-9]{24}$/,
      LI: /^(LI[0-9]{2})\d{5}[A-Z0-9]{12}$/,
      LT: /^(LT[0-9]{2})\d{16}$/,
      LU: /^(LU[0-9]{2})\d{3}[A-Z0-9]{13}$/,
      LV: /^(LV[0-9]{2})[A-Z]{4}[A-Z0-9]{13}$/,
      MA: /^(MA[0-9]{26})$/,
      MC: /^(MC[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
      MD: /^(MD[0-9]{2})[A-Z0-9]{20}$/,
      ME: /^(ME[0-9]{2})\d{18}$/,
      MK: /^(MK[0-9]{2})\d{3}[A-Z0-9]{10}\d{2}$/,
      MR: /^(MR[0-9]{2})\d{23}$/,
      MT: /^(MT[0-9]{2})[A-Z]{4}\d{5}[A-Z0-9]{18}$/,
      MU: /^(MU[0-9]{2})[A-Z]{4}\d{19}[A-Z]{3}$/,
      MZ: /^(MZ[0-9]{2})\d{21}$/,
      NL: /^(NL[0-9]{2})[A-Z]{4}\d{10}$/,
      NO: /^(NO[0-9]{2})\d{11}$/,
      PK: /^(PK[0-9]{2})[A-Z0-9]{4}\d{16}$/,
      PL: /^(PL[0-9]{2})\d{24}$/,
      PS: /^(PS[0-9]{2})[A-Z]{4}[A-Z0-9]{21}$/,
      PT: /^(PT[0-9]{2})\d{21}$/,
      QA: /^(QA[0-9]{2})[A-Z]{4}[A-Z0-9]{21}$/,
      RO: /^(RO[0-9]{2})[A-Z]{4}[A-Z0-9]{16}$/,
      RS: /^(RS[0-9]{2})\d{18}$/,
      SA: /^(SA[0-9]{2})\d{2}[A-Z0-9]{18}$/,
      SC: /^(SC[0-9]{2})[A-Z]{4}\d{20}[A-Z]{3}$/,
      SE: /^(SE[0-9]{2})\d{20}$/,
      SI: /^(SI[0-9]{2})\d{15}$/,
      SK: /^(SK[0-9]{2})\d{20}$/,
      SM: /^(SM[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
      SV: /^(SV[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      TL: /^(TL[0-9]{2})\d{19}$/,
      TN: /^(TN[0-9]{2})\d{20}$/,
      TR: /^(TR[0-9]{2})\d{5}[A-Z0-9]{17}$/,
      UA: /^(UA[0-9]{2})\d{6}[A-Z0-9]{19}$/,
      VA: /^(VA[0-9]{2})\d{18}$/,
      VG: /^(VG[0-9]{2})[A-Z]{4}\d{16}$/,
      XK: /^(XK[0-9]{2})\d{16}$/
    };
    function hasOnlyValidCountryCodes(countryCodeArray) {
      var countryCodeArrayFilteredWithObjectIbanCode = countryCodeArray.filter(function(countryCode) {
        return !(countryCode in ibanRegexThroughCountryCode);
      });
      return countryCodeArrayFilteredWithObjectIbanCode.length === 0;
    }
    function hasValidIbanFormat(str, options) {
      var strippedStr = str.replace(/[\s\-]+/gi, "").toUpperCase();
      var isoCountryCode = strippedStr.slice(0, 2).toUpperCase();
      var isoCountryCodeInIbanRegexCodeObject = isoCountryCode in ibanRegexThroughCountryCode;
      if (options.whitelist) {
        if (!hasOnlyValidCountryCodes(options.whitelist)) {
          return false;
        }
        var isoCountryCodeInWhiteList = (0, _includesArray.default)(options.whitelist, isoCountryCode);
        if (!isoCountryCodeInWhiteList) {
          return false;
        }
      }
      if (options.blacklist) {
        var isoCountryCodeInBlackList = (0, _includesArray.default)(options.blacklist, isoCountryCode);
        if (isoCountryCodeInBlackList) {
          return false;
        }
      }
      return isoCountryCodeInIbanRegexCodeObject && ibanRegexThroughCountryCode[isoCountryCode].test(strippedStr);
    }
    function hasValidIbanChecksum(str) {
      var strippedStr = str.replace(/[^A-Z0-9]+/gi, "").toUpperCase();
      var rearranged = strippedStr.slice(4) + strippedStr.slice(0, 4);
      var alphaCapsReplacedWithDigits = rearranged.replace(/[A-Z]/g, function(char) {
        return char.charCodeAt(0) - 55;
      });
      var remainder = alphaCapsReplacedWithDigits.match(/\d{1,7}/g).reduce(function(acc, value) {
        return Number(acc + value) % 97;
      }, "");
      return remainder === 1;
    }
    function isIBAN(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      return hasValidIbanFormat(str, options) && hasValidIbanChecksum(str);
    }
    var locales = exports.locales = Object.keys(ibanRegexThroughCountryCode);
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO31661Alpha2.js
var require_isISO31661Alpha2 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO31661Alpha2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CountryCodes = void 0;
    exports.default = isISO31661Alpha2;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validISO31661Alpha2CountriesCodes = /* @__PURE__ */ new Set(["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"]);
    var alpha2CountryCode = /^[a-zA-Z]{2}$/;
    function isISO31661Alpha2(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      var userAssignedCodes = options.userAssignedCodes;
      var validUserAssignedCodes = (userAssignedCodes || []).reduce(function(accumulator, userAssignedCode) {
        if (alpha2CountryCode.test(userAssignedCode)) {
          accumulator.push(userAssignedCode.toUpperCase());
        }
        return accumulator;
      }, []);
      if (validUserAssignedCodes.includes(str.toUpperCase())) {
        return true;
      }
      return validISO31661Alpha2CountriesCodes.has(str.toUpperCase());
    }
    var CountryCodes = exports.CountryCodes = validISO31661Alpha2CountriesCodes;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBIC.js
var require_isBIC = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBIC.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBIC;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isISO31661Alpha = require_isISO31661Alpha2();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var isBICReg = /^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/;
    function isBIC(str) {
      (0, _assertString.default)(str);
      var countryCode = str.slice(4, 6).toUpperCase();
      if (!_isISO31661Alpha.CountryCodes.has(countryCode) && countryCode !== "XK") {
        return false;
      }
      return isBICReg.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMD5.js
var require_isMD5 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMD5.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMD5;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var md5 = /^[a-f0-9]{32}$/;
    function isMD5(str) {
      (0, _assertString.default)(str);
      return md5.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHash.js
var require_isHash = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isHash.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHash;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var lengths = {
      md5: 32,
      md4: 32,
      sha1: 40,
      sha256: 64,
      sha384: 96,
      sha512: 128,
      ripemd128: 32,
      ripemd160: 40,
      tiger128: 32,
      tiger160: 40,
      tiger192: 48,
      crc32: 8,
      crc32b: 8
    };
    function isHash(str, algorithm) {
      (0, _assertString.default)(str);
      var hash = new RegExp("^[a-fA-F0-9]{".concat(lengths[algorithm], "}$"));
      return hash.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBase64.js
var require_isBase64 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBase64.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase64;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var base64WithPadding = /^[A-Za-z0-9+/]+={0,2}$/;
    var base64WithoutPadding = /^[A-Za-z0-9+/]+$/;
    var base64UrlWithPadding = /^[A-Za-z0-9_-]+={0,2}$/;
    var base64UrlWithoutPadding = /^[A-Za-z0-9_-]+$/;
    function isBase64(str, options) {
      var _options;
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, {
        urlSafe: false,
        padding: !((_options = options) !== null && _options !== void 0 && _options.urlSafe)
      });
      if (str === "") return true;
      if (options.padding && str.length % 4 !== 0) return false;
      var regex;
      if (options.urlSafe) {
        regex = options.padding ? base64UrlWithPadding : base64UrlWithoutPadding;
      } else {
        regex = options.padding ? base64WithPadding : base64WithoutPadding;
      }
      return (!options.padding || str.length % 4 === 0) && regex.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isJWT.js
var require_isJWT = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isJWT.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isJWT;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isBase = _interopRequireDefault(require_isBase64());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isJWT(str) {
      (0, _assertString.default)(str);
      var dotSplit = str.split(".");
      var len = dotSplit.length;
      if (len !== 3) {
        return false;
      }
      return dotSplit.reduce(function(acc, currElem) {
        return acc && (0, _isBase.default)(currElem, {
          urlSafe: true
        });
      }, true);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isJSON.js
var require_isJSON = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isJSON.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isJSON;
    var _assertString = _interopRequireDefault(require_assertString());
    var _includesArray = _interopRequireDefault(require_includesArray());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var default_json_options = {
      allow_primitives: false,
      allow_any_value: false
    };
    function isJSON(str, options) {
      (0, _assertString.default)(str);
      try {
        options = (0, _merge.default)(options, default_json_options);
        var obj = JSON.parse(str);
        if (options.allow_any_value) {
          return true;
        }
        var primitives = [];
        if (options.allow_primitives) {
          primitives = [null, false, true];
        }
        return (0, _includesArray.default)(primitives, obj) || !!obj && _typeof(obj) === "object";
      } catch (e) {
      }
      return false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEmpty.js
var require_isEmpty = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEmpty.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEmpty;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var default_is_empty_options = {
      ignore_whitespace: false
    };
    function isEmpty(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_is_empty_options);
      return (options.ignore_whitespace ? str.trim().length : str.length) === 0;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLength.js
var require_isLength = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLength.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLength;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function isLength(str, options) {
      (0, _assertString.default)(str);
      var min;
      var max;
      if (_typeof(options) === "object") {
        min = options.min || 0;
        max = options.max;
      } else {
        min = arguments[1] || 0;
        max = arguments[2];
      }
      var presentationSequences = str.match(/[^\uFE0F\uFE0E][\uFE0F\uFE0E]/g) || [];
      var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
      var len = str.length - presentationSequences.length - surrogatePairs.length;
      var isInsideRange = len >= min && (typeof max === "undefined" || len <= max);
      if (isInsideRange && Array.isArray(options === null || options === void 0 ? void 0 : options.discreteLengths)) {
        return options.discreteLengths.some(function(discreteLen) {
          return discreteLen === len;
        });
      }
      return isInsideRange;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isULID.js
var require_isULID = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isULID.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isULID;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isULID(str) {
      (0, _assertString.default)(str);
      return /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isUUID.js
var require_isUUID = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isUUID.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isUUID;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var uuid = {
      1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      6: /^[0-9A-F]{8}-[0-9A-F]{4}-6[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      7: /^[0-9A-F]{8}-[0-9A-F]{4}-7[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      8: /^[0-9A-F]{8}-[0-9A-F]{4}-8[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      nil: /^00000000-0000-0000-0000-000000000000$/i,
      max: /^ffffffff-ffff-ffff-ffff-ffffffffffff$/i,
      loose: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
      // From https://github.com/uuidjs/uuid/blob/main/src/regex.js
      all: /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i
    };
    function isUUID(str, version) {
      (0, _assertString.default)(str);
      if (version === void 0 || version === null) {
        version = "all";
      }
      return version in uuid ? uuid[version].test(str) : false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMongoId.js
var require_isMongoId = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMongoId.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMongoId;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isHexadecimal = _interopRequireDefault(require_isHexadecimal());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isMongoId(str) {
      (0, _assertString.default)(str);
      return (0, _isHexadecimal.default)(str) && str.length === 24;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAfter.js
var require_isAfter = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isAfter.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAfter;
    var _toDate = _interopRequireDefault(require_toDate());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function isAfter(date, options) {
      var comparisonDate = (_typeof(options) === "object" ? options.comparisonDate : options) || Date().toString();
      var comparison = (0, _toDate.default)(comparisonDate);
      var original = (0, _toDate.default)(date);
      return !!(original && comparison && original > comparison);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBefore.js
var require_isBefore = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBefore.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBefore;
    var _toDate = _interopRequireDefault(require_toDate());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function isBefore(date, options) {
      var comparisonDate = (_typeof(options) === "object" ? options.comparisonDate : options) || Date().toString();
      var comparison = (0, _toDate.default)(comparisonDate);
      var original = (0, _toDate.default)(date);
      return !!(original && comparison && original < comparison);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIn.js
var require_isIn = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIn.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIn;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toString = _interopRequireDefault(require_toString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function isIn(str, options) {
      (0, _assertString.default)(str);
      var i;
      if (Object.prototype.toString.call(options) === "[object Array]") {
        var array = [];
        for (i in options) {
          if ({}.hasOwnProperty.call(options, i)) {
            array[i] = (0, _toString.default)(options[i]);
          }
        }
        return array.indexOf(str) >= 0;
      } else if (_typeof(options) === "object") {
        return options.hasOwnProperty(str);
      } else if (options && typeof options.indexOf === "function") {
        return options.indexOf(str) >= 0;
      }
      return false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLuhnNumber.js
var require_isLuhnNumber = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLuhnNumber.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLuhnNumber;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isLuhnNumber(str) {
      (0, _assertString.default)(str);
      var sanitized = str.replace(/[- ]+/g, "");
      var sum = 0;
      var digit;
      var tmpNum;
      var shouldDouble;
      for (var i = sanitized.length - 1; i >= 0; i--) {
        digit = sanitized.substring(i, i + 1);
        tmpNum = parseInt(digit, 10);
        if (shouldDouble) {
          tmpNum *= 2;
          if (tmpNum >= 10) {
            sum += tmpNum % 10 + 1;
          } else {
            sum += tmpNum;
          }
        } else {
          sum += tmpNum;
        }
        shouldDouble = !shouldDouble;
      }
      return !!(sum % 10 === 0 ? sanitized : false);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isCreditCard.js
var require_isCreditCard = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isCreditCard.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isCreditCard;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isLuhnNumber = _interopRequireDefault(require_isLuhnNumber());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var cards = {
      amex: /^3[47][0-9]{13}$/,
      dinersclub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      discover: /^6(?:011|5[0-9][0-9])[0-9]{12,15}$/,
      jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
      mastercard: /^5[1-5][0-9]{2}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/,
      // /^[25][1-7][0-9]{14}$/;
      unionpay: /^(6[27][0-9]{14}|^(81[0-9]{14,17}))$/,
      visa: /^(?:4[0-9]{12})(?:[0-9]{3,6})?$/
    };
    var allCards = (function() {
      var tmpCardsArray = [];
      for (var cardProvider in cards) {
        if (cards.hasOwnProperty(cardProvider)) {
          tmpCardsArray.push(cards[cardProvider]);
        }
      }
      return tmpCardsArray;
    })();
    function isCreditCard(card) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(card);
      var provider = options.provider;
      var sanitized = card.replace(/[- ]+/g, "");
      if (provider && provider.toLowerCase() in cards) {
        if (!cards[provider.toLowerCase()].test(sanitized)) {
          return false;
        }
      } else if (provider && !(provider.toLowerCase() in cards)) {
        throw new Error("".concat(provider, " is not a valid credit card provider."));
      } else if (!allCards.some(function(cardProvider) {
        return cardProvider.test(sanitized);
      })) {
        return false;
      }
      return (0, _isLuhnNumber.default)(card);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIdentityCard.js
var require_isIdentityCard = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isIdentityCard.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIdentityCard;
    var _assertString = _interopRequireDefault(require_assertString());
    var _includesArray = _interopRequireDefault(require_includesArray());
    var _isInt = _interopRequireDefault(require_isInt());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validators = {
      PL: function PL(str) {
        (0, _assertString.default)(str);
        var weightOfDigits = {
          1: 1,
          2: 3,
          3: 7,
          4: 9,
          5: 1,
          6: 3,
          7: 7,
          8: 9,
          9: 1,
          10: 3,
          11: 0
        };
        if (str != null && str.length === 11 && (0, _isInt.default)(str, {
          allow_leading_zeroes: true
        })) {
          var digits = str.split("").slice(0, -1);
          var sum = digits.reduce(function(acc, digit, index) {
            return acc + Number(digit) * weightOfDigits[index + 1];
          }, 0);
          var modulo = sum % 10;
          var lastDigit = Number(str.charAt(str.length - 1));
          if (modulo === 0 && lastDigit === 0 || lastDigit === 10 - modulo) {
            return true;
          }
        }
        return false;
      },
      ES: function ES(str) {
        (0, _assertString.default)(str);
        var DNI = /^[0-9X-Z][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
        var charsValue = {
          X: 0,
          Y: 1,
          Z: 2
        };
        var controlDigits = ["T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E"];
        var sanitized = str.trim().toUpperCase();
        if (!DNI.test(sanitized)) {
          return false;
        }
        var number = sanitized.slice(0, -1).replace(/[X,Y,Z]/g, function(char) {
          return charsValue[char];
        });
        return sanitized.endsWith(controlDigits[number % 23]);
      },
      FI: function FI(str) {
        (0, _assertString.default)(str);
        if (str.length !== 11) {
          return false;
        }
        if (!str.match(/^\d{6}[\-A\+]\d{3}[0-9ABCDEFHJKLMNPRSTUVWXY]{1}$/)) {
          return false;
        }
        var checkDigits = "0123456789ABCDEFHJKLMNPRSTUVWXY";
        var idAsNumber = parseInt(str.slice(0, 6), 10) * 1e3 + parseInt(str.slice(7, 10), 10);
        var remainder = idAsNumber % 31;
        var checkDigit = checkDigits[remainder];
        return checkDigit === str.slice(10, 11);
      },
      IN: function IN(str) {
        var DNI = /^[1-9]\d{3}\s?\d{4}\s?\d{4}$/;
        var d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
        var p = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
        var sanitized = str.trim();
        if (!DNI.test(sanitized)) {
          return false;
        }
        var c = 0;
        var invertedArray = sanitized.replace(/\s/g, "").split("").map(Number).reverse();
        invertedArray.forEach(function(val, i) {
          c = d[c][p[i % 8][val]];
        });
        return c === 0;
      },
      IR: function IR(str) {
        if (!str.match(/^\d{10}$/)) return false;
        str = "0000".concat(str).slice(str.length - 6);
        if (parseInt(str.slice(3, 9), 10) === 0) return false;
        var lastNumber = parseInt(str.slice(9, 10), 10);
        var sum = 0;
        for (var i = 0; i < 9; i++) {
          sum += parseInt(str.slice(i, i + 1), 10) * (10 - i);
        }
        sum %= 11;
        return sum < 2 && lastNumber === sum || sum >= 2 && lastNumber === 11 - sum;
      },
      IT: function IT(str) {
        if (str.length !== 9) return false;
        if (str === "CA00000AA") return false;
        return str.search(/C[A-Z]\d{5}[A-Z]{2}/i) > -1;
      },
      NO: function NO(str) {
        var sanitized = str.trim();
        if (isNaN(Number(sanitized))) return false;
        if (sanitized.length !== 11) return false;
        if (sanitized === "00000000000") return false;
        var f = sanitized.split("").map(Number);
        var k1 = (11 - (3 * f[0] + 7 * f[1] + 6 * f[2] + 1 * f[3] + 8 * f[4] + 9 * f[5] + 4 * f[6] + 5 * f[7] + 2 * f[8]) % 11) % 11;
        var k2 = (11 - (5 * f[0] + 4 * f[1] + 3 * f[2] + 2 * f[3] + 7 * f[4] + 6 * f[5] + 5 * f[6] + 4 * f[7] + 3 * f[8] + 2 * k1) % 11) % 11;
        if (k1 !== f[9] || k2 !== f[10]) return false;
        return true;
      },
      TH: function TH(str) {
        if (!str.match(/^[1-8]\d{12}$/)) return false;
        var sum = 0;
        for (var i = 0; i < 12; i++) {
          sum += parseInt(str[i], 10) * (13 - i);
        }
        return str[12] === ((11 - sum % 11) % 10).toString();
      },
      LK: function LK(str) {
        var old_nic = /^[1-9]\d{8}[vx]$/i;
        var new_nic = /^[1-9]\d{11}$/i;
        if (str.length === 10 && old_nic.test(str)) return true;
        else if (str.length === 12 && new_nic.test(str)) return true;
        return false;
      },
      "he-IL": function heIL(str) {
        var DNI = /^\d{9}$/;
        var sanitized = str.trim();
        if (!DNI.test(sanitized)) {
          return false;
        }
        var id = sanitized;
        var sum = 0, incNum;
        for (var i = 0; i < id.length; i++) {
          incNum = Number(id[i]) * (i % 2 + 1);
          sum += incNum > 9 ? incNum - 9 : incNum;
        }
        return sum % 10 === 0;
      },
      "ar-LY": function arLY(str) {
        var NIN = /^(1|2)\d{11}$/;
        var sanitized = str.trim();
        return NIN.test(sanitized);
      },
      "ar-TN": function arTN(str) {
        var DNI = /^\d{8}$/;
        var sanitized = str.trim();
        return DNI.test(sanitized);
      },
      "zh-CN": function zhCN(str) {
        var provincesAndCities = [
          "11",
          // 北京
          "12",
          // 天津
          "13",
          // 河北
          "14",
          // 山西
          "15",
          // 内蒙古
          "21",
          // 辽宁
          "22",
          // 吉林
          "23",
          // 黑龙江
          "31",
          // 上海
          "32",
          // 江苏
          "33",
          // 浙江
          "34",
          // 安徽
          "35",
          // 福建
          "36",
          // 江西
          "37",
          // 山东
          "41",
          // 河南
          "42",
          // 湖北
          "43",
          // 湖南
          "44",
          // 广东
          "45",
          // 广西
          "46",
          // 海南
          "50",
          // 重庆
          "51",
          // 四川
          "52",
          // 贵州
          "53",
          // 云南
          "54",
          // 西藏
          "61",
          // 陕西
          "62",
          // 甘肃
          "63",
          // 青海
          "64",
          // 宁夏
          "65",
          // 新疆
          "71",
          // 台湾
          "81",
          // 香港
          "82",
          // 澳门
          "91"
          // 国外
        ];
        var powers = ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2"];
        var parityBit = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
        var checkAddressCode = function checkAddressCode2(addressCode) {
          return (0, _includesArray.default)(provincesAndCities, addressCode);
        };
        var checkBirthDayCode = function checkBirthDayCode2(birDayCode) {
          var yyyy = parseInt(birDayCode.substring(0, 4), 10);
          var mm = parseInt(birDayCode.substring(4, 6), 10);
          var dd = parseInt(birDayCode.substring(6), 10);
          var xdata = new Date(yyyy, mm - 1, dd);
          if (xdata > /* @__PURE__ */ new Date()) {
            return false;
          } else if (xdata.getFullYear() === yyyy && xdata.getMonth() === mm - 1 && xdata.getDate() === dd) {
            return true;
          }
          return false;
        };
        var getParityBit = function getParityBit2(idCardNo) {
          var id17 = idCardNo.substring(0, 17);
          var power = 0;
          for (var i = 0; i < 17; i++) {
            power += parseInt(id17.charAt(i), 10) * parseInt(powers[i], 10);
          }
          var mod = power % 11;
          return parityBit[mod];
        };
        var checkParityBit = function checkParityBit2(idCardNo) {
          return getParityBit(idCardNo) === idCardNo.charAt(17).toUpperCase();
        };
        var check15IdCardNo = function check15IdCardNo2(idCardNo) {
          var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
          if (!check) return false;
          var addressCode = idCardNo.substring(0, 2);
          check = checkAddressCode(addressCode);
          if (!check) return false;
          var birDayCode = "19".concat(idCardNo.substring(6, 12));
          check = checkBirthDayCode(birDayCode);
          if (!check) return false;
          return true;
        };
        var check18IdCardNo = function check18IdCardNo2(idCardNo) {
          var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
          if (!check) return false;
          var addressCode = idCardNo.substring(0, 2);
          check = checkAddressCode(addressCode);
          if (!check) return false;
          var birDayCode = idCardNo.substring(6, 14);
          check = checkBirthDayCode(birDayCode);
          if (!check) return false;
          return checkParityBit(idCardNo);
        };
        var checkIdCardNo = function checkIdCardNo2(idCardNo) {
          var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
          if (!check) return false;
          if (idCardNo.length === 15) {
            return check15IdCardNo(idCardNo);
          }
          return check18IdCardNo(idCardNo);
        };
        return checkIdCardNo(str);
      },
      "zh-HK": function zhHK(str) {
        str = str.trim();
        var regexHKID = /^[A-Z]{1,2}[0-9]{6}((\([0-9A]\))|(\[[0-9A]\])|([0-9A]))$/;
        var regexIsDigit = /^[0-9]$/;
        str = str.toUpperCase();
        if (!regexHKID.test(str)) return false;
        str = str.replace(/\[|\]|\(|\)/g, "");
        if (str.length === 8) str = "3".concat(str);
        var checkSumVal = 0;
        for (var i = 0; i <= 7; i++) {
          var convertedChar = void 0;
          if (!regexIsDigit.test(str[i])) convertedChar = (str[i].charCodeAt(0) - 55) % 11;
          else convertedChar = str[i];
          checkSumVal += convertedChar * (9 - i);
        }
        checkSumVal %= 11;
        var checkSumConverted;
        if (checkSumVal === 0) checkSumConverted = "0";
        else if (checkSumVal === 1) checkSumConverted = "A";
        else checkSumConverted = String(11 - checkSumVal);
        if (checkSumConverted === str[str.length - 1]) return true;
        return false;
      },
      "zh-TW": function zhTW(str) {
        var ALPHABET_CODES = {
          A: 10,
          B: 11,
          C: 12,
          D: 13,
          E: 14,
          F: 15,
          G: 16,
          H: 17,
          I: 34,
          J: 18,
          K: 19,
          L: 20,
          M: 21,
          N: 22,
          O: 35,
          P: 23,
          Q: 24,
          R: 25,
          S: 26,
          T: 27,
          U: 28,
          V: 29,
          W: 32,
          X: 30,
          Y: 31,
          Z: 33
        };
        var sanitized = str.trim().toUpperCase();
        if (!/^[A-Z][0-9]{9}$/.test(sanitized)) return false;
        return Array.from(sanitized).reduce(function(sum, number, index) {
          if (index === 0) {
            var code = ALPHABET_CODES[number];
            return code % 10 * 9 + Math.floor(code / 10);
          }
          if (index === 9) {
            return (10 - sum % 10 - Number(number)) % 10 === 0;
          }
          return sum + Number(number) * (9 - index);
        }, 0);
      },
      PK: function PK(str) {
        var CNIC = /^[1-7][0-9]{4}-[0-9]{7}-[1-9]$/;
        var sanitized = str.trim();
        return CNIC.test(sanitized);
      }
    };
    function isIdentityCard(str, locale) {
      (0, _assertString.default)(str);
      if (locale in validators) {
        return validators[locale](str);
      } else if (locale === "any") {
        for (var key in validators) {
          if (validators.hasOwnProperty(key)) {
            var validator = validators[key];
            if (validator(str)) {
              return true;
            }
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEAN.js
var require_isEAN = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEAN.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEAN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var LENGTH_EAN_8 = 8;
    var LENGTH_EAN_14 = 14;
    var validEanRegex = /^(\d{8}|\d{13}|\d{14})$/;
    function getPositionWeightThroughLengthAndIndex(length, index) {
      if (length === LENGTH_EAN_8 || length === LENGTH_EAN_14) {
        return index % 2 === 0 ? 3 : 1;
      }
      return index % 2 === 0 ? 1 : 3;
    }
    function calculateCheckDigit(ean) {
      var checksum = ean.slice(0, -1).split("").map(function(char, index) {
        return Number(char) * getPositionWeightThroughLengthAndIndex(ean.length, index);
      }).reduce(function(acc, partialSum) {
        return acc + partialSum;
      }, 0);
      var remainder = 10 - checksum % 10;
      return remainder < 10 ? remainder : 0;
    }
    function isEAN(str) {
      (0, _assertString.default)(str);
      var actualCheckDigit = Number(str.slice(-1));
      return validEanRegex.test(str) && actualCheckDigit === calculateCheckDigit(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISIN.js
var require_isISIN = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISIN.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISIN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;
    function isISIN(str) {
      (0, _assertString.default)(str);
      if (!isin.test(str)) {
        return false;
      }
      var double = true;
      var sum = 0;
      for (var i = str.length - 2; i >= 0; i--) {
        if (str[i] >= "A" && str[i] <= "Z") {
          var value = str[i].charCodeAt(0) - 55;
          var lo = value % 10;
          var hi = Math.trunc(value / 10);
          for (var _i = 0, _arr = [lo, hi]; _i < _arr.length; _i++) {
            var digit = _arr[_i];
            if (double) {
              if (digit >= 5) {
                sum += 1 + (digit - 5) * 2;
              } else {
                sum += digit * 2;
              }
            } else {
              sum += digit;
            }
            double = !double;
          }
        } else {
          var _digit = str[i].charCodeAt(0) - "0".charCodeAt(0);
          if (double) {
            if (_digit >= 5) {
              sum += 1 + (_digit - 5) * 2;
            } else {
              sum += _digit * 2;
            }
          } else {
            sum += _digit;
          }
          double = !double;
        }
      }
      var check = Math.trunc((sum + 9) / 10) * 10 - sum;
      return +str[str.length - 1] === check;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISBN.js
var require_isISBN = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISBN.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISBN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var possibleIsbn10 = /^(?:[0-9]{9}X|[0-9]{10})$/;
    var possibleIsbn13 = /^(?:[0-9]{13})$/;
    var factor = [1, 3];
    function isISBN(isbn, options) {
      (0, _assertString.default)(isbn);
      var version = String((options === null || options === void 0 ? void 0 : options.version) || options);
      if (!(options !== null && options !== void 0 && options.version || options)) {
        return isISBN(isbn, {
          version: 10
        }) || isISBN(isbn, {
          version: 13
        });
      }
      var sanitizedIsbn = isbn.replace(/[\s-]+/g, "");
      var checksum = 0;
      if (version === "10") {
        if (!possibleIsbn10.test(sanitizedIsbn)) {
          return false;
        }
        for (var i = 0; i < version - 1; i++) {
          checksum += (i + 1) * sanitizedIsbn.charAt(i);
        }
        if (sanitizedIsbn.charAt(9) === "X") {
          checksum += 10 * 10;
        } else {
          checksum += 10 * sanitizedIsbn.charAt(9);
        }
        if (checksum % 11 === 0) {
          return true;
        }
      } else if (version === "13") {
        if (!possibleIsbn13.test(sanitizedIsbn)) {
          return false;
        }
        for (var _i = 0; _i < 12; _i++) {
          checksum += factor[_i % 2] * sanitizedIsbn.charAt(_i);
        }
        if (sanitizedIsbn.charAt(12) - (10 - checksum % 10) % 10 === 0) {
          return true;
        }
      }
      return false;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISSN.js
var require_isISSN = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISSN.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISSN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var issn = "^\\d{4}-?\\d{3}[\\dX]$";
    function isISSN(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      var testIssn = issn;
      testIssn = options.require_hyphen ? testIssn.replace("?", "") : testIssn;
      testIssn = options.case_sensitive ? new RegExp(testIssn) : new RegExp(testIssn, "i");
      if (!testIssn.test(str)) {
        return false;
      }
      var digits = str.replace("-", "").toUpperCase();
      var checksum = 0;
      for (var i = 0; i < digits.length; i++) {
        var digit = digits[i];
        checksum += (digit === "X" ? 10 : +digit) * (8 - i);
      }
      return checksum % 11 === 0;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/algorithms.js
var require_algorithms = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/util/algorithms.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.iso7064Check = iso7064Check;
    exports.luhnCheck = luhnCheck;
    exports.reverseMultiplyAndSum = reverseMultiplyAndSum;
    exports.verhoeffCheck = verhoeffCheck;
    function iso7064Check(str) {
      var checkvalue = 10;
      for (var i = 0; i < str.length - 1; i++) {
        checkvalue = (parseInt(str[i], 10) + checkvalue) % 10 === 0 ? 10 * 2 % 11 : (parseInt(str[i], 10) + checkvalue) % 10 * 2 % 11;
      }
      checkvalue = checkvalue === 1 ? 0 : 11 - checkvalue;
      return checkvalue === parseInt(str[10], 10);
    }
    function luhnCheck(str) {
      var checksum = 0;
      var second = false;
      for (var i = str.length - 1; i >= 0; i--) {
        if (second) {
          var product = parseInt(str[i], 10) * 2;
          if (product > 9) {
            checksum += product.toString().split("").map(function(a) {
              return parseInt(a, 10);
            }).reduce(function(a, b) {
              return a + b;
            }, 0);
          } else {
            checksum += product;
          }
        } else {
          checksum += parseInt(str[i], 10);
        }
        second = !second;
      }
      return checksum % 10 === 0;
    }
    function reverseMultiplyAndSum(digits, base) {
      var total = 0;
      for (var i = 0; i < digits.length; i++) {
        total += digits[i] * (base - i);
      }
      return total;
    }
    function verhoeffCheck(str) {
      var d_table = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
      var p_table = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
      var str_copy = str.split("").reverse().join("");
      var checksum = 0;
      for (var i = 0; i < str_copy.length; i++) {
        checksum = d_table[checksum][p_table[i % 8][parseInt(str_copy[i], 10)]];
      }
      return checksum === 0;
    }
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isTaxID.js
var require_isTaxID = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isTaxID.js"(exports, module) {
    "use strict";
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isTaxID;
    var _assertString = _interopRequireDefault(require_assertString());
    var algorithms = _interopRequireWildcard(require_algorithms());
    var _isDate = _interopRequireDefault(require_isDate());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, default: e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _toConsumableArray(r) {
      return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }
    function _iterableToArray(r) {
      if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
    }
    function _arrayWithoutHoles(r) {
      if (Array.isArray(r)) return _arrayLikeToArray(r);
    }
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    function bgBgCheck(tin) {
      var century_year = tin.slice(0, 2);
      var month = parseInt(tin.slice(2, 4), 10);
      if (month > 40) {
        month -= 40;
        century_year = "20".concat(century_year);
      } else if (month > 20) {
        month -= 20;
        century_year = "18".concat(century_year);
      } else {
        century_year = "19".concat(century_year);
      }
      if (month < 10) {
        month = "0".concat(month);
      }
      var date = "".concat(century_year, "/").concat(month, "/").concat(tin.slice(4, 6));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var multip_lookup = [2, 4, 8, 5, 10, 9, 7, 3, 6];
      var checksum = 0;
      for (var i = 0; i < multip_lookup.length; i++) {
        checksum += digits[i] * multip_lookup[i];
      }
      checksum = checksum % 11 === 10 ? 0 : checksum % 11;
      return checksum === digits[9];
    }
    function isCanadianSIN(input) {
      var digitsArray = input.split("");
      var even = digitsArray.filter(function(_, idx) {
        return idx % 2;
      }).map(function(i) {
        return Number(i) * 2;
      }).join("").split("");
      var total = digitsArray.filter(function(_, idx) {
        return !(idx % 2);
      }).concat(even).map(function(i) {
        return Number(i);
      }).reduce(function(acc, cur) {
        return acc + cur;
      });
      return total % 10 === 0;
    }
    function csCzCheck(tin) {
      tin = tin.replace(/\W/, "");
      var full_year = parseInt(tin.slice(0, 2), 10);
      if (tin.length === 10) {
        if (full_year < 54) {
          full_year = "20".concat(full_year);
        } else {
          full_year = "19".concat(full_year);
        }
      } else {
        if (tin.slice(6) === "000") {
          return false;
        }
        if (full_year < 54) {
          full_year = "19".concat(full_year);
        } else {
          return false;
        }
      }
      if (full_year.length === 3) {
        full_year = [full_year.slice(0, 2), "0", full_year.slice(2)].join("");
      }
      var month = parseInt(tin.slice(2, 4), 10);
      if (month > 50) {
        month -= 50;
      }
      if (month > 20) {
        if (parseInt(full_year, 10) < 2004) {
          return false;
        }
        month -= 20;
      }
      if (month < 10) {
        month = "0".concat(month);
      }
      var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      if (tin.length === 10) {
        if (parseInt(tin, 10) % 11 !== 0) {
          var checkdigit = parseInt(tin.slice(0, 9), 10) % 11;
          if (parseInt(full_year, 10) < 1986 && checkdigit === 10) {
            if (parseInt(tin.slice(9), 10) !== 0) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    }
    function deAtCheck(tin) {
      return algorithms.luhnCheck(tin);
    }
    function deDeCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var occurrences = [];
      for (var i = 0; i < digits.length - 1; i++) {
        occurrences.push("");
        for (var j = 0; j < digits.length - 1; j++) {
          if (digits[i] === digits[j]) {
            occurrences[i] += j;
          }
        }
      }
      occurrences = occurrences.filter(function(a) {
        return a.length > 1;
      });
      if (occurrences.length !== 2 && occurrences.length !== 3) {
        return false;
      }
      if (occurrences[0].length === 3) {
        var trip_locations = occurrences[0].split("").map(function(a) {
          return parseInt(a, 10);
        });
        var recurrent = 0;
        for (var _i = 0; _i < trip_locations.length - 1; _i++) {
          if (trip_locations[_i] + 1 === trip_locations[_i + 1]) {
            recurrent += 1;
          }
        }
        if (recurrent === 2) {
          return false;
        }
      }
      return algorithms.iso7064Check(tin);
    }
    function dkDkCheck(tin) {
      tin = tin.replace(/\W/, "");
      var year = parseInt(tin.slice(4, 6), 10);
      var century_digit = tin.slice(6, 7);
      switch (century_digit) {
        case "0":
        case "1":
        case "2":
        case "3":
          year = "19".concat(year);
          break;
        case "4":
        case "9":
          if (year < 37) {
            year = "20".concat(year);
          } else {
            year = "19".concat(year);
          }
          break;
        default:
          if (year < 37) {
            year = "20".concat(year);
          } else if (year > 58) {
            year = "18".concat(year);
          } else {
            return false;
          }
          break;
      }
      if (year.length === 3) {
        year = [year.slice(0, 2), "0", year.slice(2)].join("");
      }
      var date = "".concat(year, "/").concat(tin.slice(2, 4), "/").concat(tin.slice(0, 2));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      var weight = 4;
      for (var i = 0; i < 9; i++) {
        checksum += digits[i] * weight;
        weight -= 1;
        if (weight === 1) {
          weight = 7;
        }
      }
      checksum %= 11;
      if (checksum === 1) {
        return false;
      }
      return checksum === 0 ? digits[9] === 0 : digits[9] === 11 - checksum;
    }
    function elCyCheck(tin) {
      var digits = tin.slice(0, 8).split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      for (var i = 1; i < digits.length; i += 2) {
        checksum += digits[i];
      }
      for (var _i2 = 0; _i2 < digits.length; _i2 += 2) {
        if (digits[_i2] < 2) {
          checksum += 1 - digits[_i2];
        } else {
          checksum += 2 * (digits[_i2] - 2) + 5;
          if (digits[_i2] > 4) {
            checksum += 2;
          }
        }
      }
      return String.fromCharCode(checksum % 26 + 65) === tin.charAt(8);
    }
    function elGrCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      for (var i = 0; i < 8; i++) {
        checksum += digits[i] * Math.pow(2, 8 - i);
      }
      return checksum % 11 % 10 === digits[8];
    }
    function enIeCheck(tin) {
      var checksum = algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 7).map(function(a) {
        return parseInt(a, 10);
      }), 8);
      if (tin.length === 9 && tin[8] !== "W") {
        checksum += (tin[8].charCodeAt(0) - 64) * 9;
      }
      checksum %= 23;
      if (checksum === 0) {
        return tin[7].toUpperCase() === "W";
      }
      return tin[7].toUpperCase() === String.fromCharCode(64 + checksum);
    }
    var enUsCampusPrefix = {
      andover: ["10", "12"],
      atlanta: ["60", "67"],
      austin: ["50", "53"],
      brookhaven: ["01", "02", "03", "04", "05", "06", "11", "13", "14", "16", "21", "22", "23", "25", "34", "51", "52", "54", "55", "56", "57", "58", "59", "65"],
      cincinnati: ["30", "32", "35", "36", "37", "38", "61"],
      fresno: ["15", "24"],
      internet: ["20", "26", "27", "45", "46", "47"],
      kansas: ["40", "44"],
      memphis: ["94", "95"],
      ogden: ["80", "90"],
      philadelphia: ["33", "39", "41", "42", "43", "46", "48", "62", "63", "64", "66", "68", "71", "72", "73", "74", "75", "76", "77", "81", "82", "83", "84", "85", "86", "87", "88", "91", "92", "93", "98", "99"],
      sba: ["31"]
    };
    function enUsGetPrefixes() {
      var prefixes = [];
      for (var location in enUsCampusPrefix) {
        if (enUsCampusPrefix.hasOwnProperty(location)) {
          prefixes.push.apply(prefixes, _toConsumableArray(enUsCampusPrefix[location]));
        }
      }
      return prefixes;
    }
    function enUsCheck(tin) {
      return enUsGetPrefixes().indexOf(tin.slice(0, 2)) !== -1;
    }
    function esArCheck(tin) {
      var accum = 0;
      var digits = tin.split("");
      var digit = parseInt(digits.pop(), 10);
      for (var i = 0; i < digits.length; i++) {
        accum += digits[9 - i] * (2 + i % 6);
      }
      var verif = 11 - accum % 11;
      if (verif === 11) {
        verif = 0;
      } else if (verif === 10) {
        verif = 9;
      }
      return digit === verif;
    }
    function esEsCheck(tin) {
      var chars = tin.toUpperCase().split("");
      if (isNaN(parseInt(chars[0], 10)) && chars.length > 1) {
        var lead_replace = 0;
        switch (chars[0]) {
          case "Y":
            lead_replace = 1;
            break;
          case "Z":
            lead_replace = 2;
            break;
          default:
        }
        chars.splice(0, 1, lead_replace);
      } else {
        while (chars.length < 9) {
          chars.unshift(0);
        }
      }
      var lookup = ["T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E"];
      chars = chars.join("");
      var checksum = parseInt(chars.slice(0, 8), 10) % 23;
      return chars[8] === lookup[checksum];
    }
    function etEeCheck(tin) {
      var full_year = tin.slice(1, 3);
      var century_digit = tin.slice(0, 1);
      switch (century_digit) {
        case "1":
        case "2":
          full_year = "18".concat(full_year);
          break;
        case "3":
        case "4":
          full_year = "19".concat(full_year);
          break;
        default:
          full_year = "20".concat(full_year);
          break;
      }
      var date = "".concat(full_year, "/").concat(tin.slice(3, 5), "/").concat(tin.slice(5, 7));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      var weight = 1;
      for (var i = 0; i < 10; i++) {
        checksum += digits[i] * weight;
        weight += 1;
        if (weight === 10) {
          weight = 1;
        }
      }
      if (checksum % 11 === 10) {
        checksum = 0;
        weight = 3;
        for (var _i3 = 0; _i3 < 10; _i3++) {
          checksum += digits[_i3] * weight;
          weight += 1;
          if (weight === 10) {
            weight = 1;
          }
        }
        if (checksum % 11 === 10) {
          return digits[10] === 0;
        }
      }
      return checksum % 11 === digits[10];
    }
    function fiFiCheck(tin) {
      var full_year = tin.slice(4, 6);
      var century_symbol = tin.slice(6, 7);
      switch (century_symbol) {
        case "+":
          full_year = "18".concat(full_year);
          break;
        case "-":
          full_year = "19".concat(full_year);
          break;
        default:
          full_year = "20".concat(full_year);
          break;
      }
      var date = "".concat(full_year, "/").concat(tin.slice(2, 4), "/").concat(tin.slice(0, 2));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var checksum = parseInt(tin.slice(0, 6) + tin.slice(7, 10), 10) % 31;
      if (checksum < 10) {
        return checksum === parseInt(tin.slice(10), 10);
      }
      checksum -= 10;
      var letters_lookup = ["A", "B", "C", "D", "E", "F", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y"];
      return letters_lookup[checksum] === tin.slice(10);
    }
    function frBeCheck(tin) {
      if (tin.slice(2, 4) !== "00" || tin.slice(4, 6) !== "00") {
        var date = "".concat(tin.slice(0, 2), "/").concat(tin.slice(2, 4), "/").concat(tin.slice(4, 6));
        if (!(0, _isDate.default)(date, "YY/MM/DD")) {
          return false;
        }
      }
      var checksum = 97 - parseInt(tin.slice(0, 9), 10) % 97;
      var checkdigits = parseInt(tin.slice(9, 11), 10);
      if (checksum !== checkdigits) {
        checksum = 97 - parseInt("2".concat(tin.slice(0, 9)), 10) % 97;
        if (checksum !== checkdigits) {
          return false;
        }
      }
      return true;
    }
    function frFrCheck(tin) {
      tin = tin.replace(/\s/g, "");
      var checksum = parseInt(tin.slice(0, 10), 10) % 511;
      var checkdigits = parseInt(tin.slice(10, 13), 10);
      return checksum === checkdigits;
    }
    function frLuCheck(tin) {
      var date = "".concat(tin.slice(0, 4), "/").concat(tin.slice(4, 6), "/").concat(tin.slice(6, 8));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      if (!algorithms.luhnCheck(tin.slice(0, 12))) {
        return false;
      }
      return algorithms.verhoeffCheck("".concat(tin.slice(0, 11)).concat(tin[12]));
    }
    function hrHrCheck(tin) {
      return algorithms.iso7064Check(tin);
    }
    function huHuCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 8;
      for (var i = 1; i < 9; i++) {
        checksum += digits[i] * (i + 1);
      }
      return checksum % 11 === digits[9];
    }
    function itItNameCheck(name) {
      var vowelflag = false;
      var xflag = false;
      for (var i = 0; i < 3; i++) {
        if (!vowelflag && /[AEIOU]/.test(name[i])) {
          vowelflag = true;
        } else if (!xflag && vowelflag && name[i] === "X") {
          xflag = true;
        } else if (i > 0) {
          if (vowelflag && !xflag) {
            if (!/[AEIOU]/.test(name[i])) {
              return false;
            }
          }
          if (xflag) {
            if (!/X/.test(name[i])) {
              return false;
            }
          }
        }
      }
      return true;
    }
    function itItCheck(tin) {
      var chars = tin.toUpperCase().split("");
      if (!itItNameCheck(chars.slice(0, 3))) {
        return false;
      }
      if (!itItNameCheck(chars.slice(3, 6))) {
        return false;
      }
      var number_locations = [6, 7, 9, 10, 12, 13, 14];
      var number_replace = {
        L: "0",
        M: "1",
        N: "2",
        P: "3",
        Q: "4",
        R: "5",
        S: "6",
        T: "7",
        U: "8",
        V: "9"
      };
      for (var _i4 = 0, _number_locations = number_locations; _i4 < _number_locations.length; _i4++) {
        var i = _number_locations[_i4];
        if (chars[i] in number_replace) {
          chars.splice(i, 1, number_replace[chars[i]]);
        }
      }
      var month_replace = {
        A: "01",
        B: "02",
        C: "03",
        D: "04",
        E: "05",
        H: "06",
        L: "07",
        M: "08",
        P: "09",
        R: "10",
        S: "11",
        T: "12"
      };
      var month = month_replace[chars[8]];
      var day = parseInt(chars[9] + chars[10], 10);
      if (day > 40) {
        day -= 40;
      }
      if (day < 10) {
        day = "0".concat(day);
      }
      var date = "".concat(chars[6]).concat(chars[7], "/").concat(month, "/").concat(day);
      if (!(0, _isDate.default)(date, "YY/MM/DD")) {
        return false;
      }
      var checksum = 0;
      for (var _i5 = 1; _i5 < chars.length - 1; _i5 += 2) {
        var char_to_int = parseInt(chars[_i5], 10);
        if (isNaN(char_to_int)) {
          char_to_int = chars[_i5].charCodeAt(0) - 65;
        }
        checksum += char_to_int;
      }
      var odd_convert = {
        // Maps of characters at odd places
        A: 1,
        B: 0,
        C: 5,
        D: 7,
        E: 9,
        F: 13,
        G: 15,
        H: 17,
        I: 19,
        J: 21,
        K: 2,
        L: 4,
        M: 18,
        N: 20,
        O: 11,
        P: 3,
        Q: 6,
        R: 8,
        S: 12,
        T: 14,
        U: 16,
        V: 10,
        W: 22,
        X: 25,
        Y: 24,
        Z: 23,
        0: 1,
        1: 0
      };
      for (var _i6 = 0; _i6 < chars.length - 1; _i6 += 2) {
        var _char_to_int = 0;
        if (chars[_i6] in odd_convert) {
          _char_to_int = odd_convert[chars[_i6]];
        } else {
          var multiplier = parseInt(chars[_i6], 10);
          _char_to_int = 2 * multiplier + 1;
          if (multiplier > 4) {
            _char_to_int += 2;
          }
        }
        checksum += _char_to_int;
      }
      if (String.fromCharCode(65 + checksum % 26) !== chars[15]) {
        return false;
      }
      return true;
    }
    function lvLvCheck(tin) {
      tin = tin.replace(/\W/, "");
      var day = tin.slice(0, 2);
      if (day !== "32") {
        var month = tin.slice(2, 4);
        if (month !== "00") {
          var full_year = tin.slice(4, 6);
          switch (tin[6]) {
            case "0":
              full_year = "18".concat(full_year);
              break;
            case "1":
              full_year = "19".concat(full_year);
              break;
            default:
              full_year = "20".concat(full_year);
              break;
          }
          var date = "".concat(full_year, "/").concat(tin.slice(2, 4), "/").concat(day);
          if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
            return false;
          }
        }
        var checksum = 1101;
        var multip_lookup = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        for (var i = 0; i < tin.length - 1; i++) {
          checksum -= parseInt(tin[i], 10) * multip_lookup[i];
        }
        return parseInt(tin[10], 10) === checksum % 11;
      }
      return true;
    }
    function mtMtCheck(tin) {
      if (tin.length !== 9) {
        var chars = tin.toUpperCase().split("");
        while (chars.length < 8) {
          chars.unshift(0);
        }
        switch (tin[7]) {
          case "A":
          case "P":
            if (parseInt(chars[6], 10) === 0) {
              return false;
            }
            break;
          default: {
            var first_part = parseInt(chars.join("").slice(0, 5), 10);
            if (first_part > 32e3) {
              return false;
            }
            var second_part = parseInt(chars.join("").slice(5, 7), 10);
            if (first_part === second_part) {
              return false;
            }
          }
        }
      }
      return true;
    }
    function nlNlCheck(tin) {
      return algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 8).map(function(a) {
        return parseInt(a, 10);
      }), 9) % 11 === parseInt(tin[8], 10);
    }
    function plPlCheck(tin) {
      if (tin.length === 10) {
        var lookup = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        var _checksum = 0;
        for (var i = 0; i < lookup.length; i++) {
          _checksum += parseInt(tin[i], 10) * lookup[i];
        }
        _checksum %= 11;
        if (_checksum === 10) {
          return false;
        }
        return _checksum === parseInt(tin[9], 10);
      }
      var full_year = tin.slice(0, 2);
      var month = parseInt(tin.slice(2, 4), 10);
      if (month > 80) {
        full_year = "18".concat(full_year);
        month -= 80;
      } else if (month > 60) {
        full_year = "22".concat(full_year);
        month -= 60;
      } else if (month > 40) {
        full_year = "21".concat(full_year);
        month -= 40;
      } else if (month > 20) {
        full_year = "20".concat(full_year);
        month -= 20;
      } else {
        full_year = "19".concat(full_year);
      }
      if (month < 10) {
        month = "0".concat(month);
      }
      var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var checksum = 0;
      var multiplier = 1;
      for (var _i7 = 0; _i7 < tin.length - 1; _i7++) {
        checksum += parseInt(tin[_i7], 10) * multiplier % 10;
        multiplier += 2;
        if (multiplier > 10) {
          multiplier = 1;
        } else if (multiplier === 5) {
          multiplier += 2;
        }
      }
      checksum = 10 - checksum % 10;
      return checksum === parseInt(tin[10], 10);
    }
    function cnpjCharToValue(char) {
      return char.charCodeAt(0) - 48;
    }
    function validateCnpj(cnpj) {
      var identifiers = cnpj.substring(0, 12).toUpperCase();
      var checkDigits = cnpj.substring(12);
      if (/^(.)\1+$/.test(cnpj.toUpperCase())) {
        return false;
      }
      var sum = 0;
      var weight = 5;
      for (var i = 0; i < 12; i++) {
        sum += cnpjCharToValue(identifiers.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      var remainder = sum % 11;
      var firstDV = remainder < 2 ? 0 : 11 - remainder;
      if (firstDV !== parseInt(checkDigits.charAt(0), 10)) {
        return false;
      }
      sum = 0;
      weight = 6;
      for (var _i8 = 0; _i8 < 12; _i8++) {
        sum += cnpjCharToValue(identifiers.charAt(_i8)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      sum += firstDV * 2;
      remainder = sum % 11;
      var secondDV = remainder < 2 ? 0 : 11 - remainder;
      return secondDV === parseInt(checkDigits.charAt(1), 10);
    }
    function ptBrCheck(tin) {
      tin = tin.replace(/[.\-/]/g, "");
      if (tin.length === 11) {
        var sum;
        var remainder;
        sum = 0;
        if (
          // Reject known invalid CPFs
          tin === "11111111111" || tin === "22222222222" || tin === "33333333333" || tin === "44444444444" || tin === "55555555555" || tin === "66666666666" || tin === "77777777777" || tin === "88888888888" || tin === "99999999999" || tin === "00000000000"
        ) return false;
        for (var i = 1; i <= 9; i++) sum += parseInt(tin.substring(i - 1, i), 10) * (11 - i);
        remainder = sum * 10 % 11;
        if (remainder === 10) remainder = 0;
        if (remainder !== parseInt(tin.substring(9, 10), 10)) return false;
        sum = 0;
        for (var _i9 = 1; _i9 <= 10; _i9++) sum += parseInt(tin.substring(_i9 - 1, _i9), 10) * (12 - _i9);
        remainder = sum * 10 % 11;
        if (remainder === 10) remainder = 0;
        if (remainder !== parseInt(tin.substring(10, 11), 10)) return false;
        return true;
      }
      return validateCnpj(tin);
    }
    function ptPtCheck(tin) {
      var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 8).map(function(a) {
        return parseInt(a, 10);
      }), 9) % 11;
      if (checksum > 9) {
        return parseInt(tin[8], 10) === 0;
      }
      return checksum === parseInt(tin[8], 10);
    }
    function roRoCheck(tin) {
      if (tin.slice(0, 4) !== "9000") {
        var full_year = tin.slice(1, 3);
        switch (tin[0]) {
          case "1":
          case "2":
            full_year = "19".concat(full_year);
            break;
          case "3":
          case "4":
            full_year = "18".concat(full_year);
            break;
          case "5":
          case "6":
            full_year = "20".concat(full_year);
            break;
          default:
        }
        var date = "".concat(full_year, "/").concat(tin.slice(3, 5), "/").concat(tin.slice(5, 7));
        if (date.length === 8) {
          if (!(0, _isDate.default)(date, "YY/MM/DD")) {
            return false;
          }
        } else if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
          return false;
        }
        var digits = tin.split("").map(function(a) {
          return parseInt(a, 10);
        });
        var multipliers = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
        var checksum = 0;
        for (var i = 0; i < multipliers.length; i++) {
          checksum += digits[i] * multipliers[i];
        }
        if (checksum % 11 === 10) {
          return digits[12] === 1;
        }
        return digits[12] === checksum % 11;
      }
      return true;
    }
    function skSkCheck(tin) {
      if (tin.length === 9) {
        tin = tin.replace(/\W/, "");
        if (tin.slice(6) === "000") {
          return false;
        }
        var full_year = parseInt(tin.slice(0, 2), 10);
        if (full_year > 53) {
          return false;
        }
        if (full_year < 10) {
          full_year = "190".concat(full_year);
        } else {
          full_year = "19".concat(full_year);
        }
        var month = parseInt(tin.slice(2, 4), 10);
        if (month > 50) {
          month -= 50;
        }
        if (month < 10) {
          month = "0".concat(month);
        }
        var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));
        if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
          return false;
        }
      }
      return true;
    }
    function slSiCheck(tin) {
      var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 7).map(function(a) {
        return parseInt(a, 10);
      }), 8) % 11;
      if (checksum === 10) {
        return parseInt(tin[7], 10) === 0;
      }
      return checksum === parseInt(tin[7], 10);
    }
    function svSeCheck(tin) {
      var tin_copy = tin.slice(0);
      if (tin.length > 11) {
        tin_copy = tin_copy.slice(2);
      }
      var full_year = "";
      var month = tin_copy.slice(2, 4);
      var day = parseInt(tin_copy.slice(4, 6), 10);
      if (tin.length > 11) {
        full_year = tin.slice(0, 4);
      } else {
        full_year = tin.slice(0, 2);
        if (tin.length === 11 && day < 60) {
          var current_year = (/* @__PURE__ */ new Date()).getFullYear().toString();
          var current_century = parseInt(current_year.slice(0, 2), 10);
          current_year = parseInt(current_year, 10);
          if (tin[6] === "-") {
            if (parseInt("".concat(current_century).concat(full_year), 10) > current_year) {
              full_year = "".concat(current_century - 1).concat(full_year);
            } else {
              full_year = "".concat(current_century).concat(full_year);
            }
          } else {
            full_year = "".concat(current_century - 1).concat(full_year);
            if (current_year - parseInt(full_year, 10) < 100) {
              return false;
            }
          }
        }
      }
      if (day > 60) {
        day -= 60;
      }
      if (day < 10) {
        day = "0".concat(day);
      }
      var date = "".concat(full_year, "/").concat(month, "/").concat(day);
      if (date.length === 8) {
        if (!(0, _isDate.default)(date, "YY/MM/DD")) {
          return false;
        }
      } else if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      return algorithms.luhnCheck(tin.replace(/\W/, ""));
    }
    function ukUaCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var multipliers = [-1, 5, 7, 9, 4, 6, 10, 5, 7];
      var checksum = 0;
      for (var i = 0; i < multipliers.length; i++) {
        checksum += digits[i] * multipliers[i];
      }
      return checksum % 11 === 10 ? digits[9] === 0 : digits[9] === checksum % 11;
    }
    var taxIdFormat = {
      "bg-BG": /^\d{10}$/,
      "cs-CZ": /^\d{6}\/{0,1}\d{3,4}$/,
      "de-AT": /^\d{9}$/,
      "de-DE": /^[1-9]\d{10}$/,
      "dk-DK": /^\d{6}-{0,1}\d{4}$/,
      "el-CY": /^[09]\d{7}[A-Z]$/,
      "el-GR": /^([0-4]|[7-9])\d{8}$/,
      "en-CA": /^\d{9}$/,
      "en-GB": /^\d{10}$|^(?!GB|NK|TN|ZZ)(?![DFIQUV])[A-Z](?![DFIQUVO])[A-Z]\d{6}[ABCD ]$/i,
      "en-IE": /^\d{7}[A-W][A-IW]{0,1}$/i,
      "en-US": /^\d{2}[- ]{0,1}\d{7}$/,
      "es-AR": /(20|23|24|27|30|33|34)[0-9]{8}[0-9]/,
      "es-ES": /^(\d{0,8}|[XYZKLM]\d{7})[A-HJ-NP-TV-Z]$/i,
      "et-EE": /^[1-6]\d{6}(00[1-9]|0[1-9][0-9]|[1-6][0-9]{2}|70[0-9]|710)\d$/,
      "fi-FI": /^\d{6}[-+A]\d{3}[0-9A-FHJ-NPR-Y]$/i,
      "fr-BE": /^\d{11}$/,
      "fr-FR": /^[0-3]\d{12}$|^[0-3]\d\s\d{2}(\s\d{3}){3}$/,
      // Conforms both to official spec and provided example
      "fr-LU": /^\d{13}$/,
      "hr-HR": /^\d{11}$/,
      "hu-HU": /^8\d{9}$/,
      "it-IT": /^[A-Z]{6}[L-NP-V0-9]{2}[A-EHLMPRST][L-NP-V0-9]{2}[A-ILMZ][L-NP-V0-9]{3}[A-Z]$/i,
      "lv-LV": /^\d{6}-{0,1}\d{5}$/,
      // Conforms both to DG TAXUD spec and original research
      "mt-MT": /^\d{3,7}[APMGLHBZ]$|^([1-8])\1\d{7}$/i,
      "nl-NL": /^\d{9}$/,
      "pl-PL": /^\d{10,11}$/,
      "pt-BR": /(?:^\d{3}\.\d{3}\.\d{3}-\d{2}$)|(?:^\d{11}$)|(?:^[A-Z0-9]{12}\d{2}$)/i,
      "pt-PT": /^\d{9}$/,
      "ro-RO": /^\d{13}$/,
      "sk-SK": /^\d{6}\/{0,1}\d{3,4}$/,
      "sl-SI": /^[1-9]\d{7}$/,
      "sv-SE": /^(\d{6}[-+]{0,1}\d{4}|(18|19|20)\d{6}[-+]{0,1}\d{4})$/,
      "uk-UA": /^\d{10}$/
    };
    taxIdFormat["lb-LU"] = taxIdFormat["fr-LU"];
    taxIdFormat["lt-LT"] = taxIdFormat["et-EE"];
    taxIdFormat["nl-BE"] = taxIdFormat["fr-BE"];
    taxIdFormat["fr-CA"] = taxIdFormat["en-CA"];
    var taxIdCheck = {
      "bg-BG": bgBgCheck,
      "cs-CZ": csCzCheck,
      "de-AT": deAtCheck,
      "de-DE": deDeCheck,
      "dk-DK": dkDkCheck,
      "el-CY": elCyCheck,
      "el-GR": elGrCheck,
      "en-CA": isCanadianSIN,
      "en-IE": enIeCheck,
      "en-US": enUsCheck,
      "es-AR": esArCheck,
      "es-ES": esEsCheck,
      "et-EE": etEeCheck,
      "fi-FI": fiFiCheck,
      "fr-BE": frBeCheck,
      "fr-FR": frFrCheck,
      "fr-LU": frLuCheck,
      "hr-HR": hrHrCheck,
      "hu-HU": huHuCheck,
      "it-IT": itItCheck,
      "lv-LV": lvLvCheck,
      "mt-MT": mtMtCheck,
      "nl-NL": nlNlCheck,
      "pl-PL": plPlCheck,
      "pt-BR": ptBrCheck,
      "pt-PT": ptPtCheck,
      "ro-RO": roRoCheck,
      "sk-SK": skSkCheck,
      "sl-SI": slSiCheck,
      "sv-SE": svSeCheck,
      "uk-UA": ukUaCheck
    };
    taxIdCheck["lb-LU"] = taxIdCheck["fr-LU"];
    taxIdCheck["lt-LT"] = taxIdCheck["et-EE"];
    taxIdCheck["nl-BE"] = taxIdCheck["fr-BE"];
    taxIdCheck["fr-CA"] = taxIdCheck["en-CA"];
    var allsymbols = /[-\\\/!@#$%\^&\*\(\)\+\=\[\]]+/g;
    var sanitizeRegexes = {
      "de-AT": allsymbols,
      "de-DE": /[\/\\]/g,
      "fr-BE": allsymbols
    };
    sanitizeRegexes["nl-BE"] = sanitizeRegexes["fr-BE"];
    function isTaxID(str) {
      var locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "en-US";
      (0, _assertString.default)(str);
      var strcopy = str.slice(0);
      if (locale in taxIdFormat) {
        if (locale in sanitizeRegexes) {
          strcopy = strcopy.replace(sanitizeRegexes[locale], "");
        }
        if (!taxIdFormat[locale].test(strcopy)) {
          return false;
        }
        if (locale in taxIdCheck) {
          return taxIdCheck[locale](strcopy);
        }
        return true;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMobilePhone.js
var require_isMobilePhone = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMobilePhone.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMobilePhone;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var phones = {
      "am-AM": /^(\+?374|0)(33|4[134]|55|77|88|9[13-689])\d{6}$/,
      "ar-AE": /^((\+?971)|0)?5[024568]\d{7}$/,
      "ar-BH": /^(\+?973)?(3|6)\d{7}$/,
      "ar-DZ": /^(\+?213|0)(5|6|7)\d{8}$/,
      "ar-LB": /^(\+?961)?((3|81)\d{6}|7\d{7})$/,
      "ar-EG": /^((\+?20)|0)?1[0125]\d{8}$/,
      "ar-IQ": /^(\+?964|0)?7[0-9]\d{8}$/,
      "ar-JO": /^(\+?962|0)?7[789]\d{7}$/,
      "ar-KW": /^(\+?965)([569]\d{7}|41\d{6})$/,
      "ar-LY": /^((\+?218)|0)?(9[1-6]\d{7}|[1-8]\d{7,9})$/,
      "ar-MA": /^(?:(?:\+|00)212|0)[5-7]\d{8}$/,
      "ar-OM": /^((\+|00)968)?([79][1-9])\d{6}$/,
      "ar-PS": /^(\+?970|0)5[6|9](\d{7})$/,
      "ar-SA": /^(!?(\+?966)|0)?5\d{8}$/,
      "ar-SD": /^((\+?249)|0)?(9[012369]|1[012])\d{7}$/,
      "ar-SY": /^(!?(\+?963)|0)?9\d{8}$/,
      "ar-TN": /^(\+?216)?[2459]\d{7}$/,
      "az-AZ": /^(\+994|0)(10|5[015]|7[07]|99)\d{7}$/,
      "ar-QA": /^(\+?974|0)?([3567]\d{7})$/,
      "bs-BA": /^((((\+|00)3876)|06))((([0-3]|[5-6])\d{6})|(4\d{7}))$/,
      "be-BY": /^(\+?375)?(24|25|29|33|44)\d{7}$/,
      "bg-BG": /^(\+?359|0)?8[789]\d{7}$/,
      "bn-BD": /^(\+?880|0)1[13456789][0-9]{8}$/,
      "ca-AD": /^(\+376)?[346]\d{5}$/,
      "cs-CZ": /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
      "da-DK": /^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "de-DE": /^((\+49|0)1)(5[0-25-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7,9}$/,
      "de-AT": /^(\+43|0)\d{1,4}\d{3,12}$/,
      "de-CH": /^(\+41|0)([1-9])\d{1,9}$/,
      "de-LU": /^(\+352)?((6\d1)\d{6})$/,
      "dv-MV": /^(\+?960)?(7[2-9]|9[1-9])\d{5}$/,
      "el-GR": /^(\+?30|0)?6(8[5-9]|9(?![26])[0-9])\d{7}$/,
      "el-CY": /^(\+?357?)?(9(9|7|6|5|4)\d{6})$/,
      "en-AI": /^(\+?1|0)264(?:2(35|92)|4(?:6[1-2]|76|97)|5(?:3[6-9]|8[1-4])|7(?:2(4|9)|72))\d{4}$/,
      "en-AU": /^(\+?61|0)4\d{8}$/,
      "en-AG": /^(?:\+1|1)268(?:464|7(?:1[3-9]|[28]\d|3[0246]|64|7[0-689]))\d{4}$/,
      "en-BM": /^(\+?1)?441(((3|7)\d{6}$)|(5[0-3][0-9]\d{4}$)|(59\d{5}$))/,
      "en-BS": /^(\+?1[-\s]?|0)?\(?242\)?[-\s]?\d{3}[-\s]?\d{4}$/,
      "en-GB": /^(\+?44|0)7[1-9]\d{8}$/,
      "en-GG": /^(\+?44|0)1481\d{6}$/,
      "en-GH": /^(\+233|0)(20|50|24|54|27|57|26|56|23|53|28|55|59)\d{7}$/,
      "en-GY": /^(\+592|0)6\d{6}$/,
      "en-HK": /^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$/,
      "en-MO": /^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$/,
      "en-IE": /^(\+?353|0)8[356789]\d{7}$/,
      "en-IN": /^(\+?91|0)?[6789]\d{9}$/,
      "en-JM": /^(\+?876)?\d{7}$/,
      "en-KE": /^(\+?254|0)(7|1)\d{8}$/,
      "fr-CF": /^(\+?236| ?)(70|75|77|72|21|22)\d{6}$/,
      "en-SS": /^(\+?211|0)(9[1257])\d{7}$/,
      "en-KI": /^((\+686|686)?)?( )?((6|7)(2|3|8)[0-9]{6})$/,
      "en-KN": /^(?:\+1|1)869(?:46\d|48[89]|55[6-8]|66\d|76[02-7])\d{4}$/,
      "en-LS": /^(\+?266)(22|28|57|58|59|27|52)\d{6}$/,
      "en-MT": /^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$/,
      "en-MU": /^(\+?230|0)?\d{8}$/,
      "en-MW": /^(\+?265|0)(((77|88|31|99|98|21)\d{7})|(((111)|1)\d{6})|(32000\d{4}))$/,
      "en-NA": /^(\+?264|0)(6|8)\d{7}$/,
      "en-NG": /^(\+?234|0)?[789]\d{9}$/,
      "en-NZ": /^(\+?64|0)[28]\d{7,9}$/,
      "en-PG": /^(\+?675|0)?(7\d|8[18])\d{6}$/,
      "en-PK": /^((00|\+)?92|0)3[0-6]\d{8}$/,
      "en-PH": /^(09|\+639)\d{9}$/,
      "en-RW": /^(\+?250|0)?[7]\d{8}$/,
      "en-SG": /^(\+65)?[3689]\d{7}$/,
      "en-SL": /^(\+?232|0)\d{8}$/,
      "en-TZ": /^(\+?255|0)?[67]\d{8}$/,
      "en-UG": /^(\+?256|0)?[7]\d{8}$/,
      "en-US": /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/,
      "en-ZA": /^(\+?27|0)\d{9}$/,
      "en-ZM": /^(\+?26)?0[79][567]\d{7}$/,
      "en-ZW": /^(\+263)[0-9]{9}$/,
      "en-BW": /^(\+?267)?(7[1-8]{1})\d{6}$/,
      "es-AR": /^\+?549(11|[2368]\d)\d{8}$/,
      "es-BO": /^(\+?591)?(6|7)\d{7}$/,
      "es-CO": /^(\+?57)?3(0(0|1|2|4|5)|1\d|2[0-4]|5(0|1))\d{7}$/,
      "es-CL": /^(\+?56|0)[2-9]\d{1}\d{7}$/,
      "es-CR": /^(\+506)?[2-8]\d{7}$/,
      "es-CU": /^(\+53|0053)?5\d{7}$/,
      "es-DO": /^(\+?1)?8[024]9\d{7}$/,
      "es-HN": /^(\+?504)?[9|8|3|2]\d{7}$/,
      "es-EC": /^(\+?593|0)([2-7]|9[2-9])\d{7}$/,
      "es-ES": /^(\+?34)?[6|7]\d{8}$/,
      "es-GT": /^(\+?502)?[2|6|7]\d{7}$/,
      "es-PE": /^(\+?51)?9\d{8}$/,
      "es-MX": /^(\+?52)?(1|01)?\d{10,11}$/,
      "es-NI": /^(\+?505)\d{7,8}$/,
      "es-PA": /^(\+?507)\d{7,8}$/,
      "es-PY": /^(\+?595|0)9[9876]\d{7}$/,
      "es-SV": /^(\+?503)?[67]\d{7}$/,
      "es-UY": /^(\+598|0)9[1-9][\d]{6}$/,
      "es-VE": /^(\+?58)?(2|4)\d{9}$/,
      "et-EE": /^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$/,
      "fa-IR": /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,
      "fi-FI": /^(\+?358|0)\s?(4[0-6]|50)\s?(\d\s?){4,8}$/,
      "fj-FJ": /^(\+?679)?\s?\d{3}\s?\d{4}$/,
      "fo-FO": /^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "fr-BF": /^(\+226|0)[67]\d{7}$/,
      "fr-BJ": /^(\+229)\d{8}$/,
      "fr-CD": /^(\+?243|0)?(8|9)\d{8}$/,
      "fr-CM": /^(\+?237)6[0-9]{8}$/,
      "fr-DJ": /^(?:\+253)?77[6-8]\d{5}$/,
      "fr-FR": /^(\+?33|0)[67]\d{8}$/,
      "fr-GF": /^(\+?594|0|00594)[67]\d{8}$/,
      "fr-GP": /^(\+?590|0|00590)[67]\d{8}$/,
      "fr-MQ": /^(\+?596|0|00596)[67]\d{8}$/,
      "fr-PF": /^(\+?689)?8[789]\d{6}$/,
      "fr-RE": /^(\+?262|0|00262)[67]\d{8}$/,
      "fr-WF": /^(\+681)?\d{6}$/,
      "he-IL": /^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/,
      "hu-HU": /^(\+?36|06)(20|30|31|50|70)\d{7}$/,
      "id-ID": /^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/,
      "ir-IR": /^(\+98|0)?9\d{9}$/,
      "it-IT": /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
      "it-SM": /^((\+378)|(0549)|(\+390549)|(\+3780549))?6\d{5,9}$/,
      "ja-JP": /^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$/,
      "ka-GE": /^(\+?995)?(79\d{7}|5\d{8})$/,
      "kk-KZ": /^(\+?7|8)?7\d{9}$/,
      "kl-GL": /^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "ko-KR": /^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/,
      "ky-KG": /^(\+996\s?)?(22[0-9]|50[0-9]|55[0-9]|70[0-9]|75[0-9]|77[0-9]|880|990|995|996|997|998)\s?\d{3}\s?\d{3}$/,
      "lt-LT": /^(\+370|8)\d{8}$/,
      "lv-LV": /^(\+?371)2\d{7}$/,
      "mg-MG": /^((\+?261|0)(2|3)\d)?\d{7}$/,
      "mn-MN": /^(\+|00|011)?976(77|81|88|91|94|95|96|99)\d{6}$/,
      "my-MM": /^(\+?959|09|9)(2[5-7]|3[1-2]|4[0-5]|6[6-9]|7[5-9]|9[6-9])[0-9]{7}$/,
      "ms-MY": /^(\+?60|0)1(([0145](-|\s)?\d{7,8})|([236-9](-|\s)?\d{7}))$/,
      "mz-MZ": /^(\+?258)?8[234567]\d{7}$/,
      "nb-NO": /^(\+?47)?[49]\d{7}$/,
      "ne-NP": /^(\+?977)?9[78]\d{8}$/,
      "nl-BE": /^(\+?32|0)4\d{8}$/,
      "nl-NL": /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/,
      "nl-AW": /^(\+)?297(56|59|64|73|74|99)\d{5}$/,
      "nn-NO": /^(\+?47)?[49]\d{7}$/,
      "pl-PL": /^(\+?48)? ?([5-8]\d|45) ?\d{3} ?\d{2} ?\d{2}$/,
      "pt-BR": /^((\+?55\ ?[1-9]{2}\ ?)|(\+?55\ ?\([1-9]{2}\)\ ?)|(0[1-9]{2}\ ?)|(\([1-9]{2}\)\ ?)|([1-9]{2}\ ?))((\d{4}\-?\d{4})|(9[1-9]{1}\d{3}\-?\d{4}))$/,
      "pt-PT": /^(\+?351)?9[1236]\d{7}$/,
      "pt-AO": /^(\+?244)?9\d{8}$/,
      "ro-MD": /^(\+?373|0)((6(0|1|2|6|7|8|9))|(7(6|7|8|9)))\d{6}$/,
      "ro-RO": /^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$/,
      "ru-RU": /^(\+?7|8)?9\d{9}$/,
      "si-LK": /^(?:0|94|\+94)?(7(0|1|2|4|5|6|7|8)( |-)?)\d{7}$/,
      "sl-SI": /^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$/,
      "sk-SK": /^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
      "so-SO": /^(\+?252|0)((6[0-9])\d{7}|(7[1-9])\d{7})$/,
      "sq-AL": /^(\+355|0)6[2-9]\d{7}$/,
      "sr-RS": /^(\+3816|06)[- \d]{5,9}$/,
      "sv-SE": /^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$/,
      "tg-TJ": /^(\+?992)?[5][5]\d{7}$/,
      "th-TH": /^(\+66|66|0)\d{9}$/,
      "tr-TR": /^(\+?90|0)?5\d{9}$/,
      "tk-TM": /^(\+993|993|8)\d{8}$/,
      "uk-UA": /^(\+?38)?0(50|6[36-8]|7[357]|9[1-9])\d{7}$/,
      "uz-UZ": /^(\+?998)?(6[125-79]|7[1-69]|88|9\d)\d{7}$/,
      "vi-VN": /^((\+?84)|0)((3([2-9]))|(5([25689]))|(7([0|6-9]))|(8([1-9]))|(9([0-9])))([0-9]{7})$/,
      "zh-CN": /^((\+|00)86)?(1[3-9]|9[28])\d{9}$/,
      "zh-TW": /^(\+?886\-?|0)?9\d{8}$/,
      "dz-BT": /^(\+?975|0)?(17|16|77|02)\d{6}$/,
      "ar-YE": /^(((\+|00)9677|0?7)[0137]\d{7}|((\+|00)967|0)[1-7]\d{6})$/,
      "ar-EH": /^(\+?212|0)[\s\-]?(5288|5289)[\s\-]?\d{5}$/,
      "fa-AF": /^(\+93|0)?(2{1}[0-8]{1}|[3-5]{1}[0-4]{1})(\d{7})$/,
      "mk-MK": /^(\+?389|0)?((?:2[2-9]\d{6}|(?:3[1-4]|4[2-8])\d{6}|500\d{5}|5[2-9]\d{6}|7[0-9][2-9]\d{5}|8[1-9]\d{6}|800\d{5}|8009\d{4}))$/
    };
    phones["en-CA"] = phones["en-US"];
    phones["fr-CA"] = phones["en-CA"];
    phones["fr-BE"] = phones["nl-BE"];
    phones["zh-HK"] = phones["en-HK"];
    phones["zh-MO"] = phones["en-MO"];
    phones["ga-IE"] = phones["en-IE"];
    phones["fr-CH"] = phones["de-CH"];
    phones["it-CH"] = phones["fr-CH"];
    function isMobilePhone(str, locale, options) {
      (0, _assertString.default)(str);
      if (options && options.strictMode && !str.startsWith("+")) {
        return false;
      }
      if (Array.isArray(locale)) {
        return locale.some(function(key2) {
          if (phones.hasOwnProperty(key2)) {
            var phone2 = phones[key2];
            if (phone2.test(str)) {
              return true;
            }
          }
          return false;
        });
      } else if (locale in phones) {
        return phones[locale].test(str);
      } else if (!locale || locale === "any") {
        for (var key in phones) {
          if (phones.hasOwnProperty(key)) {
            var phone = phones[key];
            if (phone.test(str)) {
              return true;
            }
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    var locales = exports.locales = Object.keys(phones);
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEthereumAddress.js
var require_isEthereumAddress = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isEthereumAddress.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEthereumAddress;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var eth = /^(0x)[0-9a-f]{40}$/i;
    function isEthereumAddress(str) {
      (0, _assertString.default)(str);
      return eth.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isCurrency.js
var require_isCurrency = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isCurrency.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isCurrency;
    var _merge = _interopRequireDefault(require_merge());
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function currencyRegex(options) {
      var decimal_digits = "\\d{".concat(options.digits_after_decimal[0], "}");
      options.digits_after_decimal.forEach(function(digit, index) {
        if (index !== 0) decimal_digits = "".concat(decimal_digits, "|\\d{").concat(digit, "}");
      });
      var symbol = "(".concat(options.symbol.replace(/\W/, function(m) {
        return "\\".concat(m);
      }), ")").concat(options.require_symbol ? "" : "?"), negative = "-?", whole_dollar_amount_without_sep = "[1-9]\\d*", whole_dollar_amount_with_sep = "[1-9]\\d{0,2}(\\".concat(options.thousands_separator, "\\d{3})*"), valid_whole_dollar_amounts = ["0", whole_dollar_amount_without_sep, whole_dollar_amount_with_sep], whole_dollar_amount = "(".concat(valid_whole_dollar_amounts.join("|"), ")?"), decimal_amount = "(\\".concat(options.decimal_separator, "(").concat(decimal_digits, "))").concat(options.require_decimal ? "" : "?");
      var pattern = whole_dollar_amount + (options.allow_decimal || options.require_decimal ? decimal_amount : "");
      if (options.allow_negatives && !options.parens_for_negatives) {
        if (options.negative_sign_after_digits) {
          pattern += negative;
        } else if (options.negative_sign_before_digits) {
          pattern = negative + pattern;
        }
      }
      if (options.allow_negative_sign_placeholder) {
        pattern = "( (?!\\-))?".concat(pattern);
      } else if (options.allow_space_after_symbol) {
        pattern = " ?".concat(pattern);
      } else if (options.allow_space_after_digits) {
        pattern += "( (?!$))?";
      }
      if (options.symbol_after_digits) {
        pattern += symbol;
      } else {
        pattern = symbol + pattern;
      }
      if (options.allow_negatives) {
        if (options.parens_for_negatives) {
          pattern = "(\\(".concat(pattern, "\\)|").concat(pattern, ")");
        } else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
          pattern = negative + pattern;
        }
      }
      return new RegExp("^(?!-? )(?=.*\\d)".concat(pattern, "$"));
    }
    var default_currency_options = {
      symbol: "$",
      require_symbol: false,
      allow_space_after_symbol: false,
      symbol_after_digits: false,
      allow_negatives: true,
      parens_for_negatives: false,
      negative_sign_before_digits: false,
      negative_sign_after_digits: false,
      allow_negative_sign_placeholder: false,
      thousands_separator: ",",
      decimal_separator: ".",
      allow_decimal: true,
      require_decimal: false,
      digits_after_decimal: [2],
      allow_space_after_digits: false
    };
    function isCurrency(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_currency_options);
      return currencyRegex(options).test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBtcAddress.js
var require_isBtcAddress = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBtcAddress.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBtcAddress;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var bech32 = /^(bc1|tb1|bc1p|tb1p)[ac-hj-np-z02-9]{39,58}$/;
    var base58 = /^(1|2|3|m)[A-HJ-NP-Za-km-z1-9]{25,39}$/;
    function isBtcAddress(str) {
      (0, _assertString.default)(str);
      return bech32.test(str) || base58.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO6346.js
var require_isISO6346 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO6346.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isFreightContainerID = void 0;
    exports.isISO6346 = isISO6346;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var isISO6346Str = /^[A-Z]{3}(U[0-9]{7})|([J,Z][0-9]{6,7})$/;
    var isDigit = /^[0-9]$/;
    function isISO6346(str) {
      (0, _assertString.default)(str);
      str = str.toUpperCase();
      if (!isISO6346Str.test(str)) return false;
      if (str.length === 11) {
        var sum = 0;
        for (var i = 0; i < str.length - 1; i++) {
          if (!isDigit.test(str[i])) {
            var convertedCode = void 0;
            var letterCode = str.charCodeAt(i) - 55;
            if (letterCode < 11) convertedCode = letterCode;
            else if (letterCode >= 11 && letterCode <= 20) convertedCode = 12 + letterCode % 11;
            else if (letterCode >= 21 && letterCode <= 30) convertedCode = 23 + letterCode % 21;
            else convertedCode = 34 + letterCode % 31;
            sum += convertedCode * Math.pow(2, i);
          } else sum += str[i] * Math.pow(2, i);
        }
        var checkSumDigit = sum % 11;
        if (checkSumDigit === 10) checkSumDigit = 0;
        return Number(str[str.length - 1]) === checkSumDigit;
      }
      return true;
    }
    var isFreightContainerID = exports.isFreightContainerID = isISO6346;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO6391.js
var require_isISO6391 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO6391.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO6391;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var isISO6391Set = /* @__PURE__ */ new Set(["aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu"]);
    function isISO6391(str) {
      (0, _assertString.default)(str);
      return isISO6391Set.has(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO8601.js
var require_isISO8601 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO8601.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO8601;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    var iso8601StrictSeparator = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    var isValidDate = function isValidDate2(str) {
      var ordinalMatch = str.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);
      if (ordinalMatch) {
        var oYear = Number(ordinalMatch[1]);
        var oDay = Number(ordinalMatch[2]);
        if (oYear % 4 === 0 && oYear % 100 !== 0 || oYear % 400 === 0) return oDay <= 366;
        return oDay <= 365;
      }
      var match = str.match(/(\d{4})-?(\d{0,2})-?(\d*)/).map(Number);
      var year = match[1];
      var month = match[2];
      var day = match[3];
      var monthString = month ? "0".concat(month).slice(-2) : month;
      var dayString = day ? "0".concat(day).slice(-2) : day;
      var d = new Date("".concat(year, "-").concat(monthString || "01", "-").concat(dayString || "01"));
      if (month && day) {
        return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
      }
      return true;
    };
    function isISO8601(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      var check = options.strictSeparator ? iso8601StrictSeparator.test(str) : iso8601.test(str);
      if (check && options.strict) return isValidDate(str);
      return check;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isRFC3339.js
var require_isRFC3339 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isRFC3339.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isRFC3339;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var dateFullYear = /[0-9]{4}/;
    var dateMonth = /(0[1-9]|1[0-2])/;
    var dateMDay = /([12]\d|0[1-9]|3[01])/;
    var timeHour = /([01][0-9]|2[0-3])/;
    var timeMinute = /[0-5][0-9]/;
    var timeSecond = /([0-5][0-9]|60)/;
    var timeSecFrac = /(\.[0-9]+)?/;
    var timeNumOffset = new RegExp("[-+]".concat(timeHour.source, ":").concat(timeMinute.source));
    var timeOffset = new RegExp("([zZ]|".concat(timeNumOffset.source, ")"));
    var partialTime = new RegExp("".concat(timeHour.source, ":").concat(timeMinute.source, ":").concat(timeSecond.source).concat(timeSecFrac.source));
    var fullDate = new RegExp("".concat(dateFullYear.source, "-").concat(dateMonth.source, "-").concat(dateMDay.source));
    var fullTime = new RegExp("".concat(partialTime.source).concat(timeOffset.source));
    var rfc3339 = new RegExp("^".concat(fullDate.source, "[ tT]").concat(fullTime.source, "$"));
    function isRFC3339(str) {
      (0, _assertString.default)(str);
      return rfc3339.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO15924.js
var require_isISO15924 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO15924.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ScriptCodes = void 0;
    exports.default = isISO15924;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validISO15924Codes = /* @__PURE__ */ new Set(["Adlm", "Afak", "Aghb", "Ahom", "Arab", "Aran", "Armi", "Armn", "Avst", "Bali", "Bamu", "Bass", "Batk", "Beng", "Bhks", "Blis", "Bopo", "Brah", "Brai", "Bugi", "Buhd", "Cakm", "Cans", "Cari", "Cham", "Cher", "Chis", "Chrs", "Cirt", "Copt", "Cpmn", "Cprt", "Cyrl", "Cyrs", "Deva", "Diak", "Dogr", "Dsrt", "Dupl", "Egyd", "Egyh", "Egyp", "Elba", "Elym", "Ethi", "Gara", "Geok", "Geor", "Glag", "Gong", "Gonm", "Goth", "Gran", "Grek", "Gujr", "Gukh", "Guru", "Hanb", "Hang", "Hani", "Hano", "Hans", "Hant", "Hatr", "Hebr", "Hira", "Hluw", "Hmng", "Hmnp", "Hrkt", "Hung", "Inds", "Ital", "Jamo", "Java", "Jpan", "Jurc", "Kali", "Kana", "Kawi", "Khar", "Khmr", "Khoj", "Kitl", "Kits", "Knda", "Kore", "Kpel", "Krai", "Kthi", "Lana", "Laoo", "Latf", "Latg", "Latn", "Leke", "Lepc", "Limb", "Lina", "Linb", "Lisu", "Loma", "Lyci", "Lydi", "Mahj", "Maka", "Mand", "Mani", "Marc", "Maya", "Medf", "Mend", "Merc", "Mero", "Mlym", "Modi", "Mong", "Moon", "Mroo", "Mtei", "Mult", "Mymr", "Nagm", "Nand", "Narb", "Nbat", "Newa", "Nkdb", "Nkgb", "Nkoo", "Nshu", "Ogam", "Olck", "Onao", "Orkh", "Orya", "Osge", "Osma", "Ougr", "Palm", "Pauc", "Pcun", "Pelm", "Perm", "Phag", "Phli", "Phlp", "Phlv", "Phnx", "Plrd", "Piqd", "Prti", "Psin", "Qaaa", "Qaab", "Qaac", "Qaad", "Qaae", "Qaaf", "Qaag", "Qaah", "Qaai", "Qaaj", "Qaak", "Qaal", "Qaam", "Qaan", "Qaao", "Qaap", "Qaaq", "Qaar", "Qaas", "Qaat", "Qaau", "Qaav", "Qaaw", "Qaax", "Qaay", "Qaaz", "Qaba", "Qabb", "Qabc", "Qabd", "Qabe", "Qabf", "Qabg", "Qabh", "Qabi", "Qabj", "Qabk", "Qabl", "Qabm", "Qabn", "Qabo", "Qabp", "Qabq", "Qabr", "Qabs", "Qabt", "Qabu", "Qabv", "Qabw", "Qabx", "Ranj", "Rjng", "Rohg", "Roro", "Runr", "Samr", "Sara", "Sarb", "Saur", "Sgnw", "Shaw", "Shrd", "Shui", "Sidd", "Sidt", "Sind", "Sinh", "Sogd", "Sogo", "Sora", "Soyo", "Sund", "Sunu", "Sylo", "Syrc", "Syre", "Syrj", "Syrn", "Tagb", "Takr", "Tale", "Talu", "Taml", "Tang", "Tavt", "Tayo", "Telu", "Teng", "Tfng", "Tglg", "Thaa", "Thai", "Tibt", "Tirh", "Tnsa", "Todr", "Tols", "Toto", "Tutg", "Ugar", "Vaii", "Visp", "Vith", "Wara", "Wcho", "Wole", "Xpeo", "Xsux", "Yezi", "Yiii", "Zanb", "Zinh", "Zmth", "Zsye", "Zsym", "Zxxx", "Zyyy", "Zzzz"]);
    function isISO15924(str) {
      (0, _assertString.default)(str);
      return validISO15924Codes.has(str);
    }
    var ScriptCodes = exports.ScriptCodes = validISO15924Codes;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO31661Alpha3.js
var require_isISO31661Alpha3 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO31661Alpha3.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO31661Alpha3;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validISO31661Alpha3CountriesCodes = /* @__PURE__ */ new Set(["AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH", "BWA", "BVT", "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "KHM", "CMR", "CAN", "CPV", "CYM", "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL", "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF", "GAB", "GMB", "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY", "HTI", "HMD", "VAT", "HND", "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM", "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", "LUX", "MAC", "MKD", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ", "MRT", "MUS", "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIC", "NER", "NGA", "NIU", "NFK", "MNP", "NOR", "OMN", "PAK", "PLW", "PSE", "PAN", "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT", "REU", "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT", "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP", "LKA", "SDN", "SUR", "SJM", "SWZ", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TKL", "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "UMI", "URY", "UZB", "VUT", "VEN", "VNM", "VGB", "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"]);
    var alpha3CountryCode = /^[a-zA-Z]{3}$/;
    function isISO31661Alpha3(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      var userAssignedCodes = options.userAssignedCodes;
      var validUserAssignedCodes = (userAssignedCodes || []).reduce(function(accumulator, userAssignedCode) {
        if (alpha3CountryCode.test(userAssignedCode)) {
          accumulator.push(userAssignedCode.toUpperCase());
        }
        return accumulator;
      }, []);
      if (validUserAssignedCodes.includes(str.toUpperCase())) {
        return true;
      }
      return validISO31661Alpha3CountriesCodes.has(str.toUpperCase());
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO31661Numeric.js
var require_isISO31661Numeric = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO31661Numeric.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO31661Numeric;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validISO31661NumericCountriesCodes = /* @__PURE__ */ new Set(["004", "008", "010", "012", "016", "020", "024", "028", "031", "032", "036", "040", "044", "048", "050", "051", "052", "056", "060", "064", "068", "070", "072", "074", "076", "084", "086", "090", "092", "096", "100", "104", "108", "112", "116", "120", "124", "132", "136", "140", "144", "148", "152", "156", "158", "162", "166", "170", "174", "175", "178", "180", "184", "188", "191", "192", "196", "203", "204", "208", "212", "214", "218", "222", "226", "231", "232", "233", "234", "238", "239", "242", "246", "248", "250", "254", "258", "260", "262", "266", "268", "270", "275", "276", "288", "292", "296", "300", "304", "308", "312", "316", "320", "324", "328", "332", "334", "336", "340", "344", "348", "352", "356", "360", "364", "368", "372", "376", "380", "384", "388", "392", "398", "400", "404", "408", "410", "414", "417", "418", "422", "426", "428", "430", "434", "438", "440", "442", "446", "450", "454", "458", "462", "466", "470", "474", "478", "480", "484", "492", "496", "498", "499", "500", "504", "508", "512", "516", "520", "524", "528", "531", "533", "534", "535", "540", "548", "554", "558", "562", "566", "570", "574", "578", "580", "581", "583", "584", "585", "586", "591", "598", "600", "604", "608", "612", "616", "620", "624", "626", "630", "634", "638", "642", "643", "646", "652", "654", "659", "660", "662", "663", "666", "670", "674", "678", "682", "686", "688", "690", "694", "702", "703", "704", "705", "706", "710", "716", "724", "728", "729", "732", "740", "744", "748", "752", "756", "760", "762", "764", "768", "772", "776", "780", "784", "788", "792", "795", "796", "798", "800", "804", "807", "818", "826", "831", "832", "833", "834", "840", "850", "854", "858", "860", "862", "876", "882", "887", "894"]);
    function isISO31661Numeric(str) {
      (0, _assertString.default)(str);
      return validISO31661NumericCountriesCodes.has(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO4217.js
var require_isISO4217 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isISO4217.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CurrencyCodes = void 0;
    exports.default = isISO4217;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validISO4217CurrencyCodes = /* @__PURE__ */ new Set(["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "UYI", "UYU", "UYW", "UZS", "VED", "VES", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT", "XSU", "XTS", "XUA", "XXX", "YER", "ZAR", "ZMW", "ZWL"]);
    function isISO4217(str) {
      (0, _assertString.default)(str);
      return validISO4217CurrencyCodes.has(str.toUpperCase());
    }
    var CurrencyCodes = exports.CurrencyCodes = validISO4217CurrencyCodes;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBase32.js
var require_isBase32 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBase32.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase32;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var base32 = /^[A-Z2-7]+=*$/;
    var crockfordBase32 = /^[A-HJKMNP-TV-Z0-9]+$/;
    var defaultBase32Options = {
      crockford: false
    };
    function isBase32(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultBase32Options);
      if (options.crockford) {
        return crockfordBase32.test(str);
      }
      return str.length % 8 === 0 && base32.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBase58.js
var require_isBase58 = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isBase58.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase58;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var base58Reg = /^[A-HJ-NP-Za-km-z1-9]*$/;
    function isBase58(str) {
      (0, _assertString.default)(str);
      return base58Reg.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDataURI.js
var require_isDataURI = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isDataURI.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDataURI;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validMediaType = /^[a-z]+\/[a-z0-9\-\+\._]+$/i;
    var validAttribute = /^[a-z\-]+=[a-z0-9\-]+$/i;
    var validData = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;
    function isDataURI(str) {
      (0, _assertString.default)(str);
      var data = str.split(",");
      if (data.length < 2) {
        return false;
      }
      var attributes = data.shift().trim().split(";");
      var schemeAndMediaType = attributes.shift();
      if (schemeAndMediaType.slice(0, 5) !== "data:") {
        return false;
      }
      var mediaType = schemeAndMediaType.slice(5);
      if (mediaType !== "" && !validMediaType.test(mediaType)) {
        return false;
      }
      for (var i = 0; i < attributes.length; i++) {
        if (!(i === attributes.length - 1 && attributes[i].toLowerCase() === "base64") && !validAttribute.test(attributes[i])) {
          return false;
        }
      }
      for (var _i = 0; _i < data.length; _i++) {
        if (!validData.test(data[_i])) {
          return false;
        }
      }
      return true;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMagnetURI.js
var require_isMagnetURI = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMagnetURI.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMagnetURI;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var magnetURIComponent = /(?:^magnet:\?|[^?&]&)xt(?:\.1)?=urn:(?:(?:aich|bitprint|btih|ed2k|ed2khash|kzhash|md5|sha1|tree:tiger):[a-z0-9]{32}(?:[a-z0-9]{8})?|btmh:1220[a-z0-9]{64})(?:$|&)/i;
    function isMagnetURI(url) {
      (0, _assertString.default)(url);
      if (url.indexOf("magnet:?") !== 0) {
        return false;
      }
      return magnetURIComponent.test(url);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/rtrim.js
var require_rtrim = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/rtrim.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = rtrim;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function rtrim(str, chars) {
      (0, _assertString.default)(str);
      if (chars) {
        var pattern = new RegExp("[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "]+$"), "g");
        return str.replace(pattern, "");
      }
      var strIndex = str.length - 1;
      while (/\s/.test(str.charAt(strIndex))) {
        strIndex -= 1;
      }
      return str.slice(0, strIndex + 1);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/ltrim.js
var require_ltrim = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/ltrim.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = ltrim;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function ltrim(str, chars) {
      (0, _assertString.default)(str);
      var pattern = chars ? new RegExp("^[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "]+"), "g") : /^\s+/g;
      return str.replace(pattern, "");
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/trim.js
var require_trim = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/trim.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = trim;
    var _rtrim = _interopRequireDefault(require_rtrim());
    var _ltrim = _interopRequireDefault(require_ltrim());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function trim(str, chars) {
      return (0, _rtrim.default)((0, _ltrim.default)(str, chars), chars);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMailtoURI.js
var require_isMailtoURI = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMailtoURI.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMailtoURI;
    var _trim = _interopRequireDefault(require_trim());
    var _isEmail = _interopRequireDefault(require_isEmail());
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _slicedToArray(r, e) {
      return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
        var e, n, i, u, a = [], f = true, o = false;
        try {
          if (i = (t = t.call(r)).next, 0 === l) {
            if (Object(t) !== t) return;
            f = false;
          } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
        } catch (r2) {
          o = true, n = r2;
        } finally {
          try {
            if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
          } finally {
            if (o) throw n;
          }
        }
        return a;
      }
    }
    function _arrayWithHoles(r) {
      if (Array.isArray(r)) return r;
    }
    function _createForOfIteratorHelper(r, e) {
      var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
          t && (r = t);
          var _n = 0, F = function F2() {
          };
          return { s: F, n: function n() {
            return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
          }, e: function e2(r2) {
            throw r2;
          }, f: F };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var o, a = true, u = false;
      return { s: function s() {
        t = t.call(r);
      }, n: function n() {
        var r2 = t.next();
        return a = r2.done, r2;
      }, e: function e2(r2) {
        u = true, o = r2;
      }, f: function f() {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      } };
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    function parseMailtoQueryString(queryString) {
      var allowedParams = /* @__PURE__ */ new Set(["subject", "body", "cc", "bcc"]), query = {
        cc: "",
        bcc: ""
      };
      var isParseFailed = false;
      var queryParams = queryString.split("&");
      if (queryParams.length > 4) {
        return false;
      }
      var _iterator = _createForOfIteratorHelper(queryParams), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var q = _step.value;
          var _q$split = q.split("="), _q$split2 = _slicedToArray(_q$split, 2), key = _q$split2[0], value = _q$split2[1];
          if (key && !allowedParams.has(key)) {
            isParseFailed = true;
            break;
          }
          if (value && (key === "cc" || key === "bcc")) {
            query[key] = value;
          }
          if (key) {
            allowedParams.delete(key);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return isParseFailed ? false : query;
    }
    function isMailtoURI(url, options) {
      (0, _assertString.default)(url);
      if (url.indexOf("mailto:") !== 0) {
        return false;
      }
      var _url$replace$split = url.replace("mailto:", "").split("?"), _url$replace$split2 = _slicedToArray(_url$replace$split, 2), to = _url$replace$split2[0], _url$replace$split2$ = _url$replace$split2[1], queryString = _url$replace$split2$ === void 0 ? "" : _url$replace$split2$;
      if (!to && !queryString) {
        return true;
      }
      var query = parseMailtoQueryString(queryString);
      if (!query) {
        return false;
      }
      return "".concat(to, ",").concat(query.cc, ",").concat(query.bcc).split(",").every(function(email) {
        email = (0, _trim.default)(email, " ");
        if (email) {
          return (0, _isEmail.default)(email, options);
        }
        return true;
      });
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMimeType.js
var require_isMimeType = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isMimeType.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMimeType;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var mimeTypeSimple = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9\.\-\+_]{1,100}$/i;
    var mimeTypeText = /^text\/[a-zA-Z0-9\.\-\+]{1,100};\s?charset=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?$/i;
    var mimeTypeMultipart = /^multipart\/[a-zA-Z0-9\.\-\+]{1,100}(;\s?(boundary|charset)=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?){0,2}$/i;
    function isMimeType(str) {
      (0, _assertString.default)(str);
      return mimeTypeSimple.test(str) || mimeTypeText.test(str) || mimeTypeMultipart.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLatLong.js
var require_isLatLong = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLatLong.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLatLong;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    var _includesString = _interopRequireDefault(require_includesString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var lat = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
    var long = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/;
    var latDMS = /^(([1-8]?\d)\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/i;
    var longDMS = /^\s*([1-7]?\d{1,2}\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/i;
    var defaultLatLongOptions = {
      checkDMS: false
    };
    function isLatLong(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultLatLongOptions);
      if (!(0, _includesString.default)(str, ",")) return false;
      var pair = str.split(",");
      if (pair[0].startsWith("(") && !pair[1].endsWith(")") || pair[1].endsWith(")") && !pair[0].startsWith("(")) return false;
      if (options.checkDMS) {
        return latDMS.test(pair[0]) && longDMS.test(pair[1]);
      }
      return lat.test(pair[0]) && long.test(pair[1]);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isPostalCode.js
var require_isPostalCode = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isPostalCode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPostalCode;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var threeDigit = /^\d{3}$/;
    var fourDigit = /^\d{4}$/;
    var fiveDigit = /^\d{5}$/;
    var sixDigit = /^\d{6}$/;
    var patterns = {
      AD: /^AD\d{3}$/,
      AT: fourDigit,
      AU: fourDigit,
      AZ: /^AZ\d{4}$/,
      BA: /^([7-8]\d{4}$)/,
      BD: /^([1-8][0-9]{3}|9[0-4][0-9]{2})$/,
      BE: fourDigit,
      BG: fourDigit,
      BR: /^\d{5}-?\d{3}$/,
      BY: /^2[1-4]\d{4}$/,
      CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
      CH: fourDigit,
      CN: /^(0[1-7]|1[012356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[1-5]|8[1345]|9[09])\d{4}$/,
      CO: /^(05|08|11|13|15|17|18|19|20|23|25|27|41|44|47|50|52|54|63|66|68|70|73|76|81|85|86|88|91|94|95|97|99)(\d{4})$/,
      CZ: /^\d{3}\s?\d{2}$/,
      DE: fiveDigit,
      DK: fourDigit,
      DO: fiveDigit,
      DZ: fiveDigit,
      EE: fiveDigit,
      ES: /^(5[0-2]{1}|[0-4]{1}\d{1})\d{3}$/,
      FI: fiveDigit,
      FR: /^(?:(?:0[1-9]|[1-8]\d|9[0-5])\d{3}|97[1-46]\d{2})$/,
      GB: /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i,
      GR: /^\d{3}\s?\d{2}$/,
      HR: /^([1-5]\d{4}$)/,
      HT: /^HT\d{4}$/,
      HU: fourDigit,
      ID: fiveDigit,
      IE: /^(?!.*(?:o))[A-Za-z]\d[\dw]\s\w{4}$/i,
      IL: /^(\d{5}|\d{7})$/,
      IN: /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/,
      IR: /^(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}$/,
      IS: threeDigit,
      IT: fiveDigit,
      JP: /^\d{3}\-\d{4}$/,
      KE: fiveDigit,
      KR: /^(\d{5}|\d{6})$/,
      LI: /^(948[5-9]|949[0-7])$/,
      LT: /^LT\-\d{5}$/,
      LU: fourDigit,
      LV: /^LV\-\d{4}$/,
      LK: fiveDigit,
      MC: /^980\d{2}$/,
      MG: threeDigit,
      MX: fiveDigit,
      MT: /^[A-Za-z]{3}\s{0,1}\d{4}$/,
      MY: fiveDigit,
      NL: /^[1-9]\d{3}\s?(?!sa|sd|ss)[a-z]{2}$/i,
      NO: fourDigit,
      NP: /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i,
      NZ: fourDigit,
      // https://www.pakpost.gov.pk/postcodes.php
      PK: fiveDigit,
      PL: /^\d{2}\-\d{3}$/,
      PR: /^00[679]\d{2}([ -]\d{4})?$/,
      PT: /^\d{4}\-\d{3}?$/,
      RO: sixDigit,
      RU: sixDigit,
      SA: fiveDigit,
      SE: /^[1-9]\d{2}\s?\d{2}$/,
      SG: sixDigit,
      SI: fourDigit,
      SK: /^\d{3}\s?\d{2}$/,
      TH: fiveDigit,
      TN: fourDigit,
      TW: /^\d{3}(\d{2,3})?$/,
      UA: fiveDigit,
      US: /^\d{5}(-\d{4})?$/,
      ZA: fourDigit,
      ZM: fiveDigit
    };
    var locales = exports.locales = Object.keys(patterns);
    function isPostalCode(str, locale) {
      (0, _assertString.default)(str);
      if (locale in patterns) {
        return patterns[locale].test(str);
      } else if (locale === "any") {
        for (var key in patterns) {
          if (patterns.hasOwnProperty(key)) {
            var pattern = patterns[key];
            if (pattern.test(str)) {
              return true;
            }
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/escape.js
var require_escape = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/escape.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = escape;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function escape(str) {
      (0, _assertString.default)(str);
      return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\//g, "&#x2F;").replace(/\\/g, "&#x5C;").replace(/`/g, "&#96;");
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/unescape.js
var require_unescape = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/unescape.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = unescape;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function unescape(str) {
      (0, _assertString.default)(str);
      return str.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/g, "/").replace(/&#x5C;/g, "\\").replace(/&#96;/g, "`").replace(/&amp;/g, "&");
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/blacklist.js
var require_blacklist = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/blacklist.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = blacklist;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function blacklist(str, chars) {
      (0, _assertString.default)(str);
      return str.replace(new RegExp("[".concat(chars, "]+"), "g"), "");
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/stripLow.js
var require_stripLow = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/stripLow.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = stripLow;
    var _assertString = _interopRequireDefault(require_assertString());
    var _blacklist = _interopRequireDefault(require_blacklist());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function stripLow(str, keep_new_lines) {
      (0, _assertString.default)(str);
      var chars = keep_new_lines ? "\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F" : "\\x00-\\x1F\\x7F";
      return (0, _blacklist.default)(str, chars);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/whitelist.js
var require_whitelist = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/whitelist.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = whitelist;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function whitelist(str, chars) {
      (0, _assertString.default)(str);
      return str.replace(new RegExp("[^".concat(chars, "]+"), "g"), "");
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isWhitelisted.js
var require_isWhitelisted = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isWhitelisted.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isWhitelisted;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function isWhitelisted(str, chars) {
      (0, _assertString.default)(str);
      for (var i = str.length - 1; i >= 0; i--) {
        if (chars.indexOf(str[i]) === -1) {
          return false;
        }
      }
      return true;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/normalizeEmail.js
var require_normalizeEmail = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/normalizeEmail.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = normalizeEmail;
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var default_normalize_email_options = {
      // The following options apply to all email addresses
      // Lowercases the local part of the email address.
      // Please note this may violate RFC 5321 as per http://stackoverflow.com/a/9808332/192024).
      // The domain is always lowercased, as per RFC 1035
      all_lowercase: true,
      // The following conversions are specific to GMail
      // Lowercases the local part of the GMail address (known to be case-insensitive)
      gmail_lowercase: true,
      // Removes dots from the local part of the email address, as that's ignored by GMail
      gmail_remove_dots: true,
      // Removes the subaddress (e.g. "+foo") from the email address
      gmail_remove_subaddress: true,
      // Conversts the googlemail.com domain to gmail.com
      gmail_convert_googlemaildotcom: true,
      // The following conversions are specific to Outlook.com / Windows Live / Hotmail
      // Lowercases the local part of the Outlook.com address (known to be case-insensitive)
      outlookdotcom_lowercase: true,
      // Removes the subaddress (e.g. "+foo") from the email address
      outlookdotcom_remove_subaddress: true,
      // The following conversions are specific to Yahoo
      // Lowercases the local part of the Yahoo address (known to be case-insensitive)
      yahoo_lowercase: true,
      // Removes the subaddress (e.g. "-foo") from the email address
      yahoo_remove_subaddress: true,
      // The following conversions are specific to Yandex
      // Lowercases the local part of the Yandex address (known to be case-insensitive)
      yandex_lowercase: true,
      // all yandex domains are equal, this explicitly sets the domain to 'yandex.ru'
      yandex_convert_yandexru: true,
      // The following conversions are specific to iCloud
      // Lowercases the local part of the iCloud address (known to be case-insensitive)
      icloud_lowercase: true,
      // Removes the subaddress (e.g. "+foo") from the email address
      icloud_remove_subaddress: true
    };
    var icloud_domains = ["icloud.com", "me.com"];
    var outlookdotcom_domains = ["hotmail.at", "hotmail.be", "hotmail.ca", "hotmail.cl", "hotmail.co.il", "hotmail.co.nz", "hotmail.co.th", "hotmail.co.uk", "hotmail.com", "hotmail.com.ar", "hotmail.com.au", "hotmail.com.br", "hotmail.com.gr", "hotmail.com.mx", "hotmail.com.pe", "hotmail.com.tr", "hotmail.com.vn", "hotmail.cz", "hotmail.de", "hotmail.dk", "hotmail.es", "hotmail.fr", "hotmail.hu", "hotmail.id", "hotmail.ie", "hotmail.in", "hotmail.it", "hotmail.jp", "hotmail.kr", "hotmail.lv", "hotmail.my", "hotmail.ph", "hotmail.pt", "hotmail.sa", "hotmail.sg", "hotmail.sk", "live.be", "live.co.uk", "live.com", "live.com.ar", "live.com.mx", "live.de", "live.es", "live.eu", "live.fr", "live.it", "live.nl", "msn.com", "outlook.at", "outlook.be", "outlook.cl", "outlook.co.il", "outlook.co.nz", "outlook.co.th", "outlook.com", "outlook.com.ar", "outlook.com.au", "outlook.com.br", "outlook.com.gr", "outlook.com.pe", "outlook.com.tr", "outlook.com.vn", "outlook.cz", "outlook.de", "outlook.dk", "outlook.es", "outlook.fr", "outlook.hu", "outlook.id", "outlook.ie", "outlook.in", "outlook.it", "outlook.jp", "outlook.kr", "outlook.lv", "outlook.my", "outlook.ph", "outlook.pt", "outlook.sa", "outlook.sg", "outlook.sk", "passport.com"];
    var yahoo_domains = ["rocketmail.com", "yahoo.ca", "yahoo.co.uk", "yahoo.com", "yahoo.de", "yahoo.fr", "yahoo.in", "yahoo.it", "ymail.com"];
    var yandex_domains = ["yandex.ru", "yandex.ua", "yandex.kz", "yandex.com", "yandex.by", "ya.ru"];
    function dotsReplacer(match) {
      if (match.length > 1) {
        return match;
      }
      return "";
    }
    function normalizeEmail(email, options) {
      options = (0, _merge.default)(options, default_normalize_email_options);
      var raw_parts = email.split("@");
      var domain = raw_parts.pop();
      var user = raw_parts.join("@");
      var parts = [user, domain];
      parts[1] = parts[1].toLowerCase();
      if (parts[1] === "gmail.com" || parts[1] === "googlemail.com") {
        if (options.gmail_remove_subaddress) {
          parts[0] = parts[0].split("+")[0];
        }
        if (options.gmail_remove_dots) {
          parts[0] = parts[0].replace(/\.+/g, dotsReplacer);
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.gmail_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
        parts[1] = options.gmail_convert_googlemaildotcom ? "gmail.com" : parts[1];
      } else if (icloud_domains.indexOf(parts[1]) >= 0) {
        if (options.icloud_remove_subaddress) {
          parts[0] = parts[0].split("+")[0];
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.icloud_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (outlookdotcom_domains.indexOf(parts[1]) >= 0) {
        if (options.outlookdotcom_remove_subaddress) {
          parts[0] = parts[0].split("+")[0];
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.outlookdotcom_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (yahoo_domains.indexOf(parts[1]) >= 0) {
        if (options.yahoo_remove_subaddress) {
          var components = parts[0].split("-");
          parts[0] = components.length > 1 ? components.slice(0, -1).join("-") : components[0];
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.yahoo_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (yandex_domains.indexOf(parts[1]) >= 0) {
        if (options.all_lowercase || options.yandex_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
        parts[1] = options.yandex_convert_yandexru ? "yandex.ru" : parts[1];
      } else if (options.all_lowercase) {
        parts[0] = parts[0].toLowerCase();
      }
      return parts.join("@");
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isSlug.js
var require_isSlug = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isSlug.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSlug;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var charsetRegex = /^[a-z0-9](?!.*[-_]{2,})(?:[a-z0-9_-]*[a-z0-9])?$/;
    function isSlug(str) {
      (0, _assertString.default)(str);
      return charsetRegex.test(str);
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLicensePlate.js
var require_isLicensePlate = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isLicensePlate.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLicensePlate;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var validators = {
      "cs-CZ": function csCZ(str) {
        return /^(([ABCDEFHIJKLMNPRSTUVXYZ]|[0-9])-?){5,8}$/.test(str);
      },
      "de-DE": function deDE(str) {
        return /^((A|AA|AB|AC|AE|AH|AK|AM|AN|AÖ|AP|AS|AT|AU|AW|AZ|B|BA|BB|BC|BE|BF|BH|BI|BK|BL|BM|BN|BO|BÖ|BS|BT|BZ|C|CA|CB|CE|CO|CR|CW|D|DA|DD|DE|DH|DI|DL|DM|DN|DO|DU|DW|DZ|E|EA|EB|ED|EE|EF|EG|EH|EI|EL|EM|EN|ER|ES|EU|EW|F|FB|FD|FF|FG|FI|FL|FN|FO|FR|FS|FT|FÜ|FW|FZ|G|GA|GC|GD|GE|GF|GG|GI|GK|GL|GM|GN|GÖ|GP|GR|GS|GT|GÜ|GV|GW|GZ|H|HA|HB|HC|HD|HE|HF|HG|HH|HI|HK|HL|HM|HN|HO|HP|HR|HS|HU|HV|HX|HY|HZ|IK|IL|IN|IZ|J|JE|JL|K|KA|KB|KC|KE|KF|KG|KH|KI|KK|KL|KM|KN|KO|KR|KS|KT|KU|KW|KY|L|LA|LB|LC|LD|LF|LG|LH|LI|LL|LM|LN|LÖ|LP|LR|LU|M|MA|MB|MC|MD|ME|MG|MH|MI|MK|ML|MM|MN|MO|MQ|MR|MS|MÜ|MW|MY|MZ|N|NB|ND|NE|NF|NH|NI|NK|NM|NÖ|NP|NR|NT|NU|NW|NY|NZ|OA|OB|OC|OD|OE|OF|OG|OH|OK|OL|OP|OS|OZ|P|PA|PB|PE|PF|PI|PL|PM|PN|PR|PS|PW|PZ|R|RA|RC|RD|RE|RG|RH|RI|RL|RM|RN|RO|RP|RS|RT|RU|RV|RW|RZ|S|SB|SC|SE|SG|SI|SK|SL|SM|SN|SO|SP|SR|ST|SU|SW|SY|SZ|TE|TF|TG|TO|TP|TR|TS|TT|TÜ|ÜB|UE|UH|UL|UM|UN|V|VB|VG|VK|VR|VS|W|WA|WB|WE|WF|WI|WK|WL|WM|WN|WO|WR|WS|WT|WÜ|WW|WZ|Z|ZE|ZI|ZP|ZR|ZW|ZZ)[- ]?[A-Z]{1,2}[- ]?\d{1,4}|(ABG|ABI|AIB|AIC|ALF|ALZ|ANA|ANG|ANK|APD|ARN|ART|ASL|ASZ|AUR|AZE|BAD|BAR|BBG|BCH|BED|BER|BGD|BGL|BID|BIN|BIR|BIT|BIW|BKS|BLB|BLK|BNA|BOG|BOH|BOR|BOT|BRA|BRB|BRG|BRK|BRL|BRV|BSB|BSK|BTF|BÜD|BUL|BÜR|BÜS|BÜZ|CAS|CHA|CLP|CLZ|COC|COE|CUX|DAH|DAN|DAU|DBR|DEG|DEL|DGF|DIL|DIN|DIZ|DKB|DLG|DON|DUD|DÜW|EBE|EBN|EBS|ECK|EIC|EIL|EIN|EIS|EMD|EMS|ERB|ERH|ERK|ERZ|ESB|ESW|FDB|FDS|FEU|FFB|FKB|FLÖ|FOR|FRG|FRI|FRW|FTL|FÜS|GAN|GAP|GDB|GEL|GEO|GER|GHA|GHC|GLA|GMN|GNT|GOA|GOH|GRA|GRH|GRI|GRM|GRZ|GTH|GUB|GUN|GVM|HAB|HAL|HAM|HAS|HBN|HBS|HCH|HDH|HDL|HEB|HEF|HEI|HER|HET|HGN|HGW|HHM|HIG|HIP|HMÜ|HOG|HOH|HOL|HOM|HOR|HÖS|HOT|HRO|HSK|HST|HVL|HWI|IGB|ILL|JÜL|KEH|KEL|KEM|KIB|KLE|KLZ|KÖN|KÖT|KÖZ|KRU|KÜN|KUS|KYF|LAN|LAU|LBS|LBZ|LDK|LDS|LEO|LER|LEV|LIB|LIF|LIP|LÖB|LOS|LRO|LSZ|LÜN|LUP|LWL|MAB|MAI|MAK|MAL|MED|MEG|MEI|MEK|MEL|MER|MET|MGH|MGN|MHL|MIL|MKK|MOD|MOL|MON|MOS|MSE|MSH|MSP|MST|MTK|MTL|MÜB|MÜR|MYK|MZG|NAB|NAI|NAU|NDH|NEA|NEB|NEC|NEN|NES|NEW|NMB|NMS|NOH|NOL|NOM|NOR|NVP|NWM|OAL|OBB|OBG|OCH|OHA|ÖHR|OHV|OHZ|OPR|OSL|OVI|OVL|OVP|PAF|PAN|PAR|PCH|PEG|PIR|PLÖ|PRÜ|QFT|QLB|RDG|REG|REH|REI|RID|RIE|ROD|ROF|ROK|ROL|ROS|ROT|ROW|RSL|RÜD|RÜG|SAB|SAD|SAN|SAW|SBG|SBK|SCZ|SDH|SDL|SDT|SEB|SEE|SEF|SEL|SFB|SFT|SGH|SHA|SHG|SHK|SHL|SIG|SIM|SLE|SLF|SLK|SLN|SLS|SLÜ|SLZ|SMÜ|SOB|SOG|SOK|SÖM|SON|SPB|SPN|SRB|SRO|STA|STB|STD|STE|STL|SUL|SÜW|SWA|SZB|TBB|TDO|TET|TIR|TÖL|TUT|UEM|UER|UFF|USI|VAI|VEC|VER|VIB|VIE|VIT|VOH|WAF|WAK|WAN|WAR|WAT|WBS|WDA|WEL|WEN|WER|WES|WHV|WIL|WIS|WIT|WIZ|WLG|WMS|WND|WOB|WOH|WOL|WOR|WOS|WRN|WSF|WST|WSW|WTL|WTM|WUG|WÜM|WUN|WUR|WZL|ZEL|ZIG)[- ]?(([A-Z][- ]?\d{1,4})|([A-Z]{2}[- ]?\d{1,3})))[- ]?(E|H)?$/.test(str);
      },
      "de-LI": function deLI(str) {
        return /^FL[- ]?\d{1,5}[UZ]?$/.test(str);
      },
      "en-IN": function enIN(str) {
        return /^[A-Z]{2}[ -]?[0-9]{1,2}(?:[ -]?[A-Z])(?:[ -]?[A-Z]*)?[ -]?[0-9]{4}$/.test(str);
      },
      "en-SG": function enSG(str) {
        return /^[A-Z]{3}[ -]?[\d]{4}[ -]?[A-Z]{1}$/.test(str);
      },
      "es-AR": function esAR(str) {
        return /^(([A-Z]{2} ?[0-9]{3} ?[A-Z]{2})|([A-Z]{3} ?[0-9]{3}))$/.test(str);
      },
      "fi-FI": function fiFI(str) {
        return /^(?=.{4,7})(([A-Z]{1,3}|[0-9]{1,3})[\s-]?([A-Z]{1,3}|[0-9]{1,5}))$/.test(str);
      },
      "hu-HU": function huHU(str) {
        return /^((((?!AAA)(([A-NPRSTVZWXY]{1})([A-PR-Z]{1})([A-HJ-NPR-Z]))|(A[ABC]I)|A[ABC]O|A[A-W]Q|BPI|BPO|UCO|UDO|XAO)-(?!000)\d{3})|(M\d{6})|((CK|DT|CD|HC|H[ABEFIKLMNPRSTVX]|MA|OT|R[A-Z]) \d{2}-\d{2})|(CD \d{3}-\d{3})|(C-(C|X) \d{4})|(X-(A|B|C) \d{4})|(([EPVZ]-\d{5}))|(S A[A-Z]{2} \d{2})|(SP \d{2}-\d{2}))$/.test(str);
      },
      "pt-BR": function ptBR(str) {
        return /^[A-Z]{3}[ -]?[0-9][A-Z][0-9]{2}|[A-Z]{3}[ -]?[0-9]{4}$/.test(str);
      },
      "pt-PT": function ptPT(str) {
        return /^(([A-Z]{2}[ -·]?[0-9]{2}[ -·]?[0-9]{2})|([0-9]{2}[ -·]?[A-Z]{2}[ -·]?[0-9]{2})|([0-9]{2}[ -·]?[0-9]{2}[ -·]?[A-Z]{2})|([A-Z]{2}[ -·]?[0-9]{2}[ -·]?[A-Z]{2}))$/.test(str);
      },
      "sq-AL": function sqAL(str) {
        return /^[A-Z]{2}[- ]?((\d{3}[- ]?(([A-Z]{2})|T))|(R[- ]?\d{3}))$/.test(str);
      },
      "sv-SE": function svSE(str) {
        return /^[A-HJ-PR-UW-Z]{3} ?[\d]{2}[A-HJ-PR-UW-Z1-9]$|(^[A-ZÅÄÖ ]{2,7}$)/.test(str.trim());
      },
      "en-PK": function enPK(str) {
        return /(^[A-Z]{2}((\s|-){0,1})[0-9]{3,4}((\s|-)[0-9]{2}){0,1}$)|(^[A-Z]{3}((\s|-){0,1})[0-9]{3,4}((\s|-)[0-9]{2}){0,1}$)|(^[A-Z]{4}((\s|-){0,1})[0-9]{3,4}((\s|-)[0-9]{2}){0,1}$)|(^[A-Z]((\s|-){0,1})[0-9]{4}((\s|-)[0-9]{2}){0,1}$)/.test(str.trim());
      }
    };
    function isLicensePlate(str, locale) {
      (0, _assertString.default)(str);
      if (locale in validators) {
        return validators[locale](str);
      } else if (locale === "any") {
        for (var key in validators) {
          var validator = validators[key];
          if (validator(str)) {
            return true;
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isStrongPassword.js
var require_isStrongPassword = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isStrongPassword.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isStrongPassword;
    var _merge = _interopRequireDefault(require_merge());
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var upperCaseRegex = /^[A-Z]$/;
    var lowerCaseRegex = /^[a-z]$/;
    var numberRegex = /^[0-9]$/;
    var symbolRegex = /^[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/\\ ]$/;
    var defaultOptions = {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10
    };
    function countChars(str) {
      var result = {};
      Array.from(str).forEach(function(char) {
        var curVal = result[char];
        if (curVal) {
          result[char] += 1;
        } else {
          result[char] = 1;
        }
      });
      return result;
    }
    function analyzePassword(password) {
      var charMap = countChars(password);
      var analysis = {
        length: password.length,
        uniqueChars: Object.keys(charMap).length,
        uppercaseCount: 0,
        lowercaseCount: 0,
        numberCount: 0,
        symbolCount: 0
      };
      Object.keys(charMap).forEach(function(char) {
        if (upperCaseRegex.test(char)) {
          analysis.uppercaseCount += charMap[char];
        } else if (lowerCaseRegex.test(char)) {
          analysis.lowercaseCount += charMap[char];
        } else if (numberRegex.test(char)) {
          analysis.numberCount += charMap[char];
        } else if (symbolRegex.test(char)) {
          analysis.symbolCount += charMap[char];
        }
      });
      return analysis;
    }
    function scorePassword(analysis, scoringOptions) {
      var points = 0;
      points += analysis.uniqueChars * scoringOptions.pointsPerUnique;
      points += (analysis.length - analysis.uniqueChars) * scoringOptions.pointsPerRepeat;
      if (analysis.lowercaseCount > 0) {
        points += scoringOptions.pointsForContainingLower;
      }
      if (analysis.uppercaseCount > 0) {
        points += scoringOptions.pointsForContainingUpper;
      }
      if (analysis.numberCount > 0) {
        points += scoringOptions.pointsForContainingNumber;
      }
      if (analysis.symbolCount > 0) {
        points += scoringOptions.pointsForContainingSymbol;
      }
      return points;
    }
    function isStrongPassword(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      (0, _assertString.default)(str);
      var analysis = analyzePassword(str);
      options = (0, _merge.default)(options || {}, defaultOptions);
      if (options.returnScore) {
        return scorePassword(analysis, options);
      }
      return analysis.length >= options.minLength && analysis.lowercaseCount >= options.minLowercase && analysis.uppercaseCount >= options.minUppercase && analysis.numberCount >= options.minNumbers && analysis.symbolCount >= options.minSymbols;
    }
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isVAT.js
var require_isVAT = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/lib/isVAT.js"(exports) {
    "use strict";
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isVAT;
    exports.vatMatchers = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var algorithms = _interopRequireWildcard(require_algorithms());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, default: e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var AU = function AU2(str) {
      var match = str.match(/^(AU)?(\d{11})$/);
      if (!match) {
        return false;
      }
      var weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
      str = str.replace(/^AU/, "");
      var ABN = (parseInt(str.slice(0, 1), 10) - 1).toString() + str.slice(1);
      var total = 0;
      for (var i = 0; i < 11; i++) {
        total += weights[i] * ABN.charAt(i);
      }
      return total !== 0 && total % 89 === 0;
    };
    var CH = function CH2(str) {
      var hasValidCheckNumber = function hasValidCheckNumber2(digits) {
        var lastDigit = digits.pop();
        var weights = [5, 4, 3, 2, 7, 6, 5, 4];
        var calculatedCheckNumber = (11 - digits.reduce(function(acc, el, idx) {
          return acc + el * weights[idx];
        }, 0) % 11) % 11;
        return lastDigit === calculatedCheckNumber;
      };
      return /^(CHE[- ]?)?(\d{9}|(\d{3}\.\d{3}\.\d{3})|(\d{3} \d{3} \d{3})) ?(TVA|MWST|IVA)?$/.test(str) && hasValidCheckNumber(str.match(/\d/g).map(function(el) {
        return +el;
      }));
    };
    var PT = function PT2(str) {
      var match = str.match(/^(PT)?(\d{9})$/);
      if (!match) {
        return false;
      }
      var tin = match[2];
      var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 8).map(function(a) {
        return parseInt(a, 10);
      }), 9) % 11;
      if (checksum > 9) {
        return parseInt(tin[8], 10) === 0;
      }
      return checksum === parseInt(tin[8], 10);
    };
    var vatMatchers = exports.vatMatchers = {
      /**
       * European Union VAT identification numbers
       */
      AT: function AT(str) {
        return /^(AT)?U\d{8}$/.test(str);
      },
      BE: function BE(str) {
        return /^(BE)?\d{10}$/.test(str);
      },
      BG: function BG(str) {
        return /^(BG)?\d{9,10}$/.test(str);
      },
      HR: function HR(str) {
        return /^(HR)?\d{11}$/.test(str);
      },
      CY: function CY(str) {
        return /^(CY)?\w{9}$/.test(str);
      },
      CZ: function CZ(str) {
        return /^(CZ)?\d{8,10}$/.test(str);
      },
      DK: function DK(str) {
        return /^(DK)?\d{8}$/.test(str);
      },
      EE: function EE(str) {
        return /^(EE)?\d{9}$/.test(str);
      },
      FI: function FI(str) {
        return /^(FI)?\d{8}$/.test(str);
      },
      FR: function FR(str) {
        return /^(FR)([A-Z0-9]{2}\d{9})$/.test(str);
      },
      DE: function DE(str) {
        return /^(DE)?\d{9}$/.test(str);
      },
      EL: function EL(str) {
        return /^(EL)?\d{9}$/.test(str);
      },
      HU: function HU(str) {
        return /^(HU)?\d{8}$/.test(str);
      },
      IE: function IE(str) {
        return /^(IE)?\d{7}\w{1}(W)?$/.test(str);
      },
      IT: function IT(str) {
        return /^(IT)?\d{11}$/.test(str);
      },
      LV: function LV(str) {
        return /^(LV)?\d{11}$/.test(str);
      },
      LT: function LT(str) {
        return /^(LT)?\d{9,12}$/.test(str);
      },
      LU: function LU(str) {
        return /^(LU)?\d{8}$/.test(str);
      },
      MT: function MT(str) {
        return /^(MT)?\d{8}$/.test(str);
      },
      NL: function NL(str) {
        return /^(NL)?\d{9}B\d{2}$/.test(str);
      },
      PL: function PL(str) {
        return /^(PL)?(\d{10}|(\d{3}-\d{3}-\d{2}-\d{2})|(\d{3}-\d{2}-\d{2}-\d{3}))$/.test(str);
      },
      PT,
      RO: function RO(str) {
        return /^(RO)?\d{2,10}$/.test(str);
      },
      SK: function SK(str) {
        return /^(SK)?\d{10}$/.test(str);
      },
      SI: function SI(str) {
        return /^(SI)?\d{8}$/.test(str);
      },
      ES: function ES(str) {
        return /^(ES)?\w\d{7}[A-Z]$/.test(str);
      },
      SE: function SE(str) {
        return /^(SE)?\d{12}$/.test(str);
      },
      /**
       * VAT numbers of non-EU countries
       */
      AL: function AL(str) {
        return /^(AL)?\w{9}[A-Z]$/.test(str);
      },
      MK: function MK(str) {
        return /^(MK)?\d{13}$/.test(str);
      },
      AU,
      BY: function BY(str) {
        return /^(УНП )?\d{9}$/.test(str);
      },
      CA: function CA(str) {
        return /^(CA)?\d{9}$/.test(str);
      },
      IS: function IS(str) {
        return /^(IS)?\d{5,6}$/.test(str);
      },
      IN: function IN(str) {
        return /^(IN)?\d{15}$/.test(str);
      },
      ID: function ID(str) {
        return /^(ID)?(\d{15}|(\d{2}.\d{3}.\d{3}.\d{1}-\d{3}.\d{3}))$/.test(str);
      },
      IL: function IL(str) {
        return /^(IL)?\d{9}$/.test(str);
      },
      KZ: function KZ(str) {
        return /^(KZ)?\d{12}$/.test(str);
      },
      NZ: function NZ(str) {
        return /^(NZ)?\d{9}$/.test(str);
      },
      NG: function NG(str) {
        return /^(NG)?(\d{12}|(\d{8}-\d{4}))$/.test(str);
      },
      NO: function NO(str) {
        return /^(NO)?\d{9}MVA$/.test(str);
      },
      PH: function PH(str) {
        return /^(PH)?(\d{12}|\d{3} \d{3} \d{3} \d{3})$/.test(str);
      },
      RU: function RU(str) {
        return /^(RU)?(\d{10}|\d{12})$/.test(str);
      },
      SM: function SM(str) {
        return /^(SM)?\d{5}$/.test(str);
      },
      SA: function SA(str) {
        return /^(SA)?\d{15}$/.test(str);
      },
      RS: function RS(str) {
        return /^(RS)?\d{9}$/.test(str);
      },
      CH,
      TR: function TR(str) {
        return /^(TR)?\d{10}$/.test(str);
      },
      UA: function UA(str) {
        return /^(UA)?\d{12}$/.test(str);
      },
      GB: function GB(str) {
        return /^GB((\d{3} \d{4} ([0-8][0-9]|9[0-6]))|(\d{9} \d{3})|(((GD[0-4])|(HA[5-9]))[0-9]{2}))$/.test(str);
      },
      UZ: function UZ(str) {
        return /^(UZ)?\d{9}$/.test(str);
      },
      /**
       * VAT numbers of Latin American countries
       */
      AR: function AR(str) {
        return /^(AR)?\d{11}$/.test(str);
      },
      BO: function BO(str) {
        return /^(BO)?\d{7}$/.test(str);
      },
      BR: function BR(str) {
        return /^(BR)?((\d{2}.\d{3}.\d{3}\/\d{4}-\d{2})|(\d{3}.\d{3}.\d{3}-\d{2}))$/.test(str);
      },
      CL: function CL(str) {
        return /^(CL)?\d{8}-\d{1}$/.test(str);
      },
      CO: function CO(str) {
        return /^(CO)?\d{10}$/.test(str);
      },
      CR: function CR(str) {
        return /^(CR)?\d{9,12}$/.test(str);
      },
      EC: function EC(str) {
        return /^(EC)?\d{13}$/.test(str);
      },
      SV: function SV(str) {
        return /^(SV)?\d{4}-\d{6}-\d{3}-\d{1}$/.test(str);
      },
      GT: function GT(str) {
        return /^(GT)?\d{7}-\d{1}$/.test(str);
      },
      HN: function HN(str) {
        return /^(HN)?$/.test(str);
      },
      MX: function MX(str) {
        return /^(MX)?\w{3,4}\d{6}\w{3}$/.test(str);
      },
      NI: function NI(str) {
        return /^(NI)?\d{3}-\d{6}-\d{4}\w{1}$/.test(str);
      },
      PA: function PA(str) {
        return /^(PA)?$/.test(str);
      },
      PY: function PY(str) {
        return /^(PY)?\d{6,8}-\d{1}$/.test(str);
      },
      PE: function PE(str) {
        return /^(PE)?\d{11}$/.test(str);
      },
      DO: function DO(str) {
        return /^(DO)?(\d{11}|(\d{3}-\d{7}-\d{1})|[1,4,5]{1}\d{8}|([1,4,5]{1})-\d{2}-\d{5}-\d{1})$/.test(str);
      },
      UY: function UY(str) {
        return /^(UY)?\d{12}$/.test(str);
      },
      VE: function VE(str) {
        return /^(VE)?[J,G,V,E]{1}-(\d{9}|(\d{8}-\d{1}))$/.test(str);
      }
    };
    function isVAT(str, countryCode) {
      (0, _assertString.default)(str);
      (0, _assertString.default)(countryCode);
      if (countryCode in vatMatchers) {
        return vatMatchers[countryCode](str);
      }
      throw new Error("Invalid country code: '".concat(countryCode, "'"));
    }
  }
});

// node_modules/.pnpm/validator@13.15.35/node_modules/validator/index.js
var require_validator = __commonJS({
  "node_modules/.pnpm/validator@13.15.35/node_modules/validator/index.js"(exports, module) {
    "use strict";
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _toDate = _interopRequireDefault(require_toDate());
    var _toFloat = _interopRequireDefault(require_toFloat());
    var _toInt = _interopRequireDefault(require_toInt());
    var _toBoolean = _interopRequireDefault(require_toBoolean());
    var _equals = _interopRequireDefault(require_equals());
    var _contains = _interopRequireDefault(require_contains());
    var _matches = _interopRequireDefault(require_matches());
    var _isEmail = _interopRequireDefault(require_isEmail());
    var _isURL = _interopRequireDefault(require_isURL());
    var _isMACAddress = _interopRequireDefault(require_isMACAddress());
    var _isIP = _interopRequireDefault(require_isIP());
    var _isIPRange = _interopRequireDefault(require_isIPRange());
    var _isFQDN = _interopRequireDefault(require_isFQDN());
    var _isDate = _interopRequireDefault(require_isDate());
    var _isTime = _interopRequireDefault(require_isTime());
    var _isBoolean = _interopRequireDefault(require_isBoolean());
    var _isLocale = _interopRequireDefault(require_isLocale());
    var _isAbaRouting = _interopRequireDefault(require_isAbaRouting());
    var _isAlpha = _interopRequireWildcard(require_isAlpha());
    var _isAlphanumeric = _interopRequireWildcard(require_isAlphanumeric());
    var _isNumeric = _interopRequireDefault(require_isNumeric());
    var _isPassportNumber = _interopRequireWildcard(require_isPassportNumber());
    var _isPort = _interopRequireDefault(require_isPort());
    var _isLowercase = _interopRequireDefault(require_isLowercase());
    var _isUppercase = _interopRequireDefault(require_isUppercase());
    var _isIMEI = _interopRequireDefault(require_isIMEI());
    var _isAscii = _interopRequireDefault(require_isAscii());
    var _isFullWidth = _interopRequireDefault(require_isFullWidth());
    var _isHalfWidth = _interopRequireDefault(require_isHalfWidth());
    var _isVariableWidth = _interopRequireDefault(require_isVariableWidth());
    var _isMultibyte = _interopRequireDefault(require_isMultibyte());
    var _isSemVer = _interopRequireDefault(require_isSemVer());
    var _isSurrogatePair = _interopRequireDefault(require_isSurrogatePair());
    var _isInt = _interopRequireDefault(require_isInt());
    var _isFloat = _interopRequireWildcard(require_isFloat());
    var _isDecimal = _interopRequireDefault(require_isDecimal());
    var _isHexadecimal = _interopRequireDefault(require_isHexadecimal());
    var _isOctal = _interopRequireDefault(require_isOctal());
    var _isDivisibleBy = _interopRequireDefault(require_isDivisibleBy());
    var _isHexColor = _interopRequireDefault(require_isHexColor());
    var _isRgbColor = _interopRequireDefault(require_isRgbColor());
    var _isHSL = _interopRequireDefault(require_isHSL());
    var _isISRC = _interopRequireDefault(require_isISRC());
    var _isIBAN = _interopRequireWildcard(require_isIBAN());
    var _isBIC = _interopRequireDefault(require_isBIC());
    var _isMD = _interopRequireDefault(require_isMD5());
    var _isHash = _interopRequireDefault(require_isHash());
    var _isJWT = _interopRequireDefault(require_isJWT());
    var _isJSON = _interopRequireDefault(require_isJSON());
    var _isEmpty = _interopRequireDefault(require_isEmpty());
    var _isLength = _interopRequireDefault(require_isLength());
    var _isByteLength = _interopRequireDefault(require_isByteLength());
    var _isULID = _interopRequireDefault(require_isULID());
    var _isUUID = _interopRequireDefault(require_isUUID());
    var _isMongoId = _interopRequireDefault(require_isMongoId());
    var _isAfter = _interopRequireDefault(require_isAfter());
    var _isBefore = _interopRequireDefault(require_isBefore());
    var _isIn = _interopRequireDefault(require_isIn());
    var _isLuhnNumber = _interopRequireDefault(require_isLuhnNumber());
    var _isCreditCard = _interopRequireDefault(require_isCreditCard());
    var _isIdentityCard = _interopRequireDefault(require_isIdentityCard());
    var _isEAN = _interopRequireDefault(require_isEAN());
    var _isISIN = _interopRequireDefault(require_isISIN());
    var _isISBN = _interopRequireDefault(require_isISBN());
    var _isISSN = _interopRequireDefault(require_isISSN());
    var _isTaxID = _interopRequireDefault(require_isTaxID());
    var _isMobilePhone = _interopRequireWildcard(require_isMobilePhone());
    var _isEthereumAddress = _interopRequireDefault(require_isEthereumAddress());
    var _isCurrency = _interopRequireDefault(require_isCurrency());
    var _isBtcAddress = _interopRequireDefault(require_isBtcAddress());
    var _isISO = require_isISO6346();
    var _isISO2 = _interopRequireDefault(require_isISO6391());
    var _isISO3 = _interopRequireDefault(require_isISO8601());
    var _isRFC = _interopRequireDefault(require_isRFC3339());
    var _isISO4 = _interopRequireDefault(require_isISO15924());
    var _isISO31661Alpha = _interopRequireDefault(require_isISO31661Alpha2());
    var _isISO31661Alpha2 = _interopRequireDefault(require_isISO31661Alpha3());
    var _isISO31661Numeric = _interopRequireDefault(require_isISO31661Numeric());
    var _isISO5 = _interopRequireDefault(require_isISO4217());
    var _isBase = _interopRequireDefault(require_isBase32());
    var _isBase2 = _interopRequireDefault(require_isBase58());
    var _isBase3 = _interopRequireDefault(require_isBase64());
    var _isDataURI = _interopRequireDefault(require_isDataURI());
    var _isMagnetURI = _interopRequireDefault(require_isMagnetURI());
    var _isMailtoURI = _interopRequireDefault(require_isMailtoURI());
    var _isMimeType = _interopRequireDefault(require_isMimeType());
    var _isLatLong = _interopRequireDefault(require_isLatLong());
    var _isPostalCode = _interopRequireWildcard(require_isPostalCode());
    var _ltrim = _interopRequireDefault(require_ltrim());
    var _rtrim = _interopRequireDefault(require_rtrim());
    var _trim = _interopRequireDefault(require_trim());
    var _escape = _interopRequireDefault(require_escape());
    var _unescape = _interopRequireDefault(require_unescape());
    var _stripLow = _interopRequireDefault(require_stripLow());
    var _whitelist = _interopRequireDefault(require_whitelist());
    var _blacklist = _interopRequireDefault(require_blacklist());
    var _isWhitelisted = _interopRequireDefault(require_isWhitelisted());
    var _normalizeEmail = _interopRequireDefault(require_normalizeEmail());
    var _isSlug = _interopRequireDefault(require_isSlug());
    var _isLicensePlate = _interopRequireDefault(require_isLicensePlate());
    var _isStrongPassword = _interopRequireDefault(require_isStrongPassword());
    var _isVAT = _interopRequireDefault(require_isVAT());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, default: e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var version = "13.15.35";
    var validator = {
      version,
      toDate: _toDate.default,
      toFloat: _toFloat.default,
      toInt: _toInt.default,
      toBoolean: _toBoolean.default,
      equals: _equals.default,
      contains: _contains.default,
      matches: _matches.default,
      isEmail: _isEmail.default,
      isURL: _isURL.default,
      isMACAddress: _isMACAddress.default,
      isIP: _isIP.default,
      isIPRange: _isIPRange.default,
      isFQDN: _isFQDN.default,
      isBoolean: _isBoolean.default,
      isIBAN: _isIBAN.default,
      isBIC: _isBIC.default,
      isAbaRouting: _isAbaRouting.default,
      isAlpha: _isAlpha.default,
      isAlphaLocales: _isAlpha.locales,
      isAlphanumeric: _isAlphanumeric.default,
      isAlphanumericLocales: _isAlphanumeric.locales,
      isNumeric: _isNumeric.default,
      isPassportNumber: _isPassportNumber.default,
      passportNumberLocales: _isPassportNumber.locales,
      isPort: _isPort.default,
      isLowercase: _isLowercase.default,
      isUppercase: _isUppercase.default,
      isAscii: _isAscii.default,
      isFullWidth: _isFullWidth.default,
      isHalfWidth: _isHalfWidth.default,
      isVariableWidth: _isVariableWidth.default,
      isMultibyte: _isMultibyte.default,
      isSemVer: _isSemVer.default,
      isSurrogatePair: _isSurrogatePair.default,
      isInt: _isInt.default,
      isIMEI: _isIMEI.default,
      isFloat: _isFloat.default,
      isFloatLocales: _isFloat.locales,
      isDecimal: _isDecimal.default,
      isHexadecimal: _isHexadecimal.default,
      isOctal: _isOctal.default,
      isDivisibleBy: _isDivisibleBy.default,
      isHexColor: _isHexColor.default,
      isRgbColor: _isRgbColor.default,
      isHSL: _isHSL.default,
      isISRC: _isISRC.default,
      isMD5: _isMD.default,
      isHash: _isHash.default,
      isJWT: _isJWT.default,
      isJSON: _isJSON.default,
      isEmpty: _isEmpty.default,
      isLength: _isLength.default,
      isLocale: _isLocale.default,
      isByteLength: _isByteLength.default,
      isULID: _isULID.default,
      isUUID: _isUUID.default,
      isMongoId: _isMongoId.default,
      isAfter: _isAfter.default,
      isBefore: _isBefore.default,
      isIn: _isIn.default,
      isLuhnNumber: _isLuhnNumber.default,
      isCreditCard: _isCreditCard.default,
      isIdentityCard: _isIdentityCard.default,
      isEAN: _isEAN.default,
      isISIN: _isISIN.default,
      isISBN: _isISBN.default,
      isISSN: _isISSN.default,
      isMobilePhone: _isMobilePhone.default,
      isMobilePhoneLocales: _isMobilePhone.locales,
      isPostalCode: _isPostalCode.default,
      isPostalCodeLocales: _isPostalCode.locales,
      isEthereumAddress: _isEthereumAddress.default,
      isCurrency: _isCurrency.default,
      isBtcAddress: _isBtcAddress.default,
      isISO6346: _isISO.isISO6346,
      isFreightContainerID: _isISO.isFreightContainerID,
      isISO6391: _isISO2.default,
      isISO8601: _isISO3.default,
      isISO15924: _isISO4.default,
      isRFC3339: _isRFC.default,
      isISO31661Alpha2: _isISO31661Alpha.default,
      isISO31661Alpha3: _isISO31661Alpha2.default,
      isISO31661Numeric: _isISO31661Numeric.default,
      isISO4217: _isISO5.default,
      isBase32: _isBase.default,
      isBase58: _isBase2.default,
      isBase64: _isBase3.default,
      isDataURI: _isDataURI.default,
      isMagnetURI: _isMagnetURI.default,
      isMailtoURI: _isMailtoURI.default,
      isMimeType: _isMimeType.default,
      isLatLong: _isLatLong.default,
      ltrim: _ltrim.default,
      rtrim: _rtrim.default,
      trim: _trim.default,
      escape: _escape.default,
      unescape: _unescape.default,
      stripLow: _stripLow.default,
      whitelist: _whitelist.default,
      blacklist: _blacklist.default,
      isWhitelisted: _isWhitelisted.default,
      normalizeEmail: _normalizeEmail.default,
      toString,
      isSlug: _isSlug.default,
      isStrongPassword: _isStrongPassword.default,
      isTaxID: _isTaxID.default,
      isDate: _isDate.default,
      isTime: _isTime.default,
      isLicensePlate: _isLicensePlate.default,
      isVAT: _isVAT.default,
      ibanLocales: _isIBAN.locales
    };
    var _default = exports.default = validator;
    module.exports = exports.default;
    module.exports.default = exports.default;
  }
});

// packages/think-validator/src/method.js
var require_method = __commonJS({
  "packages/think-validator/src/method.js"(exports, module) {
    module.exports = {
      GET: "param",
      POST: "post",
      FILE: "file",
      PUT: "post",
      DELETE: "post",
      PATCH: "post",
      LINK: "post",
      UNLINK: "post"
    };
  }
});

// packages/think-validator/src/rules.js
var require_rules = __commonJS({
  "packages/think-validator/src/rules.js"(exports, module) {
    var helper = require_helper();
    var validator = require_validator();
    var assert = require_assert();
    var METHOD_MAP = require_method();
    var Rules = {};
    Rules.required = (value, validValue) => {
      return validValue;
    };
    Rules._requiredIf = (validValue, { currentQuery, ctx, rules }) => {
      assert(helper.isArray(validValue), "requiredIf's value should be array");
      validValue = validValue.slice();
      const first = validValue[0];
      if (rules && rules[first] && rules[first]["method"]) {
        currentQuery = helper.extend({}, currentQuery);
        const method = rules[first]["method"].toUpperCase();
        currentQuery = ctx[METHOD_MAP[method]]();
      }
      validValue[0] = currentQuery[first];
      return validValue;
    };
    Rules.requiredIf = (value, { parsedValidValue }) => {
      const first = parsedValidValue[0];
      const others = parsedValidValue.slice(1);
      return others.indexOf(first) > -1;
    };
    Rules._requiredNotIf = (validValue, { currentQuery, ctx, rules }) => {
      assert(helper.isArray(validValue), "requiredNotIf's value should be array");
      return Rules._requiredIf(validValue, { currentQuery, ctx, rules });
    };
    Rules.requiredNotIf = (value, { parsedValidValue }) => {
      const first = parsedValidValue[0];
      const others = parsedValidValue.slice(1);
      return others.indexOf(first) === -1;
    };
    Rules._requiredWith = (validValue, { currentQuery, rules, ctx }) => {
      assert(helper.isArray(validValue), "requiredWith's value should be array");
      validValue = validValue.slice();
      return validValue.map((item) => {
        let query = currentQuery;
        if (rules && rules[item] && rules[item]["method"]) {
          const method = rules[item]["method"].toUpperCase();
          query = ctx[METHOD_MAP[method]]();
        }
        return !helper.isTrueEmpty(query[item]) ? query[item] : "";
      });
    };
    Rules.requiredWith = (value, { parsedValidValue }) => {
      return parsedValidValue.some((item) => {
        return !helper.isTrueEmpty(item);
      });
    };
    Rules._requiredWithAll = (validValue, { currentQuery, rules, ctx }) => {
      assert(helper.isArray(validValue), "requiredWithAll's value should be array");
      return Rules._requiredWith(validValue, { currentQuery, rules, ctx });
    };
    Rules.requiredWithAll = (value, { parsedValidValue }) => {
      return parsedValidValue.every((item) => {
        return !helper.isTrueEmpty(item);
      });
    };
    Rules._requiredWithOut = (validValue, { currentQuery, rules, ctx }) => {
      assert(helper.isArray(validValue), "requiredWithOut's value should be array");
      return Rules._requiredWith(validValue, { currentQuery, rules, ctx });
    };
    Rules.requiredWithOut = (value, { parsedValidValue }) => {
      return parsedValidValue.some((item) => {
        return helper.isTrueEmpty(item);
      });
    };
    Rules._requiredWithOutAll = (validValue, { currentQuery, rules, ctx }) => {
      assert(helper.isArray(validValue), "requiredWithOutAll's value should be array");
      return Rules._requiredWith(validValue, { currentQuery, rules, ctx });
    };
    Rules.requiredWithOutAll = (value, { parsedValidValue }) => {
      return parsedValidValue.every((item) => {
        return helper.isTrueEmpty(item);
      });
    };
    Rules.contains = (value, { validValue }) => {
      value = String(value);
      return validator.contains(value, validValue);
    };
    Rules._equals = (validValue, { currentQuery, rules, ctx }) => {
      if (rules && rules[validValue] && rules[validValue]["method"]) {
        currentQuery = helper.extend({}, currentQuery);
        const method = rules[validValue]["method"].toUpperCase();
        currentQuery = ctx[METHOD_MAP[method]]();
      }
      return currentQuery[validValue];
    };
    Rules.equals = (value, { parsedValidValue }) => {
      value = String(value);
      return validator.equals(value, parsedValidValue);
    };
    Rules._different = (validValue, { currentQuery, rules, ctx }) => {
      return Rules._equals(validValue, { currentQuery, rules, ctx });
    };
    Rules.different = (value, { parsedValidValue }) => {
      value = String(value);
      return !validator.equals(value, parsedValidValue);
    };
    Rules._before = (validValue) => {
      if (validValue === true) {
        const now = /* @__PURE__ */ new Date();
        const nowTime = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        return nowTime;
      }
      assert(Rules.date(validValue), "validValue should be date");
      return validValue;
    };
    Rules.before = (value, { parsedValidValue }) => {
      value = String(value);
      return validator.isBefore(value, parsedValidValue);
    };
    Rules._after = (validValue) => {
      return Rules._before(validValue);
    };
    Rules.after = (value, { parsedValidValue }) => {
      value = String(value);
      return validator.isAfter(value, parsedValidValue);
    };
    Rules.alpha = (value) => {
      value = String(value);
      return validator.isAlpha(value);
    };
    Rules.alphaDash = (value) => {
      value = String(value);
      return /^[A-Z_]+$/i.test(value);
    };
    Rules.alphaNumeric = (value) => {
      value = String(value);
      return validator.isAlphanumeric(value);
    };
    Rules.alphaNumericDash = (value) => {
      value = String(value);
      return /^\w+$/i.test(value);
    };
    Rules.ascii = (value) => {
      value = String(value);
      return validator.isAscii(value);
    };
    Rules.base64 = (value) => {
      value = String(value);
      return validator.isBase64(value);
    };
    Rules.byteLength = (value, { validValue }) => {
      assert(helper.isObject(validValue) || helper.isInt(validValue), "byteLength's value should be object or integer");
      value = String(value);
      if (helper.isObject(validValue)) {
        return validator.isByteLength(value, { min: validValue.min | 0, max: validValue.max });
      } else {
        assert(value > 0, "byteLength's value should be integer larger than zero");
        return validator.isByteLength(value, { min: validValue, max: validValue });
      }
    };
    Rules.creditCard = (value) => {
      value = String(value);
      return validator.isCreditCard(value);
    };
    Rules.currency = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "currency's value should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isCurrency(value);
      } else {
        return validator.isCurrency(value, validValue);
      }
    };
    Rules.date = (value) => {
      if (isNaN(Date.parse(value))) {
        return false;
      }
      return true;
    };
    Rules.decimal = (value) => {
      value = String(value);
      return validator.isDecimal(value);
    };
    Rules.divisibleBy = (value, { validValue }) => {
      value = String(value);
      return validator.isDivisibleBy(value, validValue);
    };
    Rules.email = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "email's value should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isEmail(value);
      } else {
        return validator.isEmail(value, validValue);
      }
    };
    Rules.fqdn = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "fqdn's value should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isFQDN(value);
      } else {
        return validator.isFQDN(value, validValue);
      }
    };
    Rules.float = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "float's value should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isFloat(value);
      } else {
        return validator.isFloat(value, validValue);
      }
    };
    Rules.fullWidth = (value) => {
      value = String(value);
      return validator.isFullWidth(value);
    };
    Rules.halfWidth = (value) => {
      value = String(value);
      return validator.isHalfWidth(value);
    };
    Rules.hexColor = (value) => {
      value = String(value);
      return validator.isHexColor(value) && /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
    };
    Rules.hex = (value) => {
      value = String(value);
      return validator.isHexadecimal(value);
    };
    Rules.ip = (value) => {
      value = String(value);
      return validator.isIP(value, 4) || validator.isIP(value, 6);
    };
    Rules.ip4 = (value) => {
      value = String(value);
      return validator.isIP(value, 4);
    };
    Rules.ip6 = (value) => {
      value = String(value);
      return validator.isIP(value, 6);
    };
    Rules.isbn = (value) => {
      value = String(value);
      return validator.isISBN(value, 10) || validator.isISBN(value, 13);
    };
    Rules.isin = (value) => {
      value = String(value);
      return validator.isISIN(value);
    };
    Rules.iso8601 = (value) => {
      value = String(value);
      return validator.isISO8601(value);
    };
    Rules.in = (value, { validValue }) => {
      assert(helper.isArray(validValue), "in's value should be array");
      value = String(value);
      return validator.isIn(value, validValue);
    };
    Rules.notIn = (value, { validValue }) => {
      assert(helper.isArray(validValue), "notIn's value should be array");
      value = String(value);
      return !validator.isIn(value, validValue);
    };
    Rules.int = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "int's value should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isInt(value);
      } else {
        return validator.isInt(value, validValue);
      }
    };
    Rules.length = (value, { validValue }) => {
      assert(helper.isObject(validValue) || helper.isInt(validValue), "length's value should be object or integer");
      value = String(value);
      if (helper.isObject(validValue)) {
        return validator.isLength(value, { min: validValue.min | 0, max: validValue.max });
      } else {
        assert(validValue > 0, "length's value should be integer larger than zero");
        return validator.isLength(value, { min: validValue, max: validValue });
      }
    };
    Rules.lowercase = (value) => {
      value = String(value);
      return validator.isLowercase(value);
    };
    Rules.uppercase = (value) => {
      value = String(value);
      return validator.isUppercase(value);
    };
    Rules.mobile = (value, { validValue }) => {
      value = String(value);
      if (validValue === true) {
        return validator.isMobilePhone(value, "zh-CN");
      } else {
        return validator.isMobilePhone(value, validValue);
      }
    };
    Rules.mongoId = (value) => {
      value = String(value);
      return validator.isMongoId(value);
    };
    Rules.multibyte = (value) => {
      value = String(value);
      return validator.isMultibyte(value);
    };
    Rules.url = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "url's validValue should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isURL(value);
      } else {
        return validator.isURL(value, validValue);
      }
    };
    Rules.order = (value) => {
      return value.split(/\s*,\s*/).every((item) => {
        return /^\w+\s+(?:ASC|DESC)$/i.test(item);
      });
    };
    Rules.field = (value) => {
      return value.split(/\s*,\s*/).every((item) => {
        return item === "*" || /^\w+$/.test(item);
      });
    };
    Rules.image = (value) => {
      if (helper.isObject(value)) {
        value = value.name;
      }
      return /\.(?:jpeg|jpg|png|bmp|gif|svg)$/i.test(value);
    };
    Rules.startWith = (value, { validValue }) => {
      return value.indexOf(validValue) === 0;
    };
    Rules.endWith = (value, { validValue }) => {
      return value.lastIndexOf(validValue) === value.length - validValue.length;
    };
    Rules.string = (value) => {
      return helper.isString(value);
    };
    Rules.array = (value) => {
      return helper.isArray(value);
    };
    Rules.boolean = (value) => {
      return helper.isBoolean(value);
    };
    Rules.object = (value) => {
      return helper.isObject(value);
    };
    Rules.regexp = (value, { validValue }) => {
      assert(helper.isRegExp(validValue), "argument should be regexp");
      return validValue.test(value);
    };
    Rules.issn = (value, { validValue }) => {
      assert(helper.isObject(validValue) || validValue === true, "issn's validValue should be object or true");
      value = String(value);
      if (validValue === true) {
        return validator.isISSN(value);
      } else {
        return validator.isISSN(value, validValue);
      }
    };
    Rules.uuid = (value) => {
      value = String(value);
      return validator.isUUID(value, "loose") && /^[0-9a-f]{8}-[0-9a-f]{4}-[345]/i.test(value);
    };
    Rules.md5 = (value) => {
      value = String(value);
      return validator.isMD5(value);
    };
    Rules.macAddress = (value) => {
      value = String(value);
      return validator.isMACAddress(value);
    };
    Rules.dataURI = (value) => {
      value = String(value);
      return validator.isDataURI(value);
    };
    Rules.variableWidth = (value) => {
      value = String(value);
      return validator.isVariableWidth(value);
    };
    module.exports = Rules;
  }
});

// packages/think-validator/src/errors.js
var require_errors = __commonJS({
  "packages/think-validator/src/errors.js"(exports, module) {
    module.exports = {
      required: "{name} can not be blank",
      contains: "{name} need contains string {args}",
      equals: "{name} need equal {pargs}",
      different: "{name} need not equal {pargs}",
      after: "{name} need a date after {pargs}",
      before: "{name} need a date before {pargs}",
      alpha: "{name} need contains only letters (a-zA-Z)",
      alphaDash: "{name} need contains only letters and dashes(a-zA-Z_)",
      alphaNumeric: "{name} need contains only letters and numeric(a-zA-Z0-9)",
      alphaNumericDash: "{name} need contains only letters, numeric and dash(a-zA-Z0-9_)",
      ascii: "{name} need contains ASCII chars only",
      base64: "{name} need a valid base64 encoded",
      byteLength: "{name} need length (in bytes) under your options",
      creditCard: "{name} need a valid credit card",
      currency: "{name} need a valid currency amount",
      date: "{name} need a date",
      decimal: "{name} need a decimal number",
      divisibleBy: "{name} need a number divisible by {args}",
      email: "{name} need an email under your options",
      fqdn: "{name} need a fully qualified domain name under your options",
      float: "{name} need a float under your options",
      fullWidth: "{name} need contains any full-width chars",
      halfWidth: "{name} need contains any half-width chars",
      hexColor: "{name} need a hexadecimal color",
      hex: "{name} need a hexadecimal number",
      ip: "{name} need an IP (version 4 or 6)",
      ip4: "{name} need an IP (version 4)",
      ip6: "{name} need an IP (version 6)",
      isbn: "{name} need an ISBN (version 10 or 13)",
      isin: "{name} need an ISIN (stock/security identifier)",
      iso8601: "{name} need a valid ISO 8601 date",
      in: "{name} need in an array of {args}",
      notIn: "{name} need not in an array of {args}",
      int: "{name} need an integer under your options",
      length: "{name} should be length under your options",
      lowercase: "{name} should be lowercase",
      uppercase: "{name} should uppercase",
      mobile: "{name} need is a mobile phone number",
      mongoId: "{name} need is a valid hex-encoded representation of a MongoDB ObjectId",
      multibyte: "{name} need contains one or more multibyte chars",
      url: "{name} need an URL under your options",
      order: "{name} need a valid sql order string",
      field: "{name} need a valid sql field string",
      image: "{name} need a valid image file",
      startWith: "{name} need start with {args}",
      endWith: "{name} need end with {args}",
      string: "{name} need a string",
      array: "{name} need an array",
      boolean: "{name} need a boolean",
      object: "{name} need an object",
      regexp: "{name} need match your custom regexp",
      issn: "{name} need an issn",
      uuid: "{name} need an uuid",
      md5: "{name} need a md5",
      macAddress: "{name} need a macAddress",
      numeric: "{name} need a numeric",
      dataURI: "{name} need a dataURI",
      variableWidth: "{name} need contains a mixture of full and half-width chars"
    };
  }
});

// packages/think-validator/src/index.js
var require_src = __commonJS({
  "packages/think-validator/src/index.js"(exports, module) {
    var assert = require_assert();
    var helper = require_helper();
    var preRules = require_rules();
    var preErrors = require_errors();
    var METHOD_MAP = require_method();
    var ARRAY_SP = "__array__";
    var OBJECT_SP = "__object__";
    var WITHOUT_ERR_MESSAGE = " valid failed";
    var Validator = class {
      constructor(ctx) {
        this.ctx = ctx;
        this.requiredValidNames = [
          "required",
          "requiredIf",
          "requiredNotIf",
          "requiredWith",
          "requiredWithAll",
          "requiredWithOut",
          "requiredWithOutAll"
        ];
        this.skippedValidNames = ["value", "default", "trim", "method", "aliasName"].concat(this.requiredValidNames);
        this.basicType = ["int", "string", "float", "array", "object", "boolean"];
        this.errors = helper.extend({}, preErrors);
      }
      /**
         * get origin argName for nested array and object
         * @param  {String} argName [description]
         * @return {String}          [description]
         */
      _getOriginArgName(argName) {
        if (argName.indexOf(ARRAY_SP) > -1) {
          const tmpRuleName = argName.split(ARRAY_SP);
          argName = tmpRuleName[0] + "[" + tmpRuleName[1] + "]";
        }
        if (argName.indexOf(OBJECT_SP) > -1) {
          const tmpRuleName = argName.split(OBJECT_SP);
          argName = tmpRuleName[0] + "." + tmpRuleName[1];
        }
        return argName;
      }
      /**
         * [error should be function or string]
         * @param  {[type]} error [description]
         * @return {[type]}       [description]
         */
      _isErrorType(error) {
        return error && (helper.isString(error) || helper.isFunction(error));
      }
      /**
         * get error message
         * @param  {String} argName        [description]
         * @param  {Object} rule            [description]
         * @param  {String} validName       [description]
         * @param  {Mixed} parsedValidValue [description]
         * @return {String}                 [description]
         */
      _getErrorMessage({ argName, rule, validName, parsedValidValue }) {
        let errMsg = "";
        if (this.requiredValidNames.indexOf(validName) > -1) {
          validName = "required";
        }
        if (argName.indexOf(ARRAY_SP) > -1) {
          argName = argName.split(ARRAY_SP)[0];
        }
        const validNameError = this.errors[validName];
        if (this._isErrorType(validNameError)) {
          errMsg = validNameError;
        }
        let argNameError = this.errors[argName];
        if (this._isErrorType(argNameError)) {
          errMsg = argNameError;
        }
        if (helper.isObject(argNameError)) {
          const validArgNameError = this.errors[argName][validName];
          if (this._isErrorType(validArgNameError)) {
            errMsg = validArgNameError;
          }
        }
        if (argName.indexOf(OBJECT_SP) > -1) {
          const parsedResult = argName.split(OBJECT_SP);
          argName = parsedResult[0];
          const subRuleName = parsedResult[1];
          argNameError = this.errors[argName];
          if (helper.isObject(argNameError)) {
            errMsg = argNameError[validName];
            for (const i in argNameError) {
              if (i.split(",").indexOf(subRuleName) > -1) {
                if (helper.isObject(argNameError[i])) {
                  if (this._isErrorType(argNameError[i][validName])) {
                    errMsg = argNameError[i][validName];
                  }
                } else {
                  if (this._isErrorType(argNameError[i])) {
                    errMsg = argNameError[i];
                  }
                }
              }
            }
          } else {
            if (this._isErrorType(argNameError)) {
              errMsg = argNameError;
            }
          }
          errMsg = errMsg || this.errors[validName];
        }
        const originArgName = this._getOriginArgName(argName);
        if (!errMsg) {
          return (rule.aliasName || originArgName) + WITHOUT_ERR_MESSAGE;
        }
        const validValue = rule[validName];
        if (helper.isFunction(errMsg)) {
          const lastErrorMsg2 = errMsg({
            name: originArgName,
            validName,
            rule,
            args: validValue,
            pargs: parsedValidValue
          });
          assert(helper.isString(lastErrorMsg2), "custom error function should return string.");
          return lastErrorMsg2;
        }
        const lastErrorMsg = errMsg.replace("{name}", rule.aliasName || originArgName).replace("{args}", helper.isString(validValue) ? validValue : JSON.stringify(validValue)).replace("{pargs}", helper.isString(parsedValidValue) ? parsedValidValue : JSON.stringify(parsedValidValue));
        return lastErrorMsg;
      }
      /**
         * parse valid args by _validName method
         * @return {Mixed}           [description]
         */
      _parseValidValue(validName, rule, cloneRules, argName) {
        let validValue = rule[validName];
        const _fn = preRules["_" + validName];
        if (helper.isFunction(_fn)) {
          validValue = _fn(validValue, {
            argName,
            validName,
            currentQuery: this.ctx[this._getRuleMethod(rule)](),
            ctx: this.ctx,
            rule,
            rules: cloneRules
          });
        }
        return validValue;
      }
      /**
         * convert value by value type
         * @param  {String} argName [description]
         * @param  {Object} rule     [description]
         * @return {Mixed}          [description]
         */
      _convertArgValue(argName, rule) {
        const queryMethod = this._getRuleMethod(rule);
        const ruleCtxQuery = this.ctx[queryMethod]();
        if ((rule.int || rule.float || rule.numeric) && queryMethod) {
          if (argName.indexOf(ARRAY_SP) > -1) {
            const parsedRuleName = argName.split(ARRAY_SP);
            ruleCtxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
          } else if (argName.indexOf(OBJECT_SP) > -1) {
            const parsedRuleName = argName.split(OBJECT_SP);
            ruleCtxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
          } else {
            ruleCtxQuery[argName] = parseFloat(rule.value);
          }
        }
      }
      /**
         * check the value if is required
         * @return {Boolean}      [description]
         */
      _isArgRequired(params) {
        let isRequired = false;
        const cloneRules = helper.extend({}, params.rules);
        for (let i = 0; i <= this.requiredValidNames.length; i++) {
          const validName = this.requiredValidNames[i];
          if (params.rule[validName]) {
            const fn = preRules[validName];
            params.validName = validName;
            params.validValue = params.rule[validName];
            params.parsedValidValue = this._parseValidValue(validName, params.rule, cloneRules, params.argName);
            if (fn(params.rule.value, params)) {
              isRequired = true;
              break;
            }
          }
        }
        return isRequired;
      }
      /**
         * get ctx's method which to get or set the query
         * @param  {Object} rule [description]
         * @return {String}      [methodName]
         */
      _getRuleMethod(rule) {
        if (typeof rule.method === "undefined" || rule.method === "") {
          rule.method = this.ctx.method.toUpperCase();
        } else {
          rule.method = rule.method.toUpperCase();
        }
        return METHOD_MAP[rule.method] || "param";
      }
      /**
         * pre treat rule.value & handle the nested array and object valid
         * @param  {Object} rules [description]
         * @return {Object}       [description]
         */
      _preTreatRules(rules) {
        const childRules = {};
        rules = helper.extend({}, rules);
        for (const argName in rules) {
          const rule = rules[argName];
          const queryMethod = this._getRuleMethod(rule);
          const ruleCtxQuery = this.ctx[queryMethod]();
          const containTypeNum = this.basicType.reduce((acc, val) => {
            val = rule[val] ? 1 : 0;
            return acc + val;
          }, 0);
          if (containTypeNum > 1) {
            throw new Error("Any rule can't contains one more basic type, the param you are validing is " + argName);
          }
          if (!rule.value) {
            rule.value = ruleCtxQuery[argName];
          }
          if (typeof rule.value === "undefined") {
            rule.value = rule.default;
          }
          if (rule.trim && rule.value && rule.value.trim) {
            rule.value = rule.value.trim();
          }
          if (rule.array && !helper.isArray(rule.value)) {
            if (rule.value && helper.isString(rule.value) && rule.value.indexOf(",") > -1) {
              rule.value = rule.value.split(",");
            } else {
              if (typeof rule.value !== "undefined") {
                rule.value = [rule.value];
              }
            }
          }
          if (rule.boolean && typeof rule.value !== "undefined") {
            rule.value = ["yes", "on", "1", "true", true].indexOf(rule.value) > -1;
          }
          if (typeof rule.value !== "undefined") {
            if (argName.indexOf(ARRAY_SP) !== -1 || argName.indexOf(OBJECT_SP) !== -1) {
              const parsedRuleName = argName.split(argName.indexOf(ARRAY_SP) === -1 ? OBJECT_SP : ARRAY_SP);
              ruleCtxQuery[parsedRuleName[0]][parsedRuleName[1]] = rule.value;
            } else {
              ruleCtxQuery[argName] = rule.value;
            }
          }
          if (rule.children && rule.value !== void 0) {
            delete rules[argName];
            const ruleValue = rule.value;
            const ruleChildren = rule.children;
            if (rule.array) {
              for (let i = 0; i < ruleValue.length; i++) {
                const tmpRuleName = argName + ARRAY_SP + i;
                childRules[tmpRuleName] = helper.extend({}, ruleChildren, {
                  value: ruleValue[i]
                });
              }
            } else {
              for (const key in ruleValue) {
                const tmpRuleName = argName + OBJECT_SP + key;
                childRules[tmpRuleName] = helper.extend({}, ruleChildren, {
                  value: ruleValue[key]
                });
              }
            }
          }
        }
        let parsedChildRules = {};
        if (Object.keys(childRules).length > 0) {
          parsedChildRules = this._preTreatRules(childRules);
        }
        return helper.extend({}, rules, parsedChildRules);
      }
      /**
         * add custom valid method
         * @param {String}   validName [description]
         * @param {Function} callback  [description]
         * @param {String}   msg       [description]
         */
      static addRule(validName, callback) {
        preRules[validName] = callback;
      }
      /**
         * validate rules
         * @param  {Object} rules [description]
         * @param  {Object} msgs  [custom errors]
         * @return {Object}       {argName: errorMessage}
         */
      validate(rules, msgs) {
        let ret = {};
        const cloneRules = helper.extend({}, rules);
        const parsedRules = this._preTreatRules(rules);
        this.errors = helper.extend(this.errors, msgs);
        for (const argName in parsedRules) {
          const rule = parsedRules[argName];
          const params = {
            argName,
            rule,
            rules: cloneRules,
            currentQuery: this.ctx[this._getRuleMethod(rule)](),
            ctx: this.ctx
          };
          if (helper.isTrueEmpty(rule.value)) {
            if (this._isArgRequired(params)) {
              for (let i = 0; i < this.requiredValidNames.length; i++) {
                if (rule[this.requiredValidNames[i]]) {
                  const validName = this.requiredValidNames[i];
                  params.validName = validName;
                  params.validValue = rule[validName];
                  params.parsedValidValue = this._parseValidValue(validName, rule, cloneRules, argName);
                  break;
                }
              }
              ret[argName] = this._getErrorMessage(params);
              continue;
            } else {
              continue;
            }
          }
          for (const validName in rule) {
            if (this.skippedValidNames.indexOf(validName) >= 0) {
              continue;
            }
            const fn = preRules[validName];
            if (!helper.isFunction(fn)) {
              throw new Error(validName + " valid method is not been configed");
            }
            params.validName = validName;
            params.validValue = rule[validName];
            params.parsedValidValue = this._parseValidValue(validName, rule, cloneRules, argName);
            const result = fn(rule.value, params);
            if (result === false) {
              const originArgName = this._getOriginArgName(argName);
              ret[originArgName] = this._getErrorMessage(params);
              break;
            } else if (helper.isObject(result)) {
              ret = Object.assign({}, ret, result);
              break;
            } else {
              this._convertArgValue(argName, rule);
            }
          }
        }
        return ret;
      }
    };
    module.exports = Validator;
  }
});

// packages/thinkjs/lib/extend/logic.js
var require_logic = __commonJS({
  "packages/thinkjs/lib/extend/logic.js"(exports, module) {
    var Validator = require_src();
    var helper = require_helper();
    var INVOKED = /* @__PURE__ */ Symbol("invoked");
    var validatorsRuleAdd = false;
    module.exports = {
      /**
       * combine scope and rules
       */
      getCombineRules(scope, rules) {
        if (helper.isObject(scope)) {
          rules = helper.extend({}, scope, rules);
        }
        return rules;
      },
      /**
       * validate rules
       */
      validate(rules, msgs) {
        if (helper.isEmpty(rules)) return;
        this[INVOKED] = true;
        if (!validatorsRuleAdd) {
          validatorsRuleAdd = true;
          const rules2 = think.app.validators.rules || {};
          for (const key in rules2) {
            Validator.addRule(key, rules2[key]);
          }
        }
        const instance = new Validator(this.ctx);
        msgs = Object.assign({}, think.app.validators.messages, msgs);
        rules = this.getCombineRules(this.scope, rules);
        const ret = instance.validate(rules, msgs);
        if (!helper.isEmpty(ret)) {
          this.validateErrors = ret;
          return false;
        }
        return true;
      },
      /**
       * after magic method
       */
      __after() {
        let allowMethods = this.allowMethods;
        if (!helper.isEmpty(allowMethods)) {
          if (helper.isString(allowMethods)) {
            allowMethods = allowMethods.split(",").map((e) => {
              return e.toUpperCase();
            });
          }
          const method = this.method;
          if (allowMethods.indexOf(method) === -1) {
            this.fail(this.config("validateDefaultErrno"), "METHOD_NOT_ALLOWED");
            return false;
          }
        }
        if (!this[INVOKED]) {
          this.rules = this.getCombineRules(this.scope, this.rules);
          if (!helper.isEmpty(this.rules)) {
            const flag = this.validate(this.rules);
            if (!flag) {
              this.fail(this.config("validateDefaultErrno"), this.validateErrors);
              return false;
            }
          }
        }
      }
    };
  }
});

// packages/thinkjs/lib/extend/controller.js
var require_controller = __commonJS({
  "packages/thinkjs/lib/extend/controller.js"(exports, module) {
    var helper = require_helper();
    var debug = require_debug()("thinkjs");
    var assert = require_assert();
    module.exports = {
      /**
       * body getter
       */
      get body() {
        return this.ctx.body;
      },
      /**
       * body setter
       */
      set body(value) {
        this.ctx.body = value;
      },
      /**
       * get client ip
       */
      get ip() {
        return this.ctx.ip;
      },
      /**
       * get client ips
       */
      get ips() {
        return this.ctx.ips;
      },
      /**
       * get status code
       */
      get status() {
        return this.ctx.status;
      },
      /**
       * set status code
       */
      set status(status) {
        this.ctx.status = status;
      },
      /**
       * get content type
       */
      get type() {
        return this.ctx.type;
      },
      /**
       * set content type
       */
      set type(contentType) {
        this.ctx.type = contentType;
      },
      /**
       * get userAgent header
       */
      get userAgent() {
        return this.ctx.userAgent;
      },
      /**
       * get request method
       */
      get method() {
        return this.ctx.method;
      },
      /**
       * is get method
       */
      get isGet() {
        return this.ctx.isGet;
      },
      /**
       * is post method
       */
      get isPost() {
        return this.ctx.isPost;
      },
      /**
       * is command line invoke
       */
      get isCli() {
        return this.ctx.isCli;
      },
      /**
       * get or set config
       * @param {String} name
       * @param {Mix} value
       * @param {String} m
       */
      config(name, value, m = this.ctx.module) {
        return think.config(name, value, m);
      },
      /**
       * is method
       * @param {String} method
       */
      isMethod(method) {
        return this.ctx.isMethod(method);
      },
      /**
       * check if is ajax request
       * @param {String} method
       */
      isAjax(method) {
        return this.ctx.isAjax(method);
      },
      /**
       * is jsonp request
       * @param {String} callback
       */
      isJsonp(callbackField) {
        return this.ctx.isJsonp(callbackField);
      },
      /**
       * send jsonp data
       */
      jsonp(data, callbackField) {
        return this.ctx.jsonp(data, callbackField);
      },
      /**
       * send json data
       */
      json(data) {
        return this.ctx.json(data);
      },
      /**
       * send success data
       */
      success(data, message) {
        return this.ctx.success(data, message);
      },
      /**
       * send fail data
       */
      fail(errno, errmsg, data) {
        return this.ctx.fail(errno, errmsg, data);
      },
      /**
       * set expires header
       * @param {Number} time
       */
      expires(time) {
        return this.ctx.expires(time);
      },
      /**
       * get query data
       * @param {String} name
       * @param {Mixed} value
       */
      get(name, value) {
        return this.ctx.param(name, value);
      },
      /**
       * get query data
       * @param {String} name
       * @param {Mixed} value
       */
      query(name, value) {
        return this.ctx.param(name, value);
      },
      /**
       * get or set post data
       * @param {String} name
       * @param {Mixed} value
       */
      post(name, value) {
        return this.ctx.post(name, value);
      },
      /**
       * get or set file data
       * @param {String} name
       * @param {Mixed} value
       */
      file(name, value) {
        return this.ctx.file(name, value);
      },
      /**
       * get or set cookies
       * @param {String} name
       * @param {String} value
       * @param {Object} options
       */
      cookie(name, value, options) {
        return this.ctx.cookie(name, value, options);
      },
      /**
       * get or set header
       * @param {String} name
       * @param {Mixed} value
       */
      header(name, value) {
        if (value === void 0 && helper.isString(name)) {
          return this.ctx.header[name];
        }
        if (this.ctx.res.headersSent) {
          debug(`headers has already sent, url: ${this.ctx.url}`);
          return;
        }
        if (value !== void 0) {
          return this.ctx.set(name, value);
        }
        if (helper.isObject(name)) {
          return this.ctx.set(name);
        }
      },
      /**
       * get referer header
       */
      referrer(onlyHost) {
        return this.ctx.referer(onlyHost);
      },
      /**
       * get referer header
       */
      referer(onlyHost) {
        return this.ctx.referer(onlyHost);
      },
      /**
       * Perform a 302 redirect to `url`.
       * @param {String} url
       * @param {String} alt
       */
      redirect(url, alt) {
        this.ctx.redirect(url, alt);
        return false;
      },
      /**
       * get controller instance
       * @param {String} name
       * @param {String} m
       */
      controller(name, m = this.ctx.module) {
        let mcls = think.app.controllers;
        if (this.ctx.app.modules.length) {
          mcls = think.app.controllers[m || "common"] || {};
        }
        const Cls = mcls[name];
        assert(Cls, `can not find controller: ${name}`);
        return new Cls(this.ctx);
      },
      /**
       * get service
       * @param {String} name
       * @param {String} m
       */
      service(...args) {
        const { modules, services } = think.app;
        if (!modules.length) {
          return think.service(...args);
        }
        const { module: module2 } = this.ctx;
        const haveSetModule = args.length > 1 && modules.includes(args[1]);
        const existInContextModule = services[module2] && services[module2][args[0]];
        if (haveSetModule || !existInContextModule) {
          return think.service(...args);
        }
        const name = args.shift();
        return think.service(name, module2, ...args);
      },
      /**
       * execute action
       * @param {String} controller
       * @param {String} actionName
       * @param {String} m
       */
      action(controller, actionName, m) {
        let instance = controller;
        if (helper.isString(controller)) {
          instance = this.controller(controller, m);
        }
        let promise = Promise.resolve();
        if (instance.__before) {
          promise = Promise.resolve(instance.__before());
        }
        return promise.then((data) => {
          if (data === false) return false;
          let method = `${actionName}Action`;
          if (!instance[method]) {
            method = "__call";
          }
          if (instance[method]) return instance[method]();
        }).then((data) => {
          if (data === false) return false;
          if (instance.__after) return instance.__after();
          return data;
        });
      },
      /**
       * download
       * @param {String} filepath
       * @param {String} filename
       */
      download(filepath, filename) {
        return this.ctx.download(filepath, filename);
      }
    };
  }
});

// packages/think-config/index.js
var require_think_config = __commonJS({
  "packages/think-config/index.js"(exports) {
    var helper = require_helper();
    var Config = class {
      /**
       * constructor
       * @param {config} config data
       */
      constructor(config = {}) {
        this.config = config;
      }
      /**
       * get config
       * get(), get('name'), get('foo.bar.xxx')
       * @param {name} undefined|String
       */
      get(name, config) {
        if (!name) {
          return this.config;
        }
        config = config || this.config;
        if (name.indexOf(".") === -1) {
          return config[name];
        }
        name = name.split(".");
        const length = name.length;
        name.some((item, index) => {
          config = config[item];
          if (index !== length - 1 && !helper.isObject(config)) {
            config = void 0;
            return true;
          }
        });
        return config;
      }
      /**
       * set config
       * set('name', 'value'), set('foo.bar', 'value')
       */
      set(name, value) {
        if (name.indexOf(".") === -1) {
          this.config[name] = value;
          return this;
        }
        let config = this.config;
        name = name.split(".");
        if (name.some((item) => /^__proto__|prototype|construcotr$/.test(item))) {
          return this;
        }
        const length = name.length;
        name.forEach((item, index) => {
          if (index === length - 1) {
            config[item] = value;
          } else {
            if (!helper.isObject(config[item])) {
              config[item] = {};
            }
            config = config[item];
          }
        });
        return this;
      }
    };
    function getConfigFn(configs, isMultiModule) {
      const configInstances = {};
      if (isMultiModule) {
        for (const name in configs) {
          configInstances[name] = new Config(configs[name]);
        }
      } else {
        configInstances.common = new Config(configs);
      }
      return (name, value, m = "common") => {
        let conf = configInstances.common;
        if (!isMultiModule) {
          if (value === void 0) {
            return conf.get(name);
          }
          return conf.set(name, value);
        }
        if (value === void 0) {
          if (m && configInstances[m]) {
            conf = configInstances[m];
          }
          return conf.get(name);
        }
        if (m === true) {
          for (const mName in configInstances) {
            configInstances[mName].set(name, value);
          }
          return;
        }
        m.split(",").forEach((item) => {
          const conf2 = configInstances[item];
          if (!conf2) return;
          conf2.set(name, value);
        });
      };
    }
    exports.Config = Config;
    exports.getConfigFn = getConfigFn;
  }
});

// packages/thinkjs/edge/shared-entry.js
var import_think_router = __toESM(require_think_router(), 1);
var import_think_controller = __toESM(require_think_controller(), 1);
var import_think_logic = __toESM(require_think_logic(), 1);
var import_logic = __toESM(require_logic(), 1);
var import_controller = __toESM(require_controller(), 1);
var import_think_config = __toESM(require_think_config(), 1);
var import_path_to_regexp = __toESM(require_path_to_regexp(), 1);
var import_helper = __toESM(require_helper(), 1);
var export_configModule = import_think_config.default;
var export_controller = import_think_controller.default;
var export_controllerMethods = import_controller.default;
var export_helper = import_helper.default;
var export_logic = import_think_logic.default;
var export_logicMethods = import_logic.default;
var export_pathToRegexp = import_path_to_regexp.default;
var export_router = import_think_router.default;
export {
  export_configModule as configModule,
  export_controller as controller,
  export_controllerMethods as controllerMethods,
  export_helper as helper,
  export_logic as logic,
  export_logicMethods as logicMethods,
  export_pathToRegexp as pathToRegexp,
  export_router as router
};
