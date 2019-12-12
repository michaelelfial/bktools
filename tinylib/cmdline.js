var pobjects = require("./pobjects.js");
/*
	Command line processing:
	
	1. Command line syntax:
		The command line can contain:
		a: flags. 
			v = cmdline.flag("myflag"); // returns true/false depending on the existence of the flag in the command line
			The flag syntax: --myflag
			extended version:
			v = cmdline.flag("myflag","m");
			The flag syntax can be also: -m
		b: options
			v = cmdline.option("myoption") 
				syntax1: --myoption:optval // returns optval if exists false otherwise
				syntax2: --myoption:	// returns true if exists
				Returns false if the option is not in the command line if (cmdline.option("myoption") === false) will check for missing option
			v = cmdline.option("myoption","o") // With alias
				Adds optional short syntax
				syntax1: --o:optval // returns optval if exists false otherwise
				syntax2: --o:	// returns true if exists
			v = cmdline.option("myoption","o", "defaultvalue") // With alias
			v = cmdline.option("myoption",null, "defaultvalue") // Without alias
				instead of false when the option is missing, returns the "defaultvalue"
			
			defaultvalue can be anything, not necessarily a string, but string is most convenient, because it matches what can come from the real command line.
		c: variables
			Similar to options but the syntax is different
			v = cmdline.variable("myvar") // returns the value of the variable or null if the variable is missing
				syntax: myvar=myvalue
				syntax: myvar='myvalue'
				syntax: myvar="myvalue"
			v = cmdline.variable("myvar","defaultvalue")
				With default value it is returned when the variable is missing instead of null
		d: command
			Executes a function with certain command name
			v = cmdline.command("mycmd",function(_cmdline, cmdname) {
				... the code ...
				_cmdline is the cmdline object. flags, options and variables can be queried from within
				cmdname is the name of the command - "mycmd" for example (needed if the function is designed to execute more then one command)
			});
			v = cmdline.command("mycmd",arg1, arg2, ...., argN,function(_cmdline,cmdname, arg1, arg2, ...., argN) {
				Like the first case, but additional arguments are passed by the caller
			});
			Returns whatever the function returns or null if it returns nothing.

	Need to add validation and possibly pre-read in order to avoid mistaking option values with commands.
*/
var exports = (function() {
	function CmdLine() {
		this.args = process.argv.slice(2);
		this.node = process.argv[0];
		this.script = process.argv[1];
		return pobjects.envelope(CmdLine, this);
	}
	CmdLine.prototype.$$options = {};
	CmdLine.prototype.$$variables = {};
	CmdLine.prototype.$$commands = {};
	CmdLine.prototype.option  = function(optname, alias, defarg) {
		if (typeof alias == "string" && alias.length > 1) throw "The alias argument to option has to be one symbol only";
		if (optname in this.$$options) return this.$$options[optname];
		for (var i = 0; i < this.args.length; i++) {
			if (this.args[i] == ("--" + optname) || (alias != null && this.args[i] == ("-" + alias))) {
				this.$$options[optname] = defarg?defarg:true;
				this.args.splice(i,1);
				if (defarg) return defarg;
				return true;
			}
			var len = 0;
			if (this.args[i].indexOf("--" + optname + ":") == 0) {
				len = ("--" + optname +":").length;
			} else if (alias != null && this.args[i].indexOf("-" + alias +":") == 0) {
				len = ("-" + alias +":").length;
			}
			
			if (len > 0) {
				var v = this.args[i].slice(len);
				
				this.args.splice(i,1);
				if (v != null && v.length > 0) {
					this.$$options[optname] = v;
				
					return v;
				}
				if (defarg) {
					this.$$options[optname] = defarg;
					return defarg;
				} else {
					this.$$options[optname] = true;
					return true;
				}
				
			}
		}
		return false;
	}
	CmdLine.prototype.flag  = function(optname, alias) {
		if (typeof alias == "string" && alias.length > 1) throw "The alias argument to flag has to be one symbol only";
		if (optname in this.$$options) return true;
		for (var i = 0; i < this.args.length; i++) {
			if (this.args[i] == ("--" + optname) || (alias != null && this.args[i] == ("-" + alias))) {
				this.$$options[optname] = true;
				this.args.splice(i,1);
				return true;
				
			}
		}
		return false;
	}
	CmdLine.prototype.variable  = function(varname, defaultVal) {
		if (varname in this.$$variables) return this.$$variables[varname];
		for (var i = 0; i < this.args.length; i++) {
			if (this.args[i].indexOf(varname + "=") == 0) {
				var val = this.args[i].slice((varname + "=").length);
				if (val.indexOf("\'") == 0 || val.indexOf("\"") == 0) val = val.slice(1,-1);
				this.$$variables[varname] = val;
				this.args.splice(i,1);
				return val;
			}
		}
		return null;
	}
	CmdLine.prototype.hascommand = function(cmdname) {
		if (cmdname in this.$$commands) return true;
		for (var i = 0; i < this.args.length; i++) {
			if (this.args[i] == cmdname) {
				this.$$commands[cmdname] = true;
				this.args.slice(i,1);
				return true;
			}
				
		}
		return false;
	}
	/*
		callback := function(CmdLine, args)
	*/
	CmdLine.prototype.command = function(cmdname, /* 0 or more */ __args, /* required */ __callback) {
		if (this.hascommand(cmdname)) {
			if (arguments.length >= 2) {
				var cb = arguments[arguments.length - 1];
				if (typeof cb != "function") throw "The last argument to command has to be a function(CmdLine, args ...)";
				var args = [this, cmdname];
				//args.push(this);
				for (var i = 1; i < arguments.length - 1;args.push(arguments[i++]));
				return cb.apply(null, args);
			} else {
				throw "command requires at least two arguments (cmdname, callback)";
			}
		} else {
			return null;
		}
	}
	
	return CmdLine;
})();

module.exports = exports;
