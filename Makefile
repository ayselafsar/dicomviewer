# Makefile for building the project

app_name=dicomviewer
appstore_build_dir=/tmp/build
appstore_sign_dir=/tmp/sign
cert_dir=$(HOME)/.nextcloud/certificates

build:
	npm install
	npm run build

appstore: build
	rm -rf $(appstore_build_dir)
	mkdir -p $(appstore_build_dir)
	rm -rf $(appstore_sign_dir)
	mkdir -p $(appstore_sign_dir)
	rsync -a \
	--exclude=.git \
	--exclude=.idea \
	--exclude=.github \
	--exclude=.tx \
	--exclude=acanio-viewer \
	--exclude=node_modules \
	--exclude=src \
	--exclude=screenshots \
	--exclude=tests \
	--exclude=.eslintignore \
	--exclude=.eslintrc.js \
	--exclude=.gitignore \
	--exclude=.gitmodules \
	--exclude=.l10nignore \
	--exclude=.php-cs-fixer.dist.php \
	--exclude=.scrutinizer.yml \
	--exclude=.travis.yml \
	--exclude=babel.config.js \
	--exclude=composer.* \
	--exclude=Makefile \
	--exclude=stylelint.config.js \
	--exclude=webpack.config.js \
	../$(app_name) $(appstore_sign_dir)
	@if [ -f $(cert_dir)/$(app_name).key ]; then \
		sudo chown $(webserveruser) $(appstore_sign_dir)/$(app_name)/appinfo ;\
		sudo -u $(webserveruser) php $(occ_dir)/occ integrity:sign-app --privateKey=$(cert_dir)/$(app_name).key --certificate=$(cert_dir)/$(app_name).crt --path=$(appstore_sign_dir)/$(app_name)/ ;\
		sudo chown -R $(USER) $(appstore_sign_dir)/$(app_name)/appinfo ;\
	else \
		echo "!!! WARNING signature key not found" ;\
	fi
	tar -czf $(appstore_build_dir)/$(app_name)-$(version).tar.gz -C $(appstore_sign_dir) $(app_name)
	@if [ -f $(cert_dir)/$(app_name).key ]; then \
		openssl dgst -sha512 -sign $(cert_dir)/$(app_name).key $(appstore_build_dir)/$(app_name)-$(version).tar.gz | openssl base64 | tee $(appstore_sign_dir)/sign.txt ;\
	fi
