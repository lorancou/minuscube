#!/bin/sh

./clean.sh

# build jsdeplist: JavaScript dependencies list
for i in $(cat jsdeplist) ; do
    if [[ $i == \#* ]] ; then
        continue
    fi
    include='<script type="text/javascript" src="'$i'"></script>'
    includepf="echoFlat('<script type=\"text/javascript\" src=\""$i"\"></script>');"
    if [ -z "$jsdeplist" ] ; then
        jsdeplist=$include
        jsdeplistpf=$includepf
    else
        jsdeplist=$jsdeplist'\n    '$include # newline + indent
        jsdeplistpf=$jsdeplistpf'\n'$includepf
    fi
done
#jsdeplist="${jsdeplist//\//\\/}" # http://www.cyberciti.biz/faq/unix-linux-replace-string-words-in-many-files/
#-> way easier to use another separator, like #: http://forums.devshed.com/unix-help-35/sed-not-escaping-forward-slash-393115.html

# build jslist: JavaScript list
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
if [ -n "$jsdeplist" ] ; then
    sed -i "s#<!-- MINUS_JSDEPLIST -->#$jsdeplist#g" minusd.html
fi
if [ -n "$jslist" ] ; then
    sed -i "s#<!-- MINUS_JSLIST -->#$jslist#g" minusd.html
fi

# create minus.html from template
echo "Building minus.html..."
cp minus.template.html minus.html
sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' minus.html
sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' minus.html
if [ -n "$jsdeplist" ] ; then
    sed -i "s#<!-- MINUS_JSDEPLIST -->#$jsdeplist#g" minus.html
fi
include='<script type="text/javascript" src="minus.js"></script>'
include="${include//\//\\/}"
sed -i "s#<!-- MINUS_JSLIST -->#$include#g" minus.html

# create distrib/pokki/addon.html from template + copy files
echo "Building distrib/pokki..."
cp distrib/pokki/popup.template.html distrib/pokki/popup.html
sed -i 's#<!-- MINUS_TITLE -->#Minus Cube#g' distrib/pokki/popup.html
sed -i 's#<!-- MINUS_INIT -->#main_init(false);#g' distrib/pokki/popup.html
if [ -n "$jsdeplist" ] ; then
    sed -i "s#<!-- MINUS_JSDEPLIST -->#$jsdeplist#g" distrib/pokki/popup.html
fi
include='<script type="text/javascript" src="../../minus.js"></script>'
include="${include//\//\\/}"
sed -i "s#<!-- MINUS_JSLIST -->#$include#g" distrib/pokki/popup.html
cp minus.js distrib/pokki/
mkdir distrib/pokki/shader
cp shader/*.fs distrib/pokki/shader/
cp shader/*.vs distrib/pokki/shader/

# create distrib/progfolio/addon_extra_headers.html from template + copy files
echo "Building distrib/progfolio..."
cp distrib/progfolio/addon_extra_headers.template.php5 distrib/progfolio/addon_extra_headers.php5
if [ -n "$jsdeplistpf" ] ; then
    sed -i "s#/\* MINUS_JSDEPLIST \*/#$jsdeplistpf#g" distrib/progfolio/addon_extra_headers.php5
fi
cp .htaccess distrib/progfolio/
cp minus.css distrib/progfolio/
cp minus.html distrib/progfolio/
cp minus.ico distrib/progfolio/
cp minus.js distrib/progfolio/
cp -r shader distrib/progfolio/
