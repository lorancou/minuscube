#!/bin/sh

echo "Cleaning temporary files..."
rm -rf .gitignore~
rm -rf *~
rm -rf js/*~
rm -rf js/#*#
rm -rf jsdep/*.js
rm -rf build/
