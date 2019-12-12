
var cmdline = require("./tinylib/cmdline.js");


function main() {
	console.log("bktools ver 0.0.1");
	var cl = new cmdline();
	
	console.log("option --x " + cl.option("x", null, "alpha"))
	console.log("flag --f " + cl.flag("f"));
	console.log("var file=" + cl.variable("file"));
	cl.command("go", "string", "sadfhjgsdf", 12345 , hui);
	
	
}

function hui($cl,cmd,v1,v) {
	console.log("In the go command " + typeof cmd);
	if ($cl.flag("f")) {
		console.log("f is on");
		let fname = $cl.variable("file");
		if (fname == null) {
			console.error("file= is required");
			return 1;
		}
	} else {
		console.log("f is off");
	}
	
}

main();