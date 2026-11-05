"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
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

  // node_modules/regenerator-runtime/runtime.js
  var require_runtime = __commonJS({
    "node_modules/regenerator-runtime/runtime.js"(exports, module) {
      var runtime = (function(exports2) {
        "use strict";
        var Op = Object.prototype;
        var hasOwn = Op.hasOwnProperty;
        var defineProperty = Object.defineProperty || function(obj, key, desc) {
          obj[key] = desc.value;
        };
        var undefined;
        var $Symbol = typeof Symbol === "function" ? Symbol : {};
        var iteratorSymbol = $Symbol.iterator || "@@iterator";
        var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
        var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
        function define(obj, key, value) {
          Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
          });
          return obj[key];
        }
        try {
          define({}, "");
        } catch (err) {
          define = function(obj, key, value) {
            return obj[key] = value;
          };
        }
        function wrap(innerFn, outerFn, self, tryLocsList) {
          var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
          var generator = Object.create(protoGenerator.prototype);
          var context = new Context(tryLocsList || []);
          defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });
          return generator;
        }
        exports2.wrap = wrap;
        function tryCatch(fn, obj, arg) {
          try {
            return { type: "normal", arg: fn.call(obj, arg) };
          } catch (err) {
            return { type: "throw", arg: err };
          }
        }
        var GenStateSuspendedStart = "suspendedStart";
        var GenStateSuspendedYield = "suspendedYield";
        var GenStateExecuting = "executing";
        var GenStateCompleted = "completed";
        var ContinueSentinel = {};
        function Generator() {
        }
        function GeneratorFunction() {
        }
        function GeneratorFunctionPrototype() {
        }
        var IteratorPrototype = {};
        define(IteratorPrototype, iteratorSymbol, function() {
          return this;
        });
        var getProto = Object.getPrototypeOf;
        var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
        if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
          IteratorPrototype = NativeIteratorPrototype;
        }
        var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
        GeneratorFunction.prototype = GeneratorFunctionPrototype;
        defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
        defineProperty(
          GeneratorFunctionPrototype,
          "constructor",
          { value: GeneratorFunction, configurable: true }
        );
        GeneratorFunction.displayName = define(
          GeneratorFunctionPrototype,
          toStringTagSymbol,
          "GeneratorFunction"
        );
        function defineIteratorMethods(prototype) {
          ["next", "throw", "return"].forEach(function(method) {
            define(prototype, method, function(arg) {
              return this._invoke(method, arg);
            });
          });
        }
        exports2.isGeneratorFunction = function(genFun) {
          var ctor = typeof genFun === "function" && genFun.constructor;
          return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
        };
        exports2.mark = function(genFun) {
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
          } else {
            genFun.__proto__ = GeneratorFunctionPrototype;
            define(genFun, toStringTagSymbol, "GeneratorFunction");
          }
          genFun.prototype = Object.create(Gp);
          return genFun;
        };
        exports2.awrap = function(arg) {
          return { __await: arg };
        };
        function AsyncIterator(generator, PromiseImpl) {
          function invoke(method, arg, resolve, reject) {
            var record = tryCatch(generator[method], generator, arg);
            if (record.type === "throw") {
              reject(record.arg);
            } else {
              var result = record.arg;
              var value = result.value;
              if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
                return PromiseImpl.resolve(value.__await).then(function(value2) {
                  invoke("next", value2, resolve, reject);
                }, function(err) {
                  invoke("throw", err, resolve, reject);
                });
              }
              return PromiseImpl.resolve(value).then(function(unwrapped) {
                result.value = unwrapped;
                resolve(result);
              }, function(error) {
                return invoke("throw", error, resolve, reject);
              });
            }
          }
          var previousPromise;
          function enqueue(method, arg) {
            function callInvokeWithMethodAndArg() {
              return new PromiseImpl(function(resolve, reject) {
                invoke(method, arg, resolve, reject);
              });
            }
            return previousPromise = // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
          }
          defineProperty(this, "_invoke", { value: enqueue });
        }
        defineIteratorMethods(AsyncIterator.prototype);
        define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
          return this;
        });
        exports2.AsyncIterator = AsyncIterator;
        exports2.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          if (PromiseImpl === void 0) PromiseImpl = Promise;
          var iter = new AsyncIterator(
            wrap(innerFn, outerFn, self, tryLocsList),
            PromiseImpl
          );
          return exports2.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
        };
        function makeInvokeMethod(innerFn, self, context) {
          var state = GenStateSuspendedStart;
          return function invoke(method, arg) {
            if (state === GenStateExecuting) {
              throw new Error("Generator is already running");
            }
            if (state === GenStateCompleted) {
              if (method === "throw") {
                throw arg;
              }
              return doneResult();
            }
            context.method = method;
            context.arg = arg;
            while (true) {
              var delegate = context.delegate;
              if (delegate) {
                var delegateResult = maybeInvokeDelegate(delegate, context);
                if (delegateResult) {
                  if (delegateResult === ContinueSentinel) continue;
                  return delegateResult;
                }
              }
              if (context.method === "next") {
                context.sent = context._sent = context.arg;
              } else if (context.method === "throw") {
                if (state === GenStateSuspendedStart) {
                  state = GenStateCompleted;
                  throw context.arg;
                }
                context.dispatchException(context.arg);
              } else if (context.method === "return") {
                context.abrupt("return", context.arg);
              }
              state = GenStateExecuting;
              var record = tryCatch(innerFn, self, context);
              if (record.type === "normal") {
                state = context.done ? GenStateCompleted : GenStateSuspendedYield;
                if (record.arg === ContinueSentinel) {
                  continue;
                }
                return {
                  value: record.arg,
                  done: context.done
                };
              } else if (record.type === "throw") {
                state = GenStateCompleted;
                context.method = "throw";
                context.arg = record.arg;
              }
            }
          };
        }
        function maybeInvokeDelegate(delegate, context) {
          var methodName = context.method;
          var method = delegate.iterator[methodName];
          if (method === undefined) {
            context.delegate = null;
            if (methodName === "throw" && delegate.iterator["return"]) {
              context.method = "return";
              context.arg = undefined;
              maybeInvokeDelegate(delegate, context);
              if (context.method === "throw") {
                return ContinueSentinel;
              }
            }
            if (methodName !== "return") {
              context.method = "throw";
              context.arg = new TypeError(
                "The iterator does not provide a '" + methodName + "' method"
              );
            }
            return ContinueSentinel;
          }
          var record = tryCatch(method, delegate.iterator, context.arg);
          if (record.type === "throw") {
            context.method = "throw";
            context.arg = record.arg;
            context.delegate = null;
            return ContinueSentinel;
          }
          var info = record.arg;
          if (!info) {
            context.method = "throw";
            context.arg = new TypeError("iterator result is not an object");
            context.delegate = null;
            return ContinueSentinel;
          }
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
            if (context.method !== "return") {
              context.method = "next";
              context.arg = undefined;
            }
          } else {
            return info;
          }
          context.delegate = null;
          return ContinueSentinel;
        }
        defineIteratorMethods(Gp);
        define(Gp, toStringTagSymbol, "Generator");
        define(Gp, iteratorSymbol, function() {
          return this;
        });
        define(Gp, "toString", function() {
          return "[object Generator]";
        });
        function pushTryEntry(locs) {
          var entry = { tryLoc: locs[0] };
          if (1 in locs) {
            entry.catchLoc = locs[1];
          }
          if (2 in locs) {
            entry.finallyLoc = locs[2];
            entry.afterLoc = locs[3];
          }
          this.tryEntries.push(entry);
        }
        function resetTryEntry(entry) {
          var record = entry.completion || {};
          record.type = "normal";
          delete record.arg;
          entry.completion = record;
        }
        function Context(tryLocsList) {
          this.tryEntries = [{ tryLoc: "root" }];
          tryLocsList.forEach(pushTryEntry, this);
          this.reset(true);
        }
        exports2.keys = function(val) {
          var object = Object(val);
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          keys.reverse();
          return function next() {
            while (keys.length) {
              var key2 = keys.pop();
              if (key2 in object) {
                next.value = key2;
                next.done = false;
                return next;
              }
            }
            next.done = true;
            return next;
          };
        };
        function values(iterable) {
          if (iterable) {
            var iteratorMethod = iterable[iteratorSymbol];
            if (iteratorMethod) {
              return iteratorMethod.call(iterable);
            }
            if (typeof iterable.next === "function") {
              return iterable;
            }
            if (!isNaN(iterable.length)) {
              var i = -1, next = function next2() {
                while (++i < iterable.length) {
                  if (hasOwn.call(iterable, i)) {
                    next2.value = iterable[i];
                    next2.done = false;
                    return next2;
                  }
                }
                next2.value = undefined;
                next2.done = true;
                return next2;
              };
              return next.next = next;
            }
          }
          return { next: doneResult };
        }
        exports2.values = values;
        function doneResult() {
          return { value: undefined, done: true };
        }
        Context.prototype = {
          constructor: Context,
          reset: function(skipTempReset) {
            this.prev = 0;
            this.next = 0;
            this.sent = this._sent = undefined;
            this.done = false;
            this.delegate = null;
            this.method = "next";
            this.arg = undefined;
            this.tryEntries.forEach(resetTryEntry);
            if (!skipTempReset) {
              for (var name in this) {
                if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                  this[name] = undefined;
                }
              }
            }
          },
          stop: function() {
            this.done = true;
            var rootEntry = this.tryEntries[0];
            var rootRecord = rootEntry.completion;
            if (rootRecord.type === "throw") {
              throw rootRecord.arg;
            }
            return this.rval;
          },
          dispatchException: function(exception) {
            if (this.done) {
              throw exception;
            }
            var context = this;
            function handle(loc, caught) {
              record.type = "throw";
              record.arg = exception;
              context.next = loc;
              if (caught) {
                context.method = "next";
                context.arg = undefined;
              }
              return !!caught;
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              var record = entry.completion;
              if (entry.tryLoc === "root") {
                return handle("end");
              }
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc");
                var hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) {
                    return handle(entry.catchLoc, true);
                  } else if (this.prev < entry.finallyLoc) {
                    return handle(entry.finallyLoc);
                  }
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) {
                    return handle(entry.catchLoc, true);
                  }
                } else if (hasFinally) {
                  if (this.prev < entry.finallyLoc) {
                    return handle(entry.finallyLoc);
                  }
                } else {
                  throw new Error("try statement without catch or finally");
                }
              }
            }
          },
          abrupt: function(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
              finallyEntry = null;
            }
            var record = finallyEntry ? finallyEntry.completion : {};
            record.type = type;
            record.arg = arg;
            if (finallyEntry) {
              this.method = "next";
              this.next = finallyEntry.finallyLoc;
              return ContinueSentinel;
            }
            return this.complete(record);
          },
          complete: function(record, afterLoc) {
            if (record.type === "throw") {
              throw record.arg;
            }
            if (record.type === "break" || record.type === "continue") {
              this.next = record.arg;
            } else if (record.type === "return") {
              this.rval = this.arg = record.arg;
              this.method = "return";
              this.next = "end";
            } else if (record.type === "normal" && afterLoc) {
              this.next = afterLoc;
            }
            return ContinueSentinel;
          },
          finish: function(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) {
                this.complete(entry.completion, entry.afterLoc);
                resetTryEntry(entry);
                return ContinueSentinel;
              }
            }
          },
          "catch": function(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if (record.type === "throw") {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function(iterable, resultName, nextLoc) {
            this.delegate = {
              iterator: values(iterable),
              resultName,
              nextLoc
            };
            if (this.method === "next") {
              this.arg = undefined;
            }
            return ContinueSentinel;
          }
        };
        return exports2;
      })(
        // If this script is executing as a CommonJS module, use module.exports
        // as the regeneratorRuntime namespace. Otherwise create a new empty
        // object. Either way, the resulting object will be used to initialize
        // the regeneratorRuntime variable at the top of this file.
        typeof module === "object" ? module.exports : {}
      );
      try {
        regeneratorRuntime = runtime;
      } catch (accidentalStrictMode) {
        if (typeof globalThis === "object") {
          globalThis.regeneratorRuntime = runtime;
        } else {
          Function("r", "regeneratorRuntime = r")(runtime);
        }
      }
    }
  });

  // node_modules/tesseract.js/src/utils/getId.js
  var require_getId = __commonJS({
    "node_modules/tesseract.js/src/utils/getId.js"(exports, module) {
      "use strict";
      module.exports = (prefix, cnt) => `${prefix}-${cnt}-${Math.random().toString(16).slice(3, 8)}`;
    }
  });

  // node_modules/tesseract.js/src/createJob.js
  var require_createJob = __commonJS({
    "node_modules/tesseract.js/src/createJob.js"(exports, module) {
      "use strict";
      var getId = require_getId();
      var jobCounter = 0;
      module.exports = ({
        id: _id,
        action,
        payload = {}
      }) => {
        let id = _id;
        if (typeof id === "undefined") {
          id = getId("Job", jobCounter);
          jobCounter += 1;
        }
        return {
          id,
          action,
          payload
        };
      };
    }
  });

  // node_modules/tesseract.js/src/utils/log.js
  var require_log = __commonJS({
    "node_modules/tesseract.js/src/utils/log.js"(exports) {
      "use strict";
      var logging = false;
      exports.logging = logging;
      exports.setLogging = (_logging) => {
        logging = _logging;
      };
      exports.log = (...args) => logging ? console.log.apply(exports, args) : null;
    }
  });

  // node_modules/tesseract.js/src/createScheduler.js
  var require_createScheduler = __commonJS({
    "node_modules/tesseract.js/src/createScheduler.js"(exports, module) {
      "use strict";
      var createJob = require_createJob();
      var { log } = require_log();
      var getId = require_getId();
      var schedulerCounter = 0;
      module.exports = () => {
        const id = getId("Scheduler", schedulerCounter);
        const workers = {};
        const runningWorkers = {};
        let jobQueue = [];
        schedulerCounter += 1;
        const getQueueLen = () => jobQueue.length;
        const getNumWorkers = () => Object.keys(workers).length;
        const dequeue = () => {
          if (jobQueue.length !== 0) {
            const wIds = Object.keys(workers);
            for (let i = 0; i < wIds.length; i += 1) {
              if (typeof runningWorkers[wIds[i]] === "undefined") {
                jobQueue[0](workers[wIds[i]]);
                break;
              }
            }
          }
        };
        const queue = (action, payload) => new Promise((resolve, reject) => {
          const job = createJob({ action, payload });
          jobQueue.push(async (w) => {
            jobQueue.shift();
            runningWorkers[w.id] = job;
            try {
              resolve(await w[action].apply(exports, [...payload, job.id]));
            } catch (err) {
              reject(err);
            } finally {
              delete runningWorkers[w.id];
              dequeue();
            }
          });
          log(`[${id}]: Add ${job.id} to JobQueue`);
          log(`[${id}]: JobQueue length=${jobQueue.length}`);
          dequeue();
        });
        const addWorker = (w) => {
          workers[w.id] = w;
          log(`[${id}]: Add ${w.id}`);
          log(`[${id}]: Number of workers=${getNumWorkers()}`);
          dequeue();
          return w.id;
        };
        const addJob = async (action, ...payload) => {
          if (getNumWorkers() === 0) {
            throw Error(`[${id}]: You need to have at least one worker before adding jobs`);
          }
          return queue(action, payload);
        };
        const terminate = async () => {
          Object.keys(workers).forEach(async (wid) => {
            await workers[wid].terminate();
          });
          jobQueue = [];
        };
        return {
          addWorker,
          addJob,
          terminate,
          getQueueLen,
          getNumWorkers
        };
      };
    }
  });

  // node_modules/tesseract.js/src/utils/getEnvironment.js
  var require_getEnvironment = __commonJS({
    "node_modules/tesseract.js/src/utils/getEnvironment.js"(exports, module) {
      "use strict";
      module.exports = (key) => {
        const env = {};
        if (typeof WorkerGlobalScope !== "undefined") {
          env.type = "webworker";
        } else if (typeof document === "object") {
          env.type = "browser";
        } else if (typeof process === "object" && typeof __require === "function") {
          env.type = "node";
        }
        if (typeof key === "undefined") {
          return env;
        }
        return env[key];
      };
    }
  });

  // node_modules/tesseract.js/src/utils/resolvePaths.js
  var require_resolvePaths = __commonJS({
    "node_modules/tesseract.js/src/utils/resolvePaths.js"(exports, module) {
      "use strict";
      var isBrowser = require_getEnvironment()("type") === "browser";
      var resolveURL = isBrowser ? (s) => new URL(s, window.location.href).href : (s) => s;
      module.exports = (options) => {
        const opts = { ...options };
        ["corePath", "workerPath", "langPath"].forEach((key) => {
          if (options[key]) {
            opts[key] = resolveURL(opts[key]);
          }
        });
        return opts;
      };
    }
  });

  // node_modules/tesseract.js/src/constants/OEM.js
  var require_OEM = __commonJS({
    "node_modules/tesseract.js/src/constants/OEM.js"(exports, module) {
      "use strict";
      module.exports = {
        TESSERACT_ONLY: 0,
        LSTM_ONLY: 1,
        TESSERACT_LSTM_COMBINED: 2,
        DEFAULT: 3
      };
    }
  });

  // node_modules/tesseract.js/package.json
  var require_package = __commonJS({
    "node_modules/tesseract.js/package.json"(exports, module) {
      module.exports = {
        name: "tesseract.js",
        version: "7.0.0",
        description: "Pure Javascript Multilingual OCR",
        main: "src/index.js",
        type: "commonjs",
        types: "src/index.d.ts",
        unpkg: "dist/tesseract.min.js",
        jsdelivr: "dist/tesseract.min.js",
        scripts: {
          start: "node scripts/server.js",
          build: "rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs",
          "profile:tesseract": "webpack-bundle-analyzer dist/tesseract-stats.json",
          "profile:worker": "webpack-bundle-analyzer dist/worker-stats.json",
          prepublishOnly: "npm run build",
          wait: "rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",
          test: "npm-run-all -p -r start test:all",
          "test:all": "npm-run-all wait test:browser test:node:all",
          "test:browser": "karma start karma.conf.js",
          "test:node": "nyc mocha --exit --bail --require ./scripts/test-helper.mjs",
          "test:node:all": "npm run test:node -- ./tests/*.test.mjs",
          lint: "eslint src",
          "lint:fix": "eslint --fix src",
          postinstall: "opencollective-postinstall || true"
        },
        browser: {
          "./src/worker/node/index.js": "./src/worker/browser/index.js"
        },
        author: "",
        contributors: [
          "jeromewu"
        ],
        license: "Apache-2.0",
        devDependencies: {
          "@babel/core": "^7.21.4",
          "@babel/eslint-parser": "^7.21.3",
          "@babel/preset-env": "^7.21.4",
          "@rollup/plugin-commonjs": "^24.1.0",
          acorn: "^8.8.2",
          "babel-loader": "^9.1.2",
          buffer: "^6.0.3",
          cors: "^2.8.5",
          eslint: "^7.32.0",
          "eslint-config-airbnb-base": "^14.2.1",
          "eslint-plugin-import": "^2.27.5",
          "expect.js": "^0.3.1",
          express: "^4.18.2",
          mocha: "^10.2.0",
          "npm-run-all": "^4.1.5",
          karma: "^6.4.2",
          "karma-chrome-launcher": "^3.2.0",
          "karma-firefox-launcher": "^2.1.2",
          "karma-mocha": "^2.0.1",
          "karma-webpack": "^5.0.0",
          nyc: "^15.1.0",
          rimraf: "^5.0.0",
          rollup: "^3.20.7",
          "wait-on": "^7.0.1",
          webpack: "^5.79.0",
          "webpack-bundle-analyzer": "^4.8.0",
          "webpack-cli": "^5.0.1",
          "webpack-dev-middleware": "^6.0.2",
          "rollup-plugin-sourcemaps": "^0.6.3"
        },
        dependencies: {
          "bmp-js": "^0.1.0",
          "idb-keyval": "^6.2.0",
          "is-url": "^1.2.4",
          "node-fetch": "^2.6.9",
          "opencollective-postinstall": "^2.0.3",
          "regenerator-runtime": "^0.13.3",
          "tesseract.js-core": "^7.0.0",
          "wasm-feature-detect": "^1.8.0",
          zlibjs: "^0.3.1"
        },
        overrides: {
          "@rollup/pluginutils": "^5.0.2"
        },
        repository: {
          type: "git",
          url: "https://github.com/naptha/tesseract.js.git"
        },
        bugs: {
          url: "https://github.com/naptha/tesseract.js/issues"
        },
        homepage: "https://github.com/naptha/tesseract.js",
        collective: {
          type: "opencollective",
          url: "https://opencollective.com/tesseractjs"
        }
      };
    }
  });

  // node_modules/tesseract.js/src/constants/defaultOptions.js
  var require_defaultOptions = __commonJS({
    "node_modules/tesseract.js/src/constants/defaultOptions.js"(exports, module) {
      "use strict";
      module.exports = {
        /*
         * Use BlobURL for worker script by default
         * TODO: remove this option
         *
         */
        workerBlobURL: true,
        logger: () => {
        }
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/defaultOptions.js
  var require_defaultOptions2 = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/defaultOptions.js"(exports, module) {
      "use strict";
      var version = require_package().version;
      var defaultOptions = require_defaultOptions();
      module.exports = {
        ...defaultOptions,
        workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@v${version}/dist/worker.min.js`
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/spawnWorker.js
  var require_spawnWorker = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/spawnWorker.js"(exports, module) {
      "use strict";
      module.exports = ({ workerPath, workerBlobURL }) => {
        let worker;
        if (Blob && URL && workerBlobURL) {
          const blob = new Blob([`importScripts("${workerPath}");`], {
            type: "application/javascript"
          });
          worker = new Worker(URL.createObjectURL(blob));
        } else {
          worker = new Worker(workerPath);
        }
        return worker;
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/terminateWorker.js
  var require_terminateWorker = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/terminateWorker.js"(exports, module) {
      "use strict";
      module.exports = (worker) => {
        worker.terminate();
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/onMessage.js
  var require_onMessage = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/onMessage.js"(exports, module) {
      "use strict";
      module.exports = (worker, handler) => {
        worker.onmessage = ({ data }) => {
          handler(data);
        };
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/send.js
  var require_send = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/send.js"(exports, module) {
      "use strict";
      module.exports = async (worker, packet) => {
        worker.postMessage(packet);
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/loadImage.js
  var require_loadImage = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/loadImage.js"(exports, module) {
      "use strict";
      var readFromBlobOrFile = (blob) => new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        fileReader.onerror = ({ target: { error: { code } } }) => {
          reject(Error(`File could not be read! Code=${code}`));
        };
        fileReader.readAsArrayBuffer(blob);
      });
      var loadImage = async (image) => {
        let data = image;
        if (typeof image === "undefined") {
          return "undefined";
        }
        if (typeof image === "string") {
          if (/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(image)) {
            data = atob(image.split(",")[1]).split("").map((c) => c.charCodeAt(0));
          } else {
            const resp = await fetch(image);
            data = await resp.arrayBuffer();
          }
        } else if (typeof HTMLElement !== "undefined" && image instanceof HTMLElement) {
          if (image.tagName === "IMG") {
            data = await loadImage(image.src);
          }
          if (image.tagName === "VIDEO") {
            data = await loadImage(image.poster);
          }
          if (image.tagName === "CANVAS") {
            await new Promise((resolve) => {
              image.toBlob(async (blob) => {
                data = await readFromBlobOrFile(blob);
                resolve();
              });
            });
          }
        } else if (typeof OffscreenCanvas !== "undefined" && image instanceof OffscreenCanvas) {
          const blob = await image.convertToBlob();
          data = await readFromBlobOrFile(blob);
        } else if (image instanceof File || image instanceof Blob) {
          data = await readFromBlobOrFile(image);
        }
        return new Uint8Array(data);
      };
      module.exports = loadImage;
    }
  });

  // node_modules/tesseract.js/src/worker/browser/index.js
  var require_browser = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/index.js"(exports, module) {
      "use strict";
      var defaultOptions = require_defaultOptions2();
      var spawnWorker = require_spawnWorker();
      var terminateWorker = require_terminateWorker();
      var onMessage = require_onMessage();
      var send = require_send();
      var loadImage = require_loadImage();
      module.exports = {
        defaultOptions,
        spawnWorker,
        terminateWorker,
        onMessage,
        send,
        loadImage
      };
    }
  });

  // node_modules/tesseract.js/src/createWorker.js
  var require_createWorker = __commonJS({
    "node_modules/tesseract.js/src/createWorker.js"(exports, module) {
      "use strict";
      var resolvePaths = require_resolvePaths();
      var createJob = require_createJob();
      var { log } = require_log();
      var getId = require_getId();
      var OEM = require_OEM();
      var {
        defaultOptions,
        spawnWorker,
        terminateWorker,
        onMessage,
        loadImage,
        send
      } = require_browser();
      var workerCounter = 0;
      module.exports = async (langs = "eng", oem = OEM.LSTM_ONLY, _options = {}, config = {}) => {
        const id = getId("Worker", workerCounter);
        const {
          logger,
          errorHandler,
          ...options
        } = resolvePaths({
          ...defaultOptions,
          ..._options
        });
        const promises = {};
        const currentLangs = typeof langs === "string" ? langs.split("+") : langs;
        let currentOem = oem;
        let currentConfig = config;
        const lstmOnlyCore = [OEM.DEFAULT, OEM.LSTM_ONLY].includes(oem) && !options.legacyCore;
        let workerResReject;
        let workerResResolve;
        const workerRes = new Promise((resolve, reject) => {
          workerResResolve = resolve;
          workerResReject = reject;
        });
        const workerError = (event) => {
          workerResReject(event.message);
        };
        let worker = spawnWorker(options);
        worker.onerror = workerError;
        workerCounter += 1;
        const startJob = ({ id: jobId, action, payload }) => new Promise((resolve, reject) => {
          log(`[${id}]: Start ${jobId}, action=${action}`);
          const promiseId = `${action}-${jobId}`;
          promises[promiseId] = { resolve, reject };
          send(worker, {
            workerId: id,
            jobId,
            action,
            payload
          });
        });
        const load = () => console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)");
        const loadInternal = (jobId) => startJob(createJob({
          id: jobId,
          action: "load",
          payload: { options: { lstmOnly: lstmOnlyCore, corePath: options.corePath, logging: options.logging } }
        }));
        const writeText = (path, text, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method: "writeFile", args: [path, text] }
        }));
        const readText = (path, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method: "readFile", args: [path, { encoding: "utf8" }] }
        }));
        const removeFile = (path, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method: "unlink", args: [path] }
        }));
        const FS = (method, args, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method, args }
        }));
        const loadLanguageInternal = (_langs, jobId) => startJob(createJob({
          id: jobId,
          action: "loadLanguage",
          payload: {
            langs: _langs,
            options: {
              langPath: options.langPath,
              dataPath: options.dataPath,
              cachePath: options.cachePath,
              cacheMethod: options.cacheMethod,
              gzip: options.gzip,
              lstmOnly: [OEM.DEFAULT, OEM.LSTM_ONLY].includes(currentOem) && !options.legacyLang
            }
          }
        }));
        const initializeInternal = (_langs, _oem, _config, jobId) => startJob(createJob({
          id: jobId,
          action: "initialize",
          payload: { langs: _langs, oem: _oem, config: _config }
        }));
        const reinitialize = (langs2 = "eng", oem2, config2, jobId) => {
          if (lstmOnlyCore && [OEM.TESSERACT_ONLY, OEM.TESSERACT_LSTM_COMBINED].includes(oem2)) throw Error("Legacy model requested but code missing.");
          const _oem = oem2 || currentOem;
          currentOem = _oem;
          const _config = config2 || currentConfig;
          currentConfig = _config;
          const langsArr = typeof langs2 === "string" ? langs2.split("+") : langs2;
          const _langs = langsArr.filter((x) => !currentLangs.includes(x));
          currentLangs.push(..._langs);
          if (_langs.length > 0) {
            return loadLanguageInternal(_langs, jobId).then(() => initializeInternal(langs2, _oem, _config, jobId));
          }
          return initializeInternal(langs2, _oem, _config, jobId);
        };
        const setParameters = (params = {}, jobId) => startJob(createJob({
          id: jobId,
          action: "setParameters",
          payload: { params }
        }));
        const recognize2 = async (image, opts = {}, output = {
          text: true
        }, jobId) => startJob(createJob({
          id: jobId,
          action: "recognize",
          payload: { image: await loadImage(image), options: opts, output }
        }));
        const detect = async (image, jobId) => {
          if (lstmOnlyCore) throw Error("`worker.detect` requires Legacy model, which was not loaded.");
          return startJob(createJob({
            id: jobId,
            action: "detect",
            payload: { image: await loadImage(image) }
          }));
        };
        const terminate = async () => {
          if (worker !== null) {
            terminateWorker(worker);
            worker = null;
          }
          return Promise.resolve();
        };
        onMessage(worker, ({
          workerId,
          jobId,
          status,
          action,
          data
        }) => {
          const promiseId = `${action}-${jobId}`;
          if (status === "resolve") {
            log(`[${workerId}]: Complete ${jobId}`);
            promises[promiseId].resolve({ jobId, data });
            delete promises[promiseId];
          } else if (status === "reject") {
            promises[promiseId].reject(data);
            delete promises[promiseId];
            if (action === "load") workerResReject(data);
            if (errorHandler) {
              errorHandler(data);
            } else {
              throw Error(data);
            }
          } else if (status === "progress") {
            logger({ ...data, userJobId: jobId });
          }
        });
        const resolveObj = {
          id,
          worker,
          load,
          writeText,
          readText,
          removeFile,
          FS,
          reinitialize,
          setParameters,
          recognize: recognize2,
          detect,
          terminate
        };
        loadInternal().then(() => loadLanguageInternal(langs)).then(() => initializeInternal(langs, oem, config)).then(() => workerResResolve(resolveObj)).catch(() => {
        });
        return workerRes;
      };
    }
  });

  // node_modules/tesseract.js/src/Tesseract.js
  var require_Tesseract = __commonJS({
    "node_modules/tesseract.js/src/Tesseract.js"(exports, module) {
      "use strict";
      var createWorker2 = require_createWorker();
      var recognize2 = async (image, langs, options) => {
        const worker = await createWorker2(langs, 1, options);
        return worker.recognize(image).finally(async () => {
          await worker.terminate();
        });
      };
      var detect = async (image, options) => {
        const worker = await createWorker2("osd", 0, options);
        return worker.detect(image).finally(async () => {
          await worker.terminate();
        });
      };
      module.exports = {
        recognize: recognize2,
        detect
      };
    }
  });

  // node_modules/tesseract.js/src/constants/languages.js
  var require_languages = __commonJS({
    "node_modules/tesseract.js/src/constants/languages.js"(exports, module) {
      "use strict";
      module.exports = {
        AFR: "afr",
        AMH: "amh",
        ARA: "ara",
        ASM: "asm",
        AZE: "aze",
        AZE_CYRL: "aze_cyrl",
        BEL: "bel",
        BEN: "ben",
        BOD: "bod",
        BOS: "bos",
        BUL: "bul",
        CAT: "cat",
        CEB: "ceb",
        CES: "ces",
        CHI_SIM: "chi_sim",
        CHI_TRA: "chi_tra",
        CHR: "chr",
        CYM: "cym",
        DAN: "dan",
        DEU: "deu",
        DZO: "dzo",
        ELL: "ell",
        ENG: "eng",
        ENM: "enm",
        EPO: "epo",
        EST: "est",
        EUS: "eus",
        FAS: "fas",
        FIN: "fin",
        FRA: "fra",
        FRK: "frk",
        FRM: "frm",
        GLE: "gle",
        GLG: "glg",
        GRC: "grc",
        GUJ: "guj",
        HAT: "hat",
        HEB: "heb",
        HIN: "hin",
        HRV: "hrv",
        HUN: "hun",
        IKU: "iku",
        IND: "ind",
        ISL: "isl",
        ITA: "ita",
        ITA_OLD: "ita_old",
        JAV: "jav",
        JPN: "jpn",
        KAN: "kan",
        KAT: "kat",
        KAT_OLD: "kat_old",
        KAZ: "kaz",
        KHM: "khm",
        KIR: "kir",
        KOR: "kor",
        KUR: "kur",
        LAO: "lao",
        LAT: "lat",
        LAV: "lav",
        LIT: "lit",
        MAL: "mal",
        MAR: "mar",
        MKD: "mkd",
        MLT: "mlt",
        MSA: "msa",
        MYA: "mya",
        NEP: "nep",
        NLD: "nld",
        NOR: "nor",
        ORI: "ori",
        PAN: "pan",
        POL: "pol",
        POR: "por",
        PUS: "pus",
        RON: "ron",
        RUS: "rus",
        SAN: "san",
        SIN: "sin",
        SLK: "slk",
        SLV: "slv",
        SPA: "spa",
        SPA_OLD: "spa_old",
        SQI: "sqi",
        SRP: "srp",
        SRP_LATN: "srp_latn",
        SWA: "swa",
        SWE: "swe",
        SYR: "syr",
        TAM: "tam",
        TEL: "tel",
        TGK: "tgk",
        TGL: "tgl",
        THA: "tha",
        TIR: "tir",
        TUR: "tur",
        UIG: "uig",
        UKR: "ukr",
        URD: "urd",
        UZB: "uzb",
        UZB_CYRL: "uzb_cyrl",
        VIE: "vie",
        YID: "yid"
      };
    }
  });

  // node_modules/tesseract.js/src/constants/PSM.js
  var require_PSM = __commonJS({
    "node_modules/tesseract.js/src/constants/PSM.js"(exports, module) {
      "use strict";
      module.exports = {
        OSD_ONLY: "0",
        AUTO_OSD: "1",
        AUTO_ONLY: "2",
        AUTO: "3",
        SINGLE_COLUMN: "4",
        SINGLE_BLOCK_VERT_TEXT: "5",
        SINGLE_BLOCK: "6",
        SINGLE_LINE: "7",
        SINGLE_WORD: "8",
        CIRCLE_WORD: "9",
        SINGLE_CHAR: "10",
        SPARSE_TEXT: "11",
        SPARSE_TEXT_OSD: "12",
        RAW_LINE: "13"
      };
    }
  });

  // node_modules/tesseract.js/src/index.js
  var require_src = __commonJS({
    "node_modules/tesseract.js/src/index.js"(exports, module) {
      "use strict";
      require_runtime();
      var createScheduler = require_createScheduler();
      var createWorker2 = require_createWorker();
      var Tesseract = require_Tesseract();
      var languages = require_languages();
      var OEM = require_OEM();
      var PSM = require_PSM();
      var { setLogging } = require_log();
      module.exports = {
        languages,
        OEM,
        PSM,
        createScheduler,
        createWorker: createWorker2,
        setLogging,
        ...Tesseract
      };
    }
  });

  // src/ext/offscreen.ts
  var import_tesseract = __toESM(require_src(), 1);

  // src/core/bubbles.ts
  var BRIGHT = 232;
  var CHROMA = 32;
  var MIN_AREA = 1500;
  var INK = 140;
  var luma = (r, g, b) => (r * 299 + g * 587 + b * 114) / 1e3;
  function findBubbles(rgba, W, H) {
    const n = W * H;
    const bright = new Uint8Array(n);
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
      if (luma(r, g, b) >= BRIGHT && Math.max(r, g, b) - Math.min(r, g, b) <= CHROMA) bright[i] = 1;
    }
    const queue = new Int32Array(n);
    const bubbles = [];
    for (let start = 0; start < n; start++) {
      if (bright[start] !== 1) continue;
      let head = 0, end = 0;
      queue[end++] = start;
      bright[start] = 2;
      let x0 = W, y0 = H, x1 = -1, y1 = -1;
      while (head < end) {
        const idx = queue[head++];
        const x = idx % W, y = idx / W | 0;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
        if (x > 0 && bright[idx - 1] === 1) {
          bright[idx - 1] = 2;
          queue[end++] = idx - 1;
        }
        if (x < W - 1 && bright[idx + 1] === 1) {
          bright[idx + 1] = 2;
          queue[end++] = idx + 1;
        }
        if (y > 0 && bright[idx - W] === 1) {
          bright[idx - W] = 2;
          queue[end++] = idx - W;
        }
        if (y < H - 1 && bright[idx + W] === 1) {
          bright[idx + W] = 2;
          queue[end++] = idx + W;
        }
      }
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      if (end < MIN_AREA || bw < 30 || bh < 20 || bh > 1400) continue;
      const bubble = analyse(rgba, W, queue, end, x0, y0, bw, bh);
      if (bubble) bubbles.push(bubble);
    }
    return bubbles;
  }
  function analyse(rgba, W, comp, count, x0, y0, bw, bh) {
    const size = bw * bh;
    const member = new Uint8Array(size);
    for (let k = 0; k < count; k++) {
      const idx = comp[k];
      member[((idx / W | 0) - y0) * bw + (idx % W - x0)] = 1;
    }
    const outside = new Uint8Array(size);
    const stack = new Int32Array(size);
    let sp = 0;
    const seed = (i) => {
      if (!member[i] && !outside[i]) {
        outside[i] = 1;
        stack[sp++] = i;
      }
    };
    for (let x = 0; x < bw; x++) {
      seed(x);
      seed((bh - 1) * bw + x);
    }
    for (let y = 0; y < bh; y++) {
      seed(y * bw);
      seed(y * bw + bw - 1);
    }
    while (sp > 0) {
      const i = stack[--sp];
      const x = i % bw;
      if (x > 0) seed(i - 1);
      if (x < bw - 1) seed(i + 1);
      if (i >= bw) seed(i - bw);
      if (i < size - bw) seed(i + bw);
    }
    const inside = new Uint8Array(size);
    let insideCount = 0, holes = 0, ink = 0;
    for (let i = 0; i < size; i++) {
      if (outside[i]) continue;
      inside[i] = 1;
      insideCount++;
      if (member[i]) continue;
      holes++;
      const p = ((i / bw | 0) + y0) * W * 4 + (i % bw + x0) * 4;
      if (luma(rgba[p], rgba[p + 1], rgba[p + 2]) < INK) ink++;
    }
    const fill = insideCount / size;
    const inkRatio = ink / insideCount;
    if (fill < 0.35 || holes < 60 || inkRatio < 0.015 || inkRatio > 0.45) return null;
    return { bbox: { x: x0, y: y0, w: bw, h: bh }, inside };
  }
  function inkBox(c) {
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        if (c.data[(y * c.width + x) * 4] !== 0) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    return x1 < 0 ? null : { w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }
  function cropBubble(rgba, W, b, pad = 10) {
    const width = b.bbox.w + pad * 2;
    const height = b.bbox.h + pad * 2;
    const data = new Uint8ClampedArray(width * height * 4).fill(255);
    for (let y = 0; y < b.bbox.h; y++) {
      for (let x = 0; x < b.bbox.w; x++) {
        if (!b.inside[y * b.bbox.w + x]) continue;
        const p = ((b.bbox.y + y) * W + b.bbox.x + x) * 4;
        const v = luma(rgba[p], rgba[p + 1], rgba[p + 2]) < 128 ? 0 : 255;
        const q = ((y + pad) * width + x + pad) * 4;
        data[q] = data[q + 1] = data[q + 2] = v;
      }
    }
    return { data, width, height, x: b.bbox.x - pad, y: b.bbox.y - pad };
  }

  // src/core/textClean.ts
  var CJK_LETTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
  function cleanBubbleText(raw, lang = "en") {
    return lang === "en" ? cleanEnglish(raw) : cleanCjk(raw, lang);
  }
  function cleanEnglish(raw) {
    let t = raw.replace(/\s+/g, " ").trim();
    t = t.replace(/([A-Za-z])- ([a-z]{2,})/g, "$1$2");
    t = t.replace(/\bl(?=\s|[,.!?]|$)/g, "I").replace(/\|/g, "I");
    const letters = t.replace(/[^A-Za-z]/g, "");
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (letters.length >= 3 && upper / letters.length > 0.8) t = toSentenceCase(t);
    return t;
  }
  function cleanCjk(raw, lang) {
    let t = raw.replace(/\s+/g, " ").trim();
    if (lang === "ko") {
      return t.replace(/ (?=[?!.,~…])/g, "");
    }
    t = t.replace(/\s+(?=[^\x00-\x7F])|(?<=[^\x00-\x7F])\s+/g, "");
    return t.replace(/ (?=[?!.,])/g, "");
  }
  function toSentenceCase(s) {
    const lower = s.toLowerCase().replace(/\bi\b/g, "I");
    return lower.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  }
  function isMeaningful(text, lang = "en") {
    if (lang !== "en") return CJK_LETTER.test(text);
    const letters = text.replace(/[^A-Za-z]/g, "");
    return letters.length >= 2 && /[A-Za-z]{2,}/.test(text);
  }

  // src/core/grouping.ts
  var MIN_CONF = 40;
  function union(a, b) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return {
      x,
      y,
      w: Math.max(a.x + a.w, b.x + b.w) - x,
      h: Math.max(a.y + a.h, b.y + b.h) - y
    };
  }
  function overlap1d(a0, a1, b0, b1) {
    return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  }
  function buildLines(words) {
    const sorted = [...words].sort((a, b) => a.bbox.x - b.bbox.x);
    const lines = [];
    for (const w of sorted) {
      const line = lines.find((l) => {
        const ov = overlap1d(l.bbox.y, l.bbox.y + l.bbox.h, w.bbox.y, w.bbox.y + w.bbox.h);
        const gap = w.bbox.x - (l.bbox.x + l.bbox.w);
        return ov > 0.5 * Math.min(l.bbox.h, w.bbox.h) && gap < 1.5 * w.bbox.h && gap > -w.bbox.h;
      });
      if (line) {
        line.words.push(w);
        line.bbox = union(line.bbox, w.bbox);
      } else {
        lines.push({ words: [w], bbox: { ...w.bbox } });
      }
    }
    for (const l of lines) l.words.sort((a, b) => a.bbox.x - b.bbox.x);
    return lines;
  }
  var hasLetters = (s) => /[\p{L}\p{N}]/u.test(s);
  function bubbleRegion(words, lang = "en", rawText) {
    const good = words.filter((w) => w.conf >= MIN_CONF && hasLetters(w.text));
    if (!good.length) return null;
    let text;
    let bbox;
    let lineHeight;
    if (lang !== "en" && rawText) {
      text = cleanBubbleText(rawText, lang);
      bbox = good.map((w) => w.bbox).reduce(union);
      lineHeight = good.reduce((s, w) => s + Math.min(w.bbox.w, w.bbox.h), 0) / good.length;
    } else {
      const lines = buildLines(good).sort((a, b) => a.bbox.y - b.bbox.y);
      text = cleanBubbleText(lines.map((l) => l.words.map((w) => w.text).join(" ")).join(" "), lang);
      bbox = lines.map((l) => l.bbox).reduce(union);
      lineHeight = lines.reduce((s, l) => s + l.bbox.h, 0) / lines.length;
    }
    if (!isMeaningful(text, lang)) return null;
    return { bbox, text, conf: good.reduce((s, w) => s + w.conf, 0) / good.length, lineHeight };
  }
  function groupWords(words, lang = "en") {
    const good = words.filter((w) => w.conf >= MIN_CONF && hasLetters(w.text));
    const lines = buildLines(good).sort((a, b) => a.bbox.y - b.bbox.y);
    const groups = [];
    for (const line of lines) {
      const g = groups.find((grp) => {
        const last = grp[grp.length - 1];
        const gap = line.bbox.y - (last.bbox.y + last.bbox.h);
        const h = Math.max(line.bbox.h, last.bbox.h);
        const colOverlap = overlap1d(
          last.bbox.x,
          last.bbox.x + last.bbox.w,
          line.bbox.x,
          line.bbox.x + line.bbox.w
        );
        return gap < 1.5 * h && colOverlap > 0.3 * Math.min(last.bbox.w, line.bbox.w);
      });
      if (g) g.push(line);
      else groups.push([line]);
    }
    const regions = [];
    for (const grp of groups) {
      const bbox = grp.map((l) => l.bbox).reduce(union);
      const wordsIn = grp.flatMap((l) => l.words);
      const text = cleanBubbleText(grp.map((l) => l.words.map((w) => w.text).join(" ")).join(" "), lang);
      if (!isMeaningful(text, lang)) continue;
      const conf = wordsIn.reduce((s, w) => s + w.conf, 0) / wordsIn.length;
      const lineHeight = grp.reduce((s, l) => s + l.bbox.h, 0) / grp.length;
      regions.push({ bbox, text, conf, lineHeight });
    }
    return regions;
  }

  // src/core/lang.ts
  var OCR_MODEL = {
    en: "eng",
    ja: "jpn",
    ko: "kor",
    zh: "chi_sim"
  };
  var VERTICAL_MODEL = "jpn_vert";
  function isVerticalInk(lang, ink) {
    return lang === "ja" && !!ink && ink.h > ink.w * 1.15;
  }

  // src/core/pixels.ts
  function otsuThreshold(rgba) {
    const hist = new Uint32Array(256);
    const total = rgba.length / 4;
    for (let p = 0; p < rgba.length; p += 4) hist[Math.round(luma(rgba[p], rgba[p + 1], rgba[p + 2]))]++;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];
    let wB = 0, sumB = 0, best = 0, bestVar = -1;
    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (!wB) continue;
      const wF = total - wB;
      if (!wF) break;
      sumB += t * hist[t];
      const mB = sumB / wB, mF = (sum - sumB) / wF;
      const v = wB * wF * (mB - mF) ** 2;
      if (v > bestVar) {
        bestVar = v;
        best = t;
      }
    }
    return best;
  }
  function binarizeOtsu(rgba) {
    const t = otsuThreshold(rgba);
    for (let p = 0; p < rgba.length; p += 4) {
      const v = luma(rgba[p], rgba[p + 1], rgba[p + 2]) <= t ? 0 : 255;
      rgba[p] = rgba[p + 1] = rgba[p + 2] = v;
      rgba[p + 3] = 255;
    }
  }
  function sampleBackground(rgba, W, H, b) {
    const m = 3;
    const x0 = Math.max(0, Math.floor(b.x - m));
    const y0 = Math.max(0, Math.floor(b.y - m));
    const x1 = Math.min(W - 1, Math.ceil(b.x + b.w + m));
    const y1 = Math.min(H - 1, Math.ceil(b.y + b.h + m));
    const px = [];
    const take = (x, y) => {
      const p = (y * W + x) * 4;
      px.push([rgba[p], rgba[p + 1], rgba[p + 2]]);
    };
    for (let x = x0; x <= x1; x += 2) {
      take(x, y0);
      take(x, y1);
    }
    for (let y = y0; y <= y1; y += 2) {
      take(x0, y);
      take(x1, y);
    }
    const med = (i) => px.map((p) => p[i]).sort((a, c) => a - c)[px.length >> 1] ?? 255;
    return `rgb(${med(0)},${med(1)},${med(2)})`;
  }
  function textColorFor(bg) {
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    return luma(r, g, b) > 140 ? "#111" : "#fff";
  }

  // src/ext/offscreen.ts
  var Pool = class {
    constructor(model, size) {
      this.model = model;
      this.size = size;
    }
    model;
    size;
    workers = [];
    idle = [];
    waiters = [];
    failure = null;
    start() {
      while (this.workers.length < this.size) {
        const p = (0, import_tesseract.createWorker)(this.model, 1, {
          workerPath: chrome.runtime.getURL("tesseract/worker.min.js"),
          corePath: chrome.runtime.getURL("tesseract/core"),
          langPath: chrome.runtime.getURL("tesseract/lang"),
          workerBlobURL: false,
          gzip: true
        });
        this.workers.push(p);
        p.then(
          (w) => this.release(w),
          (e) => {
            this.failure = e;
            this.waiters.splice(0).forEach((w) => w.reject(e));
          }
        );
      }
    }
    release(w) {
      const next = this.waiters.shift();
      if (next) next.resolve(w);
      else this.idle.push(w);
    }
    acquire() {
      if (this.failure) return Promise.reject(this.failure);
      this.start();
      const w = this.idle.pop();
      return w ? Promise.resolve(w) : new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
    }
  };
  var cores = navigator.hardwareConcurrency ?? 4;
  var pools = /* @__PURE__ */ new Map();
  function poolFor(model) {
    let p = pools.get(model);
    if (!p) {
      const size = model === "eng" ? Math.max(2, Math.min(4, cores - 1)) : model === VERTICAL_MODEL ? 1 : 2;
      p = new Pool(model, size);
      pools.set(model, p);
    }
    return p;
  }
  async function recognize(canvas, model, psm, dx, dy, scale) {
    const pool = poolFor(model);
    const worker = await pool.acquire();
    let data;
    try {
      await worker.setParameters({ tessedit_pageseg_mode: psm });
      ({ data } = await worker.recognize(canvas, {}, { blocks: true }));
    } finally {
      pool.release(worker);
    }
    const words = [];
    for (const b of data.blocks ?? [])
      for (const p of b.paragraphs)
        for (const l of p.lines)
          for (const wd of l.words)
            words.push({
              text: wd.text,
              conf: wd.confidence,
              bbox: {
                x: dx + wd.bbox.x0 / scale,
                y: dy + wd.bbox.y0 / scale,
                w: (wd.bbox.x1 - wd.bbox.x0) / scale,
                h: (wd.bbox.y1 - wd.bbox.y0) / scale
              }
            });
    return { words, text: data.text };
  }
  var blobs = /* @__PURE__ */ new Map();
  var MAX_BLOBS = 4;
  function loadBlob(url) {
    let p = blobs.get(url);
    if (!p) {
      p = fetch(url).then((res) => {
        if (!res.ok) throw new Error(`image fetch ${res.status}`);
        return res.blob();
      });
      p.catch(() => blobs.delete(url));
      blobs.set(url, p);
      if (blobs.size > MAX_BLOBS) blobs.delete(blobs.keys().next().value);
    }
    return p;
  }
  async function loadBitmap(url) {
    return createImageBitmap(await loadBlob(url));
  }
  function canvasFrom(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return { canvas, ctx: canvas.getContext("2d", { willReadFrequently: true }) };
  }
  function inscribed(b) {
    const dx = b.w * 0.19, dy = b.h * 0.19;
    return { x: b.x + dx, y: b.y + dy, w: b.w - 2 * dx, h: b.h - 2 * dy };
  }
  function union2(a, b) {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
  }
  async function ocrImage(url, lang) {
    const bmp = await loadBitmap(url);
    const { width, height } = bmp;
    const full = canvasFrom(width, height);
    full.ctx.drawImage(bmp, 0, 0);
    bmp.close();
    const rgba = full.ctx.getImageData(0, 0, width, height).data;
    const found = await Promise.all(
      findBubbles(rgba, width, height).map(async (bubble) => {
        const crop = cropBubble(rgba, width, bubble);
        const { canvas, ctx } = canvasFrom(crop.width, crop.height);
        ctx.putImageData(new ImageData(crop.data, crop.width, crop.height), 0, 0);
        const vertical = isVerticalInk(lang, inkBox(crop));
        const { words, text } = vertical ? await recognize(canvas, VERTICAL_MODEL, "5", crop.x, crop.y, 1) : await recognize(canvas, OCR_MODEL[lang], "6", crop.x, crop.y, 1);
        const region = bubbleRegion(words, lang, text);
        if (region) {
          region.bg = "#fff";
          region.fg = "#111";
          region.bbox = union2(region.bbox, inscribed(bubble.bbox));
        }
        return region;
      })
    );
    const regions = found.filter((r) => r !== null).sort((a, b) => a.bbox.y - b.bbox.y);
    return { width, height, regions };
  }
  async function ocrRegion(url, area, lang) {
    const bmp = await loadBitmap(url);
    const x = Math.max(0, Math.floor(area.x));
    const y = Math.max(0, Math.floor(area.y));
    const w = Math.min(bmp.width - x, Math.ceil(area.w));
    const h = Math.min(bmp.height - y, Math.ceil(area.h));
    if (w < 10 || h < 10) return { width: bmp.width, height: bmp.height, regions: [] };
    const raw = canvasFrom(w, h);
    raw.ctx.drawImage(bmp, x, y, w, h, 0, 0, w, h);
    const rawPx = raw.ctx.getImageData(0, 0, w, h).data;
    const scale = h < 500 ? 2 : 1;
    const big = canvasFrom(w * scale, h * scale);
    big.ctx.drawImage(bmp, x, y, w, h, 0, 0, w * scale, h * scale);
    const px = big.ctx.getImageData(0, 0, big.canvas.width, big.canvas.height);
    binarizeOtsu(px.data);
    big.ctx.putImageData(px, 0, 0);
    let regions;
    if (isVerticalInk(lang, { w, h })) {
      const { words, text } = await recognize(big.canvas, VERTICAL_MODEL, "5", x, y, scale);
      const r = bubbleRegion(words, lang, text);
      regions = r ? [r] : [];
    } else {
      const { words } = await recognize(big.canvas, OCR_MODEL[lang], "11", x, y, scale);
      regions = groupWords(words, lang);
    }
    for (const r of regions) {
      const bg = sampleBackground(rawPx, w, h, { ...r.bbox, x: r.bbox.x - x, y: r.bbox.y - y });
      r.bg = bg;
      r.fg = textColorFor(bg);
    }
    const result = { width: bmp.width, height: bmp.height, regions };
    bmp.close();
    return result;
  }
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.target !== "offscreen") return;
    const lang = msg.lang ?? "en";
    if (msg.type === "warm") {
      poolFor(OCR_MODEL[lang]).start();
      return;
    }
    if (msg.type !== "ocr") return;
    (msg.region ? ocrRegion(msg.url, msg.region, lang) : ocrImage(msg.url, lang)).then(
      (result) => sendResponse({ ok: true, result }),
      (e) => sendResponse({ ok: false, error: String(e?.message ?? e) })
    );
    return true;
  });
})();
