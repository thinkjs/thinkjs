#!/bin/sh
find project -type d -name ".svn" | xargs rm -rf
zip -r project.zip project/
rm -rf project;
svn up