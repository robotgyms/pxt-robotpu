.PHONY: target install build check test release tag push-tag clean help

PXT ?= pxt

target:
	$(PXT) target microbit

install: target
	$(PXT) install

build: install
	$(PXT) build

check: build

test: build

release: build
	@test -n "$(VERSION)" || (echo "Usage: make release VERSION=*.*.**" && exit 1)
	python3 -c 'import json; p="pxt.json"; data=json.load(open(p)); data["version"]="$(VERSION)"; open(p,"w").write(json.dumps(data, indent=4) + "\n")'
	git add pxt.json robotpu.ts main.ts Makefile
	git diff --cached --quiet --exit-code || git commit -m "Release $(VERSION)"
	git push
	$(MAKE) push-tag VERSION=$(VERSION)

tag:
	@test -n "$(VERSION)" || (echo "Usage: make tag VERSION=*.*.**" && exit 1)
	git rev-parse "$(VERSION)" >/dev/null 2>&1 || git tag "$(VERSION)"

push-tag: tag
	git push origin "$(VERSION)"

clean:
	rm -rf built

help:
	@echo "Available targets:"
	@echo "  make target - install/init the MakeCode micro:bit target"
	@echo "  make install - install MakeCode package dependencies"
	@echo "  make build  - init target, install dependencies, and compile the MakeCode extension"
	@echo "  make check  - alias for build"
	@echo "  make test   - alias for build"
	@echo "  make release VERSION=1.0.39 - update pxt.json, commit, push, tag, and push tag"
	@echo "  make tag VERSION=1.0.39 - create a local release tag"
	@echo "  make push-tag VERSION=1.0.39 - create and push a release tag"
	@echo "  make clean  - remove local PXT build output"
