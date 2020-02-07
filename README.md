# restore-stacktrace

Simple utility to restore Javascript stacktraces from sourcemaps

    $ node index.js --help

      Usage: main [options]

      Options:

        -h, --help                output usage information
        -V, --version             output the version number
        -b, --base <value>        base URL for fetching source maps
        -s, --stacktrace <value>  file containing minified stack trace
        -i, --interactive         read stack trace from stdin until the empty line
        
       -i has precedence over -s