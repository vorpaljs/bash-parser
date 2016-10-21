for package in `find ./packages/* -maxdepth 0`; do
 cd $package;
 npm run cover-publish;
 cd ../..
done
