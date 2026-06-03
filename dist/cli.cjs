#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
  }
});

// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = isexe;
    isexe.sync = sync;
    var fs8 = require("fs");
    function checkPathExt(path11, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path11.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat, path11, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path11, options);
    }
    function isexe(path11, options, cb) {
      fs8.stat(path11, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path11, options));
      });
    }
    function sync(path11, options) {
      return checkStat(fs8.statSync(path11), path11, options);
    }
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = isexe;
    isexe.sync = sync;
    var fs8 = require("fs");
    function isexe(path11, options, cb) {
      fs8.stat(path11, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    function sync(path11, options) {
      return checkStat(fs8.statSync(path11), options);
    }
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/isexe/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var fs8 = require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module2.exports = isexe;
    isexe.sync = sync;
    function isexe(path11, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path11, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path11, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    function sync(path11, options) {
      try {
        return core.sync(path11, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
  }
});

// node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/which/which.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path11 = require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
    var getPathInfo = (cmd, opt) => {
      const colon = opt.colon || COLON;
      const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
        // windows always checks the cwd first
        ...isWindows ? [process.cwd()] : [],
        ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
        "").split(colon)
      ];
      const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
      const pathExt = isWindows ? pathExtExe.split(colon) : [""];
      if (isWindows) {
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      return {
        pathEnv,
        pathExt,
        pathExtExe
      };
    };
    var which = (cmd, opt, cb) => {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      if (!opt)
        opt = {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      const step = (i) => new Promise((resolve, reject) => {
        if (i === pathEnv.length)
          return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path11.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        resolve(subStep(p, i, 0));
      });
      const subStep = (p, i, ii) => new Promise((resolve, reject) => {
        if (ii === pathExt.length)
          return resolve(step(i + 1));
        const ext = pathExt[ii];
        isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
          if (!er && is) {
            if (opt.all)
              found.push(p + ext);
            else
              return resolve(p + ext);
          }
          return resolve(subStep(p, i, ii + 1));
        });
      });
      return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
    };
    var whichSync = (cmd, opt) => {
      opt = opt || {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      for (let i = 0; i < pathEnv.length; i++) {
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path11.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        for (let j = 0; j < pathExt.length; j++) {
          const cur = p + pathExt[j];
          try {
            const is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    };
    module2.exports = which;
    which.sync = whichSync;
  }
});

// node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/path-key/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var pathKey2 = (options = {}) => {
      const environment = options.env || process.env;
      const platform = options.platform || process.platform;
      if (platform !== "win32") {
        return "PATH";
      }
      return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
    };
    module2.exports = pathKey2;
    module2.exports.default = pathKey2;
  }
});

// node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/cross-spawn/lib/util/resolveCommand.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var path11 = require("path");
    var which = require_which();
    var getPathKey = require_path_key();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const env = parsed.options.env || process.env;
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
      if (shouldSwitchCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: env[getPathKey({ env })],
          pathExt: withoutPathExt ? path11.delimiter : void 0
        });
      } catch (e) {
      } finally {
        if (shouldSwitchCwd) {
          process.chdir(cwd);
        }
      }
      if (resolved) {
        resolved = path11.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    module2.exports = resolveCommand;
  }
});

// node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/cross-spawn/lib/util/escape.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg) {
      arg = arg.replace(metaCharsRegExp, "^$1");
      return arg;
    }
    function escapeArgument(arg, doubleEscapeMetaChars) {
      arg = `${arg}`;
      arg = arg.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"');
      arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
      arg = `"${arg}"`;
      arg = arg.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, "^$1");
      }
      return arg;
    }
    module2.exports.command = escapeCommand;
    module2.exports.argument = escapeArgument;
  }
});

// node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/shebang-regex/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = /^#!(.*)/;
  }
});

// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/shebang-command/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var shebangRegex = require_shebang_regex();
    module2.exports = (string = "") => {
      const match = string.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path11, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path11.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});

// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/cross-spawn/lib/util/readShebang.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var fs8 = require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs8.openSync(command, "r");
        fs8.readSync(fd, buffer, 0, size, 0);
        fs8.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module2.exports = readShebang;
  }
});

// node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/cross-spawn/lib/parse.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var path11 = require("path");
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path11.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    function parse2(command, args, options) {
      if (args && !Array.isArray(args)) {
        options = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options = Object.assign({}, options);
      const parsed = {
        command,
        args,
        options,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options.shell ? parsed : parseNonShell(parsed);
    }
    module2.exports = parse2;
  }
});

// node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/cross-spawn/lib/enoent.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed);
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    module2.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/cross-spawn/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var cp = require("child_process");
    var parse2 = require_parse();
    var enoent = require_enoent();
    function spawn(command, args, options) {
      const parsed = parse2(command, args, options);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync(command, args, options) {
      const parsed = parse2(command, args, options);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module2.exports = spawn;
    module2.exports.spawn = spawn;
    module2.exports.sync = spawnSync;
    module2.exports._parse = parse2;
    module2.exports._enoent = enoent;
  }
});

// node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
  const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
  const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
  if (input[input.length - 1] === LF) {
    input = input.slice(0, -1);
  }
  if (input[input.length - 1] === CR) {
    input = input.slice(0, -1);
  }
  return input;
}
var init_strip_final_newline = __esm({
  "node_modules/strip-final-newline/index.js"() {
    "use strict";
    init_cjs_shims();
  }
});

// node_modules/npm-run-path/node_modules/path-key/index.js
function pathKey(options = {}) {
  const {
    env = process.env,
    platform = process.platform
  } = options;
  if (platform !== "win32") {
    return "PATH";
  }
  return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}
var init_path_key = __esm({
  "node_modules/npm-run-path/node_modules/path-key/index.js"() {
    "use strict";
    init_cjs_shims();
  }
});

// node_modules/npm-run-path/index.js
var import_node_process, import_node_path7, import_node_url, npmRunPath, applyPreferLocal, applyExecPath, npmRunPathEnv;
var init_npm_run_path = __esm({
  "node_modules/npm-run-path/index.js"() {
    "use strict";
    init_cjs_shims();
    import_node_process = __toESM(require("process"), 1);
    import_node_path7 = __toESM(require("path"), 1);
    import_node_url = require("url");
    init_path_key();
    npmRunPath = ({
      cwd = import_node_process.default.cwd(),
      path: pathOption = import_node_process.default.env[pathKey()],
      preferLocal = true,
      execPath = import_node_process.default.execPath,
      addExecPath = true
    } = {}) => {
      const cwdString = cwd instanceof URL ? (0, import_node_url.fileURLToPath)(cwd) : cwd;
      const cwdPath = import_node_path7.default.resolve(cwdString);
      const result = [];
      if (preferLocal) {
        applyPreferLocal(result, cwdPath);
      }
      if (addExecPath) {
        applyExecPath(result, execPath, cwdPath);
      }
      return [...result, pathOption].join(import_node_path7.default.delimiter);
    };
    applyPreferLocal = (result, cwdPath) => {
      let previous;
      while (previous !== cwdPath) {
        result.push(import_node_path7.default.join(cwdPath, "node_modules/.bin"));
        previous = cwdPath;
        cwdPath = import_node_path7.default.resolve(cwdPath, "..");
      }
    };
    applyExecPath = (result, execPath, cwdPath) => {
      const execPathString = execPath instanceof URL ? (0, import_node_url.fileURLToPath)(execPath) : execPath;
      result.push(import_node_path7.default.resolve(cwdPath, execPathString, ".."));
    };
    npmRunPathEnv = ({ env = import_node_process.default.env, ...options } = {}) => {
      env = { ...env };
      const pathName = pathKey({ env });
      options.path = env[pathName];
      env[pathName] = npmRunPath(options);
      return env;
    };
  }
});

// node_modules/mimic-fn/index.js
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}
var copyProperty, canCopyProperty, changePrototype, wrappedToString, toStringDescriptor, toStringName, changeToString;
var init_mimic_fn = __esm({
  "node_modules/mimic-fn/index.js"() {
    "use strict";
    init_cjs_shims();
    copyProperty = (to, from, property, ignoreNonConfigurable) => {
      if (property === "length" || property === "prototype") {
        return;
      }
      if (property === "arguments" || property === "caller") {
        return;
      }
      const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
      const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
      if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
        return;
      }
      Object.defineProperty(to, property, fromDescriptor);
    };
    canCopyProperty = function(toDescriptor, fromDescriptor) {
      return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
    };
    changePrototype = (to, from) => {
      const fromPrototype = Object.getPrototypeOf(from);
      if (fromPrototype === Object.getPrototypeOf(to)) {
        return;
      }
      Object.setPrototypeOf(to, fromPrototype);
    };
    wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
    toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
    toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
    changeToString = (to, from, name) => {
      const withName = name === "" ? "" : `with ${name.trim()}() `;
      const newToString = wrappedToString.bind(null, withName, from.toString());
      Object.defineProperty(newToString, "name", toStringName);
      Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
    };
  }
});

// node_modules/onetime/index.js
var calledFunctions, onetime, onetime_default;
var init_onetime = __esm({
  "node_modules/onetime/index.js"() {
    "use strict";
    init_cjs_shims();
    init_mimic_fn();
    calledFunctions = /* @__PURE__ */ new WeakMap();
    onetime = (function_, options = {}) => {
      if (typeof function_ !== "function") {
        throw new TypeError("Expected a function");
      }
      let returnValue;
      let callCount = 0;
      const functionName = function_.displayName || function_.name || "<anonymous>";
      const onetime2 = function(...arguments_) {
        calledFunctions.set(onetime2, ++callCount);
        if (callCount === 1) {
          returnValue = function_.apply(this, arguments_);
          function_ = null;
        } else if (options.throw === true) {
          throw new Error(`Function \`${functionName}\` can only be called once`);
        }
        return returnValue;
      };
      mimicFunction(onetime2, function_);
      calledFunctions.set(onetime2, callCount);
      return onetime2;
    };
    onetime.callCount = (function_) => {
      if (!calledFunctions.has(function_)) {
        throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
      }
      return calledFunctions.get(function_);
    };
    onetime_default = onetime;
  }
});

// node_modules/human-signals/build/src/realtime.js
var getRealtimeSignals, getRealtimeSignal, SIGRTMIN, SIGRTMAX;
var init_realtime = __esm({
  "node_modules/human-signals/build/src/realtime.js"() {
    "use strict";
    init_cjs_shims();
    getRealtimeSignals = () => {
      const length = SIGRTMAX - SIGRTMIN + 1;
      return Array.from({ length }, getRealtimeSignal);
    };
    getRealtimeSignal = (value, index) => ({
      name: `SIGRT${index + 1}`,
      number: SIGRTMIN + index,
      action: "terminate",
      description: "Application-specific signal (realtime)",
      standard: "posix"
    });
    SIGRTMIN = 34;
    SIGRTMAX = 64;
  }
});

// node_modules/human-signals/build/src/core.js
var SIGNALS;
var init_core = __esm({
  "node_modules/human-signals/build/src/core.js"() {
    "use strict";
    init_cjs_shims();
    SIGNALS = [
      {
        name: "SIGHUP",
        number: 1,
        action: "terminate",
        description: "Terminal closed",
        standard: "posix"
      },
      {
        name: "SIGINT",
        number: 2,
        action: "terminate",
        description: "User interruption with CTRL-C",
        standard: "ansi"
      },
      {
        name: "SIGQUIT",
        number: 3,
        action: "core",
        description: "User interruption with CTRL-\\",
        standard: "posix"
      },
      {
        name: "SIGILL",
        number: 4,
        action: "core",
        description: "Invalid machine instruction",
        standard: "ansi"
      },
      {
        name: "SIGTRAP",
        number: 5,
        action: "core",
        description: "Debugger breakpoint",
        standard: "posix"
      },
      {
        name: "SIGABRT",
        number: 6,
        action: "core",
        description: "Aborted",
        standard: "ansi"
      },
      {
        name: "SIGIOT",
        number: 6,
        action: "core",
        description: "Aborted",
        standard: "bsd"
      },
      {
        name: "SIGBUS",
        number: 7,
        action: "core",
        description: "Bus error due to misaligned, non-existing address or paging error",
        standard: "bsd"
      },
      {
        name: "SIGEMT",
        number: 7,
        action: "terminate",
        description: "Command should be emulated but is not implemented",
        standard: "other"
      },
      {
        name: "SIGFPE",
        number: 8,
        action: "core",
        description: "Floating point arithmetic error",
        standard: "ansi"
      },
      {
        name: "SIGKILL",
        number: 9,
        action: "terminate",
        description: "Forced termination",
        standard: "posix",
        forced: true
      },
      {
        name: "SIGUSR1",
        number: 10,
        action: "terminate",
        description: "Application-specific signal",
        standard: "posix"
      },
      {
        name: "SIGSEGV",
        number: 11,
        action: "core",
        description: "Segmentation fault",
        standard: "ansi"
      },
      {
        name: "SIGUSR2",
        number: 12,
        action: "terminate",
        description: "Application-specific signal",
        standard: "posix"
      },
      {
        name: "SIGPIPE",
        number: 13,
        action: "terminate",
        description: "Broken pipe or socket",
        standard: "posix"
      },
      {
        name: "SIGALRM",
        number: 14,
        action: "terminate",
        description: "Timeout or timer",
        standard: "posix"
      },
      {
        name: "SIGTERM",
        number: 15,
        action: "terminate",
        description: "Termination",
        standard: "ansi"
      },
      {
        name: "SIGSTKFLT",
        number: 16,
        action: "terminate",
        description: "Stack is empty or overflowed",
        standard: "other"
      },
      {
        name: "SIGCHLD",
        number: 17,
        action: "ignore",
        description: "Child process terminated, paused or unpaused",
        standard: "posix"
      },
      {
        name: "SIGCLD",
        number: 17,
        action: "ignore",
        description: "Child process terminated, paused or unpaused",
        standard: "other"
      },
      {
        name: "SIGCONT",
        number: 18,
        action: "unpause",
        description: "Unpaused",
        standard: "posix",
        forced: true
      },
      {
        name: "SIGSTOP",
        number: 19,
        action: "pause",
        description: "Paused",
        standard: "posix",
        forced: true
      },
      {
        name: "SIGTSTP",
        number: 20,
        action: "pause",
        description: 'Paused using CTRL-Z or "suspend"',
        standard: "posix"
      },
      {
        name: "SIGTTIN",
        number: 21,
        action: "pause",
        description: "Background process cannot read terminal input",
        standard: "posix"
      },
      {
        name: "SIGBREAK",
        number: 21,
        action: "terminate",
        description: "User interruption with CTRL-BREAK",
        standard: "other"
      },
      {
        name: "SIGTTOU",
        number: 22,
        action: "pause",
        description: "Background process cannot write to terminal output",
        standard: "posix"
      },
      {
        name: "SIGURG",
        number: 23,
        action: "ignore",
        description: "Socket received out-of-band data",
        standard: "bsd"
      },
      {
        name: "SIGXCPU",
        number: 24,
        action: "core",
        description: "Process timed out",
        standard: "bsd"
      },
      {
        name: "SIGXFSZ",
        number: 25,
        action: "core",
        description: "File too big",
        standard: "bsd"
      },
      {
        name: "SIGVTALRM",
        number: 26,
        action: "terminate",
        description: "Timeout or timer",
        standard: "bsd"
      },
      {
        name: "SIGPROF",
        number: 27,
        action: "terminate",
        description: "Timeout or timer",
        standard: "bsd"
      },
      {
        name: "SIGWINCH",
        number: 28,
        action: "ignore",
        description: "Terminal window size changed",
        standard: "bsd"
      },
      {
        name: "SIGIO",
        number: 29,
        action: "terminate",
        description: "I/O is available",
        standard: "other"
      },
      {
        name: "SIGPOLL",
        number: 29,
        action: "terminate",
        description: "Watched event",
        standard: "other"
      },
      {
        name: "SIGINFO",
        number: 29,
        action: "ignore",
        description: "Request for process information",
        standard: "other"
      },
      {
        name: "SIGPWR",
        number: 30,
        action: "terminate",
        description: "Device running out of power",
        standard: "systemv"
      },
      {
        name: "SIGSYS",
        number: 31,
        action: "core",
        description: "Invalid system call",
        standard: "other"
      },
      {
        name: "SIGUNUSED",
        number: 31,
        action: "terminate",
        description: "Invalid system call",
        standard: "other"
      }
    ];
  }
});

// node_modules/human-signals/build/src/signals.js
var import_node_os, getSignals, normalizeSignal;
var init_signals = __esm({
  "node_modules/human-signals/build/src/signals.js"() {
    "use strict";
    init_cjs_shims();
    import_node_os = require("os");
    init_core();
    init_realtime();
    getSignals = () => {
      const realtimeSignals = getRealtimeSignals();
      const signals2 = [...SIGNALS, ...realtimeSignals].map(normalizeSignal);
      return signals2;
    };
    normalizeSignal = ({
      name,
      number: defaultNumber,
      description,
      action,
      forced = false,
      standard
    }) => {
      const {
        signals: { [name]: constantSignal }
      } = import_node_os.constants;
      const supported = constantSignal !== void 0;
      const number = supported ? constantSignal : defaultNumber;
      return { name, number, description, supported, action, forced, standard };
    };
  }
});

// node_modules/human-signals/build/src/main.js
var import_node_os2, getSignalsByName, getSignalByName, signalsByName, getSignalsByNumber, getSignalByNumber, findSignalByNumber, signalsByNumber;
var init_main = __esm({
  "node_modules/human-signals/build/src/main.js"() {
    "use strict";
    init_cjs_shims();
    import_node_os2 = require("os");
    init_realtime();
    init_signals();
    getSignalsByName = () => {
      const signals2 = getSignals();
      return Object.fromEntries(signals2.map(getSignalByName));
    };
    getSignalByName = ({
      name,
      number,
      description,
      supported,
      action,
      forced,
      standard
    }) => [name, { name, number, description, supported, action, forced, standard }];
    signalsByName = getSignalsByName();
    getSignalsByNumber = () => {
      const signals2 = getSignals();
      const length = SIGRTMAX + 1;
      const signalsA = Array.from(
        { length },
        (value, number) => getSignalByNumber(number, signals2)
      );
      return Object.assign({}, ...signalsA);
    };
    getSignalByNumber = (number, signals2) => {
      const signal = findSignalByNumber(number, signals2);
      if (signal === void 0) {
        return {};
      }
      const { name, description, supported, action, forced, standard } = signal;
      return {
        [number]: {
          name,
          number,
          description,
          supported,
          action,
          forced,
          standard
        }
      };
    };
    findSignalByNumber = (number, signals2) => {
      const signal = signals2.find(({ name }) => import_node_os2.constants.signals[name] === number);
      if (signal !== void 0) {
        return signal;
      }
      return signals2.find((signalA) => signalA.number === number);
    };
    signalsByNumber = getSignalsByNumber();
  }
});

// node_modules/execa/lib/error.js
var import_node_process2, getErrorPrefix, makeError;
var init_error = __esm({
  "node_modules/execa/lib/error.js"() {
    "use strict";
    init_cjs_shims();
    import_node_process2 = __toESM(require("process"), 1);
    init_main();
    getErrorPrefix = ({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
      if (timedOut) {
        return `timed out after ${timeout} milliseconds`;
      }
      if (isCanceled) {
        return "was canceled";
      }
      if (errorCode !== void 0) {
        return `failed with ${errorCode}`;
      }
      if (signal !== void 0) {
        return `was killed with ${signal} (${signalDescription})`;
      }
      if (exitCode !== void 0) {
        return `failed with exit code ${exitCode}`;
      }
      return "failed";
    };
    makeError = ({
      stdout,
      stderr,
      all,
      error,
      signal,
      exitCode,
      command,
      escapedCommand,
      timedOut,
      isCanceled,
      killed,
      parsed: { options: { timeout, cwd = import_node_process2.default.cwd() } }
    }) => {
      exitCode = exitCode === null ? void 0 : exitCode;
      signal = signal === null ? void 0 : signal;
      const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
      const errorCode = error && error.code;
      const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
      const execaMessage = `Command ${prefix}: ${command}`;
      const isError = Object.prototype.toString.call(error) === "[object Error]";
      const shortMessage = isError ? `${execaMessage}
${error.message}` : execaMessage;
      const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
      if (isError) {
        error.originalMessage = error.message;
        error.message = message;
      } else {
        error = new Error(message);
      }
      error.shortMessage = shortMessage;
      error.command = command;
      error.escapedCommand = escapedCommand;
      error.exitCode = exitCode;
      error.signal = signal;
      error.signalDescription = signalDescription;
      error.stdout = stdout;
      error.stderr = stderr;
      error.cwd = cwd;
      if (all !== void 0) {
        error.all = all;
      }
      if ("bufferedData" in error) {
        delete error.bufferedData;
      }
      error.failed = true;
      error.timedOut = Boolean(timedOut);
      error.isCanceled = isCanceled;
      error.killed = killed && !timedOut;
      return error;
    };
  }
});

// node_modules/execa/lib/stdio.js
var aliases, hasAlias, normalizeStdio, normalizeStdioNode;
var init_stdio = __esm({
  "node_modules/execa/lib/stdio.js"() {
    "use strict";
    init_cjs_shims();
    aliases = ["stdin", "stdout", "stderr"];
    hasAlias = (options) => aliases.some((alias) => options[alias] !== void 0);
    normalizeStdio = (options) => {
      if (!options) {
        return;
      }
      const { stdio } = options;
      if (stdio === void 0) {
        return aliases.map((alias) => options[alias]);
      }
      if (hasAlias(options)) {
        throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
      }
      if (typeof stdio === "string") {
        return stdio;
      }
      if (!Array.isArray(stdio)) {
        throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
      }
      const length = Math.max(stdio.length, aliases.length);
      return Array.from({ length }, (value, index) => stdio[index]);
    };
    normalizeStdioNode = (options) => {
      const stdio = normalizeStdio(options);
      if (stdio === "ipc") {
        return "ipc";
      }
      if (stdio === void 0 || typeof stdio === "string") {
        return [stdio, stdio, stdio, "ipc"];
      }
      if (stdio.includes("ipc")) {
        return stdio;
      }
      return [...stdio, "ipc"];
    };
  }
});

// node_modules/signal-exit/dist/mjs/signals.js
var signals;
var init_signals2 = __esm({
  "node_modules/signal-exit/dist/mjs/signals.js"() {
    "use strict";
    init_cjs_shims();
    signals = [];
    signals.push("SIGHUP", "SIGINT", "SIGTERM");
    if (process.platform !== "win32") {
      signals.push(
        "SIGALRM",
        "SIGABRT",
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
    }
  }
});

// node_modules/signal-exit/dist/mjs/index.js
var processOk, kExitEmitter, global2, ObjectDefineProperty, Emitter, SignalExitBase, signalExitWrap, SignalExitFallback, _hupSig, _emitter, _process, _originalProcessEmit, _originalProcessReallyExit, _sigListeners, _loaded, _SignalExit_instances, processReallyExit_fn, processEmit_fn, SignalExit, process4, onExit, load, unload;
var init_mjs = __esm({
  "node_modules/signal-exit/dist/mjs/index.js"() {
    "use strict";
    init_cjs_shims();
    init_signals2();
    processOk = (process7) => !!process7 && typeof process7 === "object" && typeof process7.removeListener === "function" && typeof process7.emit === "function" && typeof process7.reallyExit === "function" && typeof process7.listeners === "function" && typeof process7.kill === "function" && typeof process7.pid === "number" && typeof process7.on === "function";
    kExitEmitter = /* @__PURE__ */ Symbol.for("signal-exit emitter");
    global2 = globalThis;
    ObjectDefineProperty = Object.defineProperty.bind(Object);
    Emitter = class {
      constructor() {
        __publicField(this, "emitted", {
          afterExit: false,
          exit: false
        });
        __publicField(this, "listeners", {
          afterExit: [],
          exit: []
        });
        __publicField(this, "count", 0);
        __publicField(this, "id", Math.random());
        if (global2[kExitEmitter]) {
          return global2[kExitEmitter];
        }
        ObjectDefineProperty(global2, kExitEmitter, {
          value: this,
          writable: false,
          enumerable: false,
          configurable: false
        });
      }
      on(ev, fn) {
        this.listeners[ev].push(fn);
      }
      removeListener(ev, fn) {
        const list = this.listeners[ev];
        const i = list.indexOf(fn);
        if (i === -1) {
          return;
        }
        if (i === 0 && list.length === 1) {
          list.length = 0;
        } else {
          list.splice(i, 1);
        }
      }
      emit(ev, code, signal) {
        if (this.emitted[ev]) {
          return false;
        }
        this.emitted[ev] = true;
        let ret = false;
        for (const fn of this.listeners[ev]) {
          ret = fn(code, signal) === true || ret;
        }
        if (ev === "exit") {
          ret = this.emit("afterExit", code, signal) || ret;
        }
        return ret;
      }
    };
    SignalExitBase = class {
    };
    signalExitWrap = (handler) => {
      return {
        onExit(cb, opts) {
          return handler.onExit(cb, opts);
        },
        load() {
          return handler.load();
        },
        unload() {
          return handler.unload();
        }
      };
    };
    SignalExitFallback = class extends SignalExitBase {
      onExit() {
        return () => {
        };
      }
      load() {
      }
      unload() {
      }
    };
    SignalExit = class extends SignalExitBase {
      constructor(process7) {
        super();
        __privateAdd(this, _SignalExit_instances);
        // "SIGHUP" throws an `ENOSYS` error on Windows,
        // so use a supported signal instead
        /* c8 ignore start */
        __privateAdd(this, _hupSig, process4.platform === "win32" ? "SIGINT" : "SIGHUP");
        /* c8 ignore stop */
        __privateAdd(this, _emitter, new Emitter());
        __privateAdd(this, _process);
        __privateAdd(this, _originalProcessEmit);
        __privateAdd(this, _originalProcessReallyExit);
        __privateAdd(this, _sigListeners, {});
        __privateAdd(this, _loaded, false);
        __privateSet(this, _process, process7);
        __privateSet(this, _sigListeners, {});
        for (const sig of signals) {
          __privateGet(this, _sigListeners)[sig] = () => {
            const listeners = __privateGet(this, _process).listeners(sig);
            let { count } = __privateGet(this, _emitter);
            const p = process7;
            if (typeof p.__signal_exit_emitter__ === "object" && typeof p.__signal_exit_emitter__.count === "number") {
              count += p.__signal_exit_emitter__.count;
            }
            if (listeners.length === count) {
              this.unload();
              const ret = __privateGet(this, _emitter).emit("exit", null, sig);
              const s = sig === "SIGHUP" ? __privateGet(this, _hupSig) : sig;
              if (!ret)
                process7.kill(process7.pid, s);
            }
          };
        }
        __privateSet(this, _originalProcessReallyExit, process7.reallyExit);
        __privateSet(this, _originalProcessEmit, process7.emit);
      }
      onExit(cb, opts) {
        if (!processOk(__privateGet(this, _process))) {
          return () => {
          };
        }
        if (__privateGet(this, _loaded) === false) {
          this.load();
        }
        const ev = opts?.alwaysLast ? "afterExit" : "exit";
        __privateGet(this, _emitter).on(ev, cb);
        return () => {
          __privateGet(this, _emitter).removeListener(ev, cb);
          if (__privateGet(this, _emitter).listeners["exit"].length === 0 && __privateGet(this, _emitter).listeners["afterExit"].length === 0) {
            this.unload();
          }
        };
      }
      load() {
        if (__privateGet(this, _loaded)) {
          return;
        }
        __privateSet(this, _loaded, true);
        __privateGet(this, _emitter).count += 1;
        for (const sig of signals) {
          try {
            const fn = __privateGet(this, _sigListeners)[sig];
            if (fn)
              __privateGet(this, _process).on(sig, fn);
          } catch (_) {
          }
        }
        __privateGet(this, _process).emit = (ev, ...a) => {
          return __privateMethod(this, _SignalExit_instances, processEmit_fn).call(this, ev, ...a);
        };
        __privateGet(this, _process).reallyExit = (code) => {
          return __privateMethod(this, _SignalExit_instances, processReallyExit_fn).call(this, code);
        };
      }
      unload() {
        if (!__privateGet(this, _loaded)) {
          return;
        }
        __privateSet(this, _loaded, false);
        signals.forEach((sig) => {
          const listener = __privateGet(this, _sigListeners)[sig];
          if (!listener) {
            throw new Error("Listener not defined for signal: " + sig);
          }
          try {
            __privateGet(this, _process).removeListener(sig, listener);
          } catch (_) {
          }
        });
        __privateGet(this, _process).emit = __privateGet(this, _originalProcessEmit);
        __privateGet(this, _process).reallyExit = __privateGet(this, _originalProcessReallyExit);
        __privateGet(this, _emitter).count -= 1;
      }
    };
    _hupSig = new WeakMap();
    _emitter = new WeakMap();
    _process = new WeakMap();
    _originalProcessEmit = new WeakMap();
    _originalProcessReallyExit = new WeakMap();
    _sigListeners = new WeakMap();
    _loaded = new WeakMap();
    _SignalExit_instances = new WeakSet();
    processReallyExit_fn = function(code) {
      if (!processOk(__privateGet(this, _process))) {
        return 0;
      }
      __privateGet(this, _process).exitCode = code || 0;
      __privateGet(this, _emitter).emit("exit", __privateGet(this, _process).exitCode, null);
      return __privateGet(this, _originalProcessReallyExit).call(__privateGet(this, _process), __privateGet(this, _process).exitCode);
    };
    processEmit_fn = function(ev, ...args) {
      const og = __privateGet(this, _originalProcessEmit);
      if (ev === "exit" && processOk(__privateGet(this, _process))) {
        if (typeof args[0] === "number") {
          __privateGet(this, _process).exitCode = args[0];
        }
        const ret = og.call(__privateGet(this, _process), ev, ...args);
        __privateGet(this, _emitter).emit("exit", __privateGet(this, _process).exitCode, null);
        return ret;
      } else {
        return og.call(__privateGet(this, _process), ev, ...args);
      }
    };
    process4 = globalThis.process;
    ({
      onExit: (
        /**
         * Called when the process is exiting, whether via signal, explicit
         * exit, or running out of stuff to do.
         *
         * If the global process object is not suitable for instrumentation,
         * then this will be a no-op.
         *
         * Returns a function that may be used to unload signal-exit.
         */
        onExit
      ),
      load: (
        /**
         * Load the listeners.  Likely you never need to call this, unless
         * doing a rather deep integration with signal-exit functionality.
         * Mostly exposed for the benefit of testing.
         *
         * @internal
         */
        load
      ),
      unload: (
        /**
         * Unload the listeners.  Likely you never need to call this, unless
         * doing a rather deep integration with signal-exit functionality.
         * Mostly exposed for the benefit of testing.
         *
         * @internal
         */
        unload
      )
    } = signalExitWrap(processOk(process4) ? new SignalExit(process4) : new SignalExitFallback()));
  }
});

// node_modules/execa/lib/kill.js
var import_node_os3, DEFAULT_FORCE_KILL_TIMEOUT, spawnedKill, setKillTimeout, shouldForceKill, isSigterm, getForceKillAfterTimeout, spawnedCancel, timeoutKill, setupTimeout, validateTimeout, setExitHandler;
var init_kill = __esm({
  "node_modules/execa/lib/kill.js"() {
    "use strict";
    init_cjs_shims();
    import_node_os3 = __toESM(require("os"), 1);
    init_mjs();
    DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
    spawnedKill = (kill, signal = "SIGTERM", options = {}) => {
      const killResult = kill(signal);
      setKillTimeout(kill, signal, options, killResult);
      return killResult;
    };
    setKillTimeout = (kill, signal, options, killResult) => {
      if (!shouldForceKill(signal, options, killResult)) {
        return;
      }
      const timeout = getForceKillAfterTimeout(options);
      const t = setTimeout(() => {
        kill("SIGKILL");
      }, timeout);
      if (t.unref) {
        t.unref();
      }
    };
    shouldForceKill = (signal, { forceKillAfterTimeout }, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
    isSigterm = (signal) => signal === import_node_os3.default.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
    getForceKillAfterTimeout = ({ forceKillAfterTimeout = true }) => {
      if (forceKillAfterTimeout === true) {
        return DEFAULT_FORCE_KILL_TIMEOUT;
      }
      if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
        throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
      }
      return forceKillAfterTimeout;
    };
    spawnedCancel = (spawned, context) => {
      const killResult = spawned.kill();
      if (killResult) {
        context.isCanceled = true;
      }
    };
    timeoutKill = (spawned, signal, reject) => {
      spawned.kill(signal);
      reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
    };
    setupTimeout = (spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
      if (timeout === 0 || timeout === void 0) {
        return spawnedPromise;
      }
      let timeoutId;
      const timeoutPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          timeoutKill(spawned, killSignal, reject);
        }, timeout);
      });
      const safeSpawnedPromise = spawnedPromise.finally(() => {
        clearTimeout(timeoutId);
      });
      return Promise.race([timeoutPromise, safeSpawnedPromise]);
    };
    validateTimeout = ({ timeout }) => {
      if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
        throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
      }
    };
    setExitHandler = async (spawned, { cleanup, detached }, timedPromise) => {
      if (!cleanup || detached) {
        return timedPromise;
      }
      const removeExitHandler = onExit(() => {
        spawned.kill();
      });
      return timedPromise.finally(() => {
        removeExitHandler();
      });
    };
  }
});

// node_modules/is-stream/index.js
function isStream(stream) {
  return stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
}
function isWritableStream(stream) {
  return isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
}
var init_is_stream = __esm({
  "node_modules/is-stream/index.js"() {
    "use strict";
    init_cjs_shims();
  }
});

// node_modules/execa/lib/pipe.js
var import_node_fs8, import_node_child_process, isExecaChildProcess, pipeToTarget, addPipeMethods;
var init_pipe = __esm({
  "node_modules/execa/lib/pipe.js"() {
    "use strict";
    init_cjs_shims();
    import_node_fs8 = require("fs");
    import_node_child_process = require("child_process");
    init_is_stream();
    isExecaChildProcess = (target) => target instanceof import_node_child_process.ChildProcess && typeof target.then === "function";
    pipeToTarget = (spawned, streamName, target) => {
      if (typeof target === "string") {
        spawned[streamName].pipe((0, import_node_fs8.createWriteStream)(target));
        return spawned;
      }
      if (isWritableStream(target)) {
        spawned[streamName].pipe(target);
        return spawned;
      }
      if (!isExecaChildProcess(target)) {
        throw new TypeError("The second argument must be a string, a stream or an Execa child process.");
      }
      if (!isWritableStream(target.stdin)) {
        throw new TypeError("The target child process's stdin must be available.");
      }
      spawned[streamName].pipe(target.stdin);
      return target;
    };
    addPipeMethods = (spawned) => {
      if (spawned.stdout !== null) {
        spawned.pipeStdout = pipeToTarget.bind(void 0, spawned, "stdout");
      }
      if (spawned.stderr !== null) {
        spawned.pipeStderr = pipeToTarget.bind(void 0, spawned, "stderr");
      }
      if (spawned.all !== void 0) {
        spawned.pipeAll = pipeToTarget.bind(void 0, spawned, "all");
      }
    };
  }
});

// node_modules/get-stream/source/contents.js
var getStreamContents, appendFinalChunk, appendChunk, addNewChunk, isAsyncIterable, getChunkType, objectToString, MaxBufferError;
var init_contents = __esm({
  "node_modules/get-stream/source/contents.js"() {
    "use strict";
    init_cjs_shims();
    getStreamContents = async (stream, { init, convertChunk, getSize, truncateChunk, addChunk, getFinalChunk, finalize }, { maxBuffer = Number.POSITIVE_INFINITY } = {}) => {
      if (!isAsyncIterable(stream)) {
        throw new Error("The first argument must be a Readable, a ReadableStream, or an async iterable.");
      }
      const state = init();
      state.length = 0;
      try {
        for await (const chunk of stream) {
          const chunkType = getChunkType(chunk);
          const convertedChunk = convertChunk[chunkType](chunk, state);
          appendChunk({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer });
        }
        appendFinalChunk({ state, convertChunk, getSize, truncateChunk, addChunk, getFinalChunk, maxBuffer });
        return finalize(state);
      } catch (error) {
        error.bufferedData = finalize(state);
        throw error;
      }
    };
    appendFinalChunk = ({ state, getSize, truncateChunk, addChunk, getFinalChunk, maxBuffer }) => {
      const convertedChunk = getFinalChunk(state);
      if (convertedChunk !== void 0) {
        appendChunk({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer });
      }
    };
    appendChunk = ({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer }) => {
      const chunkSize = getSize(convertedChunk);
      const newLength = state.length + chunkSize;
      if (newLength <= maxBuffer) {
        addNewChunk(convertedChunk, state, addChunk, newLength);
        return;
      }
      const truncatedChunk = truncateChunk(convertedChunk, maxBuffer - state.length);
      if (truncatedChunk !== void 0) {
        addNewChunk(truncatedChunk, state, addChunk, maxBuffer);
      }
      throw new MaxBufferError();
    };
    addNewChunk = (convertedChunk, state, addChunk, newLength) => {
      state.contents = addChunk(convertedChunk, state, newLength);
      state.length = newLength;
    };
    isAsyncIterable = (stream) => typeof stream === "object" && stream !== null && typeof stream[Symbol.asyncIterator] === "function";
    getChunkType = (chunk) => {
      const typeOfChunk = typeof chunk;
      if (typeOfChunk === "string") {
        return "string";
      }
      if (typeOfChunk !== "object" || chunk === null) {
        return "others";
      }
      if (globalThis.Buffer?.isBuffer(chunk)) {
        return "buffer";
      }
      const prototypeName = objectToString.call(chunk);
      if (prototypeName === "[object ArrayBuffer]") {
        return "arrayBuffer";
      }
      if (prototypeName === "[object DataView]") {
        return "dataView";
      }
      if (Number.isInteger(chunk.byteLength) && Number.isInteger(chunk.byteOffset) && objectToString.call(chunk.buffer) === "[object ArrayBuffer]") {
        return "typedArray";
      }
      return "others";
    };
    ({ toString: objectToString } = Object.prototype);
    MaxBufferError = class extends Error {
      constructor() {
        super("maxBuffer exceeded");
        __publicField(this, "name", "MaxBufferError");
      }
    };
  }
});

// node_modules/get-stream/source/utils.js
var identity, noop, getContentsProp, throwObjectStream, getLengthProp;
var init_utils = __esm({
  "node_modules/get-stream/source/utils.js"() {
    "use strict";
    init_cjs_shims();
    identity = (value) => value;
    noop = () => void 0;
    getContentsProp = ({ contents }) => contents;
    throwObjectStream = (chunk) => {
      throw new Error(`Streams in object mode are not supported: ${String(chunk)}`);
    };
    getLengthProp = (convertedChunk) => convertedChunk.length;
  }
});

// node_modules/get-stream/source/array.js
var init_array = __esm({
  "node_modules/get-stream/source/array.js"() {
    "use strict";
    init_cjs_shims();
    init_contents();
    init_utils();
  }
});

// node_modules/get-stream/source/array-buffer.js
async function getStreamAsArrayBuffer(stream, options) {
  return getStreamContents(stream, arrayBufferMethods, options);
}
var initArrayBuffer, useTextEncoder, textEncoder, useUint8Array, useUint8ArrayWithOffset, truncateArrayBufferChunk, addArrayBufferChunk, resizeArrayBufferSlow, resizeArrayBuffer, getNewContentsLength, SCALE_FACTOR, finalizeArrayBuffer, hasArrayBufferResize, arrayBufferMethods;
var init_array_buffer = __esm({
  "node_modules/get-stream/source/array-buffer.js"() {
    "use strict";
    init_cjs_shims();
    init_contents();
    init_utils();
    initArrayBuffer = () => ({ contents: new ArrayBuffer(0) });
    useTextEncoder = (chunk) => textEncoder.encode(chunk);
    textEncoder = new TextEncoder();
    useUint8Array = (chunk) => new Uint8Array(chunk);
    useUint8ArrayWithOffset = (chunk) => new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    truncateArrayBufferChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
    addArrayBufferChunk = (convertedChunk, { contents, length: previousLength }, length) => {
      const newContents = hasArrayBufferResize() ? resizeArrayBuffer(contents, length) : resizeArrayBufferSlow(contents, length);
      new Uint8Array(newContents).set(convertedChunk, previousLength);
      return newContents;
    };
    resizeArrayBufferSlow = (contents, length) => {
      if (length <= contents.byteLength) {
        return contents;
      }
      const arrayBuffer = new ArrayBuffer(getNewContentsLength(length));
      new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
      return arrayBuffer;
    };
    resizeArrayBuffer = (contents, length) => {
      if (length <= contents.maxByteLength) {
        contents.resize(length);
        return contents;
      }
      const arrayBuffer = new ArrayBuffer(length, { maxByteLength: getNewContentsLength(length) });
      new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
      return arrayBuffer;
    };
    getNewContentsLength = (length) => SCALE_FACTOR ** Math.ceil(Math.log(length) / Math.log(SCALE_FACTOR));
    SCALE_FACTOR = 2;
    finalizeArrayBuffer = ({ contents, length }) => hasArrayBufferResize() ? contents : contents.slice(0, length);
    hasArrayBufferResize = () => "resize" in ArrayBuffer.prototype;
    arrayBufferMethods = {
      init: initArrayBuffer,
      convertChunk: {
        string: useTextEncoder,
        buffer: useUint8Array,
        arrayBuffer: useUint8Array,
        dataView: useUint8ArrayWithOffset,
        typedArray: useUint8ArrayWithOffset,
        others: throwObjectStream
      },
      getSize: getLengthProp,
      truncateChunk: truncateArrayBufferChunk,
      addChunk: addArrayBufferChunk,
      getFinalChunk: noop,
      finalize: finalizeArrayBuffer
    };
  }
});

// node_modules/get-stream/source/buffer.js
async function getStreamAsBuffer(stream, options) {
  if (!("Buffer" in globalThis)) {
    throw new Error("getStreamAsBuffer() is only supported in Node.js");
  }
  try {
    return arrayBufferToNodeBuffer(await getStreamAsArrayBuffer(stream, options));
  } catch (error) {
    if (error.bufferedData !== void 0) {
      error.bufferedData = arrayBufferToNodeBuffer(error.bufferedData);
    }
    throw error;
  }
}
var arrayBufferToNodeBuffer;
var init_buffer = __esm({
  "node_modules/get-stream/source/buffer.js"() {
    "use strict";
    init_cjs_shims();
    init_array_buffer();
    arrayBufferToNodeBuffer = (arrayBuffer) => globalThis.Buffer.from(arrayBuffer);
  }
});

// node_modules/get-stream/source/string.js
async function getStreamAsString(stream, options) {
  return getStreamContents(stream, stringMethods, options);
}
var initString, useTextDecoder, addStringChunk, truncateStringChunk, getFinalStringChunk, stringMethods;
var init_string = __esm({
  "node_modules/get-stream/source/string.js"() {
    "use strict";
    init_cjs_shims();
    init_contents();
    init_utils();
    initString = () => ({ contents: "", textDecoder: new TextDecoder() });
    useTextDecoder = (chunk, { textDecoder }) => textDecoder.decode(chunk, { stream: true });
    addStringChunk = (convertedChunk, { contents }) => contents + convertedChunk;
    truncateStringChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
    getFinalStringChunk = ({ textDecoder }) => {
      const finalChunk = textDecoder.decode();
      return finalChunk === "" ? void 0 : finalChunk;
    };
    stringMethods = {
      init: initString,
      convertChunk: {
        string: identity,
        buffer: useTextDecoder,
        arrayBuffer: useTextDecoder,
        dataView: useTextDecoder,
        typedArray: useTextDecoder,
        others: throwObjectStream
      },
      getSize: getLengthProp,
      truncateChunk: truncateStringChunk,
      addChunk: addStringChunk,
      getFinalChunk: getFinalStringChunk,
      finalize: getContentsProp
    };
  }
});

// node_modules/get-stream/source/index.js
var init_source = __esm({
  "node_modules/get-stream/source/index.js"() {
    "use strict";
    init_cjs_shims();
    init_array();
    init_array_buffer();
    init_buffer();
    init_string();
    init_contents();
  }
});

// node_modules/merge-stream/index.js
var require_merge_stream = __commonJS({
  "node_modules/merge-stream/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var { PassThrough } = require("stream");
    module2.exports = function() {
      var sources = [];
      var output = new PassThrough({ objectMode: true });
      output.setMaxListeners(0);
      output.add = add;
      output.isEmpty = isEmpty;
      output.on("unpipe", remove);
      Array.prototype.slice.call(arguments).forEach(add);
      return output;
      function add(source) {
        if (Array.isArray(source)) {
          source.forEach(add);
          return this;
        }
        sources.push(source);
        source.once("end", remove.bind(null, source));
        source.once("error", output.emit.bind(output, "error"));
        source.pipe(output, { end: false });
        return this;
      }
      function isEmpty() {
        return sources.length == 0;
      }
      function remove(source) {
        sources = sources.filter(function(it) {
          return it !== source;
        });
        if (!sources.length && output.readable) {
          output.end();
        }
      }
    };
  }
});

// node_modules/execa/lib/stream.js
var import_node_fs9, import_promises, import_merge_stream, validateInputOptions, getInputSync, handleInputSync, getInput, handleInput, makeAllStream, getBufferedData, getStreamPromise, applyEncoding, getSpawnedResult;
var init_stream = __esm({
  "node_modules/execa/lib/stream.js"() {
    "use strict";
    init_cjs_shims();
    import_node_fs9 = require("fs");
    import_promises = require("timers/promises");
    init_is_stream();
    init_source();
    import_merge_stream = __toESM(require_merge_stream(), 1);
    validateInputOptions = (input) => {
      if (input !== void 0) {
        throw new TypeError("The `input` and `inputFile` options cannot be both set.");
      }
    };
    getInputSync = ({ input, inputFile }) => {
      if (typeof inputFile !== "string") {
        return input;
      }
      validateInputOptions(input);
      return (0, import_node_fs9.readFileSync)(inputFile);
    };
    handleInputSync = (options) => {
      const input = getInputSync(options);
      if (isStream(input)) {
        throw new TypeError("The `input` option cannot be a stream in sync mode");
      }
      return input;
    };
    getInput = ({ input, inputFile }) => {
      if (typeof inputFile !== "string") {
        return input;
      }
      validateInputOptions(input);
      return (0, import_node_fs9.createReadStream)(inputFile);
    };
    handleInput = (spawned, options) => {
      const input = getInput(options);
      if (input === void 0) {
        return;
      }
      if (isStream(input)) {
        input.pipe(spawned.stdin);
      } else {
        spawned.stdin.end(input);
      }
    };
    makeAllStream = (spawned, { all }) => {
      if (!all || !spawned.stdout && !spawned.stderr) {
        return;
      }
      const mixed = (0, import_merge_stream.default)();
      if (spawned.stdout) {
        mixed.add(spawned.stdout);
      }
      if (spawned.stderr) {
        mixed.add(spawned.stderr);
      }
      return mixed;
    };
    getBufferedData = async (stream, streamPromise) => {
      if (!stream || streamPromise === void 0) {
        return;
      }
      await (0, import_promises.setTimeout)(0);
      stream.destroy();
      try {
        return await streamPromise;
      } catch (error) {
        return error.bufferedData;
      }
    };
    getStreamPromise = (stream, { encoding, buffer, maxBuffer }) => {
      if (!stream || !buffer) {
        return;
      }
      if (encoding === "utf8" || encoding === "utf-8") {
        return getStreamAsString(stream, { maxBuffer });
      }
      if (encoding === null || encoding === "buffer") {
        return getStreamAsBuffer(stream, { maxBuffer });
      }
      return applyEncoding(stream, maxBuffer, encoding);
    };
    applyEncoding = async (stream, maxBuffer, encoding) => {
      const buffer = await getStreamAsBuffer(stream, { maxBuffer });
      return buffer.toString(encoding);
    };
    getSpawnedResult = async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
      const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
      const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
      const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
      try {
        return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
      } catch (error) {
        return Promise.all([
          { error, signal: error.signal, timedOut: error.timedOut },
          getBufferedData(stdout, stdoutPromise),
          getBufferedData(stderr, stderrPromise),
          getBufferedData(all, allPromise)
        ]);
      }
    };
  }
});

// node_modules/execa/lib/promise.js
var nativePromisePrototype, descriptors, mergePromise, getSpawnedPromise;
var init_promise = __esm({
  "node_modules/execa/lib/promise.js"() {
    "use strict";
    init_cjs_shims();
    nativePromisePrototype = (async () => {
    })().constructor.prototype;
    descriptors = ["then", "catch", "finally"].map((property) => [
      property,
      Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
    ]);
    mergePromise = (spawned, promise) => {
      for (const [property, descriptor] of descriptors) {
        const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
        Reflect.defineProperty(spawned, property, { ...descriptor, value });
      }
    };
    getSpawnedPromise = (spawned) => new Promise((resolve, reject) => {
      spawned.on("exit", (exitCode, signal) => {
        resolve({ exitCode, signal });
      });
      spawned.on("error", (error) => {
        reject(error);
      });
      if (spawned.stdin) {
        spawned.stdin.on("error", (error) => {
          reject(error);
        });
      }
    });
  }
});

// node_modules/execa/lib/command.js
var import_node_buffer, import_node_child_process2, normalizeArgs, NO_ESCAPE_REGEXP, escapeArg, joinCommand, getEscapedCommand, SPACES_REGEXP, parseCommand, parseExpression, concatTokens, parseTemplate, parseTemplates;
var init_command = __esm({
  "node_modules/execa/lib/command.js"() {
    "use strict";
    init_cjs_shims();
    import_node_buffer = require("buffer");
    import_node_child_process2 = require("child_process");
    normalizeArgs = (file, args = []) => {
      if (!Array.isArray(args)) {
        return [file];
      }
      return [file, ...args];
    };
    NO_ESCAPE_REGEXP = /^[\w.-]+$/;
    escapeArg = (arg) => {
      if (typeof arg !== "string" || NO_ESCAPE_REGEXP.test(arg)) {
        return arg;
      }
      return `"${arg.replaceAll('"', '\\"')}"`;
    };
    joinCommand = (file, args) => normalizeArgs(file, args).join(" ");
    getEscapedCommand = (file, args) => normalizeArgs(file, args).map((arg) => escapeArg(arg)).join(" ");
    SPACES_REGEXP = / +/g;
    parseCommand = (command) => {
      const tokens = [];
      for (const token of command.trim().split(SPACES_REGEXP)) {
        const previousToken = tokens.at(-1);
        if (previousToken && previousToken.endsWith("\\")) {
          tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
        } else {
          tokens.push(token);
        }
      }
      return tokens;
    };
    parseExpression = (expression) => {
      const typeOfExpression = typeof expression;
      if (typeOfExpression === "string") {
        return expression;
      }
      if (typeOfExpression === "number") {
        return String(expression);
      }
      if (typeOfExpression === "object" && expression !== null && !(expression instanceof import_node_child_process2.ChildProcess) && "stdout" in expression) {
        const typeOfStdout = typeof expression.stdout;
        if (typeOfStdout === "string") {
          return expression.stdout;
        }
        if (import_node_buffer.Buffer.isBuffer(expression.stdout)) {
          return expression.stdout.toString();
        }
        throw new TypeError(`Unexpected "${typeOfStdout}" stdout in template expression`);
      }
      throw new TypeError(`Unexpected "${typeOfExpression}" in template expression`);
    };
    concatTokens = (tokens, nextTokens, isNew) => isNew || tokens.length === 0 || nextTokens.length === 0 ? [...tokens, ...nextTokens] : [
      ...tokens.slice(0, -1),
      `${tokens.at(-1)}${nextTokens[0]}`,
      ...nextTokens.slice(1)
    ];
    parseTemplate = ({ templates, expressions, tokens, index, template }) => {
      const templateString = template ?? templates.raw[index];
      const templateTokens = templateString.split(SPACES_REGEXP).filter(Boolean);
      const newTokens = concatTokens(
        tokens,
        templateTokens,
        templateString.startsWith(" ")
      );
      if (index === expressions.length) {
        return newTokens;
      }
      const expression = expressions[index];
      const expressionTokens = Array.isArray(expression) ? expression.map((expression2) => parseExpression(expression2)) : [parseExpression(expression)];
      return concatTokens(
        newTokens,
        expressionTokens,
        templateString.endsWith(" ")
      );
    };
    parseTemplates = (templates, expressions) => {
      let tokens = [];
      for (const [index, template] of templates.entries()) {
        tokens = parseTemplate({ templates, expressions, tokens, index, template });
      }
      return tokens;
    };
  }
});

// node_modules/execa/lib/verbose.js
var import_node_util, import_node_process3, verboseDefault, padField, getTimestamp, logCommand;
var init_verbose = __esm({
  "node_modules/execa/lib/verbose.js"() {
    "use strict";
    init_cjs_shims();
    import_node_util = require("util");
    import_node_process3 = __toESM(require("process"), 1);
    verboseDefault = (0, import_node_util.debuglog)("execa").enabled;
    padField = (field, padding) => String(field).padStart(padding, "0");
    getTimestamp = () => {
      const date = /* @__PURE__ */ new Date();
      return `${padField(date.getHours(), 2)}:${padField(date.getMinutes(), 2)}:${padField(date.getSeconds(), 2)}.${padField(date.getMilliseconds(), 3)}`;
    };
    logCommand = (escapedCommand, { verbose }) => {
      if (!verbose) {
        return;
      }
      import_node_process3.default.stderr.write(`[${getTimestamp()}] ${escapedCommand}
`);
    };
  }
});

// node_modules/execa/index.js
var execa_exports = {};
__export(execa_exports, {
  $: () => $,
  execa: () => execa,
  execaCommand: () => execaCommand,
  execaCommandSync: () => execaCommandSync,
  execaNode: () => execaNode,
  execaSync: () => execaSync
});
function execa(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  logCommand(escapedCommand, parsed.options);
  validateTimeout(parsed.options);
  let spawned;
  try {
    spawned = import_node_child_process3.default.spawn(parsed.file, parsed.args, parsed.options);
  } catch (error) {
    const dummySpawned = new import_node_child_process3.default.ChildProcess();
    const errorPromise = Promise.reject(makeError({
      error,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    }));
    mergePromise(dummySpawned, errorPromise);
    return dummySpawned;
  }
  const spawnedPromise = getSpawnedPromise(spawned);
  const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
  const processDone = setExitHandler(spawned, parsed.options, timedPromise);
  const context = { isCanceled: false };
  spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
  spawned.cancel = spawnedCancel.bind(null, spawned, context);
  const handlePromise = async () => {
    const [{ error, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
    const stdout = handleOutput(parsed.options, stdoutResult);
    const stderr = handleOutput(parsed.options, stderrResult);
    const all = handleOutput(parsed.options, allResult);
    if (error || exitCode !== 0 || signal !== null) {
      const returnedError = makeError({
        error,
        exitCode,
        signal,
        stdout,
        stderr,
        all,
        command,
        escapedCommand,
        parsed,
        timedOut,
        isCanceled: context.isCanceled || (parsed.options.signal ? parsed.options.signal.aborted : false),
        killed: spawned.killed
      });
      if (!parsed.options.reject) {
        return returnedError;
      }
      throw returnedError;
    }
    return {
      command,
      escapedCommand,
      exitCode: 0,
      stdout,
      stderr,
      all,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  };
  const handlePromiseOnce = onetime_default(handlePromise);
  handleInput(spawned, parsed.options);
  spawned.all = makeAllStream(spawned, parsed.options);
  addPipeMethods(spawned);
  mergePromise(spawned, handlePromiseOnce);
  return spawned;
}
function execaSync(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  logCommand(escapedCommand, parsed.options);
  const input = handleInputSync(parsed.options);
  let result;
  try {
    result = import_node_child_process3.default.spawnSync(parsed.file, parsed.args, { ...parsed.options, input });
  } catch (error) {
    throw makeError({
      error,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    });
  }
  const stdout = handleOutput(parsed.options, result.stdout, result.error);
  const stderr = handleOutput(parsed.options, result.stderr, result.error);
  if (result.error || result.status !== 0 || result.signal !== null) {
    const error = makeError({
      stdout,
      stderr,
      error: result.error,
      signal: result.signal,
      exitCode: result.status,
      command,
      escapedCommand,
      parsed,
      timedOut: result.error && result.error.code === "ETIMEDOUT",
      isCanceled: false,
      killed: result.signal !== null
    });
    if (!parsed.options.reject) {
      return error;
    }
    throw error;
  }
  return {
    command,
    escapedCommand,
    exitCode: 0,
    stdout,
    stderr,
    failed: false,
    timedOut: false,
    isCanceled: false,
    killed: false
  };
}
function create$(options) {
  function $2(templatesOrOptions, ...expressions) {
    if (!Array.isArray(templatesOrOptions)) {
      return create$({ ...options, ...templatesOrOptions });
    }
    const [file, ...args] = parseTemplates(templatesOrOptions, expressions);
    return execa(file, args, normalizeScriptOptions(options));
  }
  $2.sync = (templates, ...expressions) => {
    if (!Array.isArray(templates)) {
      throw new TypeError("Please use $(options).sync`command` instead of $.sync(options)`command`.");
    }
    const [file, ...args] = parseTemplates(templates, expressions);
    return execaSync(file, args, normalizeScriptOptions(options));
  };
  return $2;
}
function execaCommand(command, options) {
  const [file, ...args] = parseCommand(command);
  return execa(file, args, options);
}
function execaCommandSync(command, options) {
  const [file, ...args] = parseCommand(command);
  return execaSync(file, args, options);
}
function execaNode(scriptPath, args, options = {}) {
  if (args && !Array.isArray(args) && typeof args === "object") {
    options = args;
    args = [];
  }
  const stdio = normalizeStdioNode(options);
  const defaultExecArgv = import_node_process4.default.execArgv.filter((arg) => !arg.startsWith("--inspect"));
  const {
    nodePath = import_node_process4.default.execPath,
    nodeOptions = defaultExecArgv
  } = options;
  return execa(
    nodePath,
    [
      ...nodeOptions,
      scriptPath,
      ...Array.isArray(args) ? args : []
    ],
    {
      ...options,
      stdin: void 0,
      stdout: void 0,
      stderr: void 0,
      stdio,
      shell: false
    }
  );
}
var import_node_buffer2, import_node_path8, import_node_child_process3, import_node_process4, import_cross_spawn, DEFAULT_MAX_BUFFER, getEnv, handleArguments, handleOutput, normalizeScriptStdin, normalizeScriptOptions, $;
var init_execa = __esm({
  "node_modules/execa/index.js"() {
    "use strict";
    init_cjs_shims();
    import_node_buffer2 = require("buffer");
    import_node_path8 = __toESM(require("path"), 1);
    import_node_child_process3 = __toESM(require("child_process"), 1);
    import_node_process4 = __toESM(require("process"), 1);
    import_cross_spawn = __toESM(require_cross_spawn(), 1);
    init_strip_final_newline();
    init_npm_run_path();
    init_onetime();
    init_error();
    init_stdio();
    init_kill();
    init_pipe();
    init_stream();
    init_promise();
    init_command();
    init_verbose();
    DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
    getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
      const env = extendEnv ? { ...import_node_process4.default.env, ...envOption } : envOption;
      if (preferLocal) {
        return npmRunPathEnv({ env, cwd: localDir, execPath });
      }
      return env;
    };
    handleArguments = (file, args, options = {}) => {
      const parsed = import_cross_spawn.default._parse(file, args, options);
      file = parsed.command;
      args = parsed.args;
      options = parsed.options;
      options = {
        maxBuffer: DEFAULT_MAX_BUFFER,
        buffer: true,
        stripFinalNewline: true,
        extendEnv: true,
        preferLocal: false,
        localDir: options.cwd || import_node_process4.default.cwd(),
        execPath: import_node_process4.default.execPath,
        encoding: "utf8",
        reject: true,
        cleanup: true,
        all: false,
        windowsHide: true,
        verbose: verboseDefault,
        ...options
      };
      options.env = getEnv(options);
      options.stdio = normalizeStdio(options);
      if (import_node_process4.default.platform === "win32" && import_node_path8.default.basename(file, ".exe") === "cmd") {
        args.unshift("/q");
      }
      return { file, args, options, parsed };
    };
    handleOutput = (options, value, error) => {
      if (typeof value !== "string" && !import_node_buffer2.Buffer.isBuffer(value)) {
        return error === void 0 ? void 0 : "";
      }
      if (options.stripFinalNewline) {
        return stripFinalNewline(value);
      }
      return value;
    };
    normalizeScriptStdin = ({ input, inputFile, stdio }) => input === void 0 && inputFile === void 0 && stdio === void 0 ? { stdin: "inherit" } : {};
    normalizeScriptOptions = (options = {}) => ({
      preferLocal: true,
      ...normalizeScriptStdin(options),
      ...options
    });
    $ = create$();
  }
});

// src/cli.ts
init_cjs_shims();
var import_cac = require("cac");
var import_picocolors3 = __toESM(require("picocolors"), 1);
var import_node_path10 = __toESM(require("path"), 1);

// src/index.ts
init_cjs_shims();

// src/glob.ts
init_cjs_shims();
var import_tinyglobby = require("tinyglobby");
var import_node_path = __toESM(require("path"), 1);
var import_node_fs = __toESM(require("fs"), 1);
var SOURCE_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "mts"];
var IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  "**/.git/**",
  "**/*.test.*",
  "**/*.spec.*",
  "**/__tests__/**"
];
async function collectSourceFiles(projectRoot) {
  const patterns = SOURCE_EXTENSIONS.map((ext) => `**/*.${ext}`);
  const files = await (0, import_tinyglobby.glob)(patterns, {
    cwd: projectRoot,
    ignore: IGNORE_PATTERNS,
    absolute: true,
    followSymbolicLinks: false
  });
  return files.filter((f) => import_node_fs.default.existsSync(f));
}
function resolveProjectRoot(dir) {
  const resolved = import_node_path.default.resolve(dir);
  if (!import_node_fs.default.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }
  return resolved;
}

// src/graph.ts
init_cjs_shims();
var import_node_path4 = __toESM(require("path"), 1);
var import_node_fs5 = __toESM(require("fs"), 1);

// src/parser.ts
init_cjs_shims();
var import_parser = require("@babel/parser");
var import_traverse = __toESM(require("@babel/traverse"), 1);
var import_node_fs2 = __toESM(require("fs"), 1);
var traverse = import_traverse.default.default ?? import_traverse.default;
var HOOK_PATTERN = /^use[A-Z]/;
var BROWSER_GLOBALS = /* @__PURE__ */ new Set([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "location",
  "history",
  "indexedDB",
  "crypto",
  "performance"
]);
var BROWSER_ONLY_CALLS = /* @__PURE__ */ new Set([
  "createBrowserClient",
  // @supabase/ssr
  "createClientComponentClient",
  // @supabase/auth-helpers-nextjs
  "createClient",
  // generic pattern — detected by import source
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "matchMedia"
]);
var CLIENT_ONLY_PACKAGES = /* @__PURE__ */ new Set([
  "framer-motion",
  "react-spring",
  "lottie-react",
  "react-confetti",
  "react-hot-toast",
  "sonner",
  // Apollo / GraphQL client — needs React context, browser fetch
  "@apollo/client",
  "@apollo/react-hooks",
  // Radix UI — all primitives are DOM-interactive client components
  "@radix-ui/",
  // React Three Fiber / 3D — WebGL, entirely client
  "@react-three/fiber",
  "@react-three/drei",
  // Drag and drop
  "@dnd-kit/core",
  "@dnd-kit/sortable",
  "react-beautiful-dnd",
  // Charts
  "recharts",
  "chart.js",
  "react-chartjs-2",
  // Rich text editors
  "slate",
  "slate-react",
  "@tiptap/react",
  "react-quill"
]);
var EVENT_PROP_PATTERN = /^on[A-Z]/;
function parseFile(filePath) {
  let code;
  try {
    code = import_node_fs2.default.readFileSync(filePath, "utf-8");
  } catch {
    return { hasUseClient: false, imports: [], reExportSources: [], clientSignals: [] };
  }
  let ast;
  try {
    ast = (0, import_parser.parse)(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
      errorRecovery: true
    });
  } catch {
    return { hasUseClient: false, imports: [], reExportSources: [], clientSignals: [] };
  }
  const imports = [];
  const reExportSources = [];
  const foundSignals = /* @__PURE__ */ new Set();
  const hasUseClient = ast.program.directives.some(
    (d) => d.value.value === "use client"
  );
  traverse(ast, {
    ImportDeclaration(nodePath) {
      const source = nodePath.node.source.value;
      imports.push(source);
      const isClientPkg = CLIENT_ONLY_PACKAGES.has(source) || CLIENT_ONLY_PACKAGES.has(source.split("/").slice(0, source.startsWith("@") ? 2 : 1).join("/")) || [...CLIENT_ONLY_PACKAGES].some((pkg) => pkg.endsWith("/") && source.startsWith(pkg));
      if (isClientPkg) {
        foundSignals.add(source);
      }
    },
    ExportAllDeclaration(nodePath) {
      if (nodePath.node.source) {
        const src = nodePath.node.source.value;
        imports.push(src);
        reExportSources.push(src);
      }
    },
    ExportNamedDeclaration(nodePath) {
      if (nodePath.node.source) {
        const src = nodePath.node.source.value;
        imports.push(src);
        reExportSources.push(src);
      }
    },
    // Dynamic import() — add to import graph so propagation follows through lazy boundaries
    ImportExpression(nodePath) {
      const src = nodePath.node.source;
      if (src.type === "StringLiteral") {
        imports.push(src.value);
      }
    },
    Identifier(nodePath) {
      const name = nodePath.node.name;
      const parent = nodePath.parent;
      const isImportSpecifier = parent.type === "ImportSpecifier" || parent.type === "ImportDefaultSpecifier" || parent.type === "ImportNamespaceSpecifier";
      if (isImportSpecifier) return;
      if (HOOK_PATTERN.test(name)) {
        if (parent.type === "CallExpression" || parent.type === "VariableDeclarator" || parent.type === "ArrayPattern" || parent.type === "ObjectPattern") {
          foundSignals.add(name);
        }
      }
      if (BROWSER_GLOBALS.has(name)) {
        foundSignals.add(name);
      }
      if (BROWSER_ONLY_CALLS.has(name) && parent.type === "CallExpression") {
        foundSignals.add(name);
      }
    },
    JSXAttribute(nodePath) {
      const name = nodePath.node.name;
      if (name.type === "JSXIdentifier" && EVENT_PROP_PATTERN.test(name.name)) {
        foundSignals.add(name.name);
      }
    },
    MemberExpression(nodePath) {
      const { object: obj, property: prop } = nodePath.node;
      if (obj.type === "Identifier" && BROWSER_GLOBALS.has(obj.name)) {
        foundSignals.add(obj.name);
      }
      if (obj.type === "Identifier" && obj.name === "React" && prop.type === "Identifier" && HOOK_PATTERN.test(prop.name)) {
        foundSignals.add(`React.${prop.name}`);
      }
    },
    // next/dynamic with { ssr: false } is an explicit client signal
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      const args = nodePath.node.arguments;
      const isDynamic = callee.type === "Identifier" && callee.name === "dynamic" || callee.type === "MemberExpression" && callee.property.type === "Identifier" && callee.property.name === "dynamic";
      if (isDynamic && args.length >= 2) {
        const opts = args[1];
        if (opts?.type === "ObjectExpression") {
          const ssrProp = opts.properties.find(
            (p) => p.type === "ObjectProperty" && (p.key.type === "Identifier" && p.key.name === "ssr" || p.key.type === "StringLiteral" && p.key.value === "ssr")
          );
          if (ssrProp && ssrProp.type === "ObjectProperty" && ssrProp.value.type === "BooleanLiteral" && ssrProp.value.value === false) {
            foundSignals.add("dynamic(ssr:false)");
          }
        }
      }
    }
  });
  return {
    hasUseClient,
    imports,
    reExportSources,
    clientSignals: Array.from(foundSignals)
  };
}

// src/resolver.ts
init_cjs_shims();
var import_node_path3 = __toESM(require("path"), 1);
var import_node_fs4 = __toESM(require("fs"), 1);
var import_get_tsconfig = require("get-tsconfig");

// src/monorepo.ts
init_cjs_shims();
var import_node_path2 = __toESM(require("path"), 1);
var import_node_fs3 = __toESM(require("fs"), 1);
var import_tinyglobby2 = require("tinyglobby");
var _workspaceCache = null;
function resetWorkspaceCache() {
  _workspaceCache = null;
}
function findMonorepoRoot(projectRoot) {
  let dir = projectRoot;
  const root = import_node_path2.default.parse(dir).root;
  while (dir !== root) {
    if (import_node_fs3.default.existsSync(import_node_path2.default.join(dir, "pnpm-workspace.yaml")) || import_node_fs3.default.existsSync(import_node_path2.default.join(dir, "turbo.json")) || hasWorkspacesField(import_node_path2.default.join(dir, "package.json"))) {
      if (dir !== projectRoot) return dir;
    }
    dir = import_node_path2.default.dirname(dir);
  }
  return null;
}
function hasWorkspacesField(pkgPath) {
  try {
    const pkg = JSON.parse(import_node_fs3.default.readFileSync(pkgPath, "utf-8"));
    return Array.isArray(pkg.workspaces) || typeof pkg.workspaces === "object";
  } catch {
    return false;
  }
}
function getWorkspacePatterns(monorepoRoot) {
  const pnpmWs = import_node_path2.default.join(monorepoRoot, "pnpm-workspace.yaml");
  if (import_node_fs3.default.existsSync(pnpmWs)) {
    const content = import_node_fs3.default.readFileSync(pnpmWs, "utf-8");
    const matches = content.match(/^\s*-\s*['"]?([^'"#\n]+?)['"]?\s*$/gm);
    if (matches) {
      return matches.map((m) => m.replace(/^\s*-\s*['"]?/, "").replace(/['"]?\s*$/, "").trim());
    }
  }
  const pkgPath = import_node_path2.default.join(monorepoRoot, "package.json");
  try {
    const pkg = JSON.parse(import_node_fs3.default.readFileSync(pkgPath, "utf-8"));
    const ws = pkg.workspaces;
    if (Array.isArray(ws)) return ws;
    if (Array.isArray(ws?.packages)) return ws.packages;
  } catch {
  }
  return ["packages/*", "apps/*"];
}
async function loadWorkspacePackages(monorepoRoot) {
  if (_workspaceCache) return _workspaceCache;
  const patterns = getWorkspacePatterns(monorepoRoot);
  const packageDirs = await (0, import_tinyglobby2.glob)(
    patterns.map((p) => `${p}/package.json`),
    { cwd: monorepoRoot, absolute: true }
  );
  const map = /* @__PURE__ */ new Map();
  for (const pkgJsonPath of packageDirs) {
    try {
      const pkg = JSON.parse(import_node_fs3.default.readFileSync(pkgJsonPath, "utf-8"));
      const pkgRoot = import_node_path2.default.dirname(pkgJsonPath);
      const name = pkg.name;
      if (!name) continue;
      const entry = resolvePackageEntry(pkgRoot, pkg);
      map.set(name, { name, root: pkgRoot, entry });
    } catch {
    }
  }
  _workspaceCache = map;
  return map;
}
function resolvePackageEntry(pkgRoot, pkg) {
  const candidates = [
    pkg.source,
    // unbundled source — best for monorepos
    pkg.module,
    pkg.main,
    "src/index.ts",
    "src/index.tsx",
    "index.ts",
    "index.tsx",
    "src/index.js",
    "index.js"
  ].filter(Boolean);
  for (const candidate of candidates) {
    const full = import_node_path2.default.resolve(pkgRoot, candidate);
    if (import_node_fs3.default.existsSync(full)) return full;
  }
  return null;
}
function resolveWorkspaceImport(importSource, packages) {
  const exact = packages.get(importSource);
  if (exact?.entry) return exact.entry;
  for (const [name, pkg] of packages) {
    if (importSource.startsWith(name + "/")) {
      const subPath = importSource.slice(name.length + 1);
      const resolved = resolveSubPath(pkg.root, subPath);
      if (resolved) return resolved;
    }
  }
  return null;
}
var EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
function resolveSubPath(pkgRoot, subPath) {
  const base = import_node_path2.default.join(pkgRoot, subPath);
  if (import_node_fs3.default.existsSync(base) && import_node_fs3.default.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (import_node_fs3.default.existsSync(candidate)) return candidate;
  }
  const withSrc = import_node_path2.default.join(pkgRoot, "src", subPath);
  for (const ext of EXTENSIONS) {
    const candidate = withSrc + ext;
    if (import_node_fs3.default.existsSync(candidate)) return candidate;
  }
  return null;
}

// src/resolver.ts
var EXTENSIONS2 = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
var _aliases = null;
var _workspacePackages = /* @__PURE__ */ new Map();
function setWorkspacePackages(packages) {
  _workspacePackages = packages;
}
function loadAliases(projectRoot) {
  if (_aliases) return _aliases;
  let options = {};
  try {
    const result = (0, import_get_tsconfig.getTsconfig)(projectRoot);
    options = result?.config?.compilerOptions ?? {};
  } catch {
    options = readTsconfigDirect(projectRoot);
  }
  const baseUrl = options.baseUrl ? import_node_path3.default.resolve(projectRoot, options.baseUrl) : projectRoot;
  const rawPaths = options.paths ?? {};
  const paths = {};
  for (const [key, vals] of Object.entries(rawPaths)) {
    paths[key] = vals.map(
      (v) => import_node_path3.default.resolve(baseUrl, v.replace(/\*$/, ""))
    );
  }
  _aliases = { baseUrl, paths };
  return _aliases;
}
function readTsconfigDirect(projectRoot) {
  const tsconfigPath = import_node_path3.default.join(projectRoot, "tsconfig.json");
  try {
    const raw = import_node_fs4.default.readFileSync(tsconfigPath, "utf-8");
    const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const parsed = JSON.parse(stripped);
    return parsed.compilerOptions ?? {};
  } catch {
    return {};
  }
}
function resetAliases() {
  _aliases = null;
}
function resolveWithExtensions(base) {
  if (import_node_fs4.default.existsSync(base) && import_node_fs4.default.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS2) {
    const candidate = base + ext;
    if (import_node_fs4.default.existsSync(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS2) {
    const candidate = import_node_path3.default.join(base, `index${ext}`);
    if (import_node_fs4.default.existsSync(candidate)) return candidate;
  }
  return null;
}
function resolveImport(importSource, importerDir, aliases2) {
  if (!importSource.startsWith(".") && !importSource.startsWith("/")) {
    for (const [aliasKey, aliasPaths] of Object.entries(aliases2.paths)) {
      const aliasPrefix = aliasKey.replace(/\*$/, "");
      if (importSource.startsWith(aliasPrefix)) {
        const suffix = importSource.slice(aliasPrefix.length);
        for (const aliasPath of aliasPaths) {
          const resolved = resolveWithExtensions(import_node_path3.default.join(aliasPath, suffix));
          if (resolved) return resolved;
        }
      }
    }
    if (_workspacePackages.size > 0) {
      const wsResolved = resolveWorkspaceImport(importSource, _workspacePackages);
      if (wsResolved) return wsResolved;
    }
    return null;
  }
  const absolute = import_node_path3.default.resolve(importerDir, importSource);
  return resolveWithExtensions(absolute);
}

// src/graph.ts
function buildImportGraph(files, projectRoot) {
  const nodes = /* @__PURE__ */ new Map();
  const edges = /* @__PURE__ */ new Map();
  const reverseEdges = /* @__PURE__ */ new Map();
  const aliases2 = loadAliases(projectRoot);
  const rawImportsRecord = /* @__PURE__ */ new Map();
  const reExportSourcesMap = /* @__PURE__ */ new Map();
  for (const filePath of files) {
    const { hasUseClient, imports, reExportSources, clientSignals } = parseFile(filePath);
    const sizeBytes = safeStatSize(filePath);
    nodes.set(filePath, {
      filePath,
      displayPath: import_node_path4.default.relative(projectRoot, filePath),
      isClientBoundary: hasUseClient,
      isClientGraph: hasUseClient,
      clientSignals,
      imports: [],
      sizeBytes
    });
    edges.set(filePath, /* @__PURE__ */ new Set());
    reverseEdges.set(filePath, /* @__PURE__ */ new Set());
    rawImportsRecord.set(filePath, imports);
    reExportSourcesMap.set(filePath, new Set(reExportSources));
  }
  for (const [filePath, node] of nodes) {
    const rawImports = rawImportsRecord.get(filePath) ?? [];
    const importerDir = import_node_path4.default.dirname(filePath);
    const resolvedImports = [];
    for (const importSource of rawImports) {
      const resolved = resolveImport(importSource, importerDir, aliases2);
      if (!resolved) continue;
      if (nodes.has(resolved)) {
        resolvedImports.push(resolved);
        edges.get(filePath).add(resolved);
        if (!reverseEdges.has(resolved)) reverseEdges.set(resolved, /* @__PURE__ */ new Set());
        reverseEdges.get(resolved).add(filePath);
        if (isBarrelFile(resolved, reExportSourcesMap, rawImportsRecord)) {
          const barrelExports = getBarrelExports(
            resolved,
            aliases2,
            nodes,
            reExportSourcesMap,
            rawImportsRecord
          );
          for (const exported of barrelExports) {
            if (!edges.get(filePath).has(exported)) {
              edges.get(filePath).add(exported);
              if (!reverseEdges.has(exported)) reverseEdges.set(exported, /* @__PURE__ */ new Set());
              reverseEdges.get(exported).add(filePath);
            }
          }
        }
      }
    }
    node.imports = resolvedImports;
  }
  return { nodes, edges, reverseEdges };
}
function propagateClientGraph(graph) {
  const queue = [];
  for (const [filePath, node] of graph.nodes) {
    if (node.isClientBoundary) {
      queue.push(filePath);
    }
  }
  const visited = /* @__PURE__ */ new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const node = graph.nodes.get(current);
    if (node) {
      node.isClientGraph = true;
    }
    const imported = graph.edges.get(current);
    if (imported) {
      for (const dep of imported) {
        if (!visited.has(dep)) {
          queue.push(dep);
        }
      }
    }
  }
}
function safeStatSize(filePath) {
  try {
    return import_node_fs5.default.statSync(filePath).size;
  } catch {
    return 0;
  }
}
function isBarrelFile(filePath, reExportSourcesMap, rawImportsRecord) {
  const base = import_node_path4.default.basename(filePath, import_node_path4.default.extname(filePath));
  if (base === "index") return true;
  const reExports = reExportSourcesMap.get(filePath);
  if (!reExports || reExports.size === 0) return false;
  const rawImports = rawImportsRecord.get(filePath) ?? [];
  return rawImports.every((imp) => reExports.has(imp));
}
function getBarrelExports(barrelPath, aliases2, nodes, reExportSourcesMap, rawImportsRecord, visited = /* @__PURE__ */ new Set()) {
  if (visited.has(barrelPath)) return [];
  visited.add(barrelPath);
  const reExports = reExportSourcesMap.get(barrelPath) ?? /* @__PURE__ */ new Set();
  const barrelDir = import_node_path4.default.dirname(barrelPath);
  const result = [];
  for (const importSource of reExports) {
    const resolved = resolveImport(importSource, barrelDir, aliases2);
    if (!resolved || !nodes.has(resolved)) continue;
    result.push(resolved);
    if (isBarrelFile(resolved, reExportSourcesMap, rawImportsRecord)) {
      result.push(
        ...getBarrelExports(resolved, aliases2, nodes, reExportSourcesMap, rawImportsRecord, visited)
      );
    }
  }
  return result;
}

// src/analyze.ts
init_cjs_shims();
function computeWhyTraces(graph) {
  const traces = /* @__PURE__ */ new Map();
  for (const [filePath, node] of graph.nodes) {
    if (!node.isClientGraph) continue;
    if (node.isClientBoundary) {
      traces.set(filePath, {
        filePath,
        chain: [filePath],
        boundaryRoot: filePath
      });
      continue;
    }
    const chain = bfsToNearestBoundary(filePath, graph);
    if (chain) {
      traces.set(filePath, {
        filePath,
        chain,
        boundaryRoot: chain[0]
      });
    }
  }
  return traces;
}
function bfsToNearestBoundary(startFile, graph) {
  const visited = /* @__PURE__ */ new Set();
  const queue = [
    { file: startFile, path: [startFile] }
  ];
  while (queue.length > 0) {
    const { file, path: currentPath } = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);
    const node = graph.nodes.get(file);
    if (node?.isClientBoundary) {
      return [...currentPath].reverse();
    }
    const parents = graph.reverseEdges.get(file);
    if (parents) {
      for (const parent of parents) {
        if (!visited.has(parent)) {
          queue.push({ file: parent, path: [...currentPath, parent] });
        }
      }
    }
  }
  return null;
}
function detectCreepCandidates(graph, traces) {
  const candidates = [];
  for (const [filePath, node] of graph.nodes) {
    if (!node.isClientGraph || node.isClientBoundary) continue;
    if (node.clientSignals.length === 0) {
      const trace = traces.get(filePath);
      if (!trace) continue;
      candidates.push({
        filePath,
        displayPath: node.displayPath,
        reason: "No client-only signals detected (no hooks, event handlers, or browser APIs)",
        recoverableBytes: node.sizeBytes,
        whyTrace: trace
      });
    }
  }
  return candidates.sort((a, b) => b.recoverableBytes - a.recoverableBytes);
}
function buildAnalysisResult(graph, projectRoot) {
  const whyTraces = computeWhyTraces(graph);
  const creepCandidates = detectCreepCandidates(graph, whyTraces);
  const clientBoundaries = [];
  const clientGraph = [];
  const serverGraph = [];
  let totalClientBytes = 0;
  for (const node of graph.nodes.values()) {
    if (node.isClientBoundary) clientBoundaries.push(node);
    if (node.isClientGraph) {
      clientGraph.push(node);
      totalClientBytes += node.sizeBytes;
    } else {
      serverGraph.push(node);
    }
  }
  const recoverableBytes = creepCandidates.reduce(
    (sum, c) => sum + c.recoverableBytes,
    0
  );
  return {
    projectRoot,
    totalFiles: graph.nodes.size,
    clientBoundaries,
    clientGraph,
    serverGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces
  };
}

// src/index.ts
async function analyze(dir = ".") {
  resetAliases();
  resetWorkspaceCache();
  const projectRoot = resolveProjectRoot(dir);
  const monorepoRoot = findMonorepoRoot(projectRoot);
  if (monorepoRoot) {
    const packages = await loadWorkspacePackages(monorepoRoot);
    setWorkspacePackages(packages);
  } else {
    setWorkspacePackages(/* @__PURE__ */ new Map());
  }
  const files = await collectSourceFiles(projectRoot);
  const graph = buildImportGraph(files, projectRoot);
  propagateClientGraph(graph);
  return buildAnalysisResult(graph, projectRoot);
}

// src/render.ts
init_cjs_shims();
var import_picocolors = __toESM(require("picocolors"), 1);
var import_node_path5 = __toESM(require("path"), 1);
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function clientLabel(text) {
  return import_picocolors.default.bold(import_picocolors.default.yellow(text));
}
function serverLabel(text) {
  return import_picocolors.default.bold(import_picocolors.default.blue(text));
}
function dimPath(p) {
  const dir = import_node_path5.default.dirname(p);
  const base = import_node_path5.default.basename(p);
  return import_picocolors.default.dim(dir === "." ? "" : dir + "/") + base;
}
function renderChain(chain, projectRoot) {
  const lines = [];
  for (let i = 0; i < chain.length; i++) {
    const filePath = chain[i];
    const rel = import_node_path5.default.relative(projectRoot, filePath);
    const indent = "  ".repeat(i);
    const connector = i === 0 ? "" : `${indent}\u2514\u2500 `;
    const isRoot = i === 0;
    const label = isRoot ? `${connector}${import_picocolors.default.bold(import_picocolors.default.yellow("\u26A1"))} ${clientLabel(rel)} ${import_picocolors.default.dim("\u2190 use client")}` : `${connector}${dimPath(rel)}`;
    lines.push(label);
  }
  return lines.join("\n");
}
function renderTerminal(result) {
  const {
    projectRoot,
    totalFiles,
    clientBoundaries,
    clientGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces
  } = result;
  const LINE = import_picocolors.default.dim("\u2500".repeat(60));
  console.log();
  console.log(LINE);
  console.log(
    import_picocolors.default.bold("  client-creep") + import_picocolors.default.dim("  Next.js client component analysis")
  );
  console.log(LINE);
  console.log();
  console.log(
    "  " + import_picocolors.default.bold("Project:") + " " + import_picocolors.default.dim(projectRoot)
  );
  console.log(
    "  " + import_picocolors.default.bold("Files scanned:") + " " + totalFiles
  );
  console.log(
    "  " + import_picocolors.default.bold("Client components:") + " " + clientLabel(`${clientGraph.length}`) + import_picocolors.default.dim(` (${clientBoundaries.length} boundaries)`)
  );
  console.log(
    "  " + import_picocolors.default.bold("Estimated client JS:") + " " + import_picocolors.default.bold(import_picocolors.default.yellow(formatBytes(totalClientBytes))) + import_picocolors.default.dim("  (estimate \u2014 raw source bytes)")
  );
  if (recoverableBytes > 0) {
    console.log(
      "  " + import_picocolors.default.bold("Potentially recoverable:") + " " + import_picocolors.default.bold(import_picocolors.default.green(formatBytes(recoverableBytes))) + import_picocolors.default.dim(`  (${creepCandidates.length} creep candidates)`)
    );
  }
  console.log();
  if (clientBoundaries.length === 0) {
    console.log(serverLabel("  \u2713 No client boundaries found."));
    console.log();
    return;
  }
  console.log(LINE);
  console.log(import_picocolors.default.bold("  Client Boundaries"));
  console.log(LINE);
  console.log();
  for (const boundary of clientBoundaries) {
    const signals2 = boundary.clientSignals.length > 0 ? import_picocolors.default.dim("  signals: ") + import_picocolors.default.cyan(boundary.clientSignals.slice(0, 4).join(", ")) : import_picocolors.default.dim("  ") + import_picocolors.default.red("no client signals detected") + import_picocolors.default.dim(" \u2190 possibly unnecessary");
    console.log(
      "  " + import_picocolors.default.yellow("\u26A1") + " " + import_picocolors.default.bold(boundary.displayPath) + signals2
    );
    const pulled = clientGraph.filter(
      (n) => !n.isClientBoundary && whyTraces.get(n.filePath)?.boundaryRoot === boundary.filePath
    );
    if (pulled.length > 0) {
      const shown = pulled.slice(0, 3);
      for (const dep of shown) {
        console.log("     " + import_picocolors.default.dim("\u2514\u2500") + " " + import_picocolors.default.dim(dep.displayPath));
      }
      if (pulled.length > 3) {
        console.log("     " + import_picocolors.default.dim(`\u2514\u2500 \u2026 and ${pulled.length - 3} more`));
      }
    }
    console.log();
  }
  if (creepCandidates.length > 0) {
    console.log(LINE);
    console.log(
      import_picocolors.default.bold("  \u26A0  Accidental Client Creep") + import_picocolors.default.dim("  \u2014 components that may not need to be client")
    );
    console.log(LINE);
    console.log();
    const shown = creepCandidates.slice(0, 10);
    for (const candidate of shown) {
      console.log(
        "  " + import_picocolors.default.red("\u26A0") + " " + import_picocolors.default.bold(candidate.displayPath) + "  " + import_picocolors.default.dim(formatBytes(candidate.recoverableBytes)) + " potentially recoverable"
      );
      console.log(
        "    " + import_picocolors.default.dim(candidate.reason)
      );
      const trace = candidate.whyTrace;
      if (trace.chain.length > 1) {
        console.log("    " + import_picocolors.default.dim("Why client:"));
        console.log(
          renderChain(trace.chain, projectRoot).split("\n").map((l) => "    " + l).join("\n")
        );
      }
      console.log();
    }
    if (creepCandidates.length > 10) {
      console.log(
        import_picocolors.default.dim(`  \u2026 and ${creepCandidates.length - 10} more creep candidates. Use --json for full output.`)
      );
      console.log();
    }
  }
  const unnecessaryBoundaries = clientBoundaries.filter(
    (b) => b.clientSignals.length === 0
  );
  if (unnecessaryBoundaries.length > 0) {
    console.log(LINE);
    console.log(
      import_picocolors.default.bold("  \u2139  Possibly Unnecessary Boundaries") + import_picocolors.default.dim("  \u2014 'use client' with no detected client signals")
    );
    console.log(LINE);
    console.log();
    for (const b of unnecessaryBoundaries) {
      console.log(
        "  " + import_picocolors.default.yellow("?") + " " + import_picocolors.default.bold(b.displayPath) + import_picocolors.default.dim("  \u2014 review: no hooks, event handlers, or browser APIs found")
      );
    }
    console.log();
  }
  console.log(LINE);
  console.log(
    import_picocolors.default.dim(
      "  Sizes are estimates (raw source bytes). Run npx @next/bundle-analyzer for exact bundle impact."
    )
  );
  console.log(LINE);
  console.log();
}
function renderJson(result) {
  const output = {
    projectRoot: result.projectRoot,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      serverComponents: result.serverGraph.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes,
      creepCandidates: result.creepCandidates.length
    },
    boundaries: result.clientBoundaries.map((b) => ({
      file: b.displayPath,
      signals: b.clientSignals,
      sizeBytes: b.sizeBytes
    })),
    creepCandidates: result.creepCandidates.map((c) => ({
      file: c.displayPath,
      reason: c.reason,
      recoverableBytes: c.recoverableBytes,
      whyChain: c.whyTrace.chain.map(
        (f) => import_node_path5.default.relative(result.projectRoot, f)
      )
    }))
  };
  console.log(JSON.stringify(output, null, 2));
}

// src/render-html.ts
init_cjs_shims();
var import_node_fs6 = __toESM(require("fs"), 1);
var import_node_path6 = __toESM(require("path"), 1);
function formatBytes2(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function renderHtml(result, outputPath) {
  const html = buildHtml(result);
  import_node_fs6.default.writeFileSync(outputPath, html, "utf-8");
}
function buildHtml(result) {
  const nodes = [];
  const links = [];
  const nodeIndex = /* @__PURE__ */ new Map();
  const visibleFiles = /* @__PURE__ */ new Set();
  for (const n of result.clientGraph) visibleFiles.add(n.filePath);
  for (const b of result.clientBoundaries) {
    const node = result.clientGraph.find((n) => n.filePath === b.filePath);
    if (node) node.imports.forEach((i) => visibleFiles.add(i));
  }
  const isCreep = new Set(result.creepCandidates.map((c) => c.filePath));
  let idx = 0;
  for (const filePath of visibleFiles) {
    const node = result.clientGraph.find((n) => n.filePath === filePath) || result.serverGraph.find((n) => n.filePath === filePath);
    if (!node) continue;
    let type = "server";
    if (node.isClientBoundary) type = "boundary";
    else if (isCreep.has(filePath)) type = "creep";
    else if (node.isClientGraph) type = "client";
    const trace = result.whyTraces.get(filePath);
    nodes.push({
      id: idx,
      label: import_node_path6.default.basename(filePath),
      path: node.displayPath,
      type,
      size: node.sizeBytes,
      signals: node.clientSignals,
      whyChain: trace ? trace.chain.map((f) => import_node_path6.default.relative(result.projectRoot, f)) : []
    });
    nodeIndex.set(filePath, idx);
    idx++;
  }
  for (const [filePath, deps] of Object.entries(
    Object.fromEntries(
      [...visibleFiles].map((f) => {
        const node = result.clientGraph.find((n) => n.filePath === f) || result.serverGraph.find((n) => n.filePath === f);
        return [f, node?.imports ?? []];
      })
    )
  )) {
    const sourceIdx = nodeIndex.get(filePath);
    if (sourceIdx === void 0) continue;
    for (const dep of deps) {
      const targetIdx = nodeIndex.get(dep);
      if (targetIdx !== void 0) {
        links.push({ source: sourceIdx, target: targetIdx });
      }
    }
  }
  const data = JSON.stringify({ nodes, links });
  const summary = {
    totalFiles: result.totalFiles,
    clientComponents: result.clientGraph.length,
    clientBoundaries: result.clientBoundaries.length,
    serverComponents: result.serverGraph.length,
    estimatedClientJs: formatBytes2(result.totalClientBytes),
    recoverable: formatBytes2(result.recoverableBytes),
    creepCandidates: result.creepCandidates.length,
    projectRoot: result.projectRoot
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>client-creep \u2014 ${import_node_path6.default.basename(result.projectRoot)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #1e1e2e; --surface: #181825; --overlay: #313244;
    --text: #cdd6f4; --subtext: #a6adc8; --dim: #585b70;
    --amber: #f9e2af; --amber-dim: #f38ba820;
    --blue: #89b4fa; --blue-dim: #89b4fa20;
    --red: #f38ba8; --red-dim: #f38ba820;
    --green: #a6e3a1; --mauve: #cba6f7;
    --border: #313244;
  }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* Header */
  #header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
  #header h1 { font-size: 15px; font-weight: 700; color: var(--amber); letter-spacing: -0.3px; }
  #header .project { font-size: 12px; color: var(--dim); }
  .stats { display: flex; gap: 16px; margin-left: auto; }
  .stat { text-align: center; }
  .stat .val { font-size: 18px; font-weight: 700; line-height: 1; }
  .stat .lbl { font-size: 10px; color: var(--subtext); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  .stat.client .val { color: var(--amber); }
  .stat.server .val { color: var(--blue); }
  .stat.creep .val { color: var(--red); }
  .stat.recover .val { color: var(--green); }

  /* Legend */
  #legend { padding: 8px 20px; border-bottom: 1px solid var(--border); display: flex; gap: 16px; align-items: center; flex-shrink: 0; }
  #legend span { font-size: 11px; color: var(--subtext); }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
  .dot.boundary { background: var(--amber); }
  .dot.creep { background: var(--red); }
  .dot.client { background: #fab387; }
  .dot.server { background: var(--blue); }
  .filter-btn { background: var(--overlay); border: 1px solid var(--border); color: var(--subtext); padding: 3px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.15s; }
  .filter-btn:hover, .filter-btn.active { background: var(--amber); color: var(--bg); border-color: var(--amber); }
  #search { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 4px 10px; border-radius: 4px; font-size: 12px; width: 180px; margin-left: auto; outline: none; }
  #search:focus { border-color: var(--amber); }

  /* Main */
  #main { display: flex; flex: 1; overflow: hidden; }
  #graph-container { flex: 1; position: relative; overflow: hidden; }
  svg { width: 100%; height: 100%; }

  /* Sidebar */
  #sidebar { width: 300px; border-left: 1px solid var(--border); overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
  #sidebar.empty { display: flex; align-items: center; justify-content: center; color: var(--dim); font-size: 13px; }
  .detail-header { font-weight: 600; font-size: 13px; word-break: break-all; }
  .detail-path { font-size: 11px; color: var(--dim); margin-top: 2px; word-break: break-all; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-top: 6px; }
  .badge.boundary { background: var(--amber-dim); color: var(--amber); }
  .badge.creep { background: var(--red-dim); color: var(--red); }
  .badge.client { background: #fab38720; color: #fab387; }
  .badge.server { background: var(--blue-dim); color: var(--blue); }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--dim); margin-top: 8px; }
  .signal-tag { display: inline-block; background: var(--overlay); color: var(--subtext); padding: 2px 6px; border-radius: 3px; font-size: 11px; margin: 2px 2px 0 0; font-family: monospace; }
  .chain { font-size: 12px; line-height: 1.8; }
  .chain-item { color: var(--subtext); padding-left: 0; }
  .chain-item.boundary-node { color: var(--amber); font-weight: 600; }
  .chain-arrow { color: var(--dim); margin-right: 4px; }
  .no-node { color: var(--dim); font-size: 13px; text-align: center; margin-top: 40px; }

  /* D3 styles */
  .node circle { cursor: pointer; transition: r 0.1s; stroke-width: 1.5px; }
  .node circle.boundary { fill: var(--amber); stroke: #f9e2af80; }
  .node circle.creep { fill: var(--red); stroke: #f38ba880; }
  .node circle.client { fill: #fab387; stroke: #fab38780; }
  .node circle.server { fill: var(--blue); stroke: #89b4fa80; }
  .node circle:hover { stroke-width: 3px; }
  .node circle.selected { stroke-width: 3px; stroke: white; }
  .link { stroke: var(--dim); stroke-opacity: 0.4; stroke-width: 1; }
  .link.client-link { stroke: var(--amber); stroke-opacity: 0.2; }
  .node text { font-size: 9px; fill: var(--subtext); pointer-events: none; }

  /* Scrollbar */
  #sidebar::-webkit-scrollbar { width: 4px; }
  #sidebar::-webkit-scrollbar-track { background: transparent; }
  #sidebar::-webkit-scrollbar-thumb { background: var(--overlay); border-radius: 2px; }
</style>
</head>
<body>

<div id="header">
  <h1>\u26A1 client-creep</h1>
  <span class="project">${summary.projectRoot}</span>
  <div class="stats">
    <div class="stat client"><div class="val">${summary.clientComponents}</div><div class="lbl">client</div></div>
    <div class="stat"><div class="val" style="color:var(--mauve)">${summary.clientBoundaries}</div><div class="lbl">boundaries</div></div>
    <div class="stat server"><div class="val">${summary.serverComponents}</div><div class="lbl">server</div></div>
    <div class="stat creep"><div class="val">${summary.creepCandidates}</div><div class="lbl">creep</div></div>
    <div class="stat recover"><div class="val">${summary.recoverable}</div><div class="lbl">recoverable</div></div>
    <div class="stat"><div class="val" style="color:var(--amber)">${summary.estimatedClientJs}</div><div class="lbl">est. client JS</div></div>
  </div>
</div>

<div id="legend">
  <span><span class="dot boundary"></span>use client boundary</span>
  <span><span class="dot creep"></span>accidental creep</span>
  <span><span class="dot client"></span>client (transitive)</span>
  <span><span class="dot server"></span>server</span>
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="boundaries">Boundaries only</button>
  <button class="filter-btn" data-filter="creep">Creep only</button>
  <input id="search" type="text" placeholder="Search files\u2026">
</div>

<div id="main">
  <div id="graph-container">
    <svg id="graph"></svg>
  </div>
  <div id="sidebar">
    <div class="no-node">Click a node to inspect it</div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script>
const RAW = ${data};
const TYPES = { boundary: 0, creep: 1, client: 2, server: 3 };
let currentFilter = 'all';
let searchQuery = '';
let selectedId = null;

function getVisibleNodes() {
  return RAW.nodes.filter(n => {
    if (currentFilter === 'boundaries' && n.type !== 'boundary') return false;
    if (currentFilter === 'creep' && n.type !== 'creep') return false;
    if (searchQuery && !n.path.toLowerCase().includes(searchQuery)) return false;
    return true;
  });
}

function nodeRadius(n) {
  const base = n.type === 'boundary' ? 7 : n.type === 'creep' ? 6 : 4;
  return base + Math.min(Math.sqrt(n.size / 500), 5);
}

let simulation, svg, linkGroup, nodeGroup;

function render() {
  const visibleNodes = getVisibleNodes();
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleLinks = RAW.links.filter(l =>
    visibleIds.has(typeof l.source === 'object' ? l.source.id : l.source) &&
    visibleIds.has(typeof l.target === 'object' ? l.target.id : l.target)
  );

  const container = document.getElementById('graph-container');
  const W = container.clientWidth, H = container.clientHeight;

  d3.select('#graph').selectAll('*').remove();

  svg = d3.select('#graph')
    .attr('viewBox', [0, 0, W, H])
    .call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', (e) => {
      g.attr('transform', e.transform);
    }));

  const g = svg.append('g');

  simulation = d3.forceSimulation(visibleNodes)
    .force('link', d3.forceLink(visibleLinks).id(d => d.id).distance(60).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 4));

  linkGroup = g.append('g')
    .selectAll('line')
    .data(visibleLinks)
    .join('line')
    .attr('class', l => {
      const src = typeof l.source === 'object' ? l.source : visibleNodes.find(n => n.id === l.source);
      return 'link' + (src && (src.type === 'boundary' || src.type === 'client') ? ' client-link' : '');
    });

  nodeGroup = g.append('g')
    .selectAll('g')
    .data(visibleNodes)
    .join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on('click', (e, d) => { e.stopPropagation(); selectNode(d); });

  nodeGroup.append('circle')
    .attr('r', d => nodeRadius(d))
    .attr('class', d => d.type + (d.id === selectedId ? ' selected' : ''));

  nodeGroup.append('text')
    .attr('dy', d => nodeRadius(d) + 10)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  simulation.on('tick', () => {
    linkGroup
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeGroup.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
  });

  svg.on('click', () => { selectedId = null; updateSidebar(null); });
}

function selectNode(d) {
  selectedId = d.id;
  d3.selectAll('.node circle').attr('class', n => n.type + (n.id === selectedId ? ' selected' : ''));
  updateSidebar(d);
}

function updateSidebar(node) {
  const sb = document.getElementById('sidebar');
  if (!node) {
    sb.innerHTML = '<div class="no-node">Click a node to inspect it</div>';
    return;
  }

  const badgeLabel = { boundary: '\u26A1 use client boundary', creep: '\u26A0 accidental creep', client: 'client (transitive)', server: 'server component' };
  const signalsHtml = node.signals.length
    ? node.signals.map(s => \`<span class="signal-tag">\${s}</span>\`).join('')
    : '<span style="color:var(--dim);font-size:12px">none detected</span>';

  const chainHtml = node.whyChain.length > 1
    ? node.whyChain.map((f, i) => {
        const isBoundary = i === 0;
        return \`<div class="chain-item \${isBoundary ? 'boundary-node' : ''}">
          \${i > 0 ? '<span class="chain-arrow">' + '  '.repeat(i) + '\u2514\u2500</span>' : '\u26A1'}
          \${f}
        </div>\`;
      }).join('')
    : '<span style="color:var(--dim);font-size:12px">this is the boundary root</span>';

  sb.innerHTML = \`
    <div>
      <div class="detail-header">\${node.label}</div>
      <div class="detail-path">\${node.path}</div>
      <span class="badge \${node.type}">\${badgeLabel[node.type]}</span>
    </div>
    <div>
      <div class="section-title">Client signals</div>
      <div style="margin-top:6px">\${signalsHtml}</div>
    </div>
    <div>
      <div class="section-title">Why client?</div>
      <div class="chain" style="margin-top:6px">\${chainHtml}</div>
    </div>
    <div>
      <div class="section-title">File size</div>
      <div style="margin-top:4px;font-size:12px;color:var(--subtext)">\${formatBytes(node.size)}</div>
    </div>
  \`;
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// Search
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

// Initial render
render();
window.addEventListener('resize', render);
</script>
</body>
</html>`;
}

// src/watch.ts
init_cjs_shims();
var import_node_fs7 = __toESM(require("fs"), 1);
var import_picocolors2 = __toESM(require("picocolors"), 1);
async function runWatch(targetDir) {
  let debounce = null;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    process.stdout.write("\x1Bc");
    process.stdout.write(import_picocolors2.default.dim("  Scanning\u2026\r"));
    try {
      resetAliases();
      resetWorkspaceCache();
      const result = await analyze(targetDir);
      renderTerminal(result);
      console.log(import_picocolors2.default.dim("  Watching for changes\u2026 (Ctrl+C to stop)"));
    } catch (err) {
      console.error(import_picocolors2.default.red(`  Error: ${err instanceof Error ? err.message : String(err)}`));
    } finally {
      running = false;
    }
  };
  await run();
  const watcher = import_node_fs7.default.watch(
    targetDir,
    { recursive: true },
    (_event, filename) => {
      if (!filename) return;
      if (filename.includes("node_modules") || filename.includes(".next") || filename.includes("dist") || filename.includes(".git"))
        return;
      if (!/\.(tsx?|jsx?|mjs|mts)$/.test(filename)) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 400);
    }
  );
  process.on("SIGINT", () => {
    watcher.close();
    console.log(import_picocolors2.default.dim("\n  Stopped watching."));
    process.exit(0);
  });
  await new Promise(() => {
  });
}

// src/push.ts
init_cjs_shims();
var import_node_path9 = __toESM(require("path"), 1);
async function detectRepoFromGit(projectRoot) {
  try {
    const { execa: execa2 } = await Promise.resolve().then(() => (init_execa(), execa_exports));
    const { stdout } = await execa2("git", ["remote", "get-url", "origin"], { cwd: projectRoot });
    const url = stdout.trim();
    const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
    if (sshMatch) return { owner: sshMatch[1], name: sshMatch[2] };
    const httpsMatch = url.match(/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
    if (httpsMatch) return { owner: httpsMatch[1], name: httpsMatch[2] };
  } catch {
  }
  return null;
}
async function pushToDashboard(result, options, scanDurationMs) {
  const dashboardUrl = (options.dashboardUrl ?? "https://client-creep-dashboard.vercel.app").replace(/\/$/, "");
  let owner = options.owner;
  let repoName = options.repo;
  if (!owner || !repoName) {
    const detected = await detectRepoFromGit(result.projectRoot);
    if (detected) {
      owner = owner ?? detected.owner;
      repoName = repoName ?? detected.name;
    } else {
      owner = owner ?? "unknown";
      repoName = repoName ?? import_node_path9.default.basename(result.projectRoot);
    }
  }
  const payload = {
    token: options.token,
    owner,
    name: repoName,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      creepCandidates: result.creepCandidates.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes
    },
    scanDurationMs: scanDurationMs ?? null,
    engineVersion: "client-creep@0.2.2",
    // Include full JSON payload for the detail view
    payload: {
      projectRoot: result.projectRoot,
      totalFiles: result.totalFiles,
      creepCandidates: result.creepCandidates.map((c) => ({
        file: c.displayPath,
        recoverableKb: c.recoverableBytes / 1024,
        chain: c.whyTrace.chain.map((f) => result.clientGraph.find((n) => n.filePath === f)?.displayPath ?? f).join(" \u2192 "),
        signals: c.whyTrace.chain.length
      })),
      boundaries: result.clientBoundaries.map((b) => ({
        file: b.displayPath,
        signals: b.clientSignals.length,
        kb: b.sizeBytes / 1024
      }))
    }
  };
  try {
    const response = await fetch(`${dashboardUrl}/api/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    if (!response.ok) {
      return { ok: false, error: json.error ?? `HTTP ${response.status}` };
    }
    return {
      ok: true,
      analysisId: json.analysisId,
      dashboardUrl: json.dashboard
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Network error: ${message}` };
  }
}

// src/cli.ts
var cli = (0, import_cac.cac)("client-creep");
cli.command("[dir]", "Analyze a Next.js project for client component creep").option("--dir <path>", "Path to the Next.js project (alias for positional arg)").option("--json", "Output results as JSON").option("--html [file]", "Write an interactive HTML report (default: client-creep-report.html)").option("--watch", "Watch for file changes and re-run analysis").option("--ci", "CI mode: exit 1 if client creep is detected").option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold").option("--push", "Push results to the client-creep dashboard").option("--token <token>", "Supabase access token for --push (get from dashboard \u2192 Settings)").option("--dashboard <url>", "Dashboard URL (default: https://client-creep-dashboard.vercel.app)").option("--owner <owner>", "Repo owner override for --push (default: auto-detected from git remote)").option("--repo <name>", "Repo name override for --push (default: auto-detected from git remote)").action(async (dir = ".", options) => {
  const targetDir = options.dir ?? dir ?? ".";
  if (options.watch) {
    await runWatch(import_node_path10.default.resolve(targetDir));
    return;
  }
  if (options.push && !options.token) {
    console.error(import_picocolors3.default.red("  Error: --push requires --token"));
    console.error(import_picocolors3.default.dim("  Get your token from the dashboard \u2192 Settings \u2192 Access Token"));
    console.error(import_picocolors3.default.dim("  Usage: npx client-creep --push --token <your-token>"));
    process.exit(1);
  }
  try {
    const showSpinner = !options.json && !options.html;
    if (showSpinner) {
      process.stdout.write(import_picocolors3.default.dim("  Scanning\u2026\r"));
    }
    const scanStart = Date.now();
    const result = await analyze(targetDir);
    const scanDurationMs = Date.now() - scanStart;
    if (options.html !== void 0 && options.html !== false) {
      const outFile = typeof options.html === "string" ? options.html : "client-creep-report.html";
      renderHtml(result, outFile);
      if (!options.json) {
        console.log(import_picocolors3.default.green(`  \u2713 HTML report written to ${outFile}`));
      }
    }
    if (options.json) {
      renderJson(result);
    } else if (!options.html) {
      renderTerminal(result);
    }
    if (options.push && options.token) {
      if (!options.json) {
        process.stdout.write(import_picocolors3.default.dim("  Pushing to dashboard\u2026\r"));
      }
      const pushResult = await pushToDashboard(
        result,
        {
          token: options.token,
          dashboardUrl: options.dashboard,
          owner: options.owner,
          repo: options.repo
        },
        scanDurationMs
      );
      if (!options.json) {
        if (pushResult.ok) {
          console.log(import_picocolors3.default.green(`  \u2713 Pushed to dashboard`));
          if (pushResult.dashboardUrl) {
            console.log(import_picocolors3.default.dim(`    ${pushResult.dashboardUrl}`));
          }
        } else {
          console.error(import_picocolors3.default.red(`  \u2717 Push failed: ${pushResult.error}`));
        }
      }
    }
    if (options.ci || options.budget) {
      const budgetKb = options.budget ? Number(options.budget) : void 0;
      let failed = false;
      if (budgetKb !== void 0) {
        const actualKb = result.totalClientBytes / 1024;
        if (actualKb > budgetKb) {
          failed = true;
          if (!options.json) {
            console.error(import_picocolors3.default.red(`
  \u2717 client-creep: budget exceeded`));
            console.error(import_picocolors3.default.red(`    ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`));
            console.error(import_picocolors3.default.dim(`    Run without --ci to see the full report and where to recover KB.`));
          }
        }
      }
      if (options.ci && result.creepCandidates.length > 0) {
        failed = true;
        if (!options.json) {
          console.error(import_picocolors3.default.red(`
  \u2717 client-creep: ${result.creepCandidates.length} accidental creep candidates found`));
          console.error(import_picocolors3.default.dim(`    ~${(result.recoverableBytes / 1024).toFixed(0)} KB potentially recoverable.`));
          console.error(import_picocolors3.default.dim(`    Run without --ci to see the full report.`));
        }
      }
      if (!failed && !options.json) {
        console.log(import_picocolors3.default.green(`  \u2713 client-creep: no issues found`));
      }
      if (failed) process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(import_picocolors3.default.red(`  Error: ${message}`));
    process.exit(1);
  }
});
cli.help();
cli.version("0.2.2");
cli.parse();
