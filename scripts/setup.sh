for package in `find ./packages/* -maxdepth 0`; do
 echo setup $package
 cd $package;
 yarn;
 npm run setup --silent;
 cd ../..;
done
