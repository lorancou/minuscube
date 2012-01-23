#!/bin/sh

echo "Cleaning temporary files..."
rm -rf .gitignore~
rm -rf *~
rm -rf js/*~
rm -rf js/#*#

echo "Cleaning distrib/pokki..."
rm -f distrib/pokki/minus.js
rm -rf distrib/pokki/shader

echo "Cleaning distrib/progfolio..."
rm -f distrib/progfolio/.htaccess
rm -f distrib/progfolio/minus.css
rm -f distrib/progfolio/minus.html
rm -f distrib/progfolio/minus.ico
rm -f distrib/progfolio/minus.js
rm -rf distrib/progfolio/shader
