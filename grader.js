#!/usr/bin/env node
var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
        var instr = infile.toString();
        if(!fs.existsSync(instr)) {
                console.log("%s does not exist. Exiting.", instr);
                process.exit(1); //http://nodejs.org/api/process.html#process_process_exit_code
        }
        return instr;
};

var assertValidURL = function(urlStr) {
	if (urlStr.length <= 0) {
		console.log("Please enter a URL string. Exiting.");
		process.exit(1);
	}
	var urlregx = new RegExp("^(http:\/\/|https:\/\/|ftp:\/\/|www.){1}([0-9A-Za-z]+\.)");
	if (urlregx.test(urlStr)){
		return(urlStr);
	}
	console.log("%s is an invalid URL. Exiting", urlStr);
	process.exit(1);
	return (urlStr);
};

var cheerioHtmlFile = function(htmlfile) {
        return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
        return JSON.parse(fs.readFileSync(checksfile));
};

var checkURL = function(urlStr, checksfile) {
	rest.get(urlStr).on('complete', function(result) {
            if (result instanceof Error) {
                sys.puts('Error: ' + result.message);
                this.retry(5000);
            } else {
                fs.writeFileSync('outfile', result);
                var checkJson = checkHtmlFile('outfile', program.checks); 
                var outJson = JSON.stringify(checkJson, null, 4);
                console.log(outJson);
	    }
	});
};

var checkHtmlFile = function(htmlfile, checksfile) {
        $ = cheerioHtmlFile(htmlfile);
        var checks = loadChecks(checksfile).sort();
        var out = {};
        for(var ii in checks) {
                var present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
        }
        return out;
};

var clone = function(fn) {
        return fn.bind({});
}

if (require.main == module) {
        program
                .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
                .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
                .option('-u, --url <url>', 'URL to grade', clone(assertValidURL))
        .parse(process.argv);
    var checkJson, outJson, outfile
    if ( program.url) {
	checkURL(program.url, program.checks);
    }
    if (!program.url && program.file) {
	var checkJson = checkHtmlFile(program.file, program.checks);
    	var outJson = JSON.stringify(checkJson, null, 4);
    	console.log(outJson);
     }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
