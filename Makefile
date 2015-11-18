BIN = ./node_modules/.bin

release-major:
	@$(BIN)/bump --major

release-minor:
	@$(BIN)/bump --minor

release-patch:
	@$(BIN)/bump --patch

publish:
	git push --tags origin HEAD:master
