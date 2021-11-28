# Makefile for building the project

app_name=dicomviewer
project_dir=$(CURDIR)
src_js_dir=$(CURDIR)/src
build_dir=$(project_dir)/build
appstore_build_dir=/tmp/dicomviewer/build
appstore_sign_dir=/tmp/dicomviewer/sign
cert_dir=$(HOME)/.nextcloud/certificates
webpack=node_modules/.bin/webpack

jssources=$(wildcard js/*) $(wildcard js/*/*) $(wildcard css/*/*) $(wildcard css/*)
othersources=$(wildcard appinfo/*) $(wildcard css/*/*) $(wildcard controller/*/*) $(wildcard templates/*/*) $(wildcard log/*/*)

all: build

clean:
	rm -rf $(build_dir)
	rm -rf vendor
	rm -rf node_modules
	rm -rf js/vendor
	rm -rf js/node_modules

build: $(jssources)
	cd $(src_js_dir) && yarn install
	cd $(src_js_dir) && yarn lint
	cd $(src_js_dir) && yarn build

appstore: clean build package

package: build $(othersources)
	rm -rf $(appstore_build_dir)
	mkdir -p $(appstore_build_dir)
	rm -rf $(appstore_sign_dir)
	mkdir -p $(appstore_sign_dir)
	rsync -a \
	--exclude=.git \
	--exclude=.idea \
	--exclude=.github \
	--exclude=.tx \
	--exclude=src \
	--exclude=screenshots \
	--exclude=tests \
	--exclude=.gitignore \
	--exclude=.l10nignore \
	--exclude=.travis.yml \
	--exclude=Makefile \
	--exclude=composer.* \
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
