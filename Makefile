.PHONY: target install build check test checkpkgcfg checkdocs doclinks release tag push-tag clean help

PXT ?= pxt

target:
	$(PXT) target microbit

install: target
	$(PXT) install

build: install
	$(PXT) build

check: build

test: checkpkgcfg build checkdocs doclinks

checkpkgcfg:
	$(PXT) checkpkgcfg

checkdocs:
	$(PXT) checkdocs

# pxt checkdocs does not scan tutorials/, so verify relative .md links by hand.
doclinks:
	@fail=0; \
	for f in tutorials/*.md README.md; do \
		for link in $$(grep -oE '\]\([^)#[:space:]]+\.md(#[^)]+)?\)' "$$f" | grep -v '://' | sed -E 's/^\]\(|\)$$//g; s/\#.*$$//'); do \
			[ -f "$$(dirname "$$f")/$$link" ] || { echo "$$f: broken link -> $$link"; fail=1; }; \
		done; \
	done; \
	[ $$fail -eq 0 ] && echo "All markdown links OK"; \
	exit $$fail

release: build
	@test -n "$(VERSION)" || (echo "Usage: make release VERSION=v*.*.**" && exit 1)
	python3 -c 'import json; p="pxt.json"; v="$(VERSION)"; v=v[1:] if v.startswith("v") else v; data=json.load(open(p)); data["version"]=v; open(p,"w").write(json.dumps(data, indent=4) + "\n")'
	git add pxt.json robotpu.ts main.ts test.ts Makefile tutorials/
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
	@echo "  make test   - validate pxt.json, compile extension + test.ts, check docs and markdown links"
	@echo "  make release VERSION=v1.0.39 - update pxt.json, commit, push, tag, and push tag"
	@echo "  make tag VERSION=v1.0.39 - create a local release tag"
	@echo "  make push-tag VERSION=v1.0.39 - create and push a release tag"
	@echo "  make clean  - remove local PXT build output"
