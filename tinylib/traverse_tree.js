var pobjects = require("./pobjects.js");
var Path = require("./paths.js");


/**
	Traverses a directory tree

	exports: 
	
	
*/
function PathTraverse(basePath) {
	this.$basePath = basePath;
	return pobjects.envelope(PathTraverse, this);
}
// +Properties/Fields
PathTraverse.prototype.$basePath = null;
// PathTraverse.prototype.
// -Properties/Fields

PathTraverse.prototype.traverse = function(fromPath) {
	
}
PathTraverse.prototype.$traverse = function(path) {
	var _path = new Path(path);
}


module.exports = exports = PathTraverse;