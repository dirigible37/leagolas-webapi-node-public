# leagolas-webapi-node

Installation:

1. Install nodejs and npm
2. Run "npm install"
3. Run "npm run debug" to build and run it in debug mode

Project Structure:

src/controllers: Where the processing of an endpoint goes. "routes" calls functions here
src/db: Db connection setup using sequelize
src/library: Helpers, enums, etc
src/middleware: Middleware stuff, only rate limiter for now
src/models: Database table models
src/routes: The api endpoint definitions
src/services: Access to external services. So far only riot api
src/utils: Any utilities used (logger, constants, etc)
