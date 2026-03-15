VSIX := packages/client/digdag-lsp-0.1.0.vsix

.PHONY: install build package install-ext

install:
	pnpm install

build: install
	pnpm build

package: build
	cd packages/client && pnpm vsce package --no-dependencies

install-ext: package
	code --install-extension $(VSIX) --force
	@echo "Extension installed. Reload VS Code to activate."
