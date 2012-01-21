#!/bin/sh

# Create minusd.html from template and jslist
echo "Building minusd.html..."
cp minus.template.html minusd.html
sed -i 's/<!-- MINUS_TITLE -->/Minus Cube Debug/g' minusd.html
for i in $(cat jslist) ; do
	include='<script type="text/javascript" src="'$i'"></script>'
	if [ -z "$list" ] ; then
		list=$include
	else
		list=$list'\n    '$include # newline + indent
	fi
done
list="${list//\//\\/}" # http://www.cyberciti.biz/faq/unix-linux-replace-string-words-in-many-files/
sed -i "s/<!-- MINUS_INCLUDES -->/$list/g" minusd.html

# Create minus.html from template
echo "Building minus.html..."
cp minus.template.html minus.html
sed -i 's/<!-- MINUS_TITLE -->/Minus Cube/g' minus.html
include='<script type="text/javascript" src="minus.js"></script>'
include="${include//\//\\/}"
sed -i "s/<!-- MINUS_INCLUDES -->/$include/g" minus.html

# Compile all scripts from jslist into minus.js
# Should use PHP minify later on for more efficiency
echo "Building minus.js..."
if [ -f minus.js ] ; then
	rm minus.js
fi
for i in $(cat jslist) ; do
	cat $i >> minus.js
	echo -e "\n\n" >> minus.js
done
