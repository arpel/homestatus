from flask_assets import Bundle

common_css = Bundle(
    'css/vendor/bootstrap.css',
    'css/styles.css',
    'css/vendor/nv.d3.css',
    'css/vendor/bootstrap-responsive.min.css',
    'css/vendor/jquery.easy-pie-chart.css',
    'css/vendor/morris-0.4.3.min.css',
    #filters='cssmin',
    output='public/css/common.css'
    )

common_js = Bundle(
    'http://code.jquery.com/jquery-latest.js',
    'js/vendor/bootstrap.min.js',
    'http://d23cj0cdvyoxg0.cloudfront.net/xivelyjs-1.0.4.min.js',
    'js/vendor/morris-0.4.3.min.js',
    'js/vendor/moment.min.js',
    'js/vendor/dygraph-combined.js',
    Bundle(
        'js/vendor/jquery.easy-pie-chart.js',
        'js/vendor/raphael-2.1.2.js',
        'js/homestatus.js',
        #filters='jsmin'
    ),
    output='public/js/common.js'
    )

index_js = Bundle(
    'js/main.js',
    #filters='jsmin',
    output='public/js/bundle_index.js'
)

tempdetails_js = Bundle(
    'js/tempdetails.js',
    #filters='jsmin',
    output='public/js/bundle_tempdetails.js'
)