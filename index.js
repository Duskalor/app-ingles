import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/dotenv/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "dotenv",
    version: "16.4.7",
    description: "Loads environment variables from .env file",
    main: "lib/main.js",
    types: "lib/main.d.ts",
    exports: {
      ".": {
        types: "./lib/main.d.ts",
        require: "./lib/main.js",
        default: "./lib/main.js"
      },
      "./config": "./config.js",
      "./config.js": "./config.js",
      "./lib/env-options": "./lib/env-options.js",
      "./lib/env-options.js": "./lib/env-options.js",
      "./lib/cli-options": "./lib/cli-options.js",
      "./lib/cli-options.js": "./lib/cli-options.js",
      "./package.json": "./package.json"
    },
    scripts: {
      "dts-check": "tsc --project tests/types/tsconfig.json",
      lint: "standard",
      pretest: "npm run lint && npm run dts-check",
      test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
      "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",
      prerelease: "npm test",
      release: "standard-version"
    },
    repository: {
      type: "git",
      url: "git://github.com/motdotla/dotenv.git"
    },
    funding: "https://dotenvx.com",
    keywords: [
      "dotenv",
      "env",
      ".env",
      "environment",
      "variables",
      "config",
      "settings"
    ],
    readmeFilename: "README.md",
    license: "BSD-2-Clause",
    devDependencies: {
      "@types/node": "^18.11.3",
      decache: "^4.6.2",
      sinon: "^14.0.1",
      standard: "^17.0.0",
      "standard-version": "^9.5.0",
      tap: "^19.2.0",
      typescript: "^4.8.4"
    },
    engines: {
      node: ">=12"
    },
    browser: {
      fs: false
    }
  };
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS((exports, module) => {
  var fs = __require("fs");
  var path = __require("path");
  var os = __require("os");
  var crypto = __require("crypto");
  var packageJson = require_package();
  var version = packageJson.version;
  var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function parse(src) {
    const obj = {};
    let lines = src.toString();
    lines = lines.replace(/\r\n?/mg, `
`);
    let match;
    while ((match = LINE.exec(lines)) != null) {
      const key = match[1];
      let value = match[2] || "";
      value = value.trim();
      const maybeQuote = value[0];
      value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
      if (maybeQuote === '"') {
        value = value.replace(/\\n/g, `
`);
        value = value.replace(/\\r/g, "\r");
      }
      obj[key] = value;
    }
    return obj;
  }
  function _parseVault(options) {
    const vaultPath = _vaultPath(options);
    const result = DotenvModule.configDotenv({ path: vaultPath });
    if (!result.parsed) {
      const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
      err.code = "MISSING_DATA";
      throw err;
    }
    const keys = _dotenvKey(options).split(",");
    const length = keys.length;
    let decrypted;
    for (let i = 0;i < length; i++) {
      try {
        const key = keys[i].trim();
        const attrs = _instructions(result, key);
        decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
        break;
      } catch (error) {
        if (i + 1 >= length) {
          throw error;
        }
      }
    }
    return DotenvModule.parse(decrypted);
  }
  function _log(message) {
    console.log(`[dotenv@${version}][INFO] ${message}`);
  }
  function _warn(message) {
    console.log(`[dotenv@${version}][WARN] ${message}`);
  }
  function _debug(message) {
    console.log(`[dotenv@${version}][DEBUG] ${message}`);
  }
  function _dotenvKey(options) {
    if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
      return options.DOTENV_KEY;
    }
    if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
      return process.env.DOTENV_KEY;
    }
    return "";
  }
  function _instructions(result, dotenvKey) {
    let uri;
    try {
      uri = new URL(dotenvKey);
    } catch (error) {
      if (error.code === "ERR_INVALID_URL") {
        const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      throw error;
    }
    const key = uri.password;
    if (!key) {
      const err = new Error("INVALID_DOTENV_KEY: Missing key part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environment = uri.searchParams.get("environment");
    if (!environment) {
      const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
    const ciphertext = result.parsed[environmentKey];
    if (!ciphertext) {
      const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
      err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
      throw err;
    }
    return { ciphertext, key };
  }
  function _vaultPath(options) {
    let possibleVaultPath = null;
    if (options && options.path && options.path.length > 0) {
      if (Array.isArray(options.path)) {
        for (const filepath of options.path) {
          if (fs.existsSync(filepath)) {
            possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
          }
        }
      } else {
        possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
      }
    } else {
      possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
    }
    if (fs.existsSync(possibleVaultPath)) {
      return possibleVaultPath;
    }
    return null;
  }
  function _resolveHome(envPath) {
    return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
  }
  function _configVault(options) {
    _log("Loading env from encrypted .env.vault");
    const parsed = DotenvModule._parseVault(options);
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsed, options);
    return { parsed };
  }
  function configDotenv(options) {
    const dotenvPath = path.resolve(process.cwd(), ".env");
    let encoding = "utf8";
    const debug = Boolean(options && options.debug);
    if (options && options.encoding) {
      encoding = options.encoding;
    } else {
      if (debug) {
        _debug("No encoding is specified. UTF-8 is used by default");
      }
    }
    let optionPaths = [dotenvPath];
    if (options && options.path) {
      if (!Array.isArray(options.path)) {
        optionPaths = [_resolveHome(options.path)];
      } else {
        optionPaths = [];
        for (const filepath of options.path) {
          optionPaths.push(_resolveHome(filepath));
        }
      }
    }
    let lastError;
    const parsedAll = {};
    for (const path2 of optionPaths) {
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
        DotenvModule.populate(parsedAll, parsed, options);
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${path2} ${e.message}`);
        }
        lastError = e;
      }
    }
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsedAll, options);
    if (lastError) {
      return { parsed: parsedAll, error: lastError };
    } else {
      return { parsed: parsedAll };
    }
  }
  function config(options) {
    if (_dotenvKey(options).length === 0) {
      return DotenvModule.configDotenv(options);
    }
    const vaultPath = _vaultPath(options);
    if (!vaultPath) {
      _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
      return DotenvModule.configDotenv(options);
    }
    return DotenvModule._configVault(options);
  }
  function decrypt(encrypted, keyStr) {
    const key = Buffer.from(keyStr.slice(-64), "hex");
    let ciphertext = Buffer.from(encrypted, "base64");
    const nonce = ciphertext.subarray(0, 12);
    const authTag = ciphertext.subarray(-16);
    ciphertext = ciphertext.subarray(12, -16);
    try {
      const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
      aesgcm.setAuthTag(authTag);
      return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
    } catch (error) {
      const isRange = error instanceof RangeError;
      const invalidKeyLength = error.message === "Invalid key length";
      const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
      if (isRange || invalidKeyLength) {
        const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      } else if (decryptionFailed) {
        const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        err.code = "DECRYPTION_FAILED";
        throw err;
      } else {
        throw error;
      }
    }
  }
  function populate(processEnv, parsed, options = {}) {
    const debug = Boolean(options && options.debug);
    const override = Boolean(options && options.override);
    if (typeof parsed !== "object") {
      const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      err.code = "OBJECT_REQUIRED";
      throw err;
    }
    for (const key of Object.keys(parsed)) {
      if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
        if (override === true) {
          processEnv[key] = parsed[key];
        }
        if (debug) {
          if (override === true) {
            _debug(`"${key}" is already defined and WAS overwritten`);
          } else {
            _debug(`"${key}" is already defined and was NOT overwritten`);
          }
        }
      } else {
        processEnv[key] = parsed[key];
      }
    }
  }
  var DotenvModule = {
    configDotenv,
    _configVault,
    _parseVault,
    config,
    decrypt,
    parse,
    populate
  };
  exports.configDotenv = DotenvModule.configDotenv;
  exports._configVault = DotenvModule._configVault;
  exports._parseVault = DotenvModule._parseVault;
  exports.config = DotenvModule.config;
  exports.decrypt = DotenvModule.decrypt;
  exports.parse = DotenvModule.parse;
  exports.populate = DotenvModule.populate;
  module.exports = DotenvModule;
});

// node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS((exports, module) => {
  var options = {};
  if (process.env.DOTENV_CONFIG_ENCODING != null) {
    options.encoding = process.env.DOTENV_CONFIG_ENCODING;
  }
  if (process.env.DOTENV_CONFIG_PATH != null) {
    options.path = process.env.DOTENV_CONFIG_PATH;
  }
  if (process.env.DOTENV_CONFIG_DEBUG != null) {
    options.debug = process.env.DOTENV_CONFIG_DEBUG;
  }
  if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
    options.override = process.env.DOTENV_CONFIG_OVERRIDE;
  }
  if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
    options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
  }
  module.exports = options;
});

// node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS((exports, module) => {
  var re = /^dotenv_config_(encoding|path|debug|override|DOTENV_KEY)=(.+)$/;
  module.exports = function optionMatcher(args) {
    return args.reduce(function(acc, cur) {
      const matches = cur.match(re);
      if (matches) {
        acc[matches[1]] = matches[2];
      }
      return acc;
    }, {});
  };
});

// node_modules/dotenv/config.js
var require_config = __commonJS(() => {
  (function() {
    require_main().config(Object.assign({}, require_env_options(), require_cli_options()(process.argv)));
  })();
});

// node_modules/node-cron/src/task.js
var require_task = __commonJS((exports, module) => {
  var EventEmitter = __require("events");

  class Task extends EventEmitter {
    constructor(execution) {
      super();
      if (typeof execution !== "function") {
        throw "execution must be a function";
      }
      this._execution = execution;
    }
    execute(now) {
      let exec;
      try {
        exec = this._execution(now);
      } catch (error) {
        return this.emit("task-failed", error);
      }
      if (exec instanceof Promise) {
        return exec.then(() => this.emit("task-finished")).catch((error) => this.emit("task-failed", error));
      } else {
        this.emit("task-finished");
        return exec;
      }
    }
  }
  module.exports = Task;
});

// node_modules/node-cron/src/convert-expression/month-names-conversion.js
var require_month_names_conversion = __commonJS((exports, module) => {
  module.exports = (() => {
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december"
    ];
    const shortMonths = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec"
    ];
    function convertMonthName(expression, items) {
      for (let i = 0;i < items.length; i++) {
        expression = expression.replace(new RegExp(items[i], "gi"), parseInt(i, 10) + 1);
      }
      return expression;
    }
    function interprete(monthExpression) {
      monthExpression = convertMonthName(monthExpression, months);
      monthExpression = convertMonthName(monthExpression, shortMonths);
      return monthExpression;
    }
    return interprete;
  })();
});

// node_modules/node-cron/src/convert-expression/week-day-names-conversion.js
var require_week_day_names_conversion = __commonJS((exports, module) => {
  module.exports = (() => {
    const weekDays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];
    const shortWeekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    function convertWeekDayName(expression, items) {
      for (let i = 0;i < items.length; i++) {
        expression = expression.replace(new RegExp(items[i], "gi"), parseInt(i, 10));
      }
      return expression;
    }
    function convertWeekDays(expression) {
      expression = expression.replace("7", "0");
      expression = convertWeekDayName(expression, weekDays);
      return convertWeekDayName(expression, shortWeekDays);
    }
    return convertWeekDays;
  })();
});

// node_modules/node-cron/src/convert-expression/asterisk-to-range-conversion.js
var require_asterisk_to_range_conversion = __commonJS((exports, module) => {
  module.exports = (() => {
    function convertAsterisk(expression, replecement) {
      if (expression.indexOf("*") !== -1) {
        return expression.replace("*", replecement);
      }
      return expression;
    }
    function convertAsterisksToRanges(expressions) {
      expressions[0] = convertAsterisk(expressions[0], "0-59");
      expressions[1] = convertAsterisk(expressions[1], "0-59");
      expressions[2] = convertAsterisk(expressions[2], "0-23");
      expressions[3] = convertAsterisk(expressions[3], "1-31");
      expressions[4] = convertAsterisk(expressions[4], "1-12");
      expressions[5] = convertAsterisk(expressions[5], "0-6");
      return expressions;
    }
    return convertAsterisksToRanges;
  })();
});

// node_modules/node-cron/src/convert-expression/range-conversion.js
var require_range_conversion = __commonJS((exports, module) => {
  module.exports = (() => {
    function replaceWithRange(expression, text, init, end) {
      const numbers = [];
      let last = parseInt(end);
      let first = parseInt(init);
      if (first > last) {
        last = parseInt(init);
        first = parseInt(end);
      }
      for (let i = first;i <= last; i++) {
        numbers.push(i);
      }
      return expression.replace(new RegExp(text, "i"), numbers.join());
    }
    function convertRange(expression) {
      const rangeRegEx = /(\d+)-(\d+)/;
      let match = rangeRegEx.exec(expression);
      while (match !== null && match.length > 0) {
        expression = replaceWithRange(expression, match[0], match[1], match[2]);
        match = rangeRegEx.exec(expression);
      }
      return expression;
    }
    function convertAllRanges(expressions) {
      for (let i = 0;i < expressions.length; i++) {
        expressions[i] = convertRange(expressions[i]);
      }
      return expressions;
    }
    return convertAllRanges;
  })();
});

// node_modules/node-cron/src/convert-expression/step-values-conversion.js
var require_step_values_conversion = __commonJS((exports, module) => {
  module.exports = (() => {
    function convertSteps(expressions) {
      var stepValuePattern = /^(.+)\/(\w+)$/;
      for (var i = 0;i < expressions.length; i++) {
        var match = stepValuePattern.exec(expressions[i]);
        var isStepValue = match !== null && match.length > 0;
        if (isStepValue) {
          var baseDivider = match[2];
          if (isNaN(baseDivider)) {
            throw baseDivider + " is not a valid step value";
          }
          var values = match[1].split(",");
          var stepValues = [];
          var divider = parseInt(baseDivider, 10);
          for (var j = 0;j <= values.length; j++) {
            var value = parseInt(values[j], 10);
            if (value % divider === 0) {
              stepValues.push(value);
            }
          }
          expressions[i] = stepValues.join(",");
        }
      }
      return expressions;
    }
    return convertSteps;
  })();
});

// node_modules/node-cron/src/convert-expression/index.js
var require_convert_expression = __commonJS((exports, module) => {
  var monthNamesConversion = require_month_names_conversion();
  var weekDayNamesConversion = require_week_day_names_conversion();
  var convertAsterisksToRanges = require_asterisk_to_range_conversion();
  var convertRanges = require_range_conversion();
  var convertSteps = require_step_values_conversion();
  module.exports = (() => {
    function appendSeccondExpression(expressions) {
      if (expressions.length === 5) {
        return ["0"].concat(expressions);
      }
      return expressions;
    }
    function removeSpaces(str) {
      return str.replace(/\s{2,}/g, " ").trim();
    }
    function normalizeIntegers(expressions) {
      for (let i = 0;i < expressions.length; i++) {
        const numbers = expressions[i].split(",");
        for (let j = 0;j < numbers.length; j++) {
          numbers[j] = parseInt(numbers[j]);
        }
        expressions[i] = numbers;
      }
      return expressions;
    }
    function interprete(expression) {
      let expressions = removeSpaces(expression).split(" ");
      expressions = appendSeccondExpression(expressions);
      expressions[4] = monthNamesConversion(expressions[4]);
      expressions[5] = weekDayNamesConversion(expressions[5]);
      expressions = convertAsterisksToRanges(expressions);
      expressions = convertRanges(expressions);
      expressions = convertSteps(expressions);
      expressions = normalizeIntegers(expressions);
      return expressions.join(" ");
    }
    return interprete;
  })();
});

// node_modules/node-cron/src/pattern-validation.js
var require_pattern_validation = __commonJS((exports, module) => {
  var convertExpression = require_convert_expression();
  var validationRegex = /^(?:\d+|\*|\*\/\d+)$/;
  function isValidExpression(expression, min, max) {
    const options = expression.split(",");
    for (const option of options) {
      const optionAsInt = parseInt(option, 10);
      if (!Number.isNaN(optionAsInt) && (optionAsInt < min || optionAsInt > max) || !validationRegex.test(option))
        return false;
    }
    return true;
  }
  function isInvalidSecond(expression) {
    return !isValidExpression(expression, 0, 59);
  }
  function isInvalidMinute(expression) {
    return !isValidExpression(expression, 0, 59);
  }
  function isInvalidHour(expression) {
    return !isValidExpression(expression, 0, 23);
  }
  function isInvalidDayOfMonth(expression) {
    return !isValidExpression(expression, 1, 31);
  }
  function isInvalidMonth(expression) {
    return !isValidExpression(expression, 1, 12);
  }
  function isInvalidWeekDay(expression) {
    return !isValidExpression(expression, 0, 7);
  }
  function validateFields(patterns, executablePatterns) {
    if (isInvalidSecond(executablePatterns[0]))
      throw new Error(`${patterns[0]} is a invalid expression for second`);
    if (isInvalidMinute(executablePatterns[1]))
      throw new Error(`${patterns[1]} is a invalid expression for minute`);
    if (isInvalidHour(executablePatterns[2]))
      throw new Error(`${patterns[2]} is a invalid expression for hour`);
    if (isInvalidDayOfMonth(executablePatterns[3]))
      throw new Error(`${patterns[3]} is a invalid expression for day of month`);
    if (isInvalidMonth(executablePatterns[4]))
      throw new Error(`${patterns[4]} is a invalid expression for month`);
    if (isInvalidWeekDay(executablePatterns[5]))
      throw new Error(`${patterns[5]} is a invalid expression for week day`);
  }
  function validate(pattern) {
    if (typeof pattern !== "string")
      throw new TypeError("pattern must be a string!");
    const patterns = pattern.split(" ");
    const executablePatterns = convertExpression(pattern).split(" ");
    if (patterns.length === 5)
      patterns.unshift("0");
    validateFields(patterns, executablePatterns);
  }
  module.exports = validate;
});

// node_modules/node-cron/src/time-matcher.js
var require_time_matcher = __commonJS((exports, module) => {
  var validatePattern = require_pattern_validation();
  var convertExpression = require_convert_expression();
  function matchPattern(pattern, value) {
    if (pattern.indexOf(",") !== -1) {
      const patterns = pattern.split(",");
      return patterns.indexOf(value.toString()) !== -1;
    }
    return pattern === value.toString();
  }

  class TimeMatcher {
    constructor(pattern, timezone) {
      validatePattern(pattern);
      this.pattern = convertExpression(pattern);
      this.timezone = timezone;
      this.expressions = this.pattern.split(" ");
      this.dtf = this.timezone ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        fractionalSecondDigits: 3,
        timeZone: this.timezone
      }) : null;
    }
    match(date) {
      date = this.apply(date);
      const runOnSecond = matchPattern(this.expressions[0], date.getSeconds());
      const runOnMinute = matchPattern(this.expressions[1], date.getMinutes());
      const runOnHour = matchPattern(this.expressions[2], date.getHours());
      const runOnDay = matchPattern(this.expressions[3], date.getDate());
      const runOnMonth = matchPattern(this.expressions[4], date.getMonth() + 1);
      const runOnWeekDay = matchPattern(this.expressions[5], date.getDay());
      return runOnSecond && runOnMinute && runOnHour && runOnDay && runOnMonth && runOnWeekDay;
    }
    apply(date) {
      if (this.dtf) {
        return new Date(this.dtf.format(date));
      }
      return date;
    }
  }
  module.exports = TimeMatcher;
});

// node_modules/node-cron/src/scheduler.js
var require_scheduler = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var TimeMatcher = require_time_matcher();

  class Scheduler extends EventEmitter {
    constructor(pattern, timezone, autorecover) {
      super();
      this.timeMatcher = new TimeMatcher(pattern, timezone);
      this.autorecover = autorecover;
    }
    start() {
      this.stop();
      let lastCheck = process.hrtime();
      let lastExecution = this.timeMatcher.apply(new Date);
      const matchTime = () => {
        const delay = 1000;
        const elapsedTime = process.hrtime(lastCheck);
        const elapsedMs = (elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6;
        const missedExecutions = Math.floor(elapsedMs / 1000);
        for (let i = missedExecutions;i >= 0; i--) {
          const date = new Date(new Date().getTime() - i * 1000);
          let date_tmp = this.timeMatcher.apply(date);
          if (lastExecution.getTime() < date_tmp.getTime() && (i === 0 || this.autorecover) && this.timeMatcher.match(date)) {
            this.emit("scheduled-time-matched", date_tmp);
            date_tmp.setMilliseconds(0);
            lastExecution = date_tmp;
          }
        }
        lastCheck = process.hrtime();
        this.timeout = setTimeout(matchTime, delay);
      };
      matchTime();
    }
    stop() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = null;
    }
  }
  module.exports = Scheduler;
});

// node_modules/uuid/dist/rng.js
var require_rng = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = rng;
  var _crypto = _interopRequireDefault(__require("crypto"));
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var rnds8Pool = new Uint8Array(256);
  var poolPtr = rnds8Pool.length;
  function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
      _crypto.default.randomFillSync(rnds8Pool);
      poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, poolPtr += 16);
  }
});

// node_modules/uuid/dist/regex.js
var require_regex = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  exports.default = _default;
});

// node_modules/uuid/dist/validate.js
var require_validate = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _regex = _interopRequireDefault(require_regex());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function validate(uuid) {
    return typeof uuid === "string" && _regex.default.test(uuid);
  }
  var _default = validate;
  exports.default = _default;
});

// node_modules/uuid/dist/stringify.js
var require_stringify = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _validate = _interopRequireDefault(require_validate());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var byteToHex = [];
  for (let i = 0;i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).substr(1));
  }
  function stringify(arr, offset = 0) {
    const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Stringified UUID is invalid");
    }
    return uuid;
  }
  var _default = stringify;
  exports.default = _default;
});

// node_modules/uuid/dist/v1.js
var require_v1 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _rng = _interopRequireDefault(require_rng());
  var _stringify = _interopRequireDefault(require_stringify());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var _nodeId;
  var _clockseq;
  var _lastMSecs = 0;
  var _lastNSecs = 0;
  function v1(options, buf, offset) {
    let i = buf && offset || 0;
    const b = buf || new Array(16);
    options = options || {};
    let node = options.node || _nodeId;
    let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;
    if (node == null || clockseq == null) {
      const seedBytes = options.random || (options.rng || _rng.default)();
      if (node == null) {
        node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      }
      if (clockseq == null) {
        clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
      }
    }
    let msecs = options.msecs !== undefined ? options.msecs : Date.now();
    let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
    if (dt < 0 && options.clockseq === undefined) {
      clockseq = clockseq + 1 & 16383;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    }
    if (nsecs >= 1e4) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
    b[i++] = tl >>> 24 & 255;
    b[i++] = tl >>> 16 & 255;
    b[i++] = tl >>> 8 & 255;
    b[i++] = tl & 255;
    const tmh = msecs / 4294967296 * 1e4 & 268435455;
    b[i++] = tmh >>> 8 & 255;
    b[i++] = tmh & 255;
    b[i++] = tmh >>> 24 & 15 | 16;
    b[i++] = tmh >>> 16 & 255;
    b[i++] = clockseq >>> 8 | 128;
    b[i++] = clockseq & 255;
    for (let n = 0;n < 6; ++n) {
      b[i + n] = node[n];
    }
    return buf || (0, _stringify.default)(b);
  }
  var _default = v1;
  exports.default = _default;
});

// node_modules/uuid/dist/parse.js
var require_parse = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _validate = _interopRequireDefault(require_validate());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function parse(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Invalid UUID");
    }
    let v;
    const arr = new Uint8Array(16);
    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    arr[1] = v >>> 16 & 255;
    arr[2] = v >>> 8 & 255;
    arr[3] = v & 255;
    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    arr[5] = v & 255;
    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    arr[7] = v & 255;
    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    arr[9] = v & 255;
    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
    arr[11] = v / 4294967296 & 255;
    arr[12] = v >>> 24 & 255;
    arr[13] = v >>> 16 & 255;
    arr[14] = v >>> 8 & 255;
    arr[15] = v & 255;
    return arr;
  }
  var _default = parse;
  exports.default = _default;
});

// node_modules/uuid/dist/v35.js
var require_v35 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _default;
  exports.URL = exports.DNS = undefined;
  var _stringify = _interopRequireDefault(require_stringify());
  var _parse = _interopRequireDefault(require_parse());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    const bytes = [];
    for (let i = 0;i < str.length; ++i) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }
  var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  exports.DNS = DNS;
  var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  exports.URL = URL2;
  function _default(name, version, hashfunc) {
    function generateUUID(value, namespace, buf, offset) {
      if (typeof value === "string") {
        value = stringToBytes(value);
      }
      if (typeof namespace === "string") {
        namespace = (0, _parse.default)(namespace);
      }
      if (namespace.length !== 16) {
        throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
      }
      let bytes = new Uint8Array(16 + value.length);
      bytes.set(namespace);
      bytes.set(value, namespace.length);
      bytes = hashfunc(bytes);
      bytes[6] = bytes[6] & 15 | version;
      bytes[8] = bytes[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (let i = 0;i < 16; ++i) {
          buf[offset + i] = bytes[i];
        }
        return buf;
      }
      return (0, _stringify.default)(bytes);
    }
    try {
      generateUUID.name = name;
    } catch (err) {}
    generateUUID.DNS = DNS;
    generateUUID.URL = URL2;
    return generateUUID;
  }
});

// node_modules/uuid/dist/md5.js
var require_md5 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _crypto = _interopRequireDefault(__require("crypto"));
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function md5(bytes) {
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === "string") {
      bytes = Buffer.from(bytes, "utf8");
    }
    return _crypto.default.createHash("md5").update(bytes).digest();
  }
  var _default = md5;
  exports.default = _default;
});

// node_modules/uuid/dist/v3.js
var require_v3 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _v = _interopRequireDefault(require_v35());
  var _md = _interopRequireDefault(require_md5());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var v3 = (0, _v.default)("v3", 48, _md.default);
  var _default = v3;
  exports.default = _default;
});

// node_modules/uuid/dist/v4.js
var require_v4 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _rng = _interopRequireDefault(require_rng());
  var _stringify = _interopRequireDefault(require_stringify());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random || (options.rng || _rng.default)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0;i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return (0, _stringify.default)(rnds);
  }
  var _default = v4;
  exports.default = _default;
});

// node_modules/uuid/dist/sha1.js
var require_sha1 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _crypto = _interopRequireDefault(__require("crypto"));
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function sha1(bytes) {
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === "string") {
      bytes = Buffer.from(bytes, "utf8");
    }
    return _crypto.default.createHash("sha1").update(bytes).digest();
  }
  var _default = sha1;
  exports.default = _default;
});

// node_modules/uuid/dist/v5.js
var require_v5 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _v = _interopRequireDefault(require_v35());
  var _sha = _interopRequireDefault(require_sha1());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var v5 = (0, _v.default)("v5", 80, _sha.default);
  var _default = v5;
  exports.default = _default;
});

// node_modules/uuid/dist/nil.js
var require_nil = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _default = "00000000-0000-0000-0000-000000000000";
  exports.default = _default;
});

// node_modules/uuid/dist/version.js
var require_version = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _validate = _interopRequireDefault(require_validate());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function version(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Invalid UUID");
    }
    return parseInt(uuid.substr(14, 1), 16);
  }
  var _default = version;
  exports.default = _default;
});

// node_modules/uuid/dist/index.js
var require_dist = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "v1", {
    enumerable: true,
    get: function() {
      return _v.default;
    }
  });
  Object.defineProperty(exports, "v3", {
    enumerable: true,
    get: function() {
      return _v2.default;
    }
  });
  Object.defineProperty(exports, "v4", {
    enumerable: true,
    get: function() {
      return _v3.default;
    }
  });
  Object.defineProperty(exports, "v5", {
    enumerable: true,
    get: function() {
      return _v4.default;
    }
  });
  Object.defineProperty(exports, "NIL", {
    enumerable: true,
    get: function() {
      return _nil.default;
    }
  });
  Object.defineProperty(exports, "version", {
    enumerable: true,
    get: function() {
      return _version.default;
    }
  });
  Object.defineProperty(exports, "validate", {
    enumerable: true,
    get: function() {
      return _validate.default;
    }
  });
  Object.defineProperty(exports, "stringify", {
    enumerable: true,
    get: function() {
      return _stringify.default;
    }
  });
  Object.defineProperty(exports, "parse", {
    enumerable: true,
    get: function() {
      return _parse.default;
    }
  });
  var _v = _interopRequireDefault(require_v1());
  var _v2 = _interopRequireDefault(require_v3());
  var _v3 = _interopRequireDefault(require_v4());
  var _v4 = _interopRequireDefault(require_v5());
  var _nil = _interopRequireDefault(require_nil());
  var _version = _interopRequireDefault(require_version());
  var _validate = _interopRequireDefault(require_validate());
  var _stringify = _interopRequireDefault(require_stringify());
  var _parse = _interopRequireDefault(require_parse());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
});

// node_modules/node-cron/src/scheduled-task.js
var require_scheduled_task = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var Task = require_task();
  var Scheduler = require_scheduler();
  var uuid = require_dist();

  class ScheduledTask extends EventEmitter {
    constructor(cronExpression, func, options) {
      super();
      if (!options) {
        options = {
          scheduled: true,
          recoverMissedExecutions: false
        };
      }
      this.options = options;
      this.options.name = this.options.name || uuid.v4();
      this._task = new Task(func);
      this._scheduler = new Scheduler(cronExpression, options.timezone, options.recoverMissedExecutions);
      this._scheduler.on("scheduled-time-matched", (now) => {
        this.now(now);
      });
      if (options.scheduled !== false) {
        this._scheduler.start();
      }
      if (options.runOnInit === true) {
        this.now("init");
      }
    }
    now(now = "manual") {
      let result = this._task.execute(now);
      this.emit("task-done", result);
    }
    start() {
      this._scheduler.start();
    }
    stop() {
      this._scheduler.stop();
    }
  }
  module.exports = ScheduledTask;
});

// node_modules/node-cron/src/background-scheduled-task/index.js
var require_background_scheduled_task = __commonJS((exports, module) => {
  var __dirname = "/Users/duskalor/Documents/Proyects/node/app-ingles/node_modules/node-cron/src/background-scheduled-task";
  var EventEmitter = __require("events");
  var path = __require("path");
  var { fork } = __require("child_process");
  var uuid = require_dist();
  var daemonPath = `${__dirname}/daemon.js`;

  class BackgroundScheduledTask extends EventEmitter {
    constructor(cronExpression, taskPath, options) {
      super();
      if (!options) {
        options = {
          scheduled: true,
          recoverMissedExecutions: false
        };
      }
      this.cronExpression = cronExpression;
      this.taskPath = taskPath;
      this.options = options;
      this.options.name = this.options.name || uuid.v4();
      if (options.scheduled) {
        this.start();
      }
    }
    start() {
      this.stop();
      this.forkProcess = fork(daemonPath);
      this.forkProcess.on("message", (message) => {
        switch (message.type) {
          case "task-done":
            this.emit("task-done", message.result);
            break;
        }
      });
      let options = this.options;
      options.scheduled = true;
      this.forkProcess.send({
        type: "register",
        path: path.resolve(this.taskPath),
        cron: this.cronExpression,
        options
      });
    }
    stop() {
      if (this.forkProcess) {
        this.forkProcess.kill();
      }
    }
    pid() {
      if (this.forkProcess) {
        return this.forkProcess.pid;
      }
    }
    isRunning() {
      return !this.forkProcess.killed;
    }
  }
  module.exports = BackgroundScheduledTask;
});

// node_modules/node-cron/src/storage.js
var require_storage = __commonJS((exports, module) => {
  module.exports = (() => {
    if (!global.scheduledTasks) {
      global.scheduledTasks = new Map;
    }
    return {
      save: (task) => {
        if (!task.options) {
          const uuid = require_dist();
          task.options = {};
          task.options.name = uuid.v4();
        }
        global.scheduledTasks.set(task.options.name, task);
      },
      getTasks: () => {
        return global.scheduledTasks;
      }
    };
  })();
});

// node_modules/node-cron/src/node-cron.js
var require_node_cron = __commonJS((exports, module) => {
  var ScheduledTask = require_scheduled_task();
  var BackgroundScheduledTask = require_background_scheduled_task();
  var validation = require_pattern_validation();
  var storage = require_storage();
  function schedule(expression, func, options) {
    const task = createTask(expression, func, options);
    storage.save(task);
    return task;
  }
  function createTask(expression, func, options) {
    if (typeof func === "string")
      return new BackgroundScheduledTask(expression, func, options);
    return new ScheduledTask(expression, func, options);
  }
  function validate(expression) {
    try {
      validation(expression);
      return true;
    } catch (_) {
      return false;
    }
  }
  function getTasks() {
    return storage.getTasks();
  }
  module.exports = { schedule, validate, getTasks };
});

// src/index.ts
var import_config = __toESM(require_config(), 1);
var import_node_cron = __toESM(require_node_cron(), 1);

// src/send-telegram.ts
var TOKEN_BOT = process.env.TOKEN_BOT;
var sendTelegram = async (text) => {
  await fetch(`https://api.telegram.org/bot${TOKEN_BOT}/sendMessage?chat_id=1974797847&text=${encodeURIComponent(text)}`);
};

// src/utils.ts
var getNumber = (cuantity) => Math.floor(Math.random() * cuantity);
var wait = (time) => new Promise((res) => setTimeout(res, time));
var getPhrase = (arr) => {
  const cuantity = arr.length;
  const randomNumber1 = getNumber(cuantity);
  const allPhrases = arr[randomNumber1];
  const qtyPhrases = arr[randomNumber1].length;
  const randomNumber2 = getNumber(qtyPhrases);
  return allPhrases[randomNumber2];
};

// src/phrases.ts
var phrases = [
  [
    {
      tense: "simplePresent",
      phrase: "Me despierto temprano todos los días.",
      traduction: "I wake up early every day."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy despertándome temprano últimamente. (rutina temporal)",
      traduction: "I am waking up early these days. (temporal routine)"
    },
    {
      tense: "presentPerfect",
      phrase: "Me he despertado temprano esta semana. (período reciente)",
      traduction: "I have woken up early this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado despertándome temprano últimamente. (esfuerzo continuo)",
      traduction: "I have been waking up early lately. (ongoing effort)"
    },
    {
      tense: "simplePast",
      phrase: "Me desperté temprano ayer.",
      traduction: "I woke up early yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba despertándome temprano cuando la alarma falló. (acción interrumpida)",
      traduction: "I was waking up early when the alarm failed. (interrupted action)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya me había despertado temprano antes de la reunión. (acción previa)",
      traduction: "I had woken up early before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevaba meses despertándome temprano. (duración previa)",
      traduction: "I had been waking up early for months. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Me despertaré temprano mañana.",
      traduction: "I will wake up early tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré despertándome temprano a las 6 AM. (plan específico)",
      traduction: "I will be waking up early at 6 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ya me habré despertado temprano cuando llegues. (futuro completado)",
      traduction: "I will have woken up early by the time you arrive. (completed future)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado despertándome temprano durante un año. (duración hasta el futuro)",
      traduction: "I will have been waking up early for a year. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella se cepilla los dientes dos veces al día.",
      traduction: "She brushes her teeth twice a day."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella se está cepillando los dientes ahora mismo. (acción actual)",
      traduction: "She is brushing her teeth right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ya se ha cepillado los dientes. (hoy)",
      traduction: "She has brushed her teeth already. (today)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ha estado cepillándose los dientes concienzudamente. (enfoque reciente)",
      traduction: "She has been brushing her teeth thoroughly. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella se cepilló los dientes esta mañana.",
      traduction: "She brushed her teeth this morning."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba cepillándose los dientes cuando la llamaron. (interrupción)",
      traduction: "She was brushing her teeth when called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya se había cepillado los dientes antes del desayuno. (acción previa)",
      traduction: "She had brushed her teeth before breakfast. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Se había estado cepillando los dientes con demasiada fuerza. (costumbre pasada)",
      traduction: "She had been brushing her teeth too hard. (past habit)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella se cepillará los dientes esta noche.",
      traduction: "She will brush her teeth tonight."
    },
    {
      tense: "futureContinuous",
      phrase: "Estará cepillándose los dientes a las 8 PM. (programado)",
      traduction: "She will be brushing her teeth at 8 PM. (scheduled)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ya se habrá cepillado los dientes para la hora de dormir. (completado)",
      traduction: "She will have brushed her teeth by bedtime. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Llevará 2 minutos por sesión cepillándose los dientes. (énfasis en duración)",
      traduction: "She'll have been brushing 2 mins per session. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos juegan al fútbol todos los fines de semana.",
      traduction: "They play soccer every weekend."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están jugando al fútbol este fin de semana. (período actual)",
      traduction: "They are playing soccer this weekend. (current period)"
    },
    {
      tense: "presentPerfect",
      phrase: "Han jugado al fútbol este mes. (tiempo reciente)",
      traduction: "They have played soccer this month. (recent time)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Han estado jugando al fútbol con más frecuencia. (aumento de frecuencia)",
      traduction: "They have been playing soccer more often. (increased frequency)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos jugaron al fútbol el sábado pasado.",
      traduction: "They played soccer last Saturday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaban jugando al fútbol cuando llovió. (interrupción)",
      traduction: "They were playing soccer when it rained. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían jugado al fútbol antes del almuerzo. (acción previa)",
      traduction: "They had played soccer before lunch. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevaban horas jugando al fútbol. (duración previa)",
      traduction: "They had been playing soccer for hours. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos jugarán al fútbol el próximo fin de semana.",
      traduction: "They will play soccer next weekend."
    },
    {
      tense: "futureContinuous",
      phrase: "Estarán jugando al fútbol a las 3 PM. (plan específico)",
      traduction: "They will be playing soccer at 3 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ya habrán jugado al fútbol para el domingo. (completado)",
      traduction: "They will have played soccer by Sunday. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Llevarán 2 horas jugando al fútbol. (énfasis en duración)",
      traduction: "They'll have been playing soccer for 2 hours. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Vamos al parque los domingos.",
      traduction: "We go to the park on Sundays."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos yendo al parque este domingo. (plan actual)",
      traduction: "We are going to the park this Sunday. (current plan)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos ido al parque este mes. (tiempo reciente)",
      traduction: "We have gone to the park this month. (recent time)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado yendo al parque regularmente. (costumbre continua)",
      traduction: "We have been going to the park regularly. (ongoing habit)"
    },
    {
      tense: "simplePast",
      phrase: "Fuimos al parque el domingo pasado.",
      traduction: "We went to the park last Sunday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos yendo al parque cuando cerró. (interrupción)",
      traduction: "We were going to the park when it closed. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos ido al parque antes de la tormenta. (acción previa)",
      traduction: "We had gone to the park before the storm. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevábamos años yendo al parque. (duración prolongada)",
      traduction: "We had been going to the park for years. (long duration)"
    },
    {
      tense: "simpleFuture",
      phrase: "Iremos al parque el próximo domingo.",
      traduction: "We will go to the park next Sunday."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré yendo al parque al mediodía. (hora específica)",
      traduction: "We will be going to the park at noon. (specific time)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ya habremos ido al parque para la noche. (completado)",
      traduction: "We will have gone to the park by evening. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Llevaremos 3 horas yendo al parque. (énfasis en duración)",
      traduction: "We'll have been going for 3 hours. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él trabaja en un banco.",
      traduction: "He works in a bank."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está trabajando en un banco temporalmente. (rol actual)",
      traduction: "He is working in a bank temporarily. (current role)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha trabajado en un banco desde 2020. (duración)",
      traduction: "He has worked in a bank since 2020. (duration)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ha estado trabajando en un banco últimamente. (enfoque reciente)",
      traduction: "He has been working in a bank lately. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él trabajó en un banco el año pasado.",
      traduction: "He worked in a bank last year."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba trabajando en un banco cuando lo ascendieron. (interrupción)",
      traduction: "He was working in a bank when promoted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había trabajado en un banco antes de cambiar de carrera. (experiencia previa)",
      traduction: "He had worked in a bank before switching careers. (prior experience)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevaba una década trabajando en un banco. (duración prolongada)",
      traduction: "He had been working in a bank for a decade. (long duration)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él trabajará en un banco el próximo año.",
      traduction: "He will work in a bank next year."
    },
    {
      tense: "futureContinuous",
      phrase: "Estará trabajando en un banco para entonces. (rol futuro)",
      traduction: "He will be working in a bank by then. (future role)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habrá trabajado en un banco durante 5 años. (hito)",
      traduction: "He will have worked in a bank for 5 years. (milestone)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habrá estado trabajando allí durante 60 meses. (énfasis en duración)",
      traduction: "He'll have been working there for 60 months. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "El sol se pone en el oeste.",
      traduction: "The sun sets in the west."
    },
    {
      tense: "presentContinuous",
      phrase: "El sol se está poniendo en el oeste ahora. (momento actual)",
      traduction: "The sun is setting in the west now. (current moment)"
    },
    {
      tense: "presentPerfect",
      phrase: "El sol se ha puesto en el oeste hoy. (acción completada)",
      traduction: "The sun has set in the west today. (completed action)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "El sol ha estado poniéndose más tarde últimamente. (patrón cambiante)",
      traduction: "The sun has been setting later recently. (changing pattern)"
    },
    {
      tense: "simplePast",
      phrase: "El sol se puso en el oeste ayer.",
      traduction: "The sun set in the west yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "El sol se estaba poniendo cuando llegamos. (acción simultánea)",
      traduction: "The sun was setting as we arrived. (simultaneous action)"
    },
    {
      tense: "pastPerfect",
      phrase: "El sol ya se había puesto antes de terminar la caminata. (acción previa)",
      traduction: "The sun had set before the hike ended. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "El sol había estado poniéndose más temprano el mes pasado. (patrón pasado)",
      traduction: "The sun had been setting earlier last month. (past pattern)"
    },
    {
      tense: "simpleFuture",
      phrase: "El sol se pondrá en el oeste mañana.",
      traduction: "The sun will set in the west tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "El sol estará poniéndose a las 6:30 PM. (hora específica)",
      traduction: "The sun will be setting at 6:30 PM. (specific time)"
    },
    {
      tense: "futurePerfect",
      phrase: "El sol ya se habrá puesto para las 7 PM. (completado)",
      traduction: "The sun will have set by 7 PM. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "El sol llevará 30 minutos poniéndose. (énfasis en duración)",
      traduction: "The sun will have been setting for 30 minutes. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Tomo café todas las mañanas.",
      traduction: "I drink coffee every morning."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy tomando café todas las mañanas últimamente. (rutina temporal)",
      traduction: "I am drinking coffee every morning these days. (temporal routine)"
    },
    {
      tense: "presentPerfect",
      phrase: "He tomado café todas las mañanas esta semana. (período reciente)",
      traduction: "I have drunk coffee every morning this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado tomando café todas las mañanas para mantenerme despierto. (esfuerzo continuo)",
      traduction: "I have been drinking coffee every morning to stay awake. (ongoing effort)"
    },
    {
      tense: "simplePast",
      phrase: "Tomé café todas las mañanas la semana pasada.",
      traduction: "I drank coffee every morning last week."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba tomando café cuando sonó el teléfono. (acción interrumpida)",
      traduction: "I was drinking coffee when the phone rang. (interrupted action)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había tomado café antes de la reunión. (acción previa)",
      traduction: "I had drunk coffee before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevaba años tomando café todas las mañanas. (duración previa)",
      traduction: "I had been drinking coffee every morning for years. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Tomaré café todas las mañanas la próxima semana.",
      traduction: "I will drink coffee every morning next week."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré tomando café a las 8 AM. (plan específico)",
      traduction: "I will be drinking coffee at 8 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré tomado café todas las mañanas para el viernes. (futuro completado)",
      traduction: "I will have drunk coffee every morning by Friday. (completed future)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado tomando café por 10 años. (duración hasta el futuro)",
      traduction: "I will have been drinking coffee for 10 years. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella estudia inglés todas las tardes.",
      traduction: "She studies English every afternoon."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está estudiando inglés intensamente esta tarde. (enfoque actual)",
      traduction: "She is studying English intensely this afternoon. (current focus)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha estudiado inglés todos los días este mes. (tiempo reciente)",
      traduction: "She has studied English every day this month. (recent time)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado estudiando inglés para el examen. (enfoque reciente)",
      traduction: "She has been studying English for the exam. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella estudió inglés ayer por la tarde.",
      traduction: "She studied English yesterday afternoon."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba estudiando inglés cuando llegó su amiga. (interrupción)",
      traduction: "She was studying English when her friend arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ella ya había estudiado inglés antes de la cena. (acción previa)",
      traduction: "She had studied English before dinner. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ella había estado estudiando inglés por horas. (duración previa)",
      traduction: "She had been studying English for hours. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella estudiará inglés mañana por la tarde.",
      traduction: "She will study English tomorrow afternoon."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará estudiando inglés a las 4 PM. (programado)",
      traduction: "She will be studying English at 4 PM. (scheduled)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá estudiado inglés para el final del mes. (completado)",
      traduction: "She will have studied English by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado estudiando 2 horas seguidas. (énfasis en duración)",
      traduction: "She will have been studying for 2 hours straight. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Necesitamos más sillas para la reunión.",
      traduction: "We need more chairs for the meeting."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos necesitando más sillas para la reunión. (necesidad temporal)",
      traduction: "We are needing more chairs for the meeting. (temporary need)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos necesitado más sillas para la reunión esta semana. (período reciente)",
      traduction: "We have needed more chairs for the meeting this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado necesitando más sillas desde la expansión del equipo. (enfoque continuo)",
      traduction: "We have been needing more chairs since the team expanded. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Necesitamos más sillas para la reunión ayer.",
      traduction: "We needed more chairs for the meeting yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos necesitando más sillas cuando llegó el cliente. (necesidad interrumpida)",
      traduction: "We were needing more chairs when the client arrived. (interrupted need)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos necesitado más sillas antes de empezar. (acción previa)",
      traduction: "We had needed more chairs before starting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevábamos horas necesitando más sillas antes de la reunión. (duración previa)",
      traduction: "We had been needing more chairs for hours before the meeting. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Necesitaremos más sillas para la reunión la próxima semana.",
      traduction: "We will need more chairs for the meeting next week."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré necesitando más sillas a las 3 PM. (plan específico)",
      traduction: "I will be needing more chairs at 3 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos necesitado más sillas para el viernes. (futuro completado)",
      traduction: "We will have needed more chairs by Friday. (completed future)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado necesitando más sillas por horas. (énfasis en duración)",
      traduction: "I will have been needing more chairs for hours. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él habla tres idiomas.",
      traduction: "He speaks three languages."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está hablando tres idiomas en su nuevo trabajo. (situación actual)",
      traduction: "He is speaking three languages at his new job. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha hablado tres idiomas desde que era niño. (duración)",
      traduction: "He has spoken three languages since childhood. (duration)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado hablando tres idiomas para mejorar su fluidez. (enfoque reciente)",
      traduction: "He has been speaking three languages to improve fluency. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él habló tres idiomas durante su viaje.",
      traduction: "He spoke three languages during his trip."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba hablando tres idiomas cuando lo conocí. (acción interrumpida)",
      traduction: "He was speaking three languages when I met him. (interrupted action)"
    },
    {
      tense: "pastPerfect",
      phrase: "Él ya había hablado tres idiomas antes de mudarse al extranjero. (acción previa)",
      traduction: "He had spoken three languages before moving abroad. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado hablando tres idiomas por horas en la conferencia. (duración previa)",
      traduction: "He had been speaking three languages for hours at the conference. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él hablará tres idiomas en su próximo proyecto.",
      traduction: "He will speak three languages in his next project."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará hablando tres idiomas en la reunión de mañana. (programado)",
      traduction: "He will be speaking three languages at tomorrow's meeting. (scheduled)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá hablado tres idiomas para el final del año. (completado)",
      traduction: "He will have spoken three languages by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado hablando tres idiomas por una hora. (énfasis en duración)",
      traduction: "He will have been speaking three languages for an hour. (duration emphasis)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos viven en Nueva York.",
      traduction: "They live in New York."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están viviendo en Nueva York temporalmente. (situación actual)",
      traduction: "They are living in New York temporarily. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han vivido en Nueva York desde 2020. (duración)",
      traduction: "They have lived in New York since 2020. (duration)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado viviendo en Nueva York por trabajo. (enfoque reciente)",
      traduction: "They have been living in New York for work. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos vivieron en Nueva York el año pasado.",
      traduction: "They lived in New York last year."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban viviendo en Nueva York cuando la pandemia comenzó. (interrupción)",
      traduction: "They were living in New York when the pandemic began. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ellos ya habían vivido en Nueva York antes de mudarse a Boston. (acción previa)",
      traduction: "They had lived in New York before moving to Boston. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado viviendo en Nueva York por una década. (duración previa)",
      traduction: "They had been living in New York for a decade. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos vivirán en Nueva York el próximo año.",
      traduction: "They will live in New York next year."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán viviendo en Nueva York en 2025. (plan específico)",
      traduction: "They will be living in New York in 2025. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán vivido en Nueva York por 5 años. (hito)",
      traduction: "They will have lived in New York for 5 years. (milestone)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Llevarán viviendo en Nueva York por una década. (duración hasta el futuro)",
      traduction: "They will have been living in New York for a decade. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella disfruta leer novelas.",
      traduction: "She enjoys reading novels."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está disfrutando leer novelas actualmente. (actividad temporal)",
      traduction: "She is enjoying reading novels lately. (temporary activity)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha disfrutado leer novelas este año. (período reciente)",
      traduction: "She has enjoyed reading novels this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado disfrutando leer novelas por horas. (enfoque continuo)",
      traduction: "She has been enjoying reading novels for hours. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella disfrutó leer novelas el mes pasado.",
      traduction: "She enjoyed reading novels last month."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba disfrutando una novela cuando llamaste. (interrupción)",
      traduction: "She was enjoying a novel when you called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ella ya había disfrutado leer novelas antes de la universidad. (acción previa)",
      traduction: "She had enjoyed reading novels before college. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ella había estado disfrutando novelas por años antes de abandonarlas. (duración previa)",
      traduction: "She had been enjoying novels for years before quitting. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella disfrutará leer novelas el próximo verano.",
      traduction: "She will enjoy reading novels next summer."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará disfrutando una novela a las 8 PM. (plan específico)",
      traduction: "She will be enjoying a novel at 8 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá disfrutado 10 novelas para fin de año. (completado)",
      traduction: "She will have enjoyed 10 novels by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado disfrutando novelas por una década. (duración hasta el futuro)",
      traduction: "She will have been enjoying novels for a decade. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Siempre desayuno antes de ir al trabajo.",
      traduction: "I always eat breakfast before work."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy desayunando antes de ir al trabajo como rutina. (enfoque actual)",
      traduction: "I am eating breakfast before work as a routine. (current focus)"
    },
    {
      tense: "presentPerfect",
      phrase: "He desayunado antes de ir al trabajo toda mi vida. (duración)",
      traduction: "I have eaten breakfast before work all my life. (duration)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado desayunando temprano para llegar puntual. (enfoque reciente)",
      traduction: "I have been eating breakfast early to arrive on time. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Desayuné antes de ir al trabajo ayer.",
      traduction: "I ate breakfast before work yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba desayunando cuando sonó la alarma. (interrupción)",
      traduction: "I was eating breakfast when the alarm rang. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había desayunado antes de la reunión matutina. (acción previa)",
      traduction: "I had eaten breakfast before the morning meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevaba años desayunando antes de trabajar. (duración previa)",
      traduction: "I had been eating breakfast before work for years. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Desayunaré antes de ir al trabajo mañana.",
      traduction: "I will eat breakfast before work tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré desayunando a las 7 AM. (plan específico)",
      traduction: "I will be eating breakfast at 7 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré desayunado antes de la conferencia de las 9 AM. (completado)",
      traduction: "I will have eaten breakfast before the 9 AM conference. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado desayunando por 30 minutos. (duración hasta el futuro)",
      traduction: "I will have been eating breakfast for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Visitamos a nuestros abuelos en las vacaciones.",
      traduction: "We visit our grandparents on holidays."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos visitando a nuestros abuelos esta semana. (situación temporal)",
      traduction: "We are visiting our grandparents this week. (temporary situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos visitado a nuestros abuelos cada Navidad desde 2010. (duración)",
      traduction: "We have visited our grandparents every Christmas since 2010. (duration)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado visitando a nuestros abuelos más seguido. (enfoque reciente)",
      traduction: "We have been visiting our grandparents more often. (recent focus)"
    },
    {
      tense: "simplePast",
      phrase: "Visitamos a nuestros abuelos el verano pasado.",
      traduction: "We visited our grandparents last summer."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos visitando a nuestros abuelos cuando llegó la tormenta. (interrupción)",
      traduction: "We were visiting our grandparents when the storm hit. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos visitado a nuestros abuelos antes de la pandemia. (acción previa)",
      traduction: "We had visited our grandparents before the pandemic. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevábamos décadas visitando a nuestros abuelos anualmente. (duración previa)",
      traduction: "We had been visiting our grandparents annually for decades. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Visitaremos a nuestros abuelos en las próximas vacaciones.",
      traduction: "We will visit our grandparents on the upcoming holidays."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré visitando a mis abuelos el 24 de diciembre. (plan específico)",
      traduction: "I will be visiting my grandparents on December 24th. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos visitado a nuestros abuelos para el final del año. (completado)",
      traduction: "We will have visited our grandparents by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado visitando a nuestros abuelos por una semana. (duración hasta el futuro)",
      traduction: "We will have been visiting our grandparents for a week. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él usualmente camina a la escuela.",
      traduction: "He usually walks to school."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está caminando a la escuela ahora mismo. (acción actual)",
      traduction: "He is walking to school right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha caminado a la escuela esta semana. (período reciente)",
      traduction: "He has walked to school this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado caminando a la escuela para mantenerse activo. (enfoque continuo)",
      traduction: "He has been walking to school to stay active. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él caminó a la escuela ayer.",
      traduction: "He walked to school yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba caminando a la escuela cuando comenzó a llover. (interrupción)",
      traduction: "He was walking to school when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Él ya había caminado a la escuela antes de que lo buscaran en auto. (acción previa)",
      traduction: "He had walked to school before they picked him up by car. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado caminando a la escuela por meses antes de cambiar de ruta. (duración previa)",
      traduction: "He had been walking to school for months before changing routes. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él caminará a la escuela mañana.",
      traduction: "He will walk to school tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará caminando a la escuela a las 8 AM. (plan específico)",
      traduction: "He will be walking to school at 8 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá caminado a la escuela 5 veces para el viernes. (completado)",
      traduction: "He will have walked to school 5 times by Friday. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado caminando a la escuela por una hora. (duración hasta el futuro)",
      traduction: "He will have been walking to school for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "A ella le gusta ver películas por la noche.",
      traduction: "She likes to watch movies at night."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está viendo películas por la noche últimamente. (actividad temporal)",
      traduction: "She is watching movies at night lately. (temporary activity)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha visto películas por la noche este mes. (período reciente)",
      traduction: "She has watched movies at night this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado viendo películas por la noche para relajarse. (enfoque continuo)",
      traduction: "She has been watching movies at night to relax. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella vio películas por la noche anoche.",
      traduction: "She watched movies at night last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba viendo una película cuando llamaste. (interrupción)",
      traduction: "She was watching a movie when you called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ella ya había visto una película antes de acostarse. (acción previa)",
      traduction: "She had watched a movie before going to bed. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ella había estado viendo películas por horas antes de dormir. (duración previa)",
      traduction: "She had been watching movies for hours before sleeping. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella verá películas por la noche mañana.",
      traduction: "She will watch movies at night tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará viendo una película a las 9 PM. (plan específico)",
      traduction: "She will be watching a movie at 9 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá visto 3 películas para el final de la semana. (completado)",
      traduction: "She will have watched 3 movies by the end of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado viendo películas por 2 horas. (duración hasta el futuro)",
      traduction: "She will have been watching movies for 2 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Limpio mi habitación todos los sábados.",
      traduction: "I clean my room every Saturday."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy limpiando mi habitación ahora mismo. (acción actual)",
      traduction: "I am cleaning my room right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He limpiado mi habitación todos los sábados este mes. (período reciente)",
      traduction: "I have cleaned my room every Saturday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado limpiando mi habitación más seguido. (enfoque continuo)",
      traduction: "I have been cleaning my room more often. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Limpié mi habitación el sábado pasado.",
      traduction: "I cleaned my room last Saturday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba limpiando mi habitación cuando me llamaron. (interrupción)",
      traduction: "I was cleaning my room when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había limpiado mi habitación antes de salir. (acción previa)",
      traduction: "I had cleaned my room before leaving. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado limpiando mi habitación durante horas antes de terminar. (duración previa)",
      traduction: "I had been cleaning my room for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Limpiaré mi habitación el próximo sábado.",
      traduction: "I will clean my room next Saturday."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré limpiando mi habitación a las 10 AM. (plan específico)",
      traduction: "I will be cleaning my room at 10 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré limpiado mi habitación para el mediodía. (completado)",
      traduction: "I will have cleaned my room by noon. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado limpiando mi habitación por una hora. (duración hasta el futuro)",
      traduction: "I will have been cleaning my room for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos escuchan música mientras estudian.",
      traduction: "They listen to music while studying."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están escuchando música mientras estudian ahora. (situación actual)",
      traduction: "They are listening to music while studying right now. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han escuchado música mientras estudian esta semana. (período reciente)",
      traduction: "They have listened to music while studying this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado escuchando música mientras estudian para concentrarse. (enfoque continuo)",
      traduction: "They have been listening to music while studying to focus. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos escucharon música mientras estudiaban anoche.",
      traduction: "They listened to music while studying last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban escuchando música cuando entró su madre. (interrupción)",
      traduction: "They were listening to music when their mother came in. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ellos ya habían escuchado música antes de comenzar a estudiar. (acción previa)",
      traduction: "They had listened to music before starting to study. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado escuchando música mientras estudiaban por horas. (duración previa)",
      traduction: "They had been listening to music while studying for hours. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos escucharán música mientras estudian mañana.",
      traduction: "They will listen to music while studying tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán escuchando música mientras estudian a las 7 PM. (plan específico)",
      traduction: "They will be listening to music while studying at 7 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán escuchado música mientras estudian por 3 horas para entonces. (completado)",
      traduction: "They will have listened to music while studying for 3 hours by then. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado escuchando música mientras estudian por 2 horas. (duración hasta el futuro)",
      traduction: "They will have been listening to music while studying for 2 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Jugamos al baloncesto después de la escuela.",
      traduction: "We play basketball after school."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos jugando al baloncesto después de la escuela ahora. (actividad actual)",
      traduction: "We are playing basketball after school right now. (current activity)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos jugado al baloncesto después de la escuela esta semana. (período reciente)",
      traduction: "We have played basketball after school this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado jugando al baloncesto para mejorar nuestras habilidades. (enfoque continuo)",
      traduction: "We have been playing basketball to improve our skills. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Jugamos al baloncesto después de la escuela ayer.",
      traduction: "We played basketball after school yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos jugando al baloncesto cuando empezó a llover. (interrupción)",
      traduction: "We were playing basketball when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos jugado al baloncesto antes de que oscureciera. (acción previa)",
      traduction: "We had played basketball before it got dark. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevábamos horas jugando al baloncesto antes de irnos. (duración previa)",
      traduction: "We had been playing basketball for hours before leaving. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Jugaremos al baloncesto después de la escuela mañana.",
      traduction: "We will play basketball after school tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré jugando al baloncesto a las 4 PM. (plan específico)",
      traduction: "I will be playing basketball at 4 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos jugado al baloncesto para las 5 PM. (completado)",
      traduction: "We will have played basketball by 5 PM. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado jugando al baloncesto por una hora. (duración hasta el futuro)",
      traduction: "We will have been playing basketball for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él escribe correos electrónicos a su jefe diariamente.",
      traduction: "He writes emails to his boss daily."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está escribiendo correos electrónicos a su jefe ahora. (acción actual)",
      traduction: "He is writing emails to his boss right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha escrito correos electrónicos a su jefe esta semana. (período reciente)",
      traduction: "He has written emails to his boss this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado escribiendo correos electrónicos para mantenerse al día. (enfoque continuo)",
      traduction: "He has been writing emails to stay on top of things. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él escribió correos electrónicos a su jefe ayer.",
      traduction: "He wrote emails to his boss yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba escribiendo un correo electrónico cuando lo interrumpieron. (interrupción)",
      traduction: "He was writing an email when he was interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había escrito varios correos electrónicos antes de la reunión. (acción previa)",
      traduction: "He had written several emails before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado escribiendo correos electrónicos durante horas antes de terminar. (duración previa)",
      traduction: "He had been writing emails for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él escribirá correos electrónicos a su jefe mañana.",
      traduction: "He will write emails to his boss tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará escribiendo correos electrónicos a las 10 AM. (plan específico)",
      traduction: "He will be writing emails at 10 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá escrito 5 correos electrónicos para el mediodía. (completado)",
      traduction: "He will have written 5 emails by noon. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado escribiendo correos electrónicos por 2 horas. (duración hasta el futuro)",
      traduction: "He will have been writing emails for 2 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella cocina la cena para su familia.",
      traduction: "She cooks dinner for her family."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está cocinando la cena para su familia ahora. (acción actual)",
      traduction: "She is cooking dinner for her family right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha cocinado la cena para su familia esta semana. (período reciente)",
      traduction: "She has cooked dinner for her family this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado cocinando la cena para su familia más seguido. (enfoque continuo)",
      traduction: "She has been cooking dinner for her family more often. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella cocinó la cena para su familia anoche.",
      traduction: "She cooked dinner for her family last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba cocinando la cena cuando llegaron los invitados. (interrupción)",
      traduction: "She was cooking dinner when the guests arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había cocinado la cena antes de que todos se sentaran. (acción previa)",
      traduction: "She had cooked dinner before everyone sat down. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ella había estado cocinando la cena por horas antes de terminar. (duración previa)",
      traduction: "She had been cooking dinner for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella cocinará la cena para su familia mañana.",
      traduction: "She will cook dinner for her family tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará cocinando la cena a las 7 PM. (plan específico)",
      traduction: "She will be cooking dinner at 7 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá cocinado la cena para las 8 PM. (completado)",
      traduction: "She will have cooked dinner by 8 PM. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado cocinando la cena por una hora. (duración hasta el futuro)",
      traduction: "She will have been cooking dinner for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Leo libros en mi tiempo libre.",
      traduction: "I read books in my free time."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy leyendo un libro en mi tiempo libre ahora. (acción actual)",
      traduction: "I am reading a book in my free time right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He leído libros en mi tiempo libre este mes. (período reciente)",
      traduction: "I have read books in my free time this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado leyendo libros para relajarme. (enfoque continuo)",
      traduction: "I have been reading books to relax. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Leí un libro en mi tiempo libre ayer.",
      traduction: "I read a book in my free time yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba leyendo un libro cuando me llamaron. (interrupción)",
      traduction: "I was reading a book when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había leído un libro antes de salir. (acción previa)",
      traduction: "I had read a book before going out. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado leyendo un libro durante horas antes de terminarlo. (duración previa)",
      traduction: "I had been reading a book for hours before finishing it. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Leeré un libro en mi tiempo libre mañana.",
      traduction: "I will read a book in my free time tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré leyendo un libro a las 9 PM. (plan específico)",
      traduction: "I will be reading a book at 9 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré leído 3 libros para el final del mes. (completado)",
      traduction: "I will have read 3 books by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado leyendo libros por 2 horas. (duración hasta el futuro)",
      traduction: "I will have been reading books for 2 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Celebramos cumpleaños con pastel.",
      traduction: "We celebrate birthdays with cake."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos celebrando un cumpleaños con pastel ahora. (acción actual)",
      traduction: "We are celebrating a birthday with cake right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos celebrado cumpleaños con pastel este año. (período reciente)",
      traduction: "We have celebrated birthdays with cake this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado celebrando cumpleaños con pastel más seguido. (enfoque continuo)",
      traduction: "We have been celebrating birthdays with cake more often. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Celebramos un cumpleaños con pastel ayer.",
      traduction: "We celebrated a birthday with cake yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos celebrando un cumpleaños cuando llegó la tía. (interrupción)",
      traduction: "We were celebrating a birthday when aunt arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos celebrado un cumpleaños antes de que trajeran el pastel. (acción previa)",
      traduction: "We had celebrated a birthday before they brought the cake. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Llevábamos horas celebrando cumpleaños con pastel antes de terminar. (duración previa)",
      traduction: "We had been celebrating birthdays with cake for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Celebraremos cumpleaños con pastel mañana.",
      traduction: "We will celebrate birthdays with cake tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré celebrando un cumpleaños con pastel a las 8 PM. (plan específico)",
      traduction: "I will be celebrating a birthday with cake at 8 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos celebrado 3 cumpleaños con pastel para fin de año. (completado)",
      traduction: "We will have celebrated 3 birthdays with cake by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado celebrando cumpleaños con pastel por una hora. (duración hasta el futuro)",
      traduction: "We will have been celebrating birthdays with cake for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él ve televisión antes de dormir.",
      traduction: "He watches TV before bed."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está viendo televisión antes de dormir ahora. (acción actual)",
      traduction: "He is watching TV before bed right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha visto televisión antes de dormir esta semana. (período reciente)",
      traduction: "He has watched TV before bed this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado viendo televisión para relajarse antes de dormir. (enfoque continuo)",
      traduction: "He has been watching TV to relax before bed. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él vio televisión antes de dormir anoche.",
      traduction: "He watched TV before bed last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba viendo televisión cuando se quedó dormido. (interrupción)",
      traduction: "He was watching TV when he fell asleep. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había visto televisión antes de acostarse temprano. (acción previa)",
      traduction: "He had watched TV before going to bed early. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado viendo televisión durante horas antes de apagarla. (duración previa)",
      traduction: "He had been watching TV for hours before turning it off. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él verá televisión antes de dormir mañana.",
      traduction: "He will watch TV before bed tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará viendo televisión a las 10 PM. (plan específico)",
      traduction: "He will be watching TV at 10 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá visto televisión por 2 horas antes de dormir. (completado)",
      traduction: "He will have watched TV for 2 hours before sleeping. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado viendo televisión por 3 horas. (duración hasta el futuro)",
      traduction: "He will have been watching TV for 3 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos viajan a la playa cada verano.",
      traduction: "They travel to the beach every summer."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están viajando a la playa este verano. (situación actual)",
      traduction: "They are traveling to the beach this summer. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han viajado a la playa todos los veranos desde 2015. (duración)",
      traduction: "They have traveled to the beach every summer since 2015. (duration)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado viajando a la playa más seguido últimamente. (enfoque continuo)",
      traduction: "They have been traveling to the beach more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos viajaron a la playa el verano pasado.",
      traduction: "They traveled to the beach last summer."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban viajando a la playa cuando se descompuso el auto. (interrupción)",
      traduction: "They were traveling to the beach when the car broke down. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ellos ya habían viajado a la playa antes de cancelar el viaje. (acción previa)",
      traduction: "They had traveled to the beach before canceling the trip. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado viajando a la playa durante años antes de cambiar de destino. (duración previa)",
      traduction: "They had been traveling to the beach for years before changing destinations. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos viajarán a la playa el próximo verano.",
      traduction: "They will travel to the beach next summer."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán viajando a la playa en julio. (plan específico)",
      traduction: "They will be traveling to the beach in July. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán viajado a la playa 5 veces para el final del año. (completado)",
      traduction: "They will have traveled to the beach 5 times by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado viajando a la playa por una década. (duración hasta el futuro)",
      traduction: "They will have been traveling to the beach for a decade. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ayudo a mi mamá con los platos.",
      traduction: "I help my mom with the dishes."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy ayudando a mi mamá con los platos ahora. (acción actual)",
      traduction: "I am helping my mom with the dishes right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He ayudado a mi mamá con los platos esta semana. (período reciente)",
      traduction: "I have helped my mom with the dishes this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado ayudando a mi mamá con los platos más seguido. (enfoque continuo)",
      traduction: "I have been helping my mom with the dishes more often. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ayudé a mi mamá con los platos ayer.",
      traduction: "I helped my mom with the dishes yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba ayudando a mi mamá cuando llegaron visitas. (interrupción)",
      traduction: "I was helping my mom when visitors arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había ayudado a mi mamá antes de salir. (acción previa)",
      traduction: "I had helped my mom before leaving. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado ayudando a mi mamá con los platos durante horas. (duración previa)",
      traduction: "I had been helping my mom with the dishes for hours. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ayudaré a mi mamá con los platos mañana.",
      traduction: "I will help my mom with the dishes tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré ayudando a mi mamá con los platos a las 7 PM. (plan específico)",
      traduction: "I will be helping my mom with the dishes at 7 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré ayudado a mi mamá con los platos para el final de la cena. (completado)",
      traduction: "I will have helped my mom with the dishes by the end of dinner. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado ayudando a mi mamá con los platos por una hora. (duración hasta el futuro)",
      traduction: "I will have been helping my mom with the dishes for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella canta en el coro de la escuela.",
      traduction: "She sings in the school choir."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está cantando en el coro de la escuela ahora. (acción actual)",
      traduction: "She is singing in the school choir right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha cantado en el coro de la escuela este año. (período reciente)",
      traduction: "She has sung in the school choir this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado cantando en el coro para mejorar su voz. (enfoque continuo)",
      traduction: "She has been singing in the choir to improve her voice. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella cantó en el coro de la escuela el mes pasado.",
      traduction: "She sang in the school choir last month."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba cantando cuando entró el director. (interrupción)",
      traduction: "She was singing when the principal walked in. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había cantado en el coro antes de unirse al grupo. (acción previa)",
      traduction: "She had sung in the choir before joining the group. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ella había estado cantando en el coro por años antes de dejarlo. (duración previa)",
      traduction: "She had been singing in the choir for years before quitting. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella cantará en el coro de la escuela el próximo semestre.",
      traduction: "She will sing in the school choir next semester."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará cantando en el coro a las 3 PM. (plan específico)",
      traduction: "She will be singing in the choir at 3 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá cantado en el coro 10 veces para fin de año. (completado)",
      traduction: "She will have sung in the choir 10 times by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado cantando en el coro por una hora. (duración hasta el futuro)",
      traduction: "She will have been singing in the choir for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Aprendemos algo nuevo todos los días.",
      traduction: "We learn something new every day."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos aprendiendo algo nuevo hoy. (acción actual)",
      traduction: "We are learning something new today. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos aprendido algo nuevo esta semana. (período reciente)",
      traduction: "We have learned something new this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado aprendiendo cosas nuevas para crecer. (enfoque continuo)",
      traduction: "We have been learning new things to grow. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Aprendimos algo nuevo ayer.",
      traduction: "We learned something new yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos aprendiendo algo nuevo cuando nos interrumpieron. (interrupción)",
      traduction: "We were learning something new when we got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos aprendido algo nuevo antes de la clase. (acción previa)",
      traduction: "We had learned something new before the class. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado aprendiendo algo nuevo durante horas antes de terminar. (duración previa)",
      traduction: "We had been learning something new for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Aprenderemos algo nuevo mañana.",
      traduction: "We will learn something new tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré aprendiendo algo nuevo a las 10 AM. (plan específico)",
      traduction: "I will be learning something new at 10 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos aprendido algo nuevo para el final del curso. (completado)",
      traduction: "We will have learned something new by the end of the course. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado aprendiendo algo nuevo por una hora. (duración hasta el futuro)",
      traduction: "We will have been learning something new for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él visita a sus amigos los fines de semana.",
      traduction: "He visits his friends on the weekend."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está visitando a sus amigos este fin de semana. (situación actual)",
      traduction: "He is visiting his friends this weekend. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha visitado a sus amigos todos los fines de semana este mes. (período reciente)",
      traduction: "He has visited his friends every weekend this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado visitando a sus amigos más seguido últimamente. (enfoque continuo)",
      traduction: "He has been visiting his friends more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él visitó a sus amigos el fin de semana pasado.",
      traduction: "He visited his friends last weekend."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba visitando a sus amigos cuando lo llamaron. (interrupción)",
      traduction: "He was visiting his friends when he got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había visitado a sus amigos antes de irse de viaje. (acción previa)",
      traduction: "He had visited his friends before going on a trip. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado visitando a sus amigos regularmente durante años. (duración previa)",
      traduction: "He had been visiting his friends regularly for years. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él visitará a sus amigos el próximo fin de semana.",
      traduction: "He will visit his friends next weekend."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará visitando a sus amigos a las 5 PM. (plan específico)",
      traduction: "He will be visiting his friends at 5 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá visitado a sus amigos 3 veces para fin de mes. (completado)",
      traduction: "He will have visited his friends 3 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado visitando a sus amigos por una hora. (duración hasta el futuro)",
      traduction: "He will have been visiting his friends for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos compran víveres los viernes.",
      traduction: "They shop for groceries on Fridays."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están comprando víveres ahora mismo. (acción actual)",
      traduction: "They are shopping for groceries right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han comprado víveres cada viernes este mes. (período reciente)",
      traduction: "They have shopped for groceries every Friday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado comprando víveres más seguido últimamente. (enfoque continuo)",
      traduction: "They have been shopping for groceries more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos compraron víveres el viernes pasado.",
      traduction: "They shopped for groceries last Friday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban comprando víveres cuando se encontraron con su vecino. (interrupción)",
      traduction: "They were shopping for groceries when they met their neighbor. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían comprado víveres antes de que cerrara la tienda. (acción previa)",
      traduction: "They had shopped for groceries before the store closed. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado comprando víveres durante toda la mañana antes de terminar. (duración previa)",
      traduction: "They had been shopping for groceries all morning before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos comprarán víveres el próximo viernes.",
      traduction: "They will shop for groceries next Friday."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán comprando víveres a las 4 PM. (plan específico)",
      traduction: "They will be shopping for groceries at 4 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán comprado víveres para el final de la semana. (completado)",
      traduction: "They will have shopped for groceries by the end of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado comprando víveres por una hora. (duración hasta el futuro)",
      traduction: "They will have been shopping for groceries for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Corro en el parque todas las mañanas.",
      traduction: "I run in the park every morning."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy corriendo en el parque ahora mismo. (acción actual)",
      traduction: "I am running in the park right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He corrido en el parque todas las mañanas esta semana. (período reciente)",
      traduction: "I have run in the park every morning this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado corriendo en el parque para mantenerme en forma. (enfoque continuo)",
      traduction: "I have been running in the park to stay fit. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Corrí en el parque ayer por la mañana.",
      traduction: "I ran in the park yesterday morning."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba corriendo en el parque cuando empezó a llover. (interrupción)",
      traduction: "I was running in the park when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había corrido en el parque antes de desayunar. (acción previa)",
      traduction: "I had run in the park before breakfast. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado corriendo en el parque durante una hora antes de terminar. (duración previa)",
      traduction: "I had been running in the park for an hour before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Correré en el parque mañana por la mañana.",
      traduction: "I will run in the park tomorrow morning."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré corriendo en el parque a las 7 AM. (plan específico)",
      traduction: "I will be running in the park at 7 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré corrido en el parque 5 veces para el viernes. (completado)",
      traduction: "I will have run in the park 5 times by Friday. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado corriendo en el parque por 30 minutos. (duración hasta el futuro)",
      traduction: "I will have been running in the park for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella llama a su mejor amiga todas las noches.",
      traduction: "She calls her best friend every night."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está llamando a su mejor amiga ahora mismo. (acción actual)",
      traduction: "She is calling her best friend right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha llamado a su mejor amiga todas las noches este mes. (período reciente)",
      traduction: "She has called her best friend every night this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado llamando a su mejor amiga para mantenerse en contacto. (enfoque continuo)",
      traduction: "She has been calling her best friend to stay in touch. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella llamó a su mejor amiga anoche.",
      traduction: "She called her best friend last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba llamando a su mejor amiga cuando se quedó sin batería. (interrupción)",
      traduction: "She was calling her best friend when her phone died. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había llamado a su mejor amiga antes de cenar. (acción previa)",
      traduction: "She had called her best friend before dinner. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado llamando a su mejor amiga durante horas antes de colgar. (duración previa)",
      traduction: "She had been calling her best friend for hours before hanging up. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella llamará a su mejor amiga mañana por la noche.",
      traduction: "She will call her best friend tomorrow night."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará llamando a su mejor amiga a las 9 PM. (plan específico)",
      traduction: "She will be calling her best friend at 9 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá llamado a su mejor amiga 10 veces para fin de semana. (completado)",
      traduction: "She will have called her best friend 10 times by the weekend. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado llamando a su mejor amiga por 30 minutos. (duración hasta el futuro)",
      traduction: "She will have been calling her best friend for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Comemos juntos al mediodía.",
      traduction: "We eat lunch together at noon."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos comiendo juntos al mediodía hoy. (acción actual)",
      traduction: "We are eating lunch together at noon today. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos comido juntos al mediodía esta semana. (período reciente)",
      traduction: "We have eaten lunch together at noon this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado comiendo juntos al mediodía más seguido. (enfoque continuo)",
      traduction: "We have been eating lunch together at noon more often. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Comimos juntos al mediodía ayer.",
      traduction: "We ate lunch together at noon yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos comiendo juntos cuando llegó el jefe. (interrupción)",
      traduction: "We were eating lunch together when the boss arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos comido juntos antes de la reunión. (acción previa)",
      traduction: "We had eaten lunch together before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado comiendo juntos durante 30 minutos antes de terminar. (duración previa)",
      traduction: "We had been eating lunch together for 30 minutes before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Comeremos juntos al mediodía mañana.",
      traduction: "We will eat lunch together at noon tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré comiendo con ellos al mediodía. (plan específico)",
      traduction: "I will be eating with them at noon. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos comido juntos al mediodía para las 12:30 PM. (completado)",
      traduction: "We will have eaten lunch together by 12:30 PM. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado comiendo juntos por 45 minutos. (duración hasta el futuro)",
      traduction: "We will have been eating together for 45 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "A él le encanta jugar videojuegos.",
      traduction: "He loves playing video games."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está jugando videojuegos ahora mismo. (acción actual)",
      traduction: "He is playing video games right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha jugado videojuegos todos los días esta semana. (período reciente)",
      traduction: "He has played video games every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado jugando videojuegos durante horas. (enfoque continuo)",
      traduction: "He has been playing video games for hours. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él jugó videojuegos anoche.",
      traduction: "He played video games last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba jugando videojuegos cuando lo llamaron. (interrupción)",
      traduction: "He was playing video games when he got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había jugado videojuegos antes de estudiar. (acción previa)",
      traduction: "He had played video games before studying. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado jugando videojuegos durante horas antes de apagar la consola. (duración previa)",
      traduction: "He had been playing video games for hours before turning off the console. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él jugará videojuegos mañana por la tarde.",
      traduction: "He will play video games tomorrow afternoon."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará jugando videojuegos a las 8 PM. (plan específico)",
      traduction: "He will be playing video games at 8 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá jugado videojuegos por 2 horas para entonces. (completado)",
      traduction: "He will have played video games for 2 hours by then. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado jugando videojuegos por 3 horas. (duración hasta el futuro)",
      traduction: "He will have been playing video games for 3 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos disfrutan hacer senderismo en las montañas.",
      traduction: "They enjoy hiking in the mountains."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están haciendo senderismo en las montañas este fin de semana. (situación actual)",
      traduction: "They are hiking in the mountains this weekend. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han hecho senderismo en las montañas varias veces este año. (período reciente)",
      traduction: "They have hiked in the mountains several times this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado haciendo senderismo en las montañas para relajarse. (enfoque continuo)",
      traduction: "They have been hiking in the mountains to relax. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos hicieron senderismo en las montañas el verano pasado.",
      traduction: "They hiked in the mountains last summer."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban haciendo senderismo cuando comenzó a llover. (interrupción)",
      traduction: "They were hiking when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ellos ya habían hecho senderismo antes de acampar. (acción previa)",
      traduction: "They had hiked before camping. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado haciendo senderismo durante horas antes de descansar. (duración previa)",
      traduction: "They had been hiking for hours before resting. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos harán senderismo en las montañas el próximo verano.",
      traduction: "They will hike in the mountains next summer."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán haciendo senderismo en las montañas a las 10 AM. (plan específico)",
      traduction: "They will be hiking in the mountains at 10 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán hecho senderismo en las montañas 5 veces para el final del año. (completado)",
      traduction: "They will have hiked in the mountains 5 times by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado haciendo senderismo por 3 horas. (duración hasta el futuro)",
      traduction: "They will have been hiking for 3 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Practico piano una hora diariamente.",
      traduction: "I practice piano for an hour daily."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy practicando piano ahora mismo. (acción actual)",
      traduction: "I am practicing piano right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He practicado piano todos los días esta semana. (período reciente)",
      traduction: "I have practiced piano every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado practicando piano para mejorar mis habilidades. (enfoque continuo)",
      traduction: "I have been practicing piano to improve my skills. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Practiqué piano ayer por una hora.",
      traduction: "I practiced piano yesterday for an hour."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba practicando piano cuando llegó mi amigo. (interrupción)",
      traduction: "I was practicing piano when my friend arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había practicado piano antes de la cena. (acción previa)",
      traduction: "I had practiced piano before dinner. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado practicando piano durante horas antes de terminar. (duración previa)",
      traduction: "I had been practicing piano for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Practicaré piano mañana por una hora.",
      traduction: "I will practice piano tomorrow for an hour."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré practicando piano a las 7 PM. (plan específico)",
      traduction: "I will be practicing piano at 7 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré practicado piano 5 veces para el viernes. (completado)",
      traduction: "I will have practiced piano 5 times by Friday. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado practicando piano por una hora. (duración hasta el futuro)",
      traduction: "I will have been practicing piano for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella bebe agua después de hacer ejercicio.",
      traduction: "She drinks water after exercising."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está bebiendo agua después de hacer ejercicio ahora. (acción actual)",
      traduction: "She is drinking water after exercising right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha bebido agua después de hacer ejercicio esta semana. (período reciente)",
      traduction: "She has drunk water after exercising this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado bebiendo agua después de hacer ejercicio para mantenerse hidratada. (enfoque continuo)",
      traduction: "She has been drinking water after exercising to stay hydrated. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella bebió agua después de hacer ejercicio ayer.",
      traduction: "She drank water after exercising yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba bebiendo agua cuando terminó su rutina. (interrupción)",
      traduction: "She was drinking water when she finished her routine. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había bebido agua antes de ducharse. (acción previa)",
      traduction: "She had drunk water before showering. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ella había estado bebiendo agua regularmente después de hacer ejercicio. (duración previa)",
      traduction: "She had been drinking water regularly after exercising. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella beberá agua después de hacer ejercicio mañana.",
      traduction: "She will drink water after exercising tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará bebiendo agua a las 6 PM. (plan específico)",
      traduction: "She will be drinking water at 6 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá bebido agua después de hacer ejercicio 3 veces para entonces. (completado)",
      traduction: "She will have drunk water after exercising 3 times by then. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado bebiendo agua por 10 minutos. (duración hasta el futuro)",
      traduction: "She will have been drinking water for 10 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Empezamos a trabajar a las 9 a.m.",
      traduction: "We start work at 9 a.m."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos empezando a trabajar ahora mismo. (acción actual)",
      traduction: "We are starting work right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos empezado a trabajar a las 9 a.m. todos los días esta semana. (período reciente)",
      traduction: "We have started work at 9 a.m. every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado empezando a trabajar temprano para cumplir con los plazos. (enfoque continuo)",
      traduction: "We have been starting work early to meet deadlines. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Empezamos a trabajar a las 9 a.m. ayer.",
      traduction: "We started work at 9 a.m. yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos empezando a trabajar cuando nos llamaron. (interrupción)",
      traduction: "We were starting work when we got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos empezado a trabajar antes de que llegara el jefe. (acción previa)",
      traduction: "We had started work before the boss arrived. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado empezando a trabajar temprano durante días. (duración previa)",
      traduction: "We had been starting work early for days. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Empezaremos a trabajar a las 9 a.m. mañana.",
      traduction: "We will start work at 9 a.m. tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré empezando a trabajar a las 9 a.m. (plan específico)",
      traduction: "I will be starting work at 9 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos empezado a trabajar a las 9 a.m. para el final de la semana. (completado)",
      traduction: "We will have started work at 9 a.m. by the end of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado empezando a trabajar temprano por una hora. (duración hasta el futuro)",
      traduction: "We will have been starting work early for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él lee el periódico todos los días.",
      traduction: "He reads the newspaper every day."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está leyendo el periódico ahora mismo. (acción actual)",
      traduction: "He is reading the newspaper right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha leído el periódico todos los días esta semana. (período reciente)",
      traduction: "He has read the newspaper every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado leyendo el periódico para estar informado. (enfoque continuo)",
      traduction: "He has been reading the newspaper to stay informed. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él leyó el periódico ayer.",
      traduction: "He read the newspaper yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba leyendo el periódico cuando lo interrumpieron. (interrupción)",
      traduction: "He was reading the newspaper when he got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había leído el periódico antes de salir. (acción previa)",
      traduction: "He had read the newspaper before leaving. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado leyendo el periódico durante horas antes de terminarlo. (duración previa)",
      traduction: "He had been reading the newspaper for hours before finishing it. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él leerá el periódico mañana.",
      traduction: "He will read the newspaper tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará leyendo el periódico a las 8 AM. (plan específico)",
      traduction: "He will be reading the newspaper at 8 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá leído el periódico para el mediodía. (completado)",
      traduction: "He will have read the newspaper by noon. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado leyendo el periódico por 30 minutos. (duración hasta el futuro)",
      traduction: "He will have been reading the newspaper for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos van al cine una vez al mes.",
      traduction: "They go to the movies once a month."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están yendo al cine este fin de semana. (situación actual)",
      traduction: "They are going to the movies this weekend. (current situation)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han ido al cine varias veces este año. (período reciente)",
      traduction: "They have gone to the movies several times this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado yendo al cine más seguido últimamente. (enfoque continuo)",
      traduction: "They have been going to the movies more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos fueron al cine el mes pasado.",
      traduction: "They went to the movies last month."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban yendo al cine cuando comenzó a llover. (interrupción)",
      traduction: "They were going to the movies when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ellos ya habían ido al cine antes de la pandemia. (acción previa)",
      traduction: "They had gone to the movies before the pandemic. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado yendo al cine regularmente durante años. (duración previa)",
      traduction: "They had been going to the movies regularly for years. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos irán al cine el próximo mes.",
      traduction: "They will go to the movies next month."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán yendo al cine a las 7 PM. (plan específico)",
      traduction: "They will be going to the movies at 7 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán ido al cine 5 veces para fin de año. (completado)",
      traduction: "They will have gone to the movies 5 times by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado yendo al cine por una hora. (duración hasta el futuro)",
      traduction: "They will have been going to the movies for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Reviso mis correos electrónicos por la mañana.",
      traduction: "I check my emails in the morning."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy revisando mis correos electrónicos ahora mismo. (acción actual)",
      traduction: "I am checking my emails right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He revisado mis correos electrónicos esta semana. (período reciente)",
      traduction: "I have checked my emails this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado revisando mis correos electrónicos para mantenerme al día. (enfoque continuo)",
      traduction: "I have been checking my emails to stay up-to-date. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Revisé mis correos electrónicos ayer por la mañana.",
      traduction: "I checked my emails yesterday morning."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba revisando mis correos cuando sonó el teléfono. (interrupción)",
      traduction: "I was checking my emails when the phone rang. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había revisado mis correos antes de salir de casa. (acción previa)",
      traduction: "I had checked my emails before leaving home. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado revisando mis correos durante horas antes de terminar. (duración previa)",
      traduction: "I had been checking my emails for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Revisaré mis correos electrónicos mañana por la mañana.",
      traduction: "I will check my emails tomorrow morning."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré revisando mis correos a las 8 AM. (plan específico)",
      traduction: "I will be checking my emails at 8 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré revisado mis correos antes de la reunión. (completado)",
      traduction: "I will have checked my emails before the meeting. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado revisando mis correos por 30 minutos. (duración hasta el futuro)",
      traduction: "I will have been checking my emails for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella pasea a su perro por la tarde.",
      traduction: "She walks her dog in the evening."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está paseando a su perro ahora mismo. (acción actual)",
      traduction: "She is walking her dog right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha paseado a su perro todas las tardes esta semana. (período reciente)",
      traduction: "She has walked her dog every evening this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado paseando a su perro más seguido últimamente. (enfoque continuo)",
      traduction: "She has been walking her dog more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella paseó a su perro anoche.",
      traduction: "She walked her dog last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba paseando a su perro cuando comenzó a llover. (interrupción)",
      traduction: "She was walking her dog when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había paseado a su perro antes de cenar. (acción previa)",
      traduction: "She had walked her dog before dinner. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado paseando a su perro durante una hora antes de terminar. (duración previa)",
      traduction: "She had been walking her dog for an hour before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella paseará a su perro mañana por la tarde.",
      traduction: "She will walk her dog tomorrow evening."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará paseando a su perro a las 6 PM. (plan específico)",
      traduction: "She will be walking her dog at 6 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá paseado a su perro para las 7 PM. (completado)",
      traduction: "She will have walked her dog by 7 PM. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado paseando a su perro por 45 minutos. (duración hasta el futuro)",
      traduction: "She will have been walking her dog for 45 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Necesitamos terminar este proyecto pronto.",
      traduction: "We need to finish this project soon."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos trabajando en terminar este proyecto ahora mismo. (acción actual)",
      traduction: "We are working on finishing this project right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos necesitado terminar este proyecto desde hace días. (período reciente)",
      traduction: "We have needed to finish this project for days. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado intentando terminar este proyecto durante horas. (enfoque continuo)",
      traduction: "We have been trying to finish this project for hours. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Necesitamos terminar este proyecto ayer, pero no lo logramos.",
      traduction: "We needed to finish this project yesterday, but we didn’t manage to."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos intentando terminar este proyecto cuando nos interrumpieron. (interrupción)",
      traduction: "We were trying to finish this project when we got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos intentado terminar este proyecto antes de que surgiera el problema. (acción previa)",
      traduction: "We had tried to finish this project before the issue arose. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado trabajando en este proyecto durante días antes de pausarlo. (duración previa)",
      traduction: "We had been working on this project for days before pausing it. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Terminaremos este proyecto pronto.",
      traduction: "We will finish this project soon."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré trabajando en este proyecto a las 10 AM. (plan específico)",
      traduction: "I will be working on this project at 10 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos terminado este proyecto para el viernes. (completado)",
      traduction: "We will have finished this project by Friday. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado trabajando en este proyecto por 5 horas. (duración hasta el futuro)",
      traduction: "We will have been working on this project for 5 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él escucha podcasts de camino al trabajo.",
      traduction: "He listens to podcasts on his way to work."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está escuchando un podcast ahora mismo. (acción actual)",
      traduction: "He is listening to a podcast right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha escuchado podcasts durante todo el viaje esta semana. (período reciente)",
      traduction: "He has listened to podcasts during the whole trip this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado escuchando podcasts para aprender inglés. (enfoque continuo)",
      traduction: "He has been listening to podcasts to learn English. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él escuchó un podcast ayer de camino al trabajo.",
      traduction: "He listened to a podcast yesterday on his way to work."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba escuchando un podcast cuando llegó al trabajo. (interrupción)",
      traduction: "He was listening to a podcast when he arrived at work. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había escuchado varios podcasts antes de llegar a la oficina. (acción previa)",
      traduction: "He had listened to several podcasts before arriving at the office. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Él había estado escuchando podcasts durante horas antes de detenerse. (duración previa)",
      traduction: "He had been listening to podcasts for hours before stopping. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él escuchará podcasts mañana de camino al trabajo.",
      traduction: "He will listen to podcasts tomorrow on his way to work."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará escuchando un podcast a las 8 AM. (plan específico)",
      traduction: "He will be listening to a podcast at 8 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá escuchado 3 podcasts para el final del viaje. (completado)",
      traduction: "He will have listened to 3 podcasts by the end of the trip. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado escuchando podcasts por una hora. (duración hasta el futuro)",
      traduction: "He will have been listening to podcasts for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos estudian para exámenes después de la escuela.",
      traduction: "They study for exams after school."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están estudiando para exámenes ahora mismo. (acción actual)",
      traduction: "They are studying for exams right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han estudiado para exámenes todos los días esta semana. (período reciente)",
      traduction: "They have studied for exams every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado estudiando para exámenes durante horas. (enfoque continuo)",
      traduction: "They have been studying for exams for hours. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos estudiaron para exámenes ayer después de la escuela.",
      traduction: "They studied for exams yesterday after school."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban estudiando cuando los interrumpieron. (interrupción)",
      traduction: "They were studying when they got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían estudiado para el examen antes de salir. (acción previa)",
      traduction: "They had studied for the exam before leaving. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Ellos habían estado estudiando para exámenes durante días antes de tomar un descanso. (duración previa)",
      traduction: "They had been studying for exams for days before taking a break. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos estudiarán para exámenes mañana después de la escuela.",
      traduction: "They will study for exams tomorrow after school."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán estudiando para exámenes a las 4 PM. (plan específico)",
      traduction: "They will be studying for exams at 4 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán estudiado para exámenes antes del fin de semana. (completado)",
      traduction: "They will have studied for exams by the weekend. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado estudiando para exámenes por 3 horas. (duración hasta el futuro)",
      traduction: "They will have been studying for exams for 3 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Visito a mis abuelos los fines de semana.",
      traduction: "I visit my grandparents on weekends."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy visitando a mis abuelos este fin de semana. (acción actual)",
      traduction: "I am visiting my grandparents this weekend. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He visitado a mis abuelos todos los fines de semana este mes. (período reciente)",
      traduction: "I have visited my grandparents every weekend this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado visitando a mis abuelos más seguido últimamente. (enfoque continuo)",
      traduction: "I have been visiting my grandparents more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Visité a mis abuelos el fin de semana pasado.",
      traduction: "I visited my grandparents last weekend."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba visitando a mis abuelos cuando me llamaron. (interrupción)",
      traduction: "I was visiting my grandparents when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había visitado a mis abuelos antes de que se mudaran. (acción previa)",
      traduction: "I had visited my grandparents before they moved. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado visitando a mis abuelos regularmente durante años. (duración previa)",
      traduction: "I had been visiting my grandparents regularly for years. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Visitaré a mis abuelos el próximo fin de semana.",
      traduction: "I will visit my grandparents next weekend."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré visitando a mis abuelos a las 3 PM. (plan específico)",
      traduction: "I will be visiting my grandparents at 3 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré visitado a mis abuelos 5 veces para fin de año. (completado)",
      traduction: "I will have visited my grandparents 5 times by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado visitando a mis abuelos por una hora. (duración hasta el futuro)",
      traduction: "I will have been visiting my grandparents for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella escribe en su diario todas las noches.",
      traduction: "She writes in her journal every night."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está escribiendo en su diario ahora mismo. (acción actual)",
      traduction: "She is writing in her journal right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha escrito en su diario todas las noches esta semana. (período reciente)",
      traduction: "She has written in her journal every night this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado escribiendo en su diario para despejar su mente. (enfoque continuo)",
      traduction: "She has been writing in her journal to clear her mind. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella escribió en su diario anoche.",
      traduction: "She wrote in her journal last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba escribiendo en su diario cuando la interrumpieron. (interrupción)",
      traduction: "She was writing in her journal when she got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había escrito en su diario antes de acostarse. (acción previa)",
      traduction: "She had written in her journal before going to bed. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado escribiendo en su diario durante horas antes de terminar. (duración previa)",
      traduction: "She had been writing in her journal for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella escribirá en su diario mañana por la noche.",
      traduction: "She will write in her journal tomorrow night."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará escribiendo en su diario a las 9 PM. (plan específico)",
      traduction: "She will be writing in her journal at 9 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá escrito en su diario 7 veces para el final de la semana. (completado)",
      traduction: "She will have written in her journal 7 times by the end of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado escribiendo en su diario por 30 minutos. (duración hasta el futuro)",
      traduction: "She will have been writing in her journal for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Nos gusta ir de camping en el verano.",
      traduction: "We like to go camping in the summer."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos planeando ir de camping este verano. (acción actual)",
      traduction: "We are planning to go camping this summer. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos ido de camping todos los veranos desde 2018. (período reciente)",
      traduction: "We have gone camping every summer since 2018. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado pensando en ir de camping más seguido. (enfoque continuo)",
      traduction: "We have been thinking about going camping more often. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Fuimos de camping el verano pasado.",
      traduction: "We went camping last summer."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos yendo de camping cuando llovió. (interrupción)",
      traduction: "We were going camping when it rained. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos ido de camping antes de que empezara la temporada. (acción previa)",
      traduction: "We had gone camping before the season started. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado yendo de camping durante años antes de cambiar de destino. (duración previa)",
      traduction: "We had been going camping for years before changing destinations. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Iremos de camping el próximo verano.",
      traduction: "We will go camping next summer."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré yendo de camping a las 8 AM. (plan específico)",
      traduction: "I will be going camping at 8 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos ido de camping 3 veces para el final del verano. (completado)",
      traduction: "We will have gone camping 3 times by the end of the summer. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado yendo de camping por una semana. (duración hasta el futuro)",
      traduction: "We will have been going camping for a week. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él limpia su carro todos los domingos.",
      traduction: "He cleans his car every Sunday."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está limpiando su carro ahora mismo. (acción actual)",
      traduction: "He is cleaning his car right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha limpiado su carro todos los domingos este mes. (período reciente)",
      traduction: "He has cleaned his car every Sunday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado limpiando su carro más seguido para mantenerlo impecable. (enfoque continuo)",
      traduction: "He has been cleaning his car more often to keep it spotless. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él limpió su carro el domingo pasado.",
      traduction: "He cleaned his car last Sunday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba limpiando su carro cuando comenzó a llover. (interrupción)",
      traduction: "He was cleaning his car when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había limpiado su carro antes de salir. (acción previa)",
      traduction: "He had cleaned his car before leaving. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado limpiando su carro durante horas antes de terminar. (duración previa)",
      traduction: "He had been cleaning his car for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él limpiará su carro el próximo domingo.",
      traduction: "He will clean his car next Sunday."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará limpiando su carro a las 10 AM. (plan específico)",
      traduction: "He will be cleaning his car at 10 AM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá limpiado su carro 4 veces para fin de mes. (completado)",
      traduction: "He will have cleaned his car 4 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado limpiando su carro por una hora. (duración hasta el futuro)",
      traduction: "He will have been cleaning his car for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos piden pizza los viernes por la noche.",
      traduction: "They order pizza on Friday nights."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están pidiendo pizza ahora mismo. (acción actual)",
      traduction: "They are ordering pizza right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han pedido pizza todos los viernes este mes. (período reciente)",
      traduction: "They have ordered pizza every Friday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado pidiendo pizza más seguido últimamente. (enfoque continuo)",
      traduction: "They have been ordering pizza more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos pidieron pizza el viernes pasado.",
      traduction: "They ordered pizza last Friday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban pidiendo pizza cuando llegó el repartidor. (interrupción)",
      traduction: "They were ordering pizza when the delivery person arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían pedido pizza antes de que cerrara la cocina. (acción previa)",
      traduction: "They had ordered pizza before the kitchen closed. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado pidiendo pizza regularmente durante meses. (duración previa)",
      traduction: "They had been ordering pizza regularly for months. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos pedirán pizza el próximo viernes.",
      traduction: "They will order pizza next Friday."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán pidiendo pizza a las 8 PM. (plan específico)",
      traduction: "They will be ordering pizza at 8 PM. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán pedido pizza 5 veces para fin de mes. (completado)",
      traduction: "They will have ordered pizza 5 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado pidiendo pizza por una hora. (duración hasta el futuro)",
      traduction: "They will have been ordering pizza for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Llego al trabajo a las 8 a.m.",
      traduction: "I arrive at work at 8 a.m."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy llegando al trabajo ahora mismo. (acción actual)",
      traduction: "I am arriving at work right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He llegado al trabajo a tiempo todos los días esta semana. (período reciente)",
      traduction: "I have arrived at work on time every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado llegando temprano para evitar el tráfico. (enfoque continuo)",
      traduction: "I have been arriving early to avoid traffic. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Llegué al trabajo a las 8 a.m. ayer.",
      traduction: "I arrived at work at 8 a.m. yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba llegando al trabajo cuando me llamaron. (interrupción)",
      traduction: "I was arriving at work when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había llegado al trabajo antes de que comenzara la reunión. (acción previa)",
      traduction: "I had arrived at work before the meeting started. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado llegando temprano durante semanas antes de cambiar mi horario. (duración previa)",
      traduction: "I had been arriving early for weeks before changing my schedule. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Llegaré al trabajo a las 8 a.m. mañana.",
      traduction: "I will arrive at work at 8 a.m. tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré llegando al trabajo a las 8 a.m. (plan específico)",
      traduction: "I will be arriving at work at 8 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré llegado al trabajo para las 8:15 a.m. (completado)",
      traduction: "I will have arrived at work by 8:15 a.m. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado llegando temprano por una hora. (duración hasta el futuro)",
      traduction: "I will have been arriving early for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella toma el autobús para ir a la escuela.",
      traduction: "She takes the bus to school."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está tomando el autobús para ir a la escuela ahora mismo. (acción actual)",
      traduction: "She is taking the bus to school right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha tomado el autobús para ir a la escuela todos los días este mes. (período reciente)",
      traduction: "She has taken the bus to school every day this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado tomando el autobús porque su auto está en reparación. (enfoque continuo)",
      traduction: "She has been taking the bus because her car is in repair. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella tomó el autobús para ir a la escuela ayer.",
      traduction: "She took the bus to school yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba tomando el autobús cuando se encontró con un amigo. (interrupción)",
      traduction: "She was taking the bus when she met a friend. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había tomado el autobús antes de que lloviera. (acción previa)",
      traduction: "She had taken the bus before it rained. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado tomando el autobús durante semanas antes de que repararan su auto. (duración previa)",
      traduction: "She had been taking the bus for weeks before her car was repaired. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella tomará el autobús para ir a la escuela mañana.",
      traduction: "She will take the bus to school tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará tomando el autobús a las 7 a.m. (plan específico)",
      traduction: "She will be taking the bus at 7 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá tomado el autobús 5 veces para fin de semana. (completado)",
      traduction: "She will have taken the bus 5 times by the weekend. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado tomando el autobús por 30 minutos. (duración hasta el futuro)",
      traduction: "She will have been taking the bus for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Nos gusta jugar juegos de mesa.",
      traduction: "We enjoy playing board games."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos jugando juegos de mesa ahora mismo. (acción actual)",
      traduction: "We are playing board games right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos jugado juegos de mesa varias veces esta semana. (período reciente)",
      traduction: "We have played board games several times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado jugando juegos de mesa para pasar el rato. (enfoque continuo)",
      traduction: "We have been playing board games to pass the time. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Jugamos juegos de mesa anoche.",
      traduction: "We played board games last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos jugando juegos de mesa cuando llegó la pizza. (interrupción)",
      traduction: "We were playing board games when the pizza arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos jugado juegos de mesa antes de ver la película. (acción previa)",
      traduction: "We had played board games before watching the movie. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado jugando juegos de mesa durante horas antes de terminar. (duración previa)",
      traduction: "We had been playing board games for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Jugaremos juegos de mesa mañana por la noche.",
      traduction: "We will play board games tomorrow night."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré jugando juegos de mesa a las 8 p.m. (plan específico)",
      traduction: "I will be playing board games at 8 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos jugado juegos de mesa 3 veces para el final de la semana. (completado)",
      traduction: "We will have played board games 3 times by the end of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado jugando juegos de mesa por 2 horas. (duración hasta el futuro)",
      traduction: "We will have been playing board games for 2 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él corta el césped los sábados.",
      traduction: "He mows the lawn on Saturdays."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está cortando el césped ahora mismo. (acción actual)",
      traduction: "He is mowing the lawn right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha cortado el césped todos los sábados este mes. (período reciente)",
      traduction: "He has mowed the lawn every Saturday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado cortando el césped más seguido últimamente. (enfoque continuo)",
      traduction: "He has been mowing the lawn more often lately. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él cortó el césped el sábado pasado.",
      traduction: "He mowed the lawn last Saturday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba cortando el césped cuando comenzó a llover. (interrupción)",
      traduction: "He was mowing the lawn when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había cortado el césped antes de que llegaran los invitados. (acción previa)",
      traduction: "He had mowed the lawn before the guests arrived. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado cortando el césped durante horas antes de terminar. (duración previa)",
      traduction: "He had been mowing the lawn for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él cortará el césped el próximo sábado.",
      traduction: "He will mow the lawn next Saturday."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará cortando el césped a las 10 a.m. (plan específico)",
      traduction: "He will be mowing the lawn at 10 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá cortado el césped para el mediodía. (completado)",
      traduction: "He will have mowed the lawn by noon. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado cortando el césped por una hora. (duración hasta el futuro)",
      traduction: "He will have been mowing the lawn for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos participan en actividades escolares.",
      traduction: "They participate in school activities."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están participando en actividades escolares ahora mismo. (acción actual)",
      traduction: "They are participating in school activities right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han participado en actividades escolares este semestre. (período reciente)",
      traduction: "They have participated in school activities this semester. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado participando en actividades escolares para mejorar sus habilidades. (enfoque continuo)",
      traduction: "They have been participating in school activities to improve their skills. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos participaron en actividades escolares el mes pasado.",
      traduction: "They participated in school activities last month."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban participando en actividades escolares cuando los interrumpieron. (interrupción)",
      traduction: "They were participating in school activities when they got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían participado en actividades escolares antes del evento principal. (acción previa)",
      traduction: "They had participated in school activities before the main event. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado participando en actividades escolares durante semanas antes de tomar un descanso. (duración previa)",
      traduction: "They had been participating in school activities for weeks before taking a break. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos participarán en actividades escolares el próximo semestre.",
      traduction: "They will participate in school activities next semester."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán participando en actividades escolares a las 3 p.m. (plan específico)",
      traduction: "They will be participating in school activities at 3 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán participado en 5 actividades escolares para fin de año. (completado)",
      traduction: "They will have participated in 5 school activities by year-end. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado participando en actividades escolares por 2 horas. (duración hasta el futuro)",
      traduction: "They will have been participating in school activities for 2 hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Aprendo algo nuevo todos los días.",
      traduction: "I learn something new every day."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy aprendiendo algo nuevo hoy. (acción actual)",
      traduction: "I am learning something new today. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He aprendido algo nuevo cada día esta semana. (período reciente)",
      traduction: "I have learned something new every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado aprendiendo algo nuevo para crecer. (enfoque continuo)",
      traduction: "I have been learning something new to grow. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Aprendí algo nuevo ayer.",
      traduction: "I learned something new yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba aprendiendo algo nuevo cuando me interrumpieron. (interrupción)",
      traduction: "I was learning something new when I got interrupted. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había aprendido algo nuevo antes de la clase. (acción previa)",
      traduction: "I had learned something new before the class. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado aprendiendo algo nuevo durante horas antes de terminar. (duración previa)",
      traduction: "I had been learning something new for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Aprenderé algo nuevo mañana.",
      traduction: "I will learn something new tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré aprendiendo algo nuevo a las 10 a.m. (plan específico)",
      traduction: "I will be learning something new at 10 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré aprendido algo nuevo para el final del curso. (completado)",
      traduction: "I will have learned something new by the end of the course. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado aprendiendo algo nuevo por una hora. (duración hasta el futuro)",
      traduction: "I will have been learning something new for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella prefiere té sobre café.",
      traduction: "She prefers tea over coffee."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está prefiriendo té sobre café últimamente. (acción actual)",
      traduction: "She is preferring tea over coffee lately. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha preferido té sobre café desde hace tiempo. (período reciente)",
      traduction: "She has preferred tea over coffee for a while. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado prefiriendo té sobre café para cuidar su salud. (enfoque continuo)",
      traduction: "She has been preferring tea over coffee to take care of her health. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella prefirió té sobre café ayer.",
      traduction: "She preferred tea over coffee yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba prefiriendo té sobre café cuando le ofrecieron café. (interrupción)",
      traduction: "She was preferring tea over coffee when she was offered coffee. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había preferido té sobre café antes de la reunión. (acción previa)",
      traduction: "She had preferred tea over coffee before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado prefiriendo té sobre café durante meses antes de cambiar. (duración previa)",
      traduction: "She had been preferring tea over coffee for months before changing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella preferirá té sobre café mañana.",
      traduction: "She will prefer tea over coffee tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará prefiriendo té sobre café a las 8 a.m. (plan específico)",
      traduction: "She will be preferring tea over coffee at 8 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá preferido té sobre café para el final de la semana. (completado)",
      traduction: "She will have preferred tea over coffee by the end of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado prefiriendo té sobre café por una hora. (duración hasta el futuro)",
      traduction: "She will have been preferring tea over coffee for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Discutimos planes durante el almuerzo.",
      traduction: "We discuss plans during lunch."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos discutiendo planes durante el almuerzo ahora mismo. (acción actual)",
      traduction: "We are discussing plans during lunch right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos discutido planes durante el almuerzo varias veces esta semana. (período reciente)",
      traduction: "We have discussed plans during lunch several times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado discutiendo planes durante el almuerzo para organizar el proyecto. (enfoque continuo)",
      traduction: "We have been discussing plans during lunch to organize the project. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Discutimos planes durante el almuerzo ayer.",
      traduction: "We discussed plans during lunch yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos discutiendo planes durante el almuerzo cuando llegó el jefe. (interrupción)",
      traduction: "We were discussing plans during lunch when the boss arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos discutido planes durante el almuerzo antes de la reunión. (acción previa)",
      traduction: "We had discussed plans during lunch before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado discutiendo planes durante el almuerzo durante horas antes de terminar. (duración previa)",
      traduction: "We had been discussing plans during lunch for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Discutiremos planes durante el almuerzo mañana.",
      traduction: "We will discuss plans during lunch tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré discutiendo planes durante el almuerzo a las 1 p.m. (plan específico)",
      traduction: "I will be discussing plans during lunch at 1 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos discutido planes durante el almuerzo para el final del día. (completado)",
      traduction: "We will have discussed plans during lunch by the end of the day. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado discutiendo planes durante el almuerzo por una hora. (duración hasta el futuro)",
      traduction: "We will have been discussing plans during lunch for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él ahorra dinero para vacaciones.",
      traduction: "He saves money for vacations."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está ahorrando dinero para vacaciones ahora mismo. (acción actual)",
      traduction: "He is saving money for vacations right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha ahorrado dinero para vacaciones este año. (período reciente)",
      traduction: "He has saved money for vacations this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado ahorrando dinero para vacaciones durante meses. (enfoque continuo)",
      traduction: "He has been saving money for vacations for months. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él ahorró dinero para vacaciones el año pasado.",
      traduction: "He saved money for vacations last year."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba ahorrando dinero para vacaciones cuando recibió un aumento. (interrupción)",
      traduction: "He was saving money for vacations when he got a raise. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había ahorrado dinero para vacaciones antes de comprar los boletos. (acción previa)",
      traduction: "He had saved money for vacations before buying the tickets. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado ahorrando dinero para vacaciones durante un año antes de gastarlo. (duración previa)",
      traduction: "He had been saving money for vacations for a year before spending it. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él ahorrará dinero para vacaciones el próximo año.",
      traduction: "He will save money for vacations next year."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará ahorrando dinero para vacaciones a finales de mes. (plan específico)",
      traduction: "He will be saving money for vacations by the end of the month. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá ahorrado suficiente dinero para vacaciones para julio. (completado)",
      traduction: "He will have saved enough money for vacations by July. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado ahorrando dinero para vacaciones por seis meses. (duración hasta el futuro)",
      traduction: "He will have been saving money for vacations for six months. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos caminan al parque todas las tardes.",
      traduction: "They walk to the park every afternoon."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están caminando al parque ahora mismo. (acción actual)",
      traduction: "They are walking to the park right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han caminado al parque todas las tardes esta semana. (período reciente)",
      traduction: "They have walked to the park every afternoon this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado caminando al parque para hacer ejercicio. (enfoque continuo)",
      traduction: "They have been walking to the park to exercise. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos caminaron al parque ayer por la tarde.",
      traduction: "They walked to the park yesterday afternoon."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban caminando al parque cuando comenzó a llover. (interrupción)",
      traduction: "They were walking to the park when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían caminado al parque antes de que oscureciera. (acción previa)",
      traduction: "They had walked to the park before it got dark. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado caminando al parque regularmente durante semanas antes de tomar un descanso. (duración previa)",
      traduction: "They had been walking to the park regularly for weeks before taking a break. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos caminarán al parque mañana por la tarde.",
      traduction: "They will walk to the park tomorrow afternoon."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán caminando al parque a las 5 p.m. (plan específico)",
      traduction: "They will be walking to the park at 5 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán caminado al parque 10 veces para fin de mes. (completado)",
      traduction: "They will have walked to the park 10 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado caminando al parque por una hora. (duración hasta el futuro)",
      traduction: "They will have been walking to the park for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Pinto en mi tiempo libre.",
      traduction: "I paint in my free time."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy pintando en mi tiempo libre ahora mismo. (acción actual)",
      traduction: "I am painting in my free time right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He pintado en mi tiempo libre varias veces este mes. (período reciente)",
      traduction: "I have painted in my free time several times this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado pintando en mi tiempo libre para relajarme. (enfoque continuo)",
      traduction: "I have been painting in my free time to relax. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Pinté en mi tiempo libre el fin de semana pasado.",
      traduction: "I painted in my free time last weekend."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba pintando en mi tiempo libre cuando me llamaron. (interrupción)",
      traduction: "I was painting in my free time when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había pintado en mi tiempo libre antes de empezar el proyecto. (acción previa)",
      traduction: "I had painted in my free time before starting the project. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado pintando en mi tiempo libre durante horas antes de terminar. (duración previa)",
      traduction: "I had been painting in my free time for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Pintaré en mi tiempo libre mañana.",
      traduction: "I will paint in my free time tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré pintando en mi tiempo libre a las 3 p.m. (plan específico)",
      traduction: "I will be painting in my free time at 3 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré pintado en mi tiempo libre 5 cuadros para fin de año. (completado)",
      traduction: "I will have painted 5 paintings in my free time by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado pintando en mi tiempo libre por dos horas. (duración hasta el futuro)",
      traduction: "I will have been painting in my free time for two hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella hace trabajo voluntario en el refugio de animales.",
      traduction: "She volunteers at the animal shelter."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está haciendo trabajo voluntario en el refugio de animales ahora mismo. (acción actual)",
      traduction: "She is volunteering at the animal shelter right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha hecho trabajo voluntario en el refugio de animales este mes. (período reciente)",
      traduction: "She has volunteered at the animal shelter this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado haciendo trabajo voluntario en el refugio de animales para ayudar a los animales. (enfoque continuo)",
      traduction: "She has been volunteering at the animal shelter to help the animals. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella hizo trabajo voluntario en el refugio de animales el mes pasado.",
      traduction: "She volunteered at the animal shelter last month."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba haciendo trabajo voluntario en el refugio de animales cuando llegó otro voluntario. (interrupción)",
      traduction: "She was volunteering at the animal shelter when another volunteer arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había hecho trabajo voluntario en el refugio de animales antes de graduarse. (acción previa)",
      traduction: "She had volunteered at the animal shelter before graduating. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado haciendo trabajo voluntario en el refugio de animales durante meses antes de tomar un descanso. (duración previa)",
      traduction: "She had been volunteering at the animal shelter for months before taking a break. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella hará trabajo voluntario en el refugio de animales el próximo mes.",
      traduction: "She will volunteer at the animal shelter next month."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará haciendo trabajo voluntario en el refugio de animales a las 10 a.m. (plan específico)",
      traduction: "She will be volunteering at the animal shelter at 10 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá hecho trabajo voluntario en el refugio de animales 10 veces para fin de año. (completado)",
      traduction: "She will have volunteered at the animal shelter 10 times by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado haciendo trabajo voluntario en el refugio de animales por tres horas. (duración hasta el futuro)",
      traduction: "She will have been volunteering at the animal shelter for three hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Preparamos la cena juntos.",
      traduction: "We prepare dinner together."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos preparando la cena juntos ahora mismo. (acción actual)",
      traduction: "We are preparing dinner together right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos preparado la cena juntos varias veces esta semana. (período reciente)",
      traduction: "We have prepared dinner together several times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado preparando la cena juntos para mejorar nuestras habilidades culinarias. (enfoque continuo)",
      traduction: "We have been preparing dinner together to improve our cooking skills. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Preparamos la cena juntos anoche.",
      traduction: "We prepared dinner together last night."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos preparando la cena juntos cuando llegó un invitado. (interrupción)",
      traduction: "We were preparing dinner together when a guest arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos preparado la cena juntos antes de que llegaran los demás. (acción previa)",
      traduction: "We had prepared dinner together before the others arrived. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado preparando la cena juntos durante horas antes de terminar. (duración previa)",
      traduction: "We had been preparing dinner together for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Prepararemos la cena juntos mañana.",
      traduction: "We will prepare dinner together tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré preparando la cena juntos a las 7 p.m. (plan específico)",
      traduction: "I will be preparing dinner together at 7 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos preparado la cena juntos para cuando lleguen los invitados. (completado)",
      traduction: "We will have prepared dinner together by the time the guests arrive. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado preparando la cena juntos por una hora. (duración hasta el futuro)",
      traduction: "We will have been preparing dinner together for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él asiste a clases de yoga los lunes.",
      traduction: "He attends yoga classes on Mondays."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está asistiendo a clases de yoga ahora mismo. (acción actual)",
      traduction: "He is attending yoga classes right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha asistido a clases de yoga todos los lunes este mes. (período reciente)",
      traduction: "He has attended yoga classes every Monday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado asistiendo a clases de yoga para mejorar su flexibilidad. (enfoque continuo)",
      traduction: "He has been attending yoga classes to improve his flexibility. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él asistió a clases de yoga el lunes pasado.",
      traduction: "He attended yoga classes last Monday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba asistiendo a clases de yoga cuando se sintió mareado. (interrupción)",
      traduction: "He was attending yoga classes when he felt dizzy. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había asistido a clases de yoga antes de lesionarse. (acción previa)",
      traduction: "He had attended yoga classes before getting injured. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado asistiendo a clases de yoga durante meses antes de tomar un descanso. (duración previa)",
      traduction: "He had been attending yoga classes for months before taking a break. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él asistirá a clases de yoga el próximo lunes.",
      traduction: "He will attend yoga classes next Monday."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará asistiendo a clases de yoga a las 6 p.m. (plan específico)",
      traduction: "He will be attending yoga classes at 6 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá asistido a clases de yoga 10 veces para fin de mes. (completado)",
      traduction: "He will have attended yoga classes 10 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado asistiendo a clases de yoga por una hora. (duración hasta el futuro)",
      traduction: "He will have been attending yoga classes for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos siempre traen bocadillos a la fiesta.",
      traduction: "They always bring snacks to the party."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están trayendo bocadillos a la fiesta ahora mismo. (acción actual)",
      traduction: "They are bringing snacks to the party right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han traído bocadillos a la fiesta cada vez este año. (período reciente)",
      traduction: "They have brought snacks to the party every time this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado trayendo bocadillos a la fiesta para compartir con todos. (enfoque continuo)",
      traduction: "They have been bringing snacks to the party to share with everyone. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos trajeron bocadillos a la fiesta la semana pasada.",
      traduction: "They brought snacks to the party last week."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban trayendo bocadillos a la fiesta cuando llegaron otros invitados. (interrupción)",
      traduction: "They were bringing snacks to the party when other guests arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían traído bocadillos a la fiesta antes de que empezara. (acción previa)",
      traduction: "They had brought snacks to the party before it started. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado trayendo bocadillos a la fiesta regularmente durante meses. (duración previa)",
      traduction: "They had been bringing snacks to the party regularly for months. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos traerán bocadillos a la fiesta el próximo fin de semana.",
      traduction: "They will bring snacks to the party next weekend."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán trayendo bocadillos a la fiesta a las 7 p.m. (plan específico)",
      traduction: "They will be bringing snacks to the party at 7 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán traído bocadillos a la fiesta 5 veces para fin de año. (completado)",
      traduction: "They will have brought snacks to the party 5 times by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado trayendo bocadillos a la fiesta por una hora. (duración hasta el futuro)",
      traduction: "They will have been bringing snacks to the party for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Termino mi tarea antes de la cena.",
      traduction: "I finish my homework before dinner."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy terminando mi tarea antes de la cena ahora mismo. (acción actual)",
      traduction: "I am finishing my homework before dinner right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He terminado mi tarea antes de la cena todos los días esta semana. (período reciente)",
      traduction: "I have finished my homework before dinner every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado terminando mi tarea antes de la cena para evitar distracciones. (enfoque continuo)",
      traduction: "I have been finishing my homework before dinner to avoid distractions. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Terminé mi tarea antes de la cena ayer.",
      traduction: "I finished my homework before dinner yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba terminando mi tarea antes de la cena cuando me llamaron. (interrupción)",
      traduction: "I was finishing my homework before dinner when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había terminado mi tarea antes de que sirvieran la cena. (acción previa)",
      traduction: "I had finished my homework before dinner was served. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado terminando mi tarea antes de la cena durante horas antes de terminarla. (duración previa)",
      traduction: "I had been finishing my homework before dinner for hours before completing it. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Terminaré mi tarea antes de la cena mañana.",
      traduction: "I will finish my homework before dinner tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré terminando mi tarea antes de la cena a las 6 p.m. (plan específico)",
      traduction: "I will be finishing my homework before dinner at 6 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré terminado mi tarea antes de la cena para cuando comience la película. (completado)",
      traduction: "I will have finished my homework before dinner by the time the movie starts. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado terminando mi tarea antes de la cena por una hora. (duración hasta el futuro)",
      traduction: "I will have been finishing my homework before dinner for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella organiza su escritorio cada semana.",
      traduction: "She organizes her desk every week."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está organizando su escritorio ahora mismo. (acción actual)",
      traduction: "She is organizing her desk right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha organizado su escritorio todas las semanas este mes. (período reciente)",
      traduction: "She has organized her desk every week this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado organizando su escritorio para mantenerlo ordenado. (enfoque continuo)",
      traduction: "She has been organizing her desk to keep it tidy. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella organizó su escritorio la semana pasada.",
      traduction: "She organized her desk last week."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba organizando su escritorio cuando llegó su jefe. (interrupción)",
      traduction: "She was organizing her desk when her boss arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había organizado su escritorio antes de la reunión. (acción previa)",
      traduction: "She had organized her desk before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado organizando su escritorio durante horas antes de terminar. (duración previa)",
      traduction: "She had been organizing her desk for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella organizará su escritorio la próxima semana.",
      traduction: "She will organize her desk next week."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará organizando su escritorio a las 10 a.m. (plan específico)",
      traduction: "She will be organizing her desk at 10 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá organizado su escritorio para el viernes. (completado)",
      traduction: "She will have organized her desk by Friday. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado organizando su escritorio por una hora. (duración hasta el futuro)",
      traduction: "She will have been organizing her desk for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Hablamos sobre películas durante el almuerzo.",
      traduction: "We talk about movies during lunch."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos hablando sobre películas durante el almuerzo ahora mismo. (acción actual)",
      traduction: "We are talking about movies during lunch right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos hablado sobre películas durante el almuerzo varias veces esta semana. (período reciente)",
      traduction: "We have talked about movies during lunch several times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado hablando sobre películas durante el almuerzo para compartir opiniones. (enfoque continuo)",
      traduction: "We have been talking about movies during lunch to share opinions. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Hablamos sobre películas durante el almuerzo ayer.",
      traduction: "We talked about movies during lunch yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos hablando sobre películas durante el almuerzo cuando llegó el jefe. (interrupción)",
      traduction: "We were talking about movies during lunch when the boss arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos hablado sobre películas durante el almuerzo antes de la reunión. (acción previa)",
      traduction: "We had talked about movies during lunch before the meeting. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado hablando sobre películas durante el almuerzo durante horas antes de cambiar de tema. (duración previa)",
      traduction: "We had been talking about movies during lunch for hours before changing the subject. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Hablaremos sobre películas durante el almuerzo mañana.",
      traduction: "We will talk about movies during lunch tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré hablando sobre películas durante el almuerzo a la 1 p.m. (plan específico)",
      traduction: "I will be talking about movies during lunch at 1 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos hablado sobre películas durante el almuerzo para el final del día. (completado)",
      traduction: "We will have talked about movies during lunch by the end of the day. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado hablando sobre películas durante el almuerzo por una hora. (duración hasta el futuro)",
      traduction: "We will have been talking about movies during lunch for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él monta en bicicleta para ir al trabajo.",
      traduction: "He rides his bike to work."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está montando en bicicleta para ir al trabajo ahora mismo. (acción actual)",
      traduction: "He is riding his bike to work right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha montado en bicicleta para ir al trabajo todos los días esta semana. (período reciente)",
      traduction: "He has ridden his bike to work every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado montando en bicicleta para ir al trabajo para reducir su huella de carbono. (enfoque continuo)",
      traduction: "He has been riding his bike to work to reduce his carbon footprint. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él montó en bicicleta para ir al trabajo ayer.",
      traduction: "He rode his bike to work yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba montando en bicicleta para ir al trabajo cuando comenzó a llover. (interrupción)",
      traduction: "He was riding his bike to work when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había montado en bicicleta para ir al trabajo antes de que se estropeara su auto. (acción previa)",
      traduction: "He had ridden his bike to work before his car broke down. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado montando en bicicleta para ir al trabajo durante meses antes de reparar su auto. (duración previa)",
      traduction: "He had been riding his bike to work for months before fixing his car. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él montará en bicicleta para ir al trabajo mañana.",
      traduction: "He will ride his bike to work tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará montando en bicicleta para ir al trabajo a las 8 a.m. (plan específico)",
      traduction: "He will be riding his bike to work at 8 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá montado en bicicleta para ir al trabajo 5 veces para fin de semana. (completado)",
      traduction: "He will have ridden his bike to work 5 times by the weekend. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado montando en bicicleta para ir al trabajo por una hora. (duración hasta el futuro)",
      traduction: "He will have been riding his bike to work for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos ven dibujos animados los sábados por la mañana.",
      traduction: "They watch cartoons on Saturday mornings."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están viendo dibujos animados ahora mismo. (acción actual)",
      traduction: "They are watching cartoons right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han visto dibujos animados todos los sábados de este mes. (período reciente)",
      traduction: "They have watched cartoons every Saturday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado viendo dibujos animados para relajarse. (enfoque continuo)",
      traduction: "They have been watching cartoons to relax. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos vieron dibujos animados el sábado pasado.",
      traduction: "They watched cartoons last Saturday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban viendo dibujos animados cuando llegaron visitas. (interrupción)",
      traduction: "They were watching cartoons when visitors arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían visto dibujos animados antes de que comenzara el partido. (acción previa)",
      traduction: "They had watched cartoons before the game started. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado viendo dibujos animados durante horas antes de terminar. (duración previa)",
      traduction: "They had been watching cartoons for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos verán dibujos animados el próximo sábado.",
      traduction: "They will watch cartoons next Saturday."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán viendo dibujos animados a las 9 a.m. (plan específico)",
      traduction: "They will be watching cartoons at 9 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán visto dibujos animados para el mediodía. (completado)",
      traduction: "They will have watched cartoons by noon. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado viendo dibujos animados por dos horas. (duración hasta el futuro)",
      traduction: "They will have been watching cartoons for two hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Llamo a mis padres todos los domingos.",
      traduction: "I call my parents every Sunday."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy llamando a mis padres ahora mismo. (acción actual)",
      traduction: "I am calling my parents right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He llamado a mis padres todos los domingos este mes. (período reciente)",
      traduction: "I have called my parents every Sunday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado llamando a mis padres regularmente para mantenernos en contacto. (enfoque continuo)",
      traduction: "I have been calling my parents regularly to stay in touch. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Llamé a mis padres el domingo pasado.",
      traduction: "I called my parents last Sunday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba llamando a mis padres cuando se cortó la llamada. (interrupción)",
      traduction: "I was calling my parents when the call dropped. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había llamado a mis padres antes de que me llamaran ellos. (acción previa)",
      traduction: "I had called my parents before they called me. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado llamando a mis padres todos los domingos durante meses antes de perder el hábito. (duración previa)",
      traduction: "I had been calling my parents every Sunday for months before losing the habit. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Llamaré a mis padres el próximo domingo.",
      traduction: "I will call my parents next Sunday."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré llamando a mis padres a las 8 p.m. (plan específico)",
      traduction: "I will be calling my parents at 8 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré llamado a mis padres para fin de mes. (completado)",
      traduction: "I will have called my parents by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado llamando a mis padres por una hora. (duración hasta el futuro)",
      traduction: "I will have been calling my parents for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella lleva chaqueta cuando hace frío.",
      traduction: "She wears a jacket when it’s cold."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está llevando una chaqueta ahora mismo porque hace frío. (acción actual)",
      traduction: "She is wearing a jacket right now because it’s cold. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha llevado chaqueta cada vez que ha hecho frío esta semana. (período reciente)",
      traduction: "She has worn a jacket every time it has been cold this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado llevando una chaqueta para protegerse del frío. (enfoque continuo)",
      traduction: "She has been wearing a jacket to protect herself from the cold. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella llevó una chaqueta ayer porque hacía frío.",
      traduction: "She wore a jacket yesterday because it was cold."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba llevando una chaqueta cuando comenzó a nevar. (interrupción)",
      traduction: "She was wearing a jacket when it started snowing. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había llevado una chaqueta antes de darse cuenta de que hacía mucho frío. (acción previa)",
      traduction: "She had worn a jacket before realizing it was very cold. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado llevando una chaqueta durante días antes de que el clima mejorara. (duración previa)",
      traduction: "She had been wearing a jacket for days before the weather improved. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella llevará una chaqueta cuando haga frío mañana.",
      traduction: "She will wear a jacket when it’s cold tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará llevando una chaqueta a las 9 a.m. si sigue haciendo frío. (plan específico)",
      traduction: "She will be wearing a jacket at 9 a.m. if it’s still cold. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá llevado una chaqueta varias veces para fin de semana. (completado)",
      traduction: "She will have worn a jacket several times by the weekend. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado llevando una chaqueta por una hora si sigue haciendo frío. (duración hasta el futuro)",
      traduction: "She will have been wearing a jacket for an hour if it’s still cold. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Nos gusta cantar en las noches de karaoke.",
      traduction: "We enjoy singing at karaoke nights."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos cantando en una noche de karaoke ahora mismo. (acción actual)",
      traduction: "We are singing at a karaoke night right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos cantado en varias noches de karaoke este mes. (período reciente)",
      traduction: "We have sung at several karaoke nights this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado cantando en las noches de karaoke para divertirnos. (enfoque continuo)",
      traduction: "We have been singing at karaoke nights for fun. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Cantamos en una noche de karaoke la semana pasada.",
      traduction: "We sang at a karaoke night last week."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos cantando en una noche de karaoke cuando nos aplaudieron. (interrupción)",
      traduction: "We were singing at a karaoke night when we got applauded. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos cantado en una noche de karaoke antes de que terminara el evento. (acción previa)",
      traduction: "We had sung at a karaoke night before the event ended. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado cantando en noches de karaoke durante horas antes de irnos. (duración previa)",
      traduction: "We had been singing at karaoke nights for hours before leaving. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Cantaremos en una noche de karaoke el próximo viernes.",
      traduction: "We will sing at a karaoke night next Friday."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré cantando en una noche de karaoke a las 10 p.m. (plan específico)",
      traduction: "I will be singing at a karaoke night at 10 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos cantado en 3 noches de karaoke para fin de mes. (completado)",
      traduction: "We will have sung at 3 karaoke nights by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado cantando en una noche de karaoke por dos horas. (duración hasta el futuro)",
      traduction: "We will have been singing at a karaoke night for two hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él colecciona estampillas como un pasatiempo.",
      traduction: "He collects stamps as a hobby."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está coleccionando estampillas ahora mismo. (acción actual)",
      traduction: "He is collecting stamps right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha coleccionado estampillas durante años. (período reciente)",
      traduction: "He has collected stamps for years. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado coleccionando estampillas para completar su colección. (enfoque continuo)",
      traduction: "He has been collecting stamps to complete his collection. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él coleccionó estampillas el año pasado.",
      traduction: "He collected stamps last year."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba coleccionando estampillas cuando encontró una rara. (interrupción)",
      traduction: "He was collecting stamps when he found a rare one. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había coleccionado estampillas antes de vender su colección. (acción previa)",
      traduction: "He had collected stamps before selling his collection. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado coleccionando estampillas durante meses antes de terminar. (duración previa)",
      traduction: "He had been collecting stamps for months before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él coleccionará más estampillas el próximo año.",
      traduction: "He will collect more stamps next year."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará coleccionando estampillas a las 4 p.m. (plan específico)",
      traduction: "He will be collecting stamps at 4 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá coleccionado 500 estampillas para fin de año. (completado)",
      traduction: "He will have collected 500 stamps by the end of the year. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado coleccionando estampillas por tres horas. (duración hasta el futuro)",
      traduction: "He will have been collecting stamps for three hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos juegan al ajedrez después de la cena.",
      traduction: "They play chess after dinner."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están jugando al ajedrez después de la cena ahora mismo. (acción actual)",
      traduction: "They are playing chess after dinner right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han jugado al ajedrez después de la cena varias veces esta semana. (período reciente)",
      traduction: "They have played chess after dinner several times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado jugando al ajedrez después de la cena para practicar. (enfoque continuo)",
      traduction: "They have been playing chess after dinner to practice. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos jugaron al ajedrez después de la cena ayer.",
      traduction: "They played chess after dinner yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban jugando al ajedrez después de la cena cuando llegó un amigo. (interrupción)",
      traduction: "They were playing chess after dinner when a friend arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían jugado al ajedrez después de la cena antes de ver una película. (acción previa)",
      traduction: "They had played chess after dinner before watching a movie. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado jugando al ajedrez después de la cena durante horas antes de terminar. (duración previa)",
      traduction: "They had been playing chess after dinner for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos jugarán al ajedrez después de la cena mañana.",
      traduction: "They will play chess after dinner tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán jugando al ajedrez después de la cena a las 9 p.m. (plan específico)",
      traduction: "They will be playing chess after dinner at 9 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán jugado al ajedrez después de la cena 5 veces para fin de semana. (completado)",
      traduction: "They will have played chess after dinner 5 times by the weekend. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado jugando al ajedrez después de la cena por dos horas. (duración hasta el futuro)",
      traduction: "They will have been playing chess after dinner for two hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Escribo correos electrónicos a mi profesor.",
      traduction: "I write emails to my teacher."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy escribiendo un correo electrónico a mi profesor ahora mismo. (acción actual)",
      traduction: "I am writing an email to my teacher right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He escrito correos electrónicos a mi profesor varias veces esta semana. (período reciente)",
      traduction: "I have written emails to my teacher several times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado escribiendo correos electrónicos a mi profesor para hacer preguntas. (enfoque continuo)",
      traduction: "I have been writing emails to my teacher to ask questions. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Escribí un correo electrónico a mi profesor ayer.",
      traduction: "I wrote an email to my teacher yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba escribiendo un correo electrónico a mi profesor cuando me llamaron. (interrupción)",
      traduction: "I was writing an email to my teacher when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había escrito un correo electrónico a mi profesor antes de la clase. (acción previa)",
      traduction: "I had written an email to my teacher before the class. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado escribiendo correos electrónicos a mi profesor durante horas antes de enviarlos. (duración previa)",
      traduction: "I had been writing emails to my teacher for hours before sending them. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Escribiré un correo electrónico a mi profesor mañana.",
      traduction: "I will write an email to my teacher tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré escribiendo un correo electrónico a mi profesor a las 3 p.m. (plan específico)",
      traduction: "I will be writing an email to my teacher at 3 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré escrito un correo electrónico a mi profesor antes del examen. (completado)",
      traduction: "I will have written an email to my teacher before the exam. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado escribiendo correos electrónicos a mi profesor por una hora. (duración hasta el futuro)",
      traduction: "I will have been writing emails to my teacher for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella cuida a su hermano menor.",
      traduction: "She takes care of her younger brother."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está cuidando a su hermano menor ahora mismo. (acción actual)",
      traduction: "She is taking care of her younger brother right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha cuidado a su hermano menor todos los días esta semana. (período reciente)",
      traduction: "She has taken care of her younger brother every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado cuidando a su hermano menor para ayudar a sus padres. (enfoque continuo)",
      traduction: "She has been taking care of her younger brother to help her parents. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella cuidó a su hermano menor ayer.",
      traduction: "She took care of her younger brother yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba cuidando a su hermano menor cuando llegaron sus padres. (interrupción)",
      traduction: "She was taking care of her younger brother when her parents arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había cuidado a su hermano menor antes de que salieran sus padres. (acción previa)",
      traduction: "She had taken care of her younger brother before her parents left. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado cuidando a su hermano menor durante horas antes de descansar. (duración previa)",
      traduction: "She had been taking care of her younger brother for hours before resting. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella cuidará a su hermano menor mañana.",
      traduction: "She will take care of her younger brother tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará cuidando a su hermano menor a las 6 p.m. (plan específico)",
      traduction: "She will be taking care of her younger brother at 6 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá cuidado a su hermano menor durante toda la tarde. (completado)",
      traduction: "She will have taken care of her younger brother all afternoon. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado cuidando a su hermano menor por tres horas. (duración hasta el futuro)",
      traduction: "She will have been taking care of her younger brother for three hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Nos reunimos en el café todos los viernes.",
      traduction: "We meet at the cafe every Friday."
    },
    {
      tense: "presentContinuous",
      phrase: "Nos estamos reuniendo en el café ahora mismo. (acción actual)",
      traduction: "We are meeting at the cafe right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Nos hemos reunido en el café todos los viernes este mes. (período reciente)",
      traduction: "We have met at the cafe every Friday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Nos hemos estado reuniendo en el café para hablar de proyectos. (enfoque continuo)",
      traduction: "We have been meeting at the cafe to discuss projects. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Nos reunimos en el café el viernes pasado.",
      traduction: "We met at the cafe last Friday."
    },
    {
      tense: "pastContinuous",
      phrase: "Nos estábamos reuniendo en el café cuando comenzó a llover. (interrupción)",
      traduction: "We were meeting at the cafe when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya nos habíamos reunido en el café antes de empezar el proyecto. (acción previa)",
      traduction: "We had met at the cafe before starting the project. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado reuniéndonos en el café regularmente durante meses antes de cambiar de lugar. (duración previa)",
      traduction: "We had been meeting at the cafe regularly for months before changing locations. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Nos reuniremos en el café el próximo viernes.",
      traduction: "We will meet at the cafe next Friday."
    },
    {
      tense: "futureContinuous",
      phrase: "Nos estaremos reuniendo en el café a las 7 p.m. (plan específico)",
      traduction: "We will be meeting at the cafe at 7 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Nos habremos reunido en el café 10 veces para fin de mes. (completado)",
      traduction: "We will have met at the cafe 10 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Nos habremos estado reuniendo en el café por dos horas. (duración hasta el futuro)",
      traduction: "We will have been meeting at the cafe for two hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él se despierta a las 6 a.m. todos los días.",
      traduction: "He wakes up at 6 a.m. every day."
    },
    {
      tense: "presentContinuous",
      phrase: "Él se está despertando a las 6 a.m. ahora mismo. (acción actual)",
      traduction: "He is waking up at 6 a.m. right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él se ha despertado a las 6 a.m. todos los días esta semana. (período reciente)",
      traduction: "He has woken up at 6 a.m. every day this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él se ha estado despertando temprano para cumplir con su rutina. (enfoque continuo)",
      traduction: "He has been waking up early to stick to his routine. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él se despertó a las 6 a.m. ayer.",
      traduction: "He woke up at 6 a.m. yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él se estaba despertando cuando sonó el despertador. (interrupción)",
      traduction: "He was waking up when the alarm went off. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya se había despertado antes de que lo llamaran. (acción previa)",
      traduction: "He had woken up before he got called. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Se había estado despertando temprano durante semanas antes de cambiar su horario. (duración previa)",
      traduction: "He had been waking up early for weeks before changing his schedule. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él se despertará a las 6 a.m. mañana.",
      traduction: "He will wake up at 6 a.m. tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará despertándose a las 6 a.m. el próximo lunes. (plan específico)",
      traduction: "He will be waking up at 6 a.m. next Monday. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él ya se habrá despertado para cuando suene el despertador. (completado)",
      traduction: "He will have woken up by the time the alarm goes off. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado despertándose temprano por una hora. (duración hasta el futuro)",
      traduction: "He will have been waking up early for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos practican fútbol tres veces por semana.",
      traduction: "They practice soccer three times a week."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están practicando fútbol ahora mismo. (acción actual)",
      traduction: "They are practicing soccer right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han practicado fútbol tres veces esta semana. (período reciente)",
      traduction: "They have practiced soccer three times this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado practicando fútbol para mejorar sus habilidades. (enfoque continuo)",
      traduction: "They have been practicing soccer to improve their skills. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos practicaron fútbol el martes pasado.",
      traduction: "They practiced soccer last Tuesday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban practicando fútbol cuando comenzó a llover. (interrupción)",
      traduction: "They were practicing soccer when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían practicado fútbol antes del partido. (acción previa)",
      traduction: "They had practiced soccer before the match. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado practicando fútbol durante horas antes de terminar. (duración previa)",
      traduction: "They had been practicing soccer for hours before finishing. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos practicarán fútbol el próximo jueves.",
      traduction: "They will practice soccer next Thursday."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán practicando fútbol a las 5 p.m. (plan específico)",
      traduction: "They will be practicing soccer at 5 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán practicado fútbol 10 veces para fin de mes. (completado)",
      traduction: "They will have practiced soccer 10 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado practicando fútbol por dos horas. (duración hasta el futuro)",
      traduction: "They will have been practicing soccer for two hours. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Reviso las redes sociales por la mañana.",
      traduction: "I check social media in the morning."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy revisando las redes sociales ahora mismo. (acción actual)",
      traduction: "I am checking social media right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He revisado las redes sociales todas las mañanas esta semana. (período reciente)",
      traduction: "I have checked social media every morning this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado revisando las redes sociales para mantenerme al día. (enfoque continuo)",
      traduction: "I have been checking social media to stay updated. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Revisé las redes sociales ayer por la mañana.",
      traduction: "I checked social media yesterday morning."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba revisando las redes sociales cuando me llamaron. (interrupción)",
      traduction: "I was checking social media when I got called. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había revisado las redes sociales antes de salir de casa. (acción previa)",
      traduction: "I had checked social media before leaving home. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado revisando las redes sociales durante horas antes de apagar el teléfono. (duración previa)",
      traduction: "I had been checking social media for hours before turning off my phone. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Revisaré las redes sociales mañana por la mañana.",
      traduction: "I will check social media tomorrow morning."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré revisando las redes sociales a las 8 a.m. (plan específico)",
      traduction: "I will be checking social media at 8 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré revisado las redes sociales antes de salir de casa. (completado)",
      traduction: "I will have checked social media before leaving home. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado revisando las redes sociales por 30 minutos. (duración hasta el futuro)",
      traduction: "I will have been checking social media for 30 minutes. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ella compra víveres los domingos.",
      traduction: "She buys groceries on Sundays."
    },
    {
      tense: "presentContinuous",
      phrase: "Ella está comprando víveres ahora mismo. (acción actual)",
      traduction: "She is buying groceries right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ella ha comprado víveres todos los domingos este mes. (período reciente)",
      traduction: "She has bought groceries every Sunday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ella ha estado comprando víveres para prepararse para la semana. (enfoque continuo)",
      traduction: "She has been buying groceries to prepare for the week. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ella compró víveres el domingo pasado.",
      traduction: "She bought groceries last Sunday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ella estaba comprando víveres cuando encontró un producto interesante. (interrupción)",
      traduction: "She was buying groceries when she found an interesting product. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había comprado víveres antes de organizar la cocina. (acción previa)",
      traduction: "She had bought groceries before organizing the kitchen. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado comprando víveres regularmente durante meses antes de cambiar de supermercado. (duración previa)",
      traduction: "She had been buying groceries regularly for months before switching supermarkets. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ella comprará víveres el próximo domingo.",
      traduction: "She will buy groceries next Sunday."
    },
    {
      tense: "futureContinuous",
      phrase: "Ella estará comprando víveres a las 10 a.m. (plan específico)",
      traduction: "She will be buying groceries at 10 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ella habrá comprado víveres para cuando comience la semana. (completado)",
      traduction: "She will have bought groceries by the start of the week. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ella habrá estado comprando víveres por una hora. (duración hasta el futuro)",
      traduction: "She will have been buying groceries for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Asistimos a la iglesia todos los fines de semana.",
      traduction: "We attend church every weekend."
    },
    {
      tense: "presentContinuous",
      phrase: "Estamos asistiendo a la iglesia ahora mismo. (acción actual)",
      traduction: "We are attending church right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Hemos asistido a la iglesia todos los fines de semana este mes. (período reciente)",
      traduction: "We have attended church every weekend this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Hemos estado asistiendo a la iglesia para fortalecer nuestra fe. (enfoque continuo)",
      traduction: "We have been attending church to strengthen our faith. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Asistimos a la iglesia el fin de semana pasado.",
      traduction: "We attended church last weekend."
    },
    {
      tense: "pastContinuous",
      phrase: "Estábamos asistiendo a la iglesia cuando comenzó a llover. (interrupción)",
      traduction: "We were attending church when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habíamos asistido a la iglesia antes de que terminara el día. (acción previa)",
      traduction: "We had attended church before the day ended. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habíamos estado asistiendo a la iglesia regularmente durante años antes de mudarnos. (duración previa)",
      traduction: "We had been attending church regularly for years before moving. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Asistiremos a la iglesia el próximo fin de semana.",
      traduction: "We will attend church next weekend."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré asistiendo a la iglesia a las 10 a.m. (plan específico)",
      traduction: "I will be attending church at 10 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habremos asistido a la iglesia 4 veces para fin de mes. (completado)",
      traduction: "We will have attended church 4 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habremos estado asistiendo a la iglesia por una hora. (duración hasta el futuro)",
      traduction: "We will have been attending church for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Él lava su auto todos los sábados.",
      traduction: "He washes his car every Saturday."
    },
    {
      tense: "presentContinuous",
      phrase: "Él está lavando su auto ahora mismo. (acción actual)",
      traduction: "He is washing his car right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Él ha lavado su auto todos los sábados este mes. (período reciente)",
      traduction: "He has washed his car every Saturday this month. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Él ha estado lavando su auto para mantenerlo limpio. (enfoque continuo)",
      traduction: "He has been washing his car to keep it clean. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Él lavó su auto el sábado pasado.",
      traduction: "He washed his car last Saturday."
    },
    {
      tense: "pastContinuous",
      phrase: "Él estaba lavando su auto cuando comenzó a llover. (interrupción)",
      traduction: "He was washing his car when it started raining. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había lavado su auto antes de que se ensuciara de nuevo. (acción previa)",
      traduction: "He had washed his car before it got dirty again. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado lavando su auto regularmente durante meses antes de tomar un descanso. (duración previa)",
      traduction: "He had been washing his car regularly for months before taking a break. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Él lavará su auto el próximo sábado.",
      traduction: "He will wash his car next Saturday."
    },
    {
      tense: "futureContinuous",
      phrase: "Él estará lavando su auto a las 9 a.m. (plan específico)",
      traduction: "He will be washing his car at 9 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Él habrá lavado su auto 5 veces para fin de mes. (completado)",
      traduction: "He will have washed his car 5 times by the end of the month. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Él habrá estado lavando su auto por una hora. (duración hasta el futuro)",
      traduction: "He will have been washing his car for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Ellos siempre sonríen en las fotos.",
      traduction: "They always smile in photos."
    },
    {
      tense: "presentContinuous",
      phrase: "Ellos están sonriendo en las fotos ahora mismo. (acción actual)",
      traduction: "They are smiling in the photos right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "Ellos han sonreído en todas las fotos que hemos tomado este año. (período reciente)",
      traduction: "They have smiled in all the photos we’ve taken this year. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "Ellos han estado sonriendo en las fotos para parecer felices. (enfoque continuo)",
      traduction: "They have been smiling in the photos to appear happy. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Ellos sonrieron en las fotos ayer.",
      traduction: "They smiled in the photos yesterday."
    },
    {
      tense: "pastContinuous",
      phrase: "Ellos estaban sonriendo en las fotos cuando el fotógrafo les pidió que cambiaran de expresión. (interrupción)",
      traduction: "They were smiling in the photos when the photographer asked them to change expressions. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya habían sonreído en las fotos antes de que el evento terminara. (acción previa)",
      traduction: "They had smiled in the photos before the event ended. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Habían estado sonriendo en las fotos durante horas antes de cansarse. (duración previa)",
      traduction: "They had been smiling in the photos for hours before getting tired. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Ellos sonreirán en las fotos mañana.",
      traduction: "They will smile in the photos tomorrow."
    },
    {
      tense: "futureContinuous",
      phrase: "Ellos estarán sonriendo en las fotos a las 3 p.m. (plan específico)",
      traduction: "They will be smiling in the photos at 3 p.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Ellos habrán sonreído en 20 fotos para el final del día. (completado)",
      traduction: "They will have smiled in 20 photos by the end of the day. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Ellos habrán estado sonriendo en las fotos por una hora. (duración hasta el futuro)",
      traduction: "They will have been smiling in the photos for an hour. (duration up to future)"
    }
  ],
  [
    {
      tense: "simplePresent",
      phrase: "Alimento a mi gato en la mañana.",
      traduction: "I feed my cat in the morning."
    },
    {
      tense: "presentContinuous",
      phrase: "Estoy alimentando a mi gato ahora mismo. (acción actual)",
      traduction: "I am feeding my cat right now. (current action)"
    },
    {
      tense: "presentPerfect",
      phrase: "He alimentado a mi gato todas las mañanas esta semana. (período reciente)",
      traduction: "I have fed my cat every morning this week. (recent period)"
    },
    {
      tense: "presentPerfectContinuous",
      phrase: "He estado alimentando a mi gato temprano para que no tenga hambre. (enfoque continuo)",
      traduction: "I have been feeding my cat early so he doesn’t get hungry. (ongoing focus)"
    },
    {
      tense: "simplePast",
      phrase: "Alimenté a mi gato ayer por la mañana.",
      traduction: "I fed my cat yesterday morning."
    },
    {
      tense: "pastContinuous",
      phrase: "Estaba alimentando a mi gato cuando llegó mi hermano. (interrupción)",
      traduction: "I was feeding my cat when my brother arrived. (interruption)"
    },
    {
      tense: "pastPerfect",
      phrase: "Ya había alimentado a mi gato antes de salir de casa. (acción previa)",
      traduction: "I had fed my cat before leaving home. (prior action)"
    },
    {
      tense: "pastPerfectContinuous",
      phrase: "Había estado alimentando a mi gato temprano durante semanas antes de cambiar su horario. (duración previa)",
      traduction: "I had been feeding my cat early for weeks before changing his schedule. (duration before past)"
    },
    {
      tense: "simpleFuture",
      phrase: "Alimentaré a mi gato mañana por la mañana.",
      traduction: "I will feed my cat tomorrow morning."
    },
    {
      tense: "futureContinuous",
      phrase: "Estaré alimentando a mi gato a las 7 a.m. (plan específico)",
      traduction: "I will be feeding my cat at 7 a.m. (specific plan)"
    },
    {
      tense: "futurePerfect",
      phrase: "Habré alimentado a mi gato antes de irme al trabajo. (completado)",
      traduction: "I will have fed my cat before going to work. (completion)"
    },
    {
      tense: "futurePerfectContinuous",
      phrase: "Habré estado alimentando a mi gato por 15 minutos. (duración hasta el futuro)",
      traduction: "I will have been feeding my cat for 15 minutes. (duration up to future)"
    }
  ]
];

// src/index.ts
var app = () => {
  import_node_cron.schedule("*/30 * * * * *", async () => {
    console.log("enviando frase");
    const phrase = getPhrase(phrases);
    const tense = phrase.tense.replace(/([A-Z])/g, " $1").trim();
    const message = `\uD83D\uDCDA **${tense}**

\uD83D\uDCAC ${phrase.phrase}

`;
    await sendTelegram(message);
    await wait(1e4);
    await sendTelegram(`\uD83C\uDF0D Traducción :
 ${phrase.traduction}`);
  });
};
app();
