fs     = require 'fs'
{exec} = require 'child_process'

libFiles  = [[
  # omit src/ and .js to make the below lines a little shorter
  'core'
  'version1'
  'construct'
  'evaluators'
  'evaluators1'
],[
  # omit src/ and .js to make the below lines a little shorter
  'core'
  'version2'
  'construct'
  'evaluators'
  'evaluators1'
  'constructors'
  'compose'
  'recursive'
  'own'
  'serialize'
  'deserialize'
],[
  # omit src/ and .js to make the below lines a little shorter
  'core'
  'version3'
  'construct'
  'evaluators'
  'evaluators3'
  'constructors'
  'compose'
  'recursive'
  'own'
  'serialize'
  'deserialize'
]]

###
Build helpers (sequenced, composible)
###

# Filename -> (Maybe (() -> IO) -> () -> IO) -> Maybe (() -> IO) -> () -> IO
ifExists = (filename) -> (condCallback) -> (callback) -> -> 
  fs.exists filename, (exists) ->
    if exists
      (condCallback callback)()
    else
      callback?()
              
# [Filename] -> (String -> () -> IO) -> () -> IO
concatFiles = (files) -> (callback) -> 
  contents = new Array files.length
  remaining = files.length
  ->
    for file, index in files then do (file, index) ->
      fs.readFile "#{file}", 'utf8', (err, fileContents) ->
        throw err if err
        contents[index] = fileContents
        (callback contents)() if --remaining is 0 and callback?

# [Filename] -> (String -> () -> IO) -> () -> IO
concatSrcFiles = (files) -> 
  concatFiles ("src/#{file}.js" for file in files)

# Filename -> Maybe (() -> IO) -> String -> () -> IO
writeFile = (filename) -> (callback) -> (text) -> ->
  fs.writeFile "#{filename}", text.join(''), 'utf8', (err) ->
    throw err if err
    callback?(filename)

# String -> Maybe (() -> IO) -> () -> IO 
logDone = (message) -> (callback) -> -> 
  console.log "...Done (#{message})"
  callback?()

###
Build scripts
###

# Number -> Maybe (() -> IO) -> () -> IO
build = (version) -> (callback) -> (concatSrcFiles libFiles[version - 1]) (writeFile "build/adt#{version}.js") callback

# Number -> Maybe (() -> IO) -> () -> IO
minify = (version) -> (callback) -> ->
  fs.exists 'node_modules/.bin/uglifyjs', (exists) ->
    tool = if exists then 'node_modules/.bin/uglifyjs' else 'uglifyjs'
    fs.exists "build/adt#{version}.js", (exists) ->
      if exists
        exec "#{tool} --no-copyright build/adt#{version}.js > build/adt#{version}.min.js", (err, stdout, stderr) ->
          throw err if err
          console.log stdout + stderr
          callback?()

# Number -> Maybe (() -> IO) -> () -> IO
wrap = (version) -> (callback) ->
    filename = "adt#{version}.js"
    filenameMin = "adt#{version}.min.js"

    # TODO: Unfortunately it is not so easy to wrap `(callback) -> f0 f1 f2 callback` in JavaScript
    #       In order to get something similar to point-free style (http://www.haskell.org/haskellwiki/Pointfree)
    #       we could do something like `(f0.compose f1).compose f2`
    #       or alternatively `(compose (compose f0) f1) f2` or `(f0.compose() f1).compose() f2`

    # Maybe (() -> IO) -> () -> IO
    _write = (callback) -> (concatFiles ['src/header.js', "build/#{filename}", 'src/footer.js']) (writeFile "dist/#{filename}") callback
    _writeMin = (callback) -> (concatFiles ['src/header.js', "build/#{filenameMin}", 'src/footer.js']) (writeFile "dist/#{filenameMin}") callback

    # Maybe (() -> IO) -> () -> IO
    _wrap = (callback) -> _write (logDone "adt#{version}.js") callback
    _wrapMin = (callback) -> _writeMin (logDone "adt#{version}.min.js") callback

    # Maybe (() -> IO) -> () -> IO
    _build = (ifExists "build/#{filename}") ((callback) -> _wrap callback)
    _buildMin = (ifExists "build/#{filenameMin}") ((callback) -> _wrapMin callback)

    _build _buildMin callback

###
Tasks
###

task 'all', "Build all distribution files", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  linkDistFiles = (callback) ->
    fs.link("dist/adt3.js","dist/adt.js")
    fs.link("dist/adt3.min.js","dist/adt.min.js")
    callback?()

  ((build 1) (logDone 'build-1') (minify 1) (logDone 'minify') (wrap 1)())()
  ((build 2) (logDone 'build-2') (minify 2) (logDone 'minify') (wrap 2)())()
  ((build 3) (logDone 'build-3') (minify 3) (logDone 'minify') (wrap 3) linkDistFiles)()

task 'build-1', "Concatenate source files into a single library file", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  ((build 1) (logDone 'build') (wrap 1)())()
  console.log "ok...."

task 'fetch:npm', "Fetch the npm package manager", ->
  exec "curl http://npmjs.org/install.sh | sudo sh", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done"

task 'fetch:uglifyjs', "Fetch the UglifyJS minification tool", ->
  exec "npm install uglify-js", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done"

task 'minify', "Minify the resulting application file after build", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  (minify wrap())()

task 'clean', "Cleanup all build files and distribution files", ->
  cmd = "rm -rf build"
  for v in [1,2,3]
    (cmd += ";rm dist/adt#{v}.js;rm dist/adt#{v}.min.js;rm dist/adt#{v}.module.js;rm dist/adt#{v}.module.min.js")
  exec cmd, (err, stdout, stderr) ->
    console.log stdout + stderr
    console.log "...Done (clean)"
