# Changelog

## [Unreleased]

### Added
- Multi-role support: Users can now have multiple roles simultaneously
- Migration script to update existing users to use the roles array
- Documentation for multi-role support implementation

### Changed
- Updated authentication system to use roles array instead of role property
- Modified API routes to handle multiple roles
- Updated permission utilities to check for roles in the roles array
- Updated UI components to display all user roles

### Removed
- Dependency on single role property throughout the application

## [0.1.0] - 2023-06-01

### Added
- Initial release 