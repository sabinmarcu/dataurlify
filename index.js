var mime    = require("mime"),
    assign  = require("object-assign"),
    through = require("through"),
    fs      = require("fs");

var mimeify = module.exports = function(filename, opts) {
    return mimeify.configure(opts)(filename);
}

mimeify.configure = function(opts) {
    opts = assign({}, opts);
    var extensions = opts.extensions || [];

    return function(filename) {
        var ext = filename.substr(filename.lastIndexOf(".") + 1);
        if (extensions.indexOf(ext) < 0) {
            return through();
        }

        return through(write, end);

        function write () {}
        function end() {
            // TODO: figure out in what format is the data coming in from browserify to match the base64
            // until I do, this will do just fine
            var _compiled = "(function(){\n" +
                "var item = { \n" +
                    "mime: \"" + mime.lookup(filename) + "\", \n" +
                    "content: \"" + (fs.readFileSync(filename)).toString("base64") + "\" \n "+
                "};\n" +
                "item.toString = function() { \n" +
                    "return \"data:\" + item.mime + \";base64,\" + item.content; \n" +
                "}; \n" +
                "module.exports = item; \n" +
            "})();";

            this.queue(_compiled);
            this.queue(null);
        }
    }

}
