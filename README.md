# restore-stacktrace

Simple utility to restore Javascript stacktraces from sourcemaps

    $ node index.js --help

      Usage: main [options]

      Options:

        -h, --help                output usage information
        -V, --version             output the version number
        -m, --maps <value>        Directory containing source maps
        -s, --stacktrace <value>  File containing minified stack trace
        -i, --interactive         Read stack trace from stdin until the empty line
        
       -i has precedence over -s