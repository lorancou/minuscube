#!/bin/sh
# Compile all scripts into minus.js
# Should use PHP minify later on for more efficiency
if [ -f minus.js ] ; then
	rm minus.js
fi
for i in $(cat jslist) ; do
	cat $i >> minus.js
	echo -e "\n\n" >> minus.js
done
