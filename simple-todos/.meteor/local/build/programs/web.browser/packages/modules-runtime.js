//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var makeInstaller, makeInstallerOptions, meteorInstall;

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/modules-runtime/.npm/package/node_modules/install/install.js     //
// This file is in bare mode and is not in its own closure.                  //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
makeInstaller = function (options) {                                         // 1
  "use strict";                                                              // 2
                                                                             // 3
  options = options || {};                                                   // 4
                                                                             // 5
  // These file extensions will be appended to required module identifiers   // 6
  // if they do not exactly match an installed module.                       // 7
  var defaultExtensions = options.extensions || [".js", ".json"];            // 8
                                                                             // 9
  // If defined, the options.onInstall function will be called any time      // 10
  // new modules are installed.                                              // 11
  var onInstall = options.onInstall;                                         // 12
                                                                             // 13
  // If defined, each module-specific require function will be passed to     // 14
  // this function, along with the module object of the parent module, and   // 15
  // the result will be used in place of the original require function.      // 16
  var wrapRequire = options.wrapRequire;                                     // 17
                                                                             // 18
  // If defined, the options.override function will be called before         // 19
  // looking up any top-level package identifiers in node_modules            // 20
  // directories. It can either return a string to provide an alternate      // 21
  // package identifier, or a non-string value to prevent the lookup from    // 22
  // proceeding.                                                             // 23
  var override = options.override;                                           // 24
                                                                             // 25
  // If defined, the options.fallback function will be called when no        // 26
  // installed module is found for a required module identifier. Often       // 27
  // options.fallback will be implemented in terms of the native Node        // 28
  // require function, which has the ability to load binary modules.         // 29
  var fallback = options.fallback;                                           // 30
                                                                             // 31
  // List of fields to look for in package.json files to determine the       // 32
  // main entry module of the package. The first field listed here whose     // 33
  // value is a string will be used to resolve the entry module.             // 34
  var mainFields = options.mainFields ||                                     // 35
    // If options.mainFields is absent and options.browser is truthy,        // 36
    // package resolution will prefer the "browser" field of package.json    // 37
    // files to the "main" field. Note that this only supports               // 38
    // string-valued "browser" fields for now, though in the future it       // 39
    // might make sense to support the object version, a la browserify.      // 40
    (options.browser ? ["browser", "main"] : ["main"]);                      // 41
                                                                             // 42
  // Called below as hasOwn.call(obj, key).                                  // 43
  var hasOwn = {}.hasOwnProperty;                                            // 44
                                                                             // 45
  // Cache for looking up File objects given absolute module identifiers.    // 46
  // Invariants:                                                             // 47
  //   filesByModuleId[module.id] === fileAppendId(root, module.id)          // 48
  //   filesByModuleId[module.id].module === module                          // 49
  var filesByModuleId = {};                                                  // 50
                                                                             // 51
  // The file object representing the root directory of the installed        // 52
  // module tree.                                                            // 53
  var root = new File("/", new File("/.."));                                 // 54
  var rootRequire = makeRequire(root);                                       // 55
                                                                             // 56
  // Merges the given tree of directories and module factory functions       // 57
  // into the tree of installed modules and returns a require function       // 58
  // that behaves as if called from a module in the root directory.          // 59
  function install(tree, options) {                                          // 60
    if (isObject(tree)) {                                                    // 61
      fileMergeContents(root, tree, options);                                // 62
      if (isFunction(onInstall)) {                                           // 63
        onInstall(rootRequire);                                              // 64
      }                                                                      // 65
    }                                                                        // 66
    return rootRequire;                                                      // 67
  }                                                                          // 68
                                                                             // 69
  // Replace this function to enable Module.prototype.prefetch.              // 70
  install.fetch = function (ids) {                                           // 71
    throw new Error("fetch not implemented");                                // 72
  };                                                                         // 73
                                                                             // 74
  // This constructor will be used to instantiate the module objects         // 75
  // passed to module factory functions (i.e. the third argument after       // 76
  // require and exports), and is exposed as install.Module in case the      // 77
  // caller of makeInstaller wishes to modify Module.prototype.              // 78
  function Module(id) {                                                      // 79
    this.id = id;                                                            // 80
                                                                             // 81
    // The Node implementation of module.children unfortunately includes     // 82
    // only those child modules that were imported for the first time by     // 83
    // this parent module (i.e., child.parent === this).                     // 84
    this.children = [];                                                      // 85
                                                                             // 86
    // This object is an install.js extension that includes all child        // 87
    // modules imported by this module, even if this module is not the       // 88
    // first to import them.                                                 // 89
    this.childrenById = {};                                                  // 90
  }                                                                          // 91
                                                                             // 92
  Module.prototype.resolve = function (id) {                                 // 93
    return this.require.resolve(id);                                         // 94
  };                                                                         // 95
                                                                             // 96
  var resolvedPromise;                                                       // 97
  var lastPrefetchPromise;                                                   // 98
                                                                             // 99
  Module.prototype.prefetch = function (id) {                                // 100
    var module = this;                                                       // 101
    var parentFile = getOwn(filesByModuleId, module.id);                     // 102
    var missing; // Initialized to {} only if necessary.                     // 103
                                                                             // 104
    resolvedPromise = resolvedPromise || Promise.resolve();                  // 105
    lastPrefetchPromise = lastPrefetchPromise || resolvedPromise;            // 106
    var previousPromise = lastPrefetchPromise;                               // 107
                                                                             // 108
    function walk(module) {                                                  // 109
      var file = getOwn(filesByModuleId, module.id);                         // 110
      if (fileIsDynamic(file) && ! file.pending) {                           // 111
        file.pending = true;                                                 // 112
        missing = missing || {};                                             // 113
                                                                             // 114
        // These are the data that will be exposed to the install.fetch      // 115
        // callback, so it's worth documenting each item with a comment.     // 116
        missing[module.id] = {                                               // 117
          // The CommonJS module object that will be exposed to this         // 118
          // dynamic module when it is evaluated. Note that install.fetch    // 119
          // could decide to populate module.exports directly, instead of    // 120
          // fetching anything. In that case, install.fetch should omit      // 121
          // this module from the tree that it produces.                     // 122
          module: file.module,                                               // 123
          // List of module identifier strings imported by this module.      // 124
          // Note that the missing object already contains all available     // 125
          // dependencies (including transitive dependencies), so            // 126
          // install.fetch should not need to traverse these dependencies    // 127
          // in most cases; however, they may be useful for other reasons.   // 128
          // Though the strings are unique, note that two different          // 129
          // strings could resolve to the same module.                       // 130
          deps: Object.keys(file.deps),                                      // 131
          // The options (if any) that were passed as the second argument    // 132
          // to the install(tree, options) function when this stub was       // 133
          // first registered. Typically contains options.extensions, but    // 134
          // could contain any information appropriate for the entire tree   // 135
          // as originally installed. These options will be automatically    // 136
          // inherited by the newly fetched modules, so install.fetch        // 137
          // should not need to modify them.                                 // 138
          options: file.options,                                             // 139
          // Any stub data included in the array notation from the           // 140
          // original entry for this dynamic module. Typically contains      // 141
          // "main" and/or "browser" fields for package.json files, and is   // 142
          // otherwise undefined.                                            // 143
          stub: file.stub                                                    // 144
        };                                                                   // 145
                                                                             // 146
        each(file.deps, function (parentId, id) {                            // 147
          fileResolve(file, id);                                             // 148
        });                                                                  // 149
                                                                             // 150
        each(module.childrenById, walk);                                     // 151
      }                                                                      // 152
    }                                                                        // 153
                                                                             // 154
    return lastPrefetchPromise = resolvedPromise.then(function () {          // 155
      var absChildId = module.resolve(id);                                   // 156
      each(module.childrenById, walk);                                       // 157
                                                                             // 158
      return Promise.resolve(                                                // 159
        // The install.fetch function takes an object mapping missing        // 160
        // dynamic module identifiers to options objects, and should         // 161
        // return a Promise that resolves to a module tree that can be       // 162
        // installed. As an optimization, if there were no missing dynamic   // 163
        // modules, then we can skip calling install.fetch entirely.         // 164
        missing && install.fetch(missing)                                    // 165
                                                                             // 166
      ).then(function (tree) {                                               // 167
        function both() {                                                    // 168
          if (tree) install(tree);                                           // 169
          return absChildId;                                                 // 170
        }                                                                    // 171
                                                                             // 172
        // Although we want multiple install.fetch calls to run in           // 173
        // parallel, it is important that the promises returned by           // 174
        // module.prefetch are resolved in the same order as the original    // 175
        // calls to module.prefetch, because previous fetches may include    // 176
        // modules assumed to exist by more recent module.prefetch calls.    // 177
        // Whether previousPromise was resolved or rejected, carry on with   // 178
        // the installation regardless.                                      // 179
        return previousPromise.then(both, both);                             // 180
      });                                                                    // 181
    });                                                                      // 182
  };                                                                         // 183
                                                                             // 184
  install.Module = Module;                                                   // 185
                                                                             // 186
  function getOwn(obj, key) {                                                // 187
    return hasOwn.call(obj, key) && obj[key];                                // 188
  }                                                                          // 189
                                                                             // 190
  function isObject(value) {                                                 // 191
    return typeof value === "object" && value !== null;                      // 192
  }                                                                          // 193
                                                                             // 194
  function isFunction(value) {                                               // 195
    return typeof value === "function";                                      // 196
  }                                                                          // 197
                                                                             // 198
  function isString(value) {                                                 // 199
    return typeof value === "string";                                        // 200
  }                                                                          // 201
                                                                             // 202
  function makeMissingError(id) {                                            // 203
    return new Error("Cannot find module '" + id + "'");                     // 204
  }                                                                          // 205
                                                                             // 206
  function makeRequire(file) {                                               // 207
    function require(id) {                                                   // 208
      var result = fileResolve(file, id);                                    // 209
      if (result) {                                                          // 210
        return fileEvaluate(result, file.module);                            // 211
      }                                                                      // 212
                                                                             // 213
      var error = makeMissingError(id);                                      // 214
                                                                             // 215
      if (isFunction(fallback)) {                                            // 216
        return fallback(                                                     // 217
          id, // The missing module identifier.                              // 218
          file.module.id, // The path of the requiring file.                 // 219
          error // The error we would have thrown.                           // 220
        );                                                                   // 221
      }                                                                      // 222
                                                                             // 223
      throw error;                                                           // 224
    }                                                                        // 225
                                                                             // 226
    if (isFunction(wrapRequire)) {                                           // 227
      require = wrapRequire(require, file.module);                           // 228
    }                                                                        // 229
                                                                             // 230
    require.extensions = fileGetExtensions(file).slice(0);                   // 231
                                                                             // 232
    require.resolve = function (id) {                                        // 233
      var f = fileResolve(file, id);                                         // 234
      if (f) return f.module.id;                                             // 235
      var error = makeMissingError(id);                                      // 236
      if (fallback && isFunction(fallback.resolve)) {                        // 237
        return fallback.resolve(id, file.module.id, error);                  // 238
      }                                                                      // 239
      throw error;                                                           // 240
    };                                                                       // 241
                                                                             // 242
    return require;                                                          // 243
  }                                                                          // 244
                                                                             // 245
  // File objects represent either directories or modules that have been     // 246
  // installed. When a `File` respresents a directory, its `.contents`       // 247
  // property is an object containing the names of the files (or             // 248
  // directories) that it contains. When a `File` represents a module, its   // 249
  // `.contents` property is a function that can be invoked with the         // 250
  // appropriate `(require, exports, module)` arguments to evaluate the      // 251
  // module. If the `.contents` property is a string, that string will be    // 252
  // resolved as a module identifier, and the exports of the resulting       // 253
  // module will provide the exports of the original file. The `.parent`     // 254
  // property of a File is either a directory `File` or `null`. Note that    // 255
  // a child may claim another `File` as its parent even if the parent       // 256
  // does not have an entry for that child in its `.contents` object.        // 257
  // This is important for implementing anonymous files, and preventing      // 258
  // child modules from using `../relative/identifier` syntax to examine     // 259
  // unrelated modules.                                                      // 260
  function File(moduleId, parent) {                                          // 261
    var file = this;                                                         // 262
                                                                             // 263
    // Link to the parent file.                                              // 264
    file.parent = parent = parent || null;                                   // 265
                                                                             // 266
    // The module object for this File, which will eventually boast an       // 267
    // .exports property when/if the file is evaluated.                      // 268
    file.module = new Module(moduleId);                                      // 269
    filesByModuleId[moduleId] = file;                                        // 270
                                                                             // 271
    // The .contents of the file can be either (1) an object, if the file    // 272
    // represents a directory containing other files; (2) a factory          // 273
    // function, if the file represents a module that can be imported; (3)   // 274
    // a string, if the file is an alias for another file; or (4) null, if   // 275
    // the file's contents are not (yet) available.                          // 276
    file.contents = null;                                                    // 277
                                                                             // 278
    // Set of module identifiers imported by this module. Note that this     // 279
    // set is not necessarily complete, so don't rely on it unless you       // 280
    // know what you're doing.                                               // 281
    file.deps = {};                                                          // 282
  }                                                                          // 283
                                                                             // 284
  function fileEvaluate(file, parentModule) {                                // 285
    var module = file.module;                                                // 286
    if (! hasOwn.call(module, "exports")) {                                  // 287
      var contents = file.contents;                                          // 288
      if (! contents) {                                                      // 289
        // If this file was installed with array notation, and the array     // 290
        // contained one or more objects but no functions, then the combined
        // properties of the objects are treated as a temporary stub for     // 292
        // file.module.exports. This is particularly important for partial   // 293
        // package.json modules, so that the resolution logic can know the   // 294
        // value of the "main" and/or "browser" fields, at least, even if    // 295
        // the rest of the package.json file is not (yet) available.         // 296
        if (file.stub) {                                                     // 297
          return file.stub;                                                  // 298
        }                                                                    // 299
                                                                             // 300
        throw makeMissingError(module.id);                                   // 301
      }                                                                      // 302
                                                                             // 303
      if (parentModule) {                                                    // 304
        module.parent = parentModule;                                        // 305
        var children = parentModule.children;                                // 306
        if (Array.isArray(children)) {                                       // 307
          children.push(module);                                             // 308
        }                                                                    // 309
      }                                                                      // 310
                                                                             // 311
      // If a Module.prototype.useNode method is defined, give it a chance   // 312
      // to define module.exports based on module.id using Node.             // 313
      if (! isFunction(module.useNode) ||                                    // 314
          ! module.useNode()) {                                              // 315
        contents(                                                            // 316
          module.require = module.require || makeRequire(file),              // 317
          // If the file had a .stub, reuse the same object for exports.     // 318
          module.exports = file.stub || {},                                  // 319
          module,                                                            // 320
          file.module.id,                                                    // 321
          file.parent.module.id                                              // 322
        );                                                                   // 323
      }                                                                      // 324
                                                                             // 325
      module.loaded = true;                                                  // 326
    }                                                                        // 327
                                                                             // 328
    // The module.runModuleSetters method will be deprecated in favor of     // 329
    // just module.runSetters: https://github.com/benjamn/reify/pull/160     // 330
    var runSetters = module.runSetters || module.runModuleSetters;           // 331
    if (isFunction(runSetters)) {                                            // 332
      runSetters.call(module);                                               // 333
    }                                                                        // 334
                                                                             // 335
    return module.exports;                                                   // 336
  }                                                                          // 337
                                                                             // 338
  function fileIsDirectory(file) {                                           // 339
    return file && isObject(file.contents);                                  // 340
  }                                                                          // 341
                                                                             // 342
  function fileIsDynamic(file) {                                             // 343
    return file && file.contents === null;                                   // 344
  }                                                                          // 345
                                                                             // 346
  function fileMergeContents(file, contents, options) {                      // 347
    if (Array.isArray(contents)) {                                           // 348
      contents.forEach(function (item) {                                     // 349
        if (isString(item)) {                                                // 350
          file.deps[item] = file.module.id;                                  // 351
        } else if (isFunction(item)) {                                       // 352
          contents = item;                                                   // 353
        } else if (isObject(item)) {                                         // 354
          file.stub = file.stub || {};                                       // 355
          each(item, function (value, key) {                                 // 356
            file.stub[key] = value;                                          // 357
          });                                                                // 358
        }                                                                    // 359
      });                                                                    // 360
                                                                             // 361
      if (! isFunction(contents)) {                                          // 362
        // If the array did not contain a function, merge nothing.           // 363
        contents = null;                                                     // 364
      }                                                                      // 365
                                                                             // 366
    } else if (! isFunction(contents) &&                                     // 367
               ! isString(contents) &&                                       // 368
               ! isObject(contents)) {                                       // 369
      // If contents is neither an array nor a function nor a string nor     // 370
      // an object, just give up and merge nothing.                          // 371
      contents = null;                                                       // 372
    }                                                                        // 373
                                                                             // 374
    if (contents) {                                                          // 375
      file.contents = file.contents || (isObject(contents) ? {} : contents);
      if (isObject(contents) && fileIsDirectory(file)) {                     // 377
        each(contents, function (value, key) {                               // 378
          if (key === "..") {                                                // 379
            child = file.parent;                                             // 380
                                                                             // 381
          } else {                                                           // 382
            var child = getOwn(file.contents, key);                          // 383
                                                                             // 384
            if (! child) {                                                   // 385
              child = file.contents[key] = new File(                         // 386
                file.module.id.replace(/\/*$/, "/") + key,                   // 387
                file                                                         // 388
              );                                                             // 389
                                                                             // 390
              child.options = options;                                       // 391
            }                                                                // 392
          }                                                                  // 393
                                                                             // 394
          fileMergeContents(child, value, options);                          // 395
        });                                                                  // 396
      }                                                                      // 397
    }                                                                        // 398
  }                                                                          // 399
                                                                             // 400
  function each(obj, callback, context) {                                    // 401
    Object.keys(obj).forEach(function (key) {                                // 402
      callback.call(this, obj[key], key);                                    // 403
    }, context);                                                             // 404
  }                                                                          // 405
                                                                             // 406
  function fileGetExtensions(file) {                                         // 407
    return file.options                                                      // 408
      && file.options.extensions                                             // 409
      || defaultExtensions;                                                  // 410
  }                                                                          // 411
                                                                             // 412
  function fileAppendIdPart(file, part, extensions) {                        // 413
    // Always append relative to a directory.                                // 414
    while (file && ! fileIsDirectory(file)) {                                // 415
      file = file.parent;                                                    // 416
    }                                                                        // 417
                                                                             // 418
    if (! file || ! part || part === ".") {                                  // 419
      return file;                                                           // 420
    }                                                                        // 421
                                                                             // 422
    if (part === "..") {                                                     // 423
      return file.parent;                                                    // 424
    }                                                                        // 425
                                                                             // 426
    var exactChild = getOwn(file.contents, part);                            // 427
                                                                             // 428
    // Only consider multiple file extensions if this part is the last       // 429
    // part of a module identifier and not equal to `.` or `..`, and there   // 430
    // was no exact match or the exact match was a directory.                // 431
    if (extensions && (! exactChild || fileIsDirectory(exactChild))) {       // 432
      for (var e = 0; e < extensions.length; ++e) {                          // 433
        var child = getOwn(file.contents, part + extensions[e]);             // 434
        if (child && ! fileIsDirectory(child)) {                             // 435
          return child;                                                      // 436
        }                                                                    // 437
      }                                                                      // 438
    }                                                                        // 439
                                                                             // 440
    return exactChild;                                                       // 441
  }                                                                          // 442
                                                                             // 443
  function fileAppendId(file, id, extensions) {                              // 444
    var parts = id.split("/");                                               // 445
                                                                             // 446
    // Use `Array.prototype.every` to terminate iteration early if           // 447
    // `fileAppendIdPart` returns a falsy value.                             // 448
    parts.every(function (part, i) {                                         // 449
      return file = i < parts.length - 1                                     // 450
        ? fileAppendIdPart(file, part)                                       // 451
        : fileAppendIdPart(file, part, extensions);                          // 452
    });                                                                      // 453
                                                                             // 454
    return file;                                                             // 455
  }                                                                          // 456
                                                                             // 457
  function recordChild(parentModule, childFile) {                            // 458
    var childModule = childFile && childFile.module;                         // 459
    if (parentModule && childModule) {                                       // 460
      parentModule.childrenById[childModule.id] = childModule;               // 461
    }                                                                        // 462
  }                                                                          // 463
                                                                             // 464
  function fileResolve(file, id, parentModule, seenDirFiles) {               // 465
    var parentModule = parentModule || file.module;                          // 466
    var extensions = fileGetExtensions(file);                                // 467
                                                                             // 468
    file =                                                                   // 469
      // Absolute module identifiers (i.e. those that begin with a `/`       // 470
      // character) are interpreted relative to the root directory, which    // 471
      // is a slight deviation from Node, which has access to the entire     // 472
      // file system.                                                        // 473
      id.charAt(0) === "/" ? fileAppendId(root, id, extensions) :            // 474
      // Relative module identifiers are interpreted relative to the         // 475
      // current file, naturally.                                            // 476
      id.charAt(0) === "." ? fileAppendId(file, id, extensions) :            // 477
      // Top-level module identifiers are interpreted as referring to        // 478
      // packages in `node_modules` directories.                             // 479
      nodeModulesLookup(file, id, extensions);                               // 480
                                                                             // 481
    // If the identifier resolves to a directory, we use the same logic as   // 482
    // Node to find an `index.js` or `package.json` file to evaluate.        // 483
    while (fileIsDirectory(file)) {                                          // 484
      seenDirFiles = seenDirFiles || [];                                     // 485
                                                                             // 486
      // If the "main" field of a `package.json` file resolves to a          // 487
      // directory we've already considered, then we should not attempt to   // 488
      // read the same `package.json` file again. Using an array as a set    // 489
      // is acceptable here because the number of directories to consider    // 490
      // is rarely greater than 1 or 2. Also, using indexOf allows us to     // 491
      // store File objects instead of strings.                              // 492
      if (seenDirFiles.indexOf(file) < 0) {                                  // 493
        seenDirFiles.push(file);                                             // 494
                                                                             // 495
        var pkgJsonFile = fileAppendIdPart(file, "package.json"), main;      // 496
        var pkg = pkgJsonFile && fileEvaluate(pkgJsonFile, parentModule);    // 497
        if (pkg &&                                                           // 498
            mainFields.some(function (name) {                                // 499
              return isString(main = pkg[name]);                             // 500
            })) {                                                            // 501
          recordChild(parentModule, pkgJsonFile);                            // 502
                                                                             // 503
          // The "main" field of package.json does not have to begin with    // 504
          // ./ to be considered relative, so first we try simply            // 505
          // appending it to the directory path before falling back to a     // 506
          // full fileResolve, which might return a package from a           // 507
          // node_modules directory.                                         // 508
          file = fileAppendId(file, main, extensions) ||                     // 509
            fileResolve(file, main, parentModule, seenDirFiles);             // 510
                                                                             // 511
          if (file) {                                                        // 512
            // The fileAppendId call above may have returned a directory,    // 513
            // so continue the loop to make sure we resolve it to a          // 514
            // non-directory file.                                           // 515
            continue;                                                        // 516
          }                                                                  // 517
        }                                                                    // 518
      }                                                                      // 519
                                                                             // 520
      // If we didn't find a `package.json` file, or it didn't have a        // 521
      // resolvable `.main` property, the only possibility left to           // 522
      // consider is that this directory contains an `index.js` module.      // 523
      // This assignment almost always terminates the while loop, because    // 524
      // there's very little chance `fileIsDirectory(file)` will be true     // 525
      // for the result of `fileAppendIdPart(file, "index.js")`. However,    // 526
      // in principle it is remotely possible that a file called             // 527
      // `index.js` could be a directory instead of a file.                  // 528
      file = fileAppendIdPart(file, "index.js");                             // 529
    }                                                                        // 530
                                                                             // 531
    if (file && isString(file.contents)) {                                   // 532
      file = fileResolve(file, file.contents, parentModule, seenDirFiles);   // 533
    }                                                                        // 534
                                                                             // 535
    recordChild(parentModule, file);                                         // 536
                                                                             // 537
    return file;                                                             // 538
  };                                                                         // 539
                                                                             // 540
  function nodeModulesLookup(file, id, extensions) {                         // 541
    if (isFunction(override)) {                                              // 542
      id = override(id, file.module.id);                                     // 543
    }                                                                        // 544
                                                                             // 545
    if (isString(id)) {                                                      // 546
      for (var resolved; file && ! resolved; file = file.parent) {           // 547
        resolved = fileIsDirectory(file) &&                                  // 548
          fileAppendId(file, "node_modules/" + id, extensions);              // 549
      }                                                                      // 550
                                                                             // 551
      return resolved;                                                       // 552
    }                                                                        // 553
  }                                                                          // 554
                                                                             // 555
  return install;                                                            // 556
};                                                                           // 557
                                                                             // 558
if (typeof exports === "object") {                                           // 559
  exports.makeInstaller = makeInstaller;                                     // 560
}                                                                            // 561
                                                                             // 562
///////////////////////////////////////////////////////////////////////////////







(function(){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/modules-runtime/options.js                                       //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
makeInstallerOptions = {};                                                   // 1
                                                                             // 2
if (typeof Profile === "function" &&                                         // 3
    process.env.METEOR_PROFILE) {                                            // 4
  makeInstallerOptions.wrapRequire = function (require) {                    // 5
    return Profile(function (id) {                                           // 6
      return "require(" + JSON.stringify(id) + ")";                          // 7
    }, require);                                                             // 8
  };                                                                         // 9
}                                                                            // 10
                                                                             // 11
///////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/modules-runtime/client.js                                        //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
// On the client, make package resolution prefer the "browser" field of      // 1
// package.json files to the "main" field.                                   // 2
makeInstallerOptions.browser = true;                                         // 3
                                                                             // 4
meteorInstall = makeInstaller(makeInstallerOptions);                         // 5
                                                                             // 6
///////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['modules-runtime'] = {}, {
  meteorInstall: meteorInstall
});

})();
