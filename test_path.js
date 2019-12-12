var cmdline = require("./tinylib/cmdline.js");
var Path = require("./tinylib/paths.js");

function main() {
	//console.log(process.argv);
	var cl = new cmdline();
	
	var p1 = cl.variable("p1");
	var p2 = cl.variable("p2");
	
	// console.log("option --x " + cl.option("x", null, "alpha"))
	// console.log("flag --f " + cl.flag("f"));
	// console.log("var file=" + cl.variable("file"));
	cl.command("c", p1, p2, combine);
	cl.command("n", p1, p2, normalize);
	cl.command("?", help);
	
}

function combine(cl, cmd, p1, p2) {
	if (p1 == null || p2 == null) {
		console.error("(c)ombine requires two non-empty variables p1=<path1> p2=<path2>")
	} else {
		console.log("p1=" + p1);
		console.log("p2=" + p2);
		var pp1 = new Path(p1);
			console.log("pp1.$hasfile=" + pp1.$hasfile);
			console.log("pp1.fileName=" + pp1.fileName());
			console.log("pp1.pathLength=" + pp1.pathLength());
		var pp2 = new Path(p2);
		var bnorm = cl.flag("normalize","n");
		var ppr = pp1.combine(p2, bnorm);
		console.log("combined=" + ppr.toString());
	}
}
function normalize(cl, cmd, ...paths) {
	
	for (var p of paths) {
		if (p) {
			console.log("p=" + p);
			p = new Path(p);
			console.log("p.normalized=" + p.normalized());
		}
	}
}
function help(cl,cmd) {
	console.log(
		"usage: test_path [c|n] p1=<path1> p2=<path2>\
				test_path ?"
	);
}

main();