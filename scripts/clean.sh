for package in `find ./packages/* -maxdepth 0`; do
 cd $package;
 rm -rf node_modules;
 rm -rf .nyc_output;
 npm run clean --silent || echo clean task not found in $package
 cd ../..;

done
rm -rf docs/bundle.js;
