# Contributing

Thank you for helping improve Zimbabwe Traditional Recipes. Contributions should be respectful, focused, and consistent with the app's goal of making Zimbabwean cooking accessible.

## Before opening a pull request

1. Check existing issues and pull requests for related work.
2. For larger changes, open an issue first to discuss the user need and approach.
3. Create a focused branch from `master` and keep unrelated formatting or generated files out of the change.
4. Run `npm run lint` and `npx tsc --noEmit`. Include or update tests when behavior changes.
5. Update the relevant documentation, localization strings, privacy disclosures, and Supabase migration when the change affects them.

## Pull request details

Use a clear title and describe the user-facing behavior, implementation approach, and any migration or configuration steps. Include emulator screenshots for UI changes when practical. Call out known limitations and data-handling changes. Never include API keys, passwords, service-role tokens, signing files, or personal user data.

## Reporting a bug

Use the bug report form in GitHub Issues. Include reproducible steps, expected and actual behavior, app version, device/OS, and relevant redacted logs. Do not post account credentials, private recipe data, or screenshots containing personal information.

## Code conventions

- Follow the existing TypeScript, React Native, Expo Router, localization, and theme patterns.
- Keep secrets server-side. Values prefixed with `EXPO_PUBLIC_` are bundled into the client and must never contain private credentials.
- Add database changes as ordered, timestamped Supabase migrations. Keep RLS policies explicit and avoid client-trusted writes for scores or protected data.
- Keep user-visible copy clear and localized where the app supports translations.

## Community standards

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Maintainers may close contributions that are unsafe, abusive, unrelated, or inconsistent with the project's privacy and security requirements.

## License

By submitting a contribution, you agree that it may be distributed under the repository's [MIT License](LICENSE), unless the contribution clearly states otherwise and maintainers accept it.
