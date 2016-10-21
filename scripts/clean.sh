for package in `find ./packages/* -maxdepth 0`; do
 cd $package;
 rm -rf node_modules;
 rm -rf .nyc_output;
 cd ../..;
done
rm -rf docs/bundle.js;
