#!/bin/sh

# download JavaScript dependencies
echo "Downloading dependencies..."
if [ ! -d js/dep ] ; then
    mkdir -p js/dep
    for i in $(cat jsdeplist) ; do
        if [[ $i == \#* ]] ; then
            continue
        fi
        cd js/dep
        wget --no-check-certificate $i
        cd ../..
    done
fi

# build jslist: JavaScript files list
echo "Compiling jslist..."
for i in $(cat jslist) ; do
    if [[ $i == \#* ]] ; then
        continue
    fi
    include='<script type="text/javascript" src="'$i'"></script>'
    if [ -z "$jslist" ] ; then
        jslist=$include
    else
        jslist=$jslist'\n    '$include # newline + indent
    fi
done
#jslist="${jslist//\//\\/}" # http://www.cyberciti.biz/faq/unix-linux-replace-string-words-in-many-files/
#-> way easier to use another separator, like #: http://forums.devshed.com/unix-help-35/sed-not-escaping-forward-slash-393115.html

# compile all scripts from jslist into minus.js
# should use PHP minify later on for more efficiency
echo "Building minus.js..."
if [ -f minus.js ] ; then
    rm minus.js
fi
for i in $(cat jslist) ; do
    if [[ $i == \#* ]] ; then
        continue
    fi
    cat $i >> minus.js
    echo -e "\n\n" >> minus.js
done

# create minusd.html from template
echo "Building minusd.html..."
cp minus.template.html minusd.html
sed -i 's#<!-- MINUS_TITLE -->#Minus Cube Debug#g' minusd.html
sed -i 's#<!-- MINUS_INIT -->#main_init(true);#g' minusd.html
if [ -n "$jslist" ] ; then
    sed -i "s#<!-- MINUS_JSLIST -->#$jslist#g" minusd.html
fi

# create minus.html from template
echo "Building minus.html..."
cp minus.template.html minus.html
sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' minus.html
sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' minus.html
include='<script type="text/javascript" src="minus.js"></script>'
include="${include//\//\\/}"
sed -i "s#<!-- MINUS_JSLIST -->#$include#g" minus.html

# create distrib/pokki/addon.html from template + copy files
echo "Building distrib/pokki..."
cp distrib/pokki/popup.template.html distrib/pokki/popup.html
sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' distrib/pokki/popup.html
sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' distrib/pokki/popup.html
include='<script type="text/javascript" src="../../minus.js"></script>'
include="${include//\//\\/}"
sed -i "s#<!-- MINUS_JSLIST -->#$include#g" distrib/pokki/popup.html
cp minus.js distrib/pokki/
mkdir -p distrib/pokki/shader
cp shader/*.fs distrib/pokki/shader/
cp shader/*.vs distrib/pokki/shader/

# copy files to progfolio distrib
echo "Building distrib/progfolio..."
cp .htaccess distrib/progfolio/
cp minus.css distrib/progfolio/
cp minus.html distrib/progfolio/
cp minus.ico distrib/progfolio/
cp minus.js distrib/progfolio/
cp -r shader distrib/progfolio/
