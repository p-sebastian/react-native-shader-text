# Contributing

Thanks for contributing to React Native Shader Text.

Open an issue before substantial API or rendering changes. Keep the package iOS-only, preserve the public contract, and include observable tests for behavior changes.

Before opening a pull request, run:

```sh
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run codegen:check
bun run build
bun run pack:inspect
```

Pull requests are squash-merged. By contributing, you agree that your work is licensed under the MIT License.
