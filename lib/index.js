var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name2, symbol) => (symbol = Symbol[name2]) ? symbol : Symbol.for("Symbol." + name2);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name2, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name: name2, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name2, decorators, target, extra2) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name2]() {
    return __privateGet(this, extra2);
  }, set [name2](x) {
    return __privateSet(this, extra2, x);
  } }, name2));
  k ? p && k < 4 && __name(extra2, (k > 2 ? "set " : k > 1 ? "get " : "") + name2) : __name(target, name2);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name2, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name2 in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra2 : desc.get) : (x) => x[name2];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra2 : desc.set) : (x, y) => x[name2] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra2 : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra2 = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name2, desc), p ? k ^ 4 ? extra2 : desc : target;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.3/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
  return result;
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
    return true;
  }) ?? Object.keys({
    ...a,
    ...b
  }).every((key) => deepEqual(a[key], b[key], strict));
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) date2 = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// node_modules/.pnpm/@deepseek-ai+schemastery@3.18.1/node_modules/@deepseek-ai/schemastery/lib/index.mjs
var kSchema = Symbol.for("schemastery");
var kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  options;
  name = "ValidationError";
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
    else if (typeof segment === "number") prefix += "[" + segment + "]";
    else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") try {
    schema.callback = new Function("return " + schema.callback)();
  } catch {
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
  return {
    version: 1,
    vendor: "schemastery",
    validate: (value) => {
      try {
        return { value: Schema.resolve(value, this, {})[0] };
      } catch (error) {
        if (ValidationError.is(error)) return { issues: [{
          message: error.message,
          path: error.options.path
        }] };
        throw error;
      }
    }
  };
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = {
    uid: this.uid,
    refs: globalThis.__schemastery_refs__
  };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
    else if (typeof value === "string") result[locale] = value;
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
    return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
  });
  if (schema.list) schema.list = schema.list.map((inner, index) => {
    return inner.i18n(mapValues(messages, (data = {}) => {
      if (Array.isArray(getInner(data))) return getInner(data)[index];
      if (Array.isArray(data)) return data[index];
      return extractKeys(data);
    }));
  });
  if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
    if (getInner(data)) return getInner(data);
    return extractKeys(data);
  }));
  if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
};
for (const key of [
  "required",
  "disabled",
  "collapse",
  "hidden",
  "loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "deprecated",
    type: "danger"
  });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "experimental",
    type: "warning"
  });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = {
    ...schema.meta,
    pattern: pattern2
  };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) Object.assign(result, item.simplify(value));
    return result;
  } else if (this.type === "union") for (const schema of this.list) try {
    Schema.resolve(value, schema, {});
    return schema.simplify(value);
  } catch {
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    role,
    extra: extra2
  };
  return schema;
};
for (const key of [
  "default",
  "link",
  "comment",
  "description",
  "max",
  "min",
  "step"
]) Object.assign(Schema.prototype, { [key](value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
var resolvers = {};
Schema.extend = function extend(type, resolve2) {
  resolvers[type] = resolve2;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) return Schema.any();
  else if ([
    "string",
    "number",
    "boolean"
  ].includes(typeof source)) return Schema.const(source).required();
  else if (source[kSchema]) return source;
  else if (typeof source === "function") switch (source) {
    case String:
      return Schema.string().required();
    case Number:
      return Schema.number().required();
    case Boolean:
      return Schema.boolean().required();
    case Function:
      return Schema.function().required();
    default:
      return Schema.is(source).required();
  }
  else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = {
        ...schema.meta,
        ...schema.inner.meta
      };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({
    type: "lazy",
    builder,
    inner: { toJSON: toJSON2 }
  });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
    const date2 = new Date(value);
    if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
    return date2;
  }, true)]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
    try {
      return new RegExp(value, flag);
    } catch (e) {
      throw new ValidationError(e.message, options);
    }
  }, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = {
      ...schema.meta,
      ...schema.inner.meta
    };
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) if (data & bits[key]) keys.push(key);
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else throw new ValidationError(`expected number or array but got ${data}`, options);
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) result[key] = value;
  }
  if (!strict) merge(result, data);
  return [result];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages = [];
  for (const inner of list) try {
    return Schema.resolve(data, inner, options, strict);
  } catch (error) {
    messages.push(error);
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) result = value;
    else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    else if (typeof value === "object") merge(result ??= {}, value);
    else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
  }
  if (!strict && isPlainObject(data)) merge(result, data);
  return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) return [callback(result)];
  else return [callback(result), callback(adapted)];
});
var formatters = {};
function defineMethod(name2, keys, format) {
  formatters[name2] = format;
  Object.assign(Schema, { [name2](...args) {
    const schema = new Schema({ type: name2 });
    keys.forEach((key, index) => {
      switch (key) {
        case "sKey":
          schema.sKey = args[index] ?? Schema.string();
          break;
        case "inner":
          schema.inner = Schema.from(args[index]);
          break;
        case "list":
          schema.list = args[index].map(Schema.from);
          break;
        case "dict":
          schema.dict = mapValues(args[index], Schema.from);
          break;
        case "bits":
          schema.bits = {};
          for (const key2 in args[index]) {
            if (typeof args[index][key2] !== "number") continue;
            schema.bits[key2] = args[index][key2];
          }
          break;
        case "callback": {
          const callback = schema.callback = args[index];
          callback["toJSON"] ||= () => callback.toString();
          break;
        }
        case "constructor": {
          const constructor = schema.constructor = args[index];
          if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
          break;
        }
        default:
          schema[key] = args[index];
      }
    });
    if (name2 === "object" || name2 === "dict") schema.meta.default = {};
    else if (name2 === "array" || name2 === "tuple") schema.meta.default = [];
    else if (name2 === "bitset") schema.meta.default = 0;
    return schema;
  } });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") return constructor.name;
  else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
  "inner",
  "callback",
  "preserve"
], ({ inner }, isInner) => inner.toString(isInner));

// src/runtime.ts
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

// src/engine/placeholders.ts
function protectVerbatim(input) {
  const placeholders = /* @__PURE__ */ new Map();
  let counter = 0;
  let protectedContent = input;
  protectedContent = protectedContent.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (match) => {
    const key = `__SHUORENHUA_CODEBLOCK_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(\$\$[\s\S]*?\$\$)/g, (match) => {
    const key = `__SHUORENHUA_DISP_MATH_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(\$[^$\n]+?\$)/g, (match) => {
    const key = `__SHUORENHUA_INLINE_MATH_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(`[^`\n]+?`)/g, (match) => {
    const key = `__SHUORENHUA_INLINECODE_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(https?:\/\/[^\s)>\]]+)/g, (match) => {
    const key = `__SHUORENHUA_URL_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  return {
    text: protectedContent,
    placeholders
  };
}
function restoreVerbatim(text, placeholders) {
  let result = text;
  for (const [key, value] of placeholders.entries()) {
    result = result.replaceAll(key, () => value);
  }
  return result;
}

// src/engine/rules.ts
var OPENING_GREETINGS = [
  /^(好的|收到|没问题|当然可以|很高兴为您解答|感谢您的提问)[，！。、\s\n]*/i,
  /^(针对您提出的|关于您提到的|关于这个问题|针对您所说的问题)[^，。！？\n]*[，。：:\n\s]*/i,
  /^(这是一个非常(好|棒|深刻|经典|有趣)的问题)[，。！\n\s]*/i,
  /^(我来为您(详细)?(解答|分析|梳理|整理|说明|介绍))[，。！\n\s]*/i,
  /^(以下是为您(准备|整理|提供)的|下面为您详细介绍)[^：:\n]*[：:\n\s]*/i,
  /^(在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,\s]*)/i,
  /^(随着[^，,\n]*(飞速发展|迅猛发展|日益普及|不断进步|广泛应用)[^，,\n]*[，,\s]*)/i,
  /^(在(这个|如今)[^，,\n]*(时代|背景下)[，,\s]*)/i
];
var CLOSING_BOILERPLATES = [
  /(希望以上(解答|内容|方案|建议|信息)?(对您有所帮助|能帮到您|能解决您的问题|对您有用)[！。~]*\s*)+$/i,
  /(希望(对您有所帮助|能帮到您|能解决您的问题)[！。~]*\s*)+$/i,
  /(如果您还有(任何|其他)?(疑问|问题|需要|想法)，欢迎随时(向我提问|提问|告知我|联系我|深入探讨)[！。~]*\s*)+$/i,
  /(作为(一个)?AI(语言模型|助手)?，(我需要提醒您|请注意)[^。\n]*[。\n]?\s*)+$/i,
  /(请根据您的(实际情况|具体需求|业务场景)(进行调整|酌情参考|审慎选择)[！。]*\s*)+$/i,
  /(总而言之|综上所述|总的来说|总的来看)[，,][^\n。]*[。\n]?\s*$/i,
  /(如需进一步(了解|探讨|协助)，请随时(告诉我|留言)[！。~]*\s*)+$/i
];
var BUZZWORD_REPLACEMENTS = [
  { pattern: /赋能/g, replacement: "\u5E2E\u52A9", label: "\u8D4B\u80FD -> \u5E2E\u52A9" },
  { pattern: /抓手/g, replacement: "\u5207\u5165\u70B9", label: "\u6293\u624B -> \u5207\u5165\u70B9" },
  { pattern: /闭环/g, replacement: "\u641E\u5B9A", label: "\u95ED\u73AF -> \u641E\u5B9A" },
  { pattern: /深耕/g, replacement: "\u4E13\u6CE8", label: "\u6DF1\u8015 -> \u4E13\u6CE8" },
  { pattern: /打法/g, replacement: "\u505A\u6CD5", label: "\u6253\u6CD5 -> \u505A\u6CD5" },
  { pattern: /壁垒/g, replacement: "\u95E8\u69DB", label: "\u58C1\u5792 -> \u95E8\u69DB" },
  { pattern: /背书/g, replacement: "\u652F\u6301", label: "\u80CC\u4E66 -> \u652F\u6301" },
  { pattern: /底层逻辑/g, replacement: "\u57FA\u672C\u539F\u7406", label: "\u5E95\u5C42\u903B\u8F91 -> \u57FA\u672C\u539F\u7406" },
  { pattern: /顶层设计/g, replacement: "\u603B\u4F53\u89C4\u5212", label: "\u9876\u5C42\u8BBE\u8BA1 -> \u603B\u4F53\u89C4\u5212" },
  { pattern: /颗粒度/g, replacement: "\u7EC6\u8282\u7A0B\u5EA6", label: "\u9897\u7C92\u5EA6 -> \u7EC6\u8282\u7A0B\u5EA6" },
  { pattern: /对齐/g, replacement: "\u540C\u6B65", label: "\u5BF9\u9F50 -> \u540C\u6B65" },
  { pattern: /打通/g, replacement: "\u8FDE\u901A", label: "\u6253\u901A -> \u8FDE\u901A" },
  { pattern: /矩阵/g, replacement: "\u7EC4\u5408", label: "\u77E9\u9635 -> \u7EC4\u5408" },
  { pattern: /载体/g, replacement: "\u5F62\u5F0F", label: "\u8F7D\u4F53 -> \u5F62\u5F0F" },
  { pattern: /发力点/g, replacement: "\u91CD\u70B9", label: "\u53D1\u529B\u70B9 -> \u91CD\u70B9" },
  { pattern: /组合拳/g, replacement: "\u591A\u9879\u4E3E\u63AA", label: "\u7EC4\u5408\u62F3 -> \u591A\u9879\u4E3E\u63AA" },
  { pattern: /痛点/g, replacement: "\u96BE\u70B9", label: "\u75DB\u70B9 -> \u96BE\u70B9" },
  { pattern: /标志着/g, replacement: "\u8868\u660E", label: "\u6807\u5FD7\u7740 -> \u8868\u660E" },
  { pattern: /彰显了/g, replacement: "\u4F53\u73B0\u51FA", label: "\u5F70\u663E\u4E86 -> \u4F53\u73B0\u51FA" },
  { pattern: /凸显了/g, replacement: "\u8BF4\u660E", label: "\u51F8\u663E\u4E86 -> \u8BF4\u660E" },
  { pattern: /毋庸置疑(的是)?[，,]?/g, replacement: "\u663E\u7136\uFF0C", label: "\u6BCB\u5EB8\u7F6E\u7591 -> \u663E\u7136" },
  { pattern: /不可否认的是[，,]?/g, replacement: "\u786E\u5B9E\uFF0C", label: "\u4E0D\u53EF\u5426\u8BA4 -> \u786E\u5B9E" },
  { pattern: /显而易见的是[，,]?/g, replacement: "\u663E\u7136\uFF0C", label: "\u663E\u800C\u6613\u89C1 -> \u663E\u7136" },
  { pattern: /毫无疑问(的是)?[，,]?/g, replacement: "\u663E\u7136\uFF0C", label: "\u6BEB\u65E0\u7591\u95EE -> \u663E\u7136" },
  { pattern: /发挥着至关重要的作用/g, replacement: "\u975E\u5E38\u91CD\u8981", label: "\u81F3\u5173\u91CD\u8981 -> \u975E\u5E38\u91CD\u8981" },
  { pattern: /扮演着不可或缺的角色/g, replacement: "\u4E0D\u53EF\u6216\u7F3A", label: "\u4E0D\u53EF\u6216\u7F3A\u7684\u89D2\u8272 -> \u4E0D\u53EF\u6216\u7F3A" },
  { pattern: /值得注意的是[，,]?/g, replacement: "\u6CE8\u610F\uFF1A", label: "\u503C\u5F97\u6CE8\u610F -> \u6CE8\u610F" },
  { pattern: /需要指出的是[，,]?/g, replacement: "\u63D0\u793A\uFF1A", label: "\u9700\u8981\u6307\u51FA -> \u63D0\u793A" }
];
var FILLER_SENTENCES = [
  /在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,]/g,
  /随着[^，,\n]*(飞速发展|迅猛发展|日益普及|不断进步|广泛应用)[^，,\n]*[，,]/g,
  /在(这个|如今)[^，,\n]*(时代|背景下)[，,]/g
];

// src/engine/humanizer.ts
function humanize(input, options = {}) {
  const rawInput = input ?? "";
  if (!rawInput.trim()) {
    return {
      text: "",
      original: rawInput,
      mode: "default",
      source: "rule",
      stats: {
        originalLength: 0,
        humanizedLength: 0,
        savedPercentage: 0,
        removedOpeners: 0,
        removedClosers: 0,
        replacedBuzzwords: 0
      }
    };
  }
  const preserveCode = options.preserveCode !== false;
  const { text: protectedContent, placeholders } = preserveCode ? protectVerbatim(rawInput) : { text: rawInput, placeholders: /* @__PURE__ */ new Map() };
  let processed = protectedContent.trim();
  let removedOpeners = 0;
  let removedClosers = 0;
  let replacedBuzzwords = 0;
  let openerMatched = true;
  while (openerMatched) {
    openerMatched = false;
    for (const regex of OPENING_GREETINGS) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, "").trim();
        removedOpeners++;
        openerMatched = true;
      }
    }
  }
  let closerMatched = true;
  while (closerMatched) {
    closerMatched = false;
    for (const regex of CLOSING_BOILERPLATES) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, "").trim();
        removedClosers++;
        closerMatched = true;
      }
    }
  }
  for (const regex of FILLER_SENTENCES) {
    if (regex.test(processed)) {
      processed = processed.replaceAll(regex, "");
    }
  }
  for (const item of BUZZWORD_REPLACEMENTS) {
    const matches = processed.match(item.pattern);
    if (matches && matches.length > 0) {
      replacedBuzzwords += matches.length;
      processed = processed.replaceAll(item.pattern, item.replacement);
    }
  }
  processed = processed.replace(/(^|\n)首先[，,]?\s*/g, "$11. ").replace(/(^|\n)其次[，,]?\s*/g, "$12. ").replace(/(^|\n)再次[，,]?\s*/g, "$13. ").replace(/(^|\n)最后[，,]?\s*/g, "$14. ").replace(/(^|\n)第一[，、]?\s*/g, "$11. ").replace(/(^|\n)第二[，、]?\s*/g, "$12. ").replace(/(^|\n)第三[，、]?\s*/g, "$13. ").replace(/[，,]?(总的来说|总而言之|综上所述)[，,]?/g, "").replace(/[，,]?(显而易见|毋庸置疑)[，,]?/g, "");
  processed = processed.replace(/\n{3,}/g, "\n\n").trim();
  const finalResult = restoreVerbatim(processed, placeholders);
  const originalLength = rawInput.length;
  const humanizedLength = finalResult.length;
  const savedRatio = originalLength > 0 ? Math.max(0, Math.round((originalLength - humanizedLength) / originalLength * 100)) : 0;
  const stats = {
    originalLength,
    humanizedLength,
    savedPercentage: savedRatio,
    removedOpeners,
    removedClosers,
    replacedBuzzwords
  };
  return {
    text: finalResult,
    original: rawInput,
    mode: "default",
    source: "rule",
    stats
  };
}

// src/engine/prompt.ts
var HUMANIZER_SYSTEM_PROMPT = `
\u4F60\u662F\u4E00\u4F4D\u4E13\u95E8\u5C06 AI \u751F\u6210\u7684\u751F\u786C\u6587\u672C\u91CD\u5199\u4E3A\u771F\u5B9E\u3001\u5730\u9053\u3001\u81EA\u7136\u201C\u4EBA\u8BDD\u201D\u7684\u8BED\u8A00\u5927\u5E08\u3002
\u4F60\u7684\u4EFB\u52A1\u662F\uFF1A\u5F7B\u5E95\u6D88\u9664\u201CAI \u5473\u201D\u3001\u201C\u673A\u5668\u7FFB\u8BD1\u8154\u201D\u4E0E\u201C\u4E92\u8054\u7F51/\u516C\u6587\u516B\u80A1\u5957\u8BDD\u201D\uFF0C\u540C\u65F6 100% \u4FDD\u7559\u5168\u90E8\u6838\u5FC3\u4E8B\u5B9E\u3001\u6280\u672F\u7EC6\u8282\u3001\u4EE3\u7801\u4E0E\u771F\u5B9E\u903B\u8F91\u3002

\u3010\u6838\u5FC3\u539F\u5219\uFF08\u5FC5\u987B\u4E25\u683C\u9075\u5B88\uFF09\u3011

\u4E00\u3001\u5F7B\u5E95\u5220\u9664\u5BF9\u8BDD\u673A\u5668\u4EBA\u6B8B\u7559\u4E0E\u5BA2\u5957\u5E9F\u8BDD\uFF08\u6E90\u81EA MrGeDiao/shuorenhua\uFF09
1. \u4E25\u7981\u5F00\u573A\u5BD2\u6684\uFF1A\u5F7B\u5E95\u5220\u9664\u201C\u597D\u7684\u201D\u3001\u201C\u6536\u5230\u201D\u3001\u201C\u6CA1\u95EE\u9898\u201D\u3001\u201C\u5F88\u9AD8\u5174\u4E3A\u60A8\u89E3\u7B54\u201D\u3001\u201C\u8FD9\u662F\u4E00\u4E2A\u5F88\u597D\u7684\u95EE\u9898\u201D\u3001\u201C\u5728\u5F53\u4ECA\u5FEB\u901F\u53D1\u5C55\u7684\u65F6\u4EE3\u201D\u3001\u201C\u968F\u7740...\u7684\u4E0D\u65AD\u666E\u53CA\u201D\u7B49\u4E00\u5207\u7A7A\u6D1E\u7684\u5F00\u573A\u767D\uFF0C\u76F4\u63A5\u5207\u5165\u6838\u5FC3\u6B63\u9898\u3002
2. \u4E25\u7981\u7ED3\u5C3E\u5BA2\u5957\u4E0E\u514D\u8D23\u58F0\u660E\uFF1A\u5F7B\u5E95\u5220\u9664\u201C\u5E0C\u671B\u4EE5\u4E0A\u89E3\u7B54\u5BF9\u60A8\u6709\u6240\u5E2E\u52A9\u201D\u3001\u201C\u5982\u679C\u60A8\u8FD8\u6709\u5176\u4ED6\u7591\u95EE\u6B22\u8FCE\u968F\u65F6\u63D0\u95EE\u201D\u3001\u201C\u4F5C\u4E3AAI\u6211\u9700\u8981\u63D0\u9192\u60A8\u201D\u3001\u201C\u8BF7\u6839\u636E\u5B9E\u9645\u60C5\u51B5\u5BA1\u614E\u9009\u62E9\u201D\u7B49\u514D\u8D23\u58F0\u660E\u4E0E\u9E21\u6C64\u5C3E\u5DF4\u3002

\u4E8C\u3001\u5F7B\u5E95\u94F2\u9664\u4E92\u8054\u7F51\u9ED1\u8BDD\u3001\u516C\u6587\u516B\u80A1\u4E0E\u5927\u8BCD\u8F70\u70B8\uFF08\u6E90\u81EA nothing0here/humanizer-zh\uFF09
1. \u575A\u51B3\u7528\u901A\u4FD7\u5927\u767D\u8BDD\u66FF\u6362\u4EE5\u4E0B\u9AD8\u5371\u8BCD\u6C47\uFF1A
   - \u201C\u8D4B\u80FD\u201D -> \u6539\u4E3A\u201C\u5E2E\u52A9/\u652F\u6301/\u8BA9...\u80FD\u591F\u201D
   - \u201C\u6293\u624B\u201D -> \u6539\u4E3A\u201C\u5207\u5165\u70B9/\u5DE5\u5177/\u529E\u6CD5\u201D
   - \u201C\u6253\u901A...\u95ED\u73AF\u201D -> \u6539\u4E3A\u201C\u8D70\u901A\u6D41\u7A0B/\u641E\u5B9A/\u5F62\u6210\u5B8C\u6574\u95ED\u73AF\u201D
   - \u201C\u6DF1\u8015\u201D -> \u6539\u4E3A\u201C\u4E13\u6CE8/\u6DF1\u505A/\u957F\u671F\u505A\u201D
   - \u201C\u5E95\u5C42\u903B\u8F91\u201D -> \u6539\u4E3A\u201C\u57FA\u672C\u539F\u7406/\u6838\u5FC3\u539F\u56E0\u201D
   - \u201C\u9876\u5C42\u8BBE\u8BA1\u201D -> \u6539\u4E3A\u201C\u603B\u4F53\u89C4\u5212/\u6574\u4F53\u67B6\u6784\u201D
   - \u201C\u9897\u7C92\u5EA6\u201D -> \u6539\u4E3A\u201C\u7EC6\u8282\u7A0B\u5EA6/\u7CBE\u7EC6\u5EA6\u201D
   - \u201C\u5BF9\u9F50\u201D -> \u6539\u4E3A\u201C\u540C\u6B65/\u62C9\u9F50/\u7EDF\u4E00\u201D
   - \u201C\u6253\u901A\u201D -> \u6539\u4E3A\u201C\u8FDE\u901A/\u5BF9\u63A5\u201D
   - \u201C\u77E9\u9635\u201D -> \u6539\u4E3A\u201C\u7EC4\u5408/\u7CFB\u5217\u201D
   - \u201C\u75DB\u70B9\u201D -> \u6539\u4E3A\u201C\u96BE\u70B9/\u95EE\u9898/\u9EBB\u70E6\u201D
   - \u201C\u53D1\u529B\u70B9/\u7EC4\u5408\u62F3\u201D -> \u6539\u4E3A\u201C\u91CD\u70B9/\u591A\u9879\u4E3E\u63AA\u201D
   - \u201C\u6BCB\u5EB8\u7F6E\u7591/\u663E\u800C\u6613\u89C1/\u4E0D\u53EF\u5426\u8BA4\u201D -> \u6539\u4E3A\u201C\u663E\u7136/\u786E\u5B9E\u201D\u6216\u76F4\u63A5\u5220\u6389\u4FEE\u9970\u8BCD\u3002
2. \u6D88\u9664\u6B27\u5316\u7FFB\u8BD1\u8154\u4E0E\u6076\u6027\u88AB\u52A8\u53E5\uFF08\u5982\u901A\u7BC7\u201C\u88AB...\u6240\u8D4B\u4E88\u201D\u3001\u201C\u968F\u7740...\u5BF9\u4E8E...\u901A\u8FC7...\u201D\u53E5\u9996\u75C5\uFF09\uFF0C\u6539\u4E3A\u5730\u9053\u7684\u6C49\u8BED\u4E3B\u52A8\u8BED\u6001\u3002
3. \u5220\u9664\u865A\u5F20\u58F0\u52BF\u7684\u201C\u6311\u6218\u4E0E\u5C55\u671B\u201D\u5047\u6DF1\u6C89\uFF08\u5982\u201C\u5C3D\u7BA1\u9762\u4E34\u8BF8\u591A\u6311\u6218\uFF0C\u4F46\u4F9D\u7136\u5C55\u73B0\u51FA\u5F3A\u52B2\u97E7\u6027\uFF0C\u672A\u6765\u53EF\u671F\u201D\uFF09\u3002

\u4E09\u3001\u6253\u7834\u516C\u5F0F\u5316\u7ED3\u6784\u4E0E\u865A\u5047\u5347\u534E\uFF08\u6E90\u81EA op7418/Humanizer-zh\uFF09
1. \u62D2\u7EDD\u628A\u666E\u901A\u5C0F\u4E8B\u5347\u534E\u4E3A\u201C\u6807\u5FD7\u7740\u91CD\u8981\u91CC\u7A0B\u7891\u201D\u3001\u201C\u8C31\u5199\u4E86\u5D2D\u65B0\u7BC7\u7AE0\u201D\u3001\u201C\u7559\u4E0B\u4E86\u4E0D\u53EF\u78E8\u706D\u7684\u5370\u8BB0\u201D\u3002
2. \u6253\u7834\u673A\u68B0\u523B\u677F\u7684\u4E09\u6BB5\u8BBA\uFF08\u201C\u9996\u5148...\u5176\u6B21...\u518D\u6B21...\u6700\u540E...\u7EFC\u4E0A\u6240\u8FF0\u201D\uFF09\uFF0C\u6839\u636E\u771F\u5B9E\u903B\u8F91\u81EA\u7136\u5206\u6BB5\u6216\u7528\u6E05\u6670\u7684\u5217\u8868\u3002
3. \u53E5\u5F0F\u957F\u77ED\u7ED3\u5408\uFF0C\u81EA\u7136\u547C\u5438\uFF0C\u6709\u4EBA\u5473\u3001\u6709\u6001\u5EA6\u3001\u6709\u8282\u594F\u611F\uFF0C\u800C\u4E0D\u662F\u6BEB\u65E0\u7075\u9B42\u7684\u62A5\u544A\u5F0F\u5E73\u94FA\u76F4\u53D9\u3002

\u56DB\u3001\u6280\u672F\u4E8B\u5B9E\u4E0E\u4EE3\u7801 100% \u7EDD\u5BF9\u4FDD\u771F\uFF08\u6E90\u81EA MrGeDiao/shuorenhua\uFF09
1. Markdown \u4EE3\u7801\u5757\uFF08\`\`\`...\`\`\`\uFF09\u3001\u5185\u8054\u4EE3\u7801\uFF08\`...\`\uFF09\u3001\u547D\u4EE4\u884C\u3001\u63A5\u53E3\u540D\u3001\u8DEF\u5F84\u3001\u914D\u7F6E\u9879\u3001\u53C2\u6570\u3001\u6570\u5B57\u7EDD\u5BF9\u9010\u5B57\u4FDD\u7559\uFF0C\u4E25\u7981\u64C5\u81EA\u4FEE\u6539\u3002
2. \u4E25\u7981\u65E0\u4E2D\u751F\u6709\u6216\u8111\u8865\u7F16\u9020\u539F\u6587\u6CA1\u6709\u63D0\u53CA\u7684\u4E8B\u5B9E\u3001\u6570\u636E\u6216\u6B65\u9AA4\u3002

\u3010\u8F93\u51FA\u8981\u6C42\u3011
\u76F4\u63A5\u8F93\u51FA\u6539\u5199\u6DA6\u8272\u540E\u7684\u201C\u4EBA\u8BDD\u201D\u6B63\u6587\uFF0C\u4E0D\u52A0\u4EFB\u4F55\u81EA\u6211\u89E3\u91CA\u3001\u524D\u8A00\u6216\u603B\u7ED3\u5E9F\u8BDD\u3002
`.trim();

// src/cache.ts
function isFreshCacheRecord(record, text) {
  return !!record && record.original === text && record.text.length > 0;
}
function humanizeCacheKey(messageId, text) {
  return messageId ? `msg:${messageId}` : `anon:${fnv1a(text).toString(36)}`;
}
async function openShuorenhuaCache(ctx, maxEntries = 100) {
  try {
    const facility = ctx.get("storageDomain");
    if (!facility || typeof facility.open !== "function") {
      ctx.logger.debug("shuorenhua cache disabled: storageDomain service not available");
      return null;
    }
    const storage = await import("@deepseek-ai/dsh-storage-domain").catch((error) => {
      ctx.logger.debug("shuorenhua cache disabled: @deepseek-ai/dsh-storage-domain unavailable", error);
      return null;
    });
    if (!storage) return null;
    const zod = await import("zod").catch((error) => {
      ctx.logger.debug("shuorenhua cache disabled: zod unavailable", error);
      return null;
    });
    if (!zod) return null;
    const { defineDomain, domainTable } = storage;
    const spec = defineDomain({
      name: "shuorenhua",
      version: 1,
      tables: {
        humanize: domainTable(
          zod.z.object({
            original: zod.z.string(),
            text: zod.z.string(),
            ts: zod.z.number()
          })
        )
      }
    });
    const domain = await facility.open(spec);
    const table = domain.table("humanize");
    return {
      read: (key) => table.get(key),
      async persist(key, record) {
        if (table.size >= maxEntries) {
          let oldest;
          for (const entry of table.entries()) {
            if (!oldest || entry[1].ts < oldest[1].ts) oldest = entry;
          }
          if (oldest) await table.delete(oldest[0]);
        }
        await table.put(key, record);
      },
      close: () => domain.close()
    };
  } catch (error) {
    ctx.logger.warn("shuorenhua cache open failed, continuing without cache", error);
    return null;
  }
}
function fnv1a(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// src/runtime.ts
async function* streamHumanize(ctx, text, config = {}, signal) {
  const llmService = ctx.get("llm");
  if (!llmService || typeof llmService.stream !== "function") {
    throw new Error("DSH \u5BBF\u4E3B LLM \u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u63D0\u4F9B\u65B9\u914D\u7F6E");
  }
  let provider = config.provider;
  let model = config.model;
  const defaultModelService = ctx.get("agentDefaultModel");
  if ((!provider || !model) && defaultModelService && typeof defaultModelService.currentSelection === "function") {
    try {
      const selection = defaultModelService.currentSelection();
      if (selection?.provider && !provider) {
        provider = selection.provider;
      }
      if (selection?.model && !model) {
        model = selection.model;
      }
    } catch {
    }
  }
  if (!provider && typeof llmService.listProviders === "function") {
    try {
      const providers = llmService.listProviders();
      if (Array.isArray(providers) && providers.length > 0) {
        provider = providers[0]?.id;
      }
    } catch {
    }
  }
  provider = provider || "deepseek-official";
  if (!model && typeof llmService.listModels === "function") {
    try {
      const models = await llmService.listModels(provider);
      if (Array.isArray(models) && models.length > 0) {
        model = models[0]?.id;
      }
    } catch {
    }
  }
  model = model || "deepseek-chat";
  const stream = llmService.stream({
    provider,
    model,
    system: HUMANIZER_SYSTEM_PROMPT,
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: "user",
        source: { kind: "user" },
        content: [{ type: "text", text }]
      }
    ],
    temperature: 0.4,
    signal
  });
  let hasYielded = false;
  for await (const chunk of stream) {
    if (chunk.type === "text-delta" && typeof chunk.text === "string") {
      yield chunk.text;
      hasYielded = true;
    } else if (chunk.type === "finish") {
      if (chunk.reason?.kind === "error") {
        const failureMsg = chunk.reason.failure?.message || "LLM \u8C03\u7528\u5931\u8D25";
        throw new Error(`[${provider}/${model}] ${failureMsg}`);
      }
      if (chunk.reason?.kind === "aborted") {
        return;
      }
    }
  }
  if (!hasYielded && !signal?.aborted) {
    throw new Error(`[${provider}/${model}] \u6A21\u578B\u672A\u8FD4\u56DE\u4EFB\u4F55\u751F\u6210\u6587\u672C\uFF0C\u8BF7\u68C0\u67E5\u63D0\u4F9B\u65B9\u670D\u52A1\u72B6\u6001\u4E0E\u6A21\u578B\u914D\u7F6E`);
  }
}
var _humanize_dec, _a, _init;
var ShuorenhuaRuntime = class extends (_a = TypertRemoteService, _humanize_dec = [Remote], _a) {
  constructor(ctx, config = {}) {
    super(ctx, "shuorenhua");
    this.config = config;
    __runInitializers(_init, 5, this);
  }
  async humanize(text) {
    let assembled = "";
    try {
      for await (const delta of streamHumanize(this.ctx, text, this.config)) {
        assembled += delta;
      }
    } catch (err) {
      throw new Error(err?.message || "AI \u6DA6\u8272\u751F\u6210\u5931\u8D25");
    }
    if (!assembled.trim()) {
      throw new Error("AI \u8FD4\u56DE\u5185\u5BB9\u4E3A\u7A7A");
    }
    const originalLength = text.length;
    const humanizedLength = assembled.length;
    const savedPercentage = originalLength > 0 ? Math.max(0, Math.round((originalLength - humanizedLength) / originalLength * 100)) : 0;
    return {
      text: assembled,
      original: text,
      mode: "default",
      source: "ai",
      stats: {
        originalLength,
        humanizedLength,
        savedPercentage,
        removedOpeners: 0,
        removedClosers: 0,
        replacedBuzzwords: 0
      }
    };
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "humanize", _humanize_dec, ShuorenhuaRuntime);
__decoratorMetadata(_init, ShuorenhuaRuntime);
function rejectCrossOrigin(req, res) {
  const origin = req.headers?.origin;
  if (origin) {
    let originHost;
    try {
      originHost = new URL(origin).hostname;
    } catch {
      originHost = void 0;
    }
    const ownHost = (req.headers?.host ?? "").split(":")[0];
    if (!ownHost || !originHost || originHost !== ownHost) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: "Cross-origin request rejected" }));
      return true;
    }
  }
  return false;
}
async function readJsonBody(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return null;
  }
  let bodyText = "";
  try {
    for await (const chunk of req) {
      bodyText += chunk;
      if (bodyText.length > 512 * 1024) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: "Payload too large" }));
        return null;
      }
    }
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Failed to read request body" }));
    return null;
  }
  try {
    const parsed = JSON.parse(bodyText);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return null;
  }
}
function registerShuorenhuaWebServer(ctx, config = {}, cacheRef = { current: null }) {
  const webServer = ctx.get("webServer");
  if (!webServer || typeof webServer.register !== "function") {
    return () => {
    };
  }
  const disposers = [];
  disposers.push(webServer.register({
    kind: "exact",
    path: "/shuorenhua/cache/read",
    handler: async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      if (rejectCrossOrigin(req, res)) return;
      const body = await readJsonBody(req, res);
      if (!body) return;
      const text = typeof body.text === "string" ? body.text : "";
      const messageId = typeof body.messageId === "string" ? body.messageId : void 0;
      const record = cacheRef.current?.read(humanizeCacheKey(messageId, text));
      if (isFreshCacheRecord(record, text)) {
        res.statusCode = 200;
        res.end(JSON.stringify({ cached: true, text: record.text }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ cached: false, text: null }));
    }
  }));
  disposers.push(webServer.register({
    kind: "exact",
    path: "/shuorenhua/stream",
    handler: async (req, res) => {
      if (rejectCrossOrigin(req, res)) return;
      const body = await readJsonBody(req, res);
      if (!body) return;
      const text = typeof body.text === "string" ? body.text : "";
      const messageId = typeof body.messageId === "string" ? body.messageId : void 0;
      if (!text.trim()) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.write(`data: ${JSON.stringify({ error: "\u5F85\u6DA6\u8272\u6587\u672C\u5185\u5BB9\u4E3A\u7A7A", done: true })}

`);
        res.end();
        return;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const controller = new AbortController();
      req.on("close", () => {
        controller.abort();
      });
      let assembled = "";
      try {
        for await (const delta of streamHumanize(ctx, text, config, controller.signal)) {
          if (controller.signal.aborted) break;
          assembled += delta;
          res.write(`data: ${JSON.stringify({ delta })}

`);
        }
        res.write(`data: ${JSON.stringify({ done: true })}

`);
        if (!controller.signal.aborted && assembled.trim()) {
          const cache = cacheRef.current;
          if (cache) {
            void cache.persist(humanizeCacheKey(messageId, text), {
              original: text,
              text: assembled,
              ts: Date.now()
            }).catch(() => {
            });
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const errMsg = err?.message || "AI \u6DA6\u8272\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5";
          res.write(`data: ${JSON.stringify({ error: errMsg, done: true })}

`);
        }
      } finally {
        res.end();
      }
    }
  }));
  return () => {
    for (const dispose of disposers) dispose();
  };
}
function registerShuorenhuaTools(ctx) {
  const toolsService = ctx.get("tools");
  if (!toolsService || typeof toolsService.register !== "function") {
    return () => {
    };
  }
  return toolsService.register({
    name: "shuorenhua_simplify",
    description: "\u628A\u7ED9\u5B9A\u7684AI\u56DE\u7B54\u3001\u516C\u6587\u6216\u5197\u957F\u6587\u672C\u8F6C\u5316\u4E3A\u901A\u4FD7\u3001\u7B80\u7EC3\u3001\u53BB\u9664\u5957\u8BDD\u7684\u4EBA\u8BDD\u3002\u4FDD\u7559\u6838\u5FC3\u4E8B\u5B9E\u3001\u6570\u636E\u4E0E\u4EE3\u7801\u5757\uFF0C\u6D88\u9664\u4E00\u5207\u5BA2\u5957\u3001\u5F00\u573A\u767D\u3001\u7ED3\u5C3E\u514D\u8D23\u58F0\u660E\u4E0E\u516B\u80A1\u5927\u8BCD\u3002",
    parameters: {
      type: "object",
      required: ["text"],
      properties: {
        text: {
          type: "string",
          description: "\u9700\u8981\u8F6C\u5316\u4E3A\u4EBA\u8BDD\u7684\u6587\u672C\u5185\u5BB9\u3002"
        }
      }
    },
    output: {
      schema: { type: "object" },
      render: (_args, value) => [
        { type: "text", text: JSON.stringify(value, null, 2) }
      ]
    },
    isConcurrencySafe: () => true,
    presentCall: () => ({
      card: "generic",
      kind: "other",
      title: "\u8BF4\u4EBA\u8BDD\u6DA6\u8272"
    }),
    async execute(args) {
      const result = humanize(args.text);
      return {
        ok: true,
        simplified: result.text,
        stats: result.stats
      };
    }
  });
}

// src/contract.ts
var dummySchema = {
  parse: (value) => value
};
var strictCodec = (typeSymbol) => ({
  mode: "strict",
  typeSymbol,
  schema: dummySchema,
  create: () => dummySchema
});
var jsonParam = (name2, wire, typeSymbol) => ({
  name: name2,
  wire,
  source: "json",
  codec: strictCodec(typeSymbol)
});
var DSH_SHUORENHUA_INVOCATIONS = [
  {
    id: "dsh-shuorenhua#shuorenhua/humanize",
    service: "shuorenhua",
    namespace: "shuorenhua",
    method: "humanize",
    invocation: { kind: "direct" },
    parameters: [
      jsonParam("text", "text", "dsh-shuorenhua#Text")
    ],
    result: strictCodec("dsh-shuorenhua#HumanizeResult")
  }
];

// src/typert.ts
var TYPERT_MANIFEST = {
  package: "dsh-shuorenhua",
  face: "host",
  schemas: [],
  model: {
    services: [
      {
        key: "shuorenhua",
        exportName: "ShuorenhuaRuntime",
        description: "Shuorenhua (Speak Human) text simplification and de-AI-clich\xE9 service.",
        tags: [],
        members: [
          {
            kind: "method",
            name: "humanize",
            signature: "humanize(text: string): Promise<HumanizeResult>"
          }
        ],
        types: []
      }
    ],
    events: [],
    objects: []
  },
  invocations: DSH_SHUORENHUA_INVOCATIONS
};

// src/index.ts
var name = "dsh-shuorenhua";
var Config = Schema.object({
  provider: Schema.string(),
  model: Schema.string(),
  enableTool: Schema.boolean().default(true),
  enableCache: Schema.boolean().default(true),
  cacheMaxEntries: Schema.number().default(100)
});
function apply(ctx, config) {
  const resolved = Config(config ?? {});
  new ShuorenhuaRuntime(ctx, resolved);
  ctx.inject(["typert"], (typertCtx) => {
    typertCtx.effect(() => {
      let dispose;
      try {
        const typert = typertCtx.get("typert");
        if (typert) {
          if (typeof typert.register === "function") {
            dispose = typert.register(TYPERT_MANIFEST);
          } else if (typert.remotes && typeof typert.remotes.register === "function") {
            dispose = typert.remotes.register(TYPERT_MANIFEST);
          }
        }
      } catch {
      }
      return () => {
        if (dispose) void dispose();
      };
    }, "dsh-shuorenhua: typert manifest");
  });
  const cacheHolder = { current: null };
  if (resolved.enableCache !== false) {
    ctx.inject(["storageDomain"], (cacheCtx) => {
      cacheCtx.effect(
        async () => {
          const cache = await openShuorenhuaCache(cacheCtx, resolved.cacheMaxEntries ?? 100);
          if (!cache) return () => {
          };
          cacheHolder.current = cache;
          return () => {
            cacheHolder.current = null;
            void cache.close().catch(() => {
            });
          };
        },
        "dsh-shuorenhua: humanize cache"
      );
    });
  }
  ctx.inject(["webServer"], (webCtx) => {
    webCtx.effect(
      () => registerShuorenhuaWebServer(webCtx, resolved, cacheHolder),
      "dsh-shuorenhua: webserver route"
    );
  });
  if (resolved.enableTool !== false) {
    ctx.inject(["tools"], (toolCtx) => {
      toolCtx.effect(
        () => registerShuorenhuaTools(toolCtx),
        "dsh-shuorenhua: agent tools"
      );
    });
  }
}
export {
  Config,
  ShuorenhuaRuntime,
  apply,
  humanize,
  name,
  registerShuorenhuaTools,
  registerShuorenhuaWebServer,
  streamHumanize
};
//# sourceMappingURL=index.js.map
