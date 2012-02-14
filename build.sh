#!/bin/sh

if [ -z "$1" ] ; then
    distrib="all"
else
    distrib=$1
fi

# download JavaScript dependencies if they're missing
echo "Checking JavaScript dependencies..."
pushd jsdep > /dev/null
for url in $(cat jsdeplist) ; do

    # discard commented lines
    if [ $url == \#* ] ; then
        continue
    fi

    # get filename: split string and get last element
    for i in $(echo $url | tr "/" "\n")
    do
        filename=$i
    done

    # check if dependency is there
    if [ ! -f $filename ] ; then
        echo "Downloading $dep..."
        wget --no-check-certificate $url
    fi

    # add it to the deps list
    include='<script type="text/javascript" src="jsdep/'$filename'"></script>'
    include_d='<script type="text/javascript" src="/jsdep/'$filename'"></script>'
    include_progfolio="echoFlat('<script type=\"text/javascript\" src=\"addon/jsdep/$filename\"></script>');"
    include_progfolio="${include_progfolio//\//\\/}"
    if [ -z "$deps" ] ; then
        deps=$include
        deps_d=$include_d
        deps_progfolio=$include_progfolio
    else
        deps=$deps'\n    '$include # newline + indent
        deps_d=$deps_d'\n    '$include_d
        deps_progfolio=$deps_progfolio'\n'$include_progfolio
    fi
done
popd > /dev/null

# create scripts list
echo "Creating scripts list..."
pushd js > /dev/null
for filename in $(cat jslist) ; do

    # discard commented lines
    if [ $filename == \#* ] ; then
        continue
    fi
    
    # build include line and add it to the scripts list
    include_d='<script type="text/javascript" src="/js/'$filename'"></script>' # debug = use root file to get modfis in real time
    if [ -z "$scripts_d" ] ; then
        scripts_d=$include_d
    else
        scripts_d=$scripts_d'\n    '$include_d # newline + indent
    fi
done
popd > /dev/null

# remove build folder
echo "Cleaning..."
if [ -d build ] ; then
    rm build -rf
fi

# compile all scripts from jslist into minus.js
# should use UglifyJS
echo "Building minus.js..."
mkdir -p build
for filename in $(cat js/jslist) ; do

    # discard commented lines
    if [ $filename == \#* ] ; then
        continue
    fi

    # appends to minus.js
    cat js/$filename >> build/minus.js
    echo -e "\n\n" >> build/minus.js
done

# build www distrib
if [ $distrib == "all" -o $distrib == "www" ] ; then

    echo "Building build/www..."
    mkdir -p build/www

    # copy files
    cp distrib/www/minus.css build/www/
    cp distrib/www/minus.ico build/www/
    cp distrib/www/.htaccess build/www/
    mkdir -p build/www/jsdep
    cp -r jsdep/*.js build/www/jsdep/
    cp -r shader build/www/
    cp build/minus.js build/www/minus.js

    # create minusd.html from template
    cp distrib/www/minus.template.html build/www/minusd.html
    sed -i 's#<!-- MINUS_TITLE -->#Minus Cube Debug#g' build/www/minusd.html
    sed -i 's#<!-- MINUS_INIT -->#main_init(true);#g' build/www/minusd.html
    if [ -n "$deps_d" ] ; then
        sed -i "s#<!-- MINUS_DEPS -->#$deps_d#g" build/www/minusd.html
    fi
    if [ -n "$scripts_d" ] ; then
        sed -i "s#<!-- MINUS_SCRIPTS -->#$scripts_d#g" build/www/minusd.html
    fi

    # create minus.html from template
    cp distrib/www/minus.template.html build/www/minus.html
    sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' build/www/minus.html
    sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' build/www/minus.html
    if [ -n "$deps" ] ; then
        sed -i "s#<!-- MINUS_DEPS -->#$deps#g" build/www/minus.html
    fi
    include='<script type="text/javascript" src="minus.js"></script>'
    include="${include//\//\\/}"
    sed -i "s#<!-- MINUS_SCRIPTS -->#$include#g" build/www/minus.html
fi

# build progfolio distrib
if [ $distrib == "all" -o $distrib == "progfolio" ] ; then

    echo "Building build/progfolio..."
    mkdir -p build/progfolio

    # copy www files
    cp distrib/www/minus.css build/progfolio/
    cp distrib/www/minus.ico build/progfolio/
    cp distrib/www/.htaccess build/progfolio/
    mkdir -p build/progfolio/jsdep
    cp -r jsdep/*.js build/progfolio/jsdep/
    cp -r shader build/progfolio/
    cp build/minus.js build/progfolio/minus.js

    # create minus.html from template
    cp distrib/www/minus.template.html build/progfolio/minus.html
    sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' build/progfolio/minus.html
    sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' build/progfolio/minus.html
    if [ -n "$deps" ] ; then
        sed -i "s#<!-- MINUS_DEPS -->#$deps#g" build/progfolio/minus.html
    fi
    include='<script type="text/javascript" src="minus.js"></script>'
    include="${include//\//\\/}"
    sed -i "s#<!-- MINUS_SCRIPTS -->#$include#g" build/progfolio/minus.html
    
    # copy progfolio files
    cp distrib/progfolio/addon.php5 build/progfolio/
    cp distrib/progfolio/addon_body_on_load.php5 build/progfolio/

    # create addon_extra_headers.php5 from template
    cp distrib/progfolio/addon_extra_headers.template.php5 build/progfolio/addon_extra_headers.php5
    if [ -n "$deps_progfolio" ] ; then
        sed -i "s#MINUS_DEPS#$deps_progfolio#g" build/progfolio/addon_extra_headers.php5
    fi
    include="echoFlat('<script type=\"text/javascript\" src=\"addon/minus.js\"></script>');"
    include="${include//\//\\/}"
    sed -i "s#MINUS_SCRIPTS#$include#g" build/progfolio/addon_extra_headers.php5

fi

# build pokki distrib
if [ $distrib == "all" -o $distrib == "pokki" ] ; then

    echo "Building build/pokki..."
    mkdir -p build/pokki

    # copy files
    cp distrib/pokki/background.html build/pokki/
    cp distrib/pokki/manifest.json build/pokki/
    cp -r distrib/pokki/css build/pokki/
    cp -r distrib/pokki/img build/pokki/
    cp -r distrib/pokki/js build/pokki/
    mkdir -p build/pokki/jsdep
    cp -r jsdep/*.js build/pokki/jsdep/
    cp -r shader build/pokki/
    cp build/minus.js build/pokki/js/minus.js
    
    # create popup.html from template
    cp distrib/pokki/popup.template.html build/pokki/popup.html
    sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' build/pokki/popup.html
    sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' build/pokki/popup.html
    if [ -n "$deps" ] ; then
        sed -i "s#<!-- MINUS_DEPS -->#$deps#g" build/pokki/popup.html
    fi
    include='<script type="text/javascript" src="js/minus.js"></script>'
    include="${include//\//\\/}"
    sed -i "s#<!-- MINUS_SCRIPTS -->#$include#g" build/pokki/popup.html
fi

echo "Done."
