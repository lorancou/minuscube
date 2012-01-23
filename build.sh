#!/bin/sh

# build JavaScript dependencies list
for i in $(cat jsdeplist) ; do
    if [[ $i == \#* ]] ; then
        continue
    fi
    include='<script type="text/javascript" src="'$i'"></script>'
    if [ -z "$jsdeplist" ] ; then
        jsdeplist=$include
    else
        jsdeplist=$jsdeplist'\n    '$include # newline + indent
    fi
done
jsdeplist="${jsdeplist//\//\\/}" # http://www.cyberciti.biz/faq/unix-linux-replace-string-words-in-many-files/

# build JavaScript list
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
jslist="${jslist//\//\\/}" # http://www.cyberciti.biz/faq/unix-linux-replace-string-words-in-many-files/

# create minusd.html from template, jsdeplist and jslist
echo "Building minusd.html..."
cp minus.template.html minusd.html
sed -i 's/<!-- MINUS_TITLE -->/Minus Cube Debug/g' minusd.html
sed -i 's/<!-- MINUS_INIT -->/main_init(true);/g' minusd.html
if [ -n "$jsdeplist" ] ; then
    sed -i "s/<!-- MINUS_JSDEPLIST -->/$jsdeplist/g" minusd.html
fi
if [ -n "$jslist" ] ; then
    sed -i "s/<!-- MINUS_JSLIST -->/$jslist/g" minusd.html
fi

# create minus.html from template and jsdeplist
echo "Building minus.html..."
cp minus.template.html minus.html
sed -i 's/<!-- MINUS_TITLE -->/Minus Cube/g' minus.html
sed -i 's/<!-- MINUS_INIT -->/main_init(false);/g' minus.html
if [ -n "$jsdeplist" ] ; then
    sed -i "s/<!-- MINUS_JSDEPLIST -->/$jsdeplist/g" minus.html
fi
include='<script type="text/javascript" src="minus.js"></script>'
include="${include//\//\\/}"
sed -i "s/<!-- MINUS_JSLIST -->/$include/g" minus.html

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
