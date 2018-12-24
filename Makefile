app_name=$(notdir $(CURDIR))
build_tools_directory=$(CURDIR)/build/tools
source_artifact_directory=$(CURDIR)/build/artifacts/source
source_package_name=$(source_build_directory)/$(app_name)
appstore_artifact_directory=$(CURDIR)/build/artifacts/appstore
appstore_package_name=$(appstore_build_directory)/$(app_name)
npm=$(shell which npm 2> /dev/null)
composer=$(shell which composer 2> /dev/null)

gcp=$(shell which gcp 2> /dev/null)

ifeq (, $(gcp))
	copy_command=cp
else
	copy_command=gcp
endif

private_key=$(HOME)/.nextcloud/$(app_name).key
certificate=$(HOME)/.nextcloud/$(app_name).crt
sign_skip_msg="Skipping signing, no key and certificate found in $(private_key) and $(certificate)"
openssl_msg="SHA512 signature for appstore package"
ifneq (,$(wildcard $(private_key)))
ifneq (,$(wildcard $(certificate)))
	CAN_SIGN=true
endif
endif

all: build

# Fetches the PHP and JS dependencies and compiles the JS. If no composer.json
# is present, the composer step is skipped, if no package.json or js/package.json
# is present, the npm step is skipped
.PHONY: build
build:
ifneq (,$(wildcard $(CURDIR)/composer.json))
	make composer
endif
ifneq (,$(wildcard $(CURDIR)/package.json))
	make npm
endif
ifneq (,$(wildcard $(CURDIR)/js/package.json))
	make npm
endif

# Installs and updates the composer dependencies. If composer is not installed
# a copy is fetched from the web
.PHONY: composer
composer:
ifeq (, $(composer))
	@echo "No composer command available, downloading a copy from the web"
	mkdir -p $(build_tools_directory)
	curl -sS https://getcomposer.org/installer | php
	mv composer.phar $(build_tools_directory)
	php $(build_tools_directory)/composer.phar install --prefer-dist
	php $(build_tools_directory)/composer.phar update --prefer-dist
else
	composer install --prefer-dist
	composer update --prefer-dist
endif

# Installs npm dependencies
.PHONY: npm
npm:
ifeq (,$(wildcard $(CURDIR)/package.json))
	cd js && $(npm) run build
else
	npm run build
endif

# Removes the appstore build
.PHONY: clean
clean:
	rm -rf ./build

# Same as clean but also removes dependencies installed by composer, bower and
# npm
.PHONY: distclean
distclean: clean
	rm -rf vendor
	rm -rf node_modules
	rm -rf js/vendor
	rm -rf js/node_modules

# Builds the source and appstore package
.PHONY: dist
dist:
	make source
	make appstore

# Builds the source package for development
.PHONY: source
source:
	rm -rf $(source_artifact_directory)
	mkdir -p $(source_artifact_directory)/$(app_name)
	$(copy_command) -r \
		"appinfo" \
		"css" \
		"img" \
		"lib" \
		"LICENSE" \
	$(source_artifact_directory)/$(app_name)
	mkdir -p $(source_artifact_directory)/$(app_name)/js
	$(copy_command) -r \
        "js/dist/." \
    $(source_artifact_directory)/$(app_name)/js
	tar -czf $(source_artifact_directory)/$(app_name).tar.gz -C $(source_artifact_directory) --exclude='.gitignore' $(app_name)

# Builds the source package for the app store
.PHONY: appstore
appstore:
	rm -rf $(appstore_artifact_directory)/$(app_name)
	mkdir -p $(appstore_artifact_directory)/$(app_name)
	$(copy_command) -r \
		"appinfo" \
		"css" \
		"img" \
		"lib" \
		"LICENSE" \
	$(appstore_artifact_directory)/$(app_name)
	mkdir -p $(appstore_artifact_directory)/$(app_name)/js
	$(copy_command) -r \
        "js/dist/." \
    $(appstore_artifact_directory)/$(app_name)/js
	tar -czf $(appstore_artifact_directory)/$(app_name).tar.gz -C $(appstore_artifact_directory) --exclude='.gitignore' $(app_name)
ifdef CAN_SIGN
		@echo $(openssl_msg)
		openssl dgst -sha512 -sign $(private_key) $(appstore_artifact_directory)/$(app_name).tar.gz | openssl base64
else
		@echo $(sign_skip_msg)
endif

.PHONY: test
test: composer
	$(CURDIR)/vendor/phpunit/phpunit/phpunit -c phpunit.xml
	$(CURDIR)/vendor/phpunit/phpunit/phpunit -c phpunit.integration.xml
