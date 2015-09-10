# Base Project

This is as template project for a REST API, Node.js/Express.js/MongoDB based application server..

## Features

Among the features it provides out of the box are:

- User creation
- User authentication using local strategy
- User authentication using facebook
- User roles (regular user and admin), with proper authentication
- CRUD operations over User (some are only available to admins)
- Listing Users (with pagination)
- Field selection in API (allow selecting which fields should be returned at each request)
- User account activation (email sent after user creation)
- Password recovery email
- User's action logging
- Basic request/response logging

## Configuration

Some configuration is needed to actually use this project:

- Review app configuration, found in config/environment
- Define an app secret (also in config/environment)
- Review/define email sending configurations (in config/activatorConfig)
- Review email templates (in resources/emailTemplates)
- Create a reasonable password recovery page (the one in config/resources/templates/emailRecovery.ejs if for POC only)
- Define env variable MAILGUN_APIKEY to hold the apy key to mailgun account

## TODO
- Some refactoring in code may be necessary, to avoid code duplication and to simplify somethings a bit.

## Contributing

Feel free to fork and mess with this code. But, before opening PRs, be sure that you adhere to the Code Style and Conventions
(run `grunt lint`) and add/modify as many tests as needed to ensure your code is working as expected.

## License

The MIT License (MIT)

[![Fiddus Tecnologia](http://fiddus.com.br/assets/img/logo-site.png)](http://fiddus.com.br)

Copyright (c) 2015 Vinicius Teixeira vinicius0026@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
