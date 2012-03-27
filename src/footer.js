  // Export adt to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    exports.adt = adt;
  return adt;
})();

