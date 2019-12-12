var pobjects = require("./pobjects.js");

/**
	Exports: Path
	Usage: var p = new Path([path [, cutfile]]);
	
	@param 	path 	{string} 	the path to parse into the object
	@param  path	{Path}		copy constructor 
	@param  cutfile {boolean|null}	if true cuts the file part from the path (the part after the last /)
									if false treats the file part as one more directory and not as file.
									if omitted/null - nothing special is done
	
	Class for path calculations. This class does not represent existing paths in any way, it is a tool for 
	calculations only. The code using hte class is responsible to pass existing paths whereever this is important.
	
	Properties
	
			
	
*/
function Path(path, cutfile) {
	this.reset();
	if (typeof path == "string") {
		if (!this.parsePath(path)) throw "Cannot parse the specified path";
	} else if (path instanceof Path) {
		this.$parts = Array.from(path.$parts);
		this.$absolute = path.$absolute;
		this.$hasfile = path.$hasfile;
	}
	if (this.$hasfile) {
		if (cutfile === true) { // Remove the file part
			this.$parts.pop();
			this.$hasfile = false;
		} else if (cutfile === false) { // Treat the file part as directory
			this.$hasfile = false;
		}
	}
	
	return pobjects.envelope(Path, this);
};
// + Properties/fields
Path.prototype.$parts = null;
Path.prototype.$reSeparator = /[\/\\]/;
Path.prototype.$strSeparator = "/";
Path.prototype.$partEmpty = ".";
Path.prototype.$partUp = "..";
Path.prototype.$absolute = false;
Path.prototype.$hasfile = false;
// - Properties/fields

// + Private
/**
	Non-empty string with no separators
*/
Path.prototype.$checkPathPart = function(s) {
	if (typeof s == "string") {
		if (this.$reSeparator.test(s)) return false;
		if (s.length > 0) return true;
	}
	return false;
}
// - Private


// + Public
/** Clones the object
*/
Path.prototype.clone = function() {
	return new Path(this);
}
/** Returns a new Path object without any file - strips the path
*/
Path.prototype.pathOf = function() {
	return new Path(this,true);
}
/**	Adds a part to the path. If the path contains a file, does it to the path of the file, keeping it unchanged.
	
	returns: true if successful and false if not possible
*/
Path.prototype.addDir = function(part) {
	if (!this.$checkPathPart(part)) return false;
	if (this.$parts == null) this.$parts = [];
	var pos = this.$parts.length;
	if (this.$hasfile) {
		var pos = this.$parts.length - 1;
	}
	if (part == this.$partUp) {
		if (pos > 0) {
			if (this.$parts[pos-1] != this.$partUp) {
				this.$parts.splice(pos-1,1)
			} else {
				this.$parts.splice(pos,0,part)
			}
			return true;
		} else {
			this.$parts.splice(pos,0,part)
			return true;
			
		}
	} else if (part == this.$partEmpty) {
		return true;
	} else {
		this.$parts.splice(pos,0,part)
		return true;
	}
}
/** Sets the file name - changes it if it exists or adds it if not
*/
Path.prototype.setFile = function(s) {
	if (s == null) {
		if (this.$parts == null) this.$parts = [];
		if (this.$hasfile) {
			if (this.$parts.length > 0) {
				this.$parts.splice(this.$parts.length -1,1);
				this.$hasfile = false;
			} else {
				this.$hasfile = false;
			}
		}
		return true;
	} else if (this.$checkPathPart(s)) {
		if (this.$hasfile && this.$parts.length > 0) {
			this.$parts[this.$parts.length - 1] = s;
			return true;
		} else {
			this.$parts.push(s);
			this.$hasfile = true;
			return true;
		}
	}
	return false;
}
/** Returns the file name (if present) from the path or null if not.
*/
Path.prototype.fileName = function() {
	if (this.$hasfile && this.$parts.length > 0) {
		return this.$parts[this.$parts.length - 1];
	}
	return null;
}
/**	Resets the object to empty state
*/
Path.prototype.reset = function() {
	this.$parts = [];
	this.$absolute = false;
	this.$hasfile = false;
}
/** Checks if this is an empty path
*/
Path.prototype.empty = function() {
	if (this.$parts == null || this.$parts.length == 0) {
		if (!this.$absolute /* && !this.$hasfile*/) return true;
		// Should not have $hasfile == true in this case
	}
	return false;
}
/** Returns the length (parts number) of the path part of a path (file part is not counted)
*/
Path.prototype.pathLength = function() {
	if (this.$parts == null || this.$parts.length == 0) return 0;
	return this.$parts.length - (this.$hasfile?1:0);
}
/** Parses a path and fills the object with it
*/
Path.prototype.parsePath = function(path) {
	if (typeof path == "string") {
		this.reset();
		var arr = path.split(this.$reSeparator);
		if (arr != null && arr.length > 0) {
			if (arr[0].length == 0 && arr.length > 1) {
				this.$absolute = true;
				arr.splice(0,1);
			}
			for (var i = 0; i < arr.length; i++) {
				if (i < arr.length - 1) {
					if (arr[i].length > 0) {
						// Empty parts are ignored
						this.$parts.push(arr[i]);
					}
				} else {
					if (arr[i].length > 0) {
						this.$hasfile = true;
						this.$parts.push(arr[i]);
					} else {
						this.$hasfile = false;
					}
				}
			}
			return true;
		}
	} 
	this.reset();
	return false;
}
Path.prototype.toString = function(delimiter) {
	var d = delimiter || this.$strSeparator;
	var s = "";
	if (this.$absolute) s += d;
	if (this.$parts.length > 0) {
		for (var i = 0; i < this.$parts.length;i++) {
			if (i > 0) s += d;
			s += this.$parts[i];
		}
		if (!this.$hasfile) s += d;
	}
	return s;
}
Path.prototype.normalized = function() {
	var s = "";
	var parts = [];
	var path = this;
	for (var i = 0; i < (path.$hasfile?path.$parts.length - 1:path.$parts.length); i++) {
		var part = path.$parts[i];
		if (part == this.$partUp) {
			if (parts.length > 0 && parts[parts.length - 1] != this.$partUp) {
				parts.pop()
			} else {
				parts.push(part);
			}
		} else if (part == this.$partEmpty) {
			// nothing
		} else {
			parts.push(part);
		}
	}
	if (this.$absolute) s += this.$strSeparator;
	s += parts.join(this.$strSeparator) + ((parts.length > 0)?this.$strSeparator:"");
	if (this.$hasfile) s += this.fileName();
	return new Path(s);
}
Path.prototype.combine = function(path, normalize) {
	if (typeof path == "string") {
		// Create Path
		path = new Path(path);
		if (normalize) path = path.normalized();
	} else if (path == null) {
		return normalize?this.normalized():this.clone();
	}
	if (path instanceof Path) {
		path = path.clone();
		// We have what we want
		if (path.$absolute) { // if the right path is absolute - it wins
			return path; // This is why we need clone above
		} else {
			// If the right path is relative it combines with the left one
			var thispath = this.pathOf();
			if (normalize) thispath = thispath.normalized();
			for (var i = 0; i < (path.$hasfile?path.$parts.length - 1:path.$parts.length); i++) {
				if (!thispath.addDir(path.$parts[i])) throw "Error combining paths";
			}
			// If there is a file in the right path, it is added to the resulting one.
			if (path.$hasfile) {
				thispath.setFile(path.fileName());
			}
			return thispath;
		}
	} else {
		throw "The path parameter is not string not Path object";
	}
}
// - Public
module.exports = exports = Path;