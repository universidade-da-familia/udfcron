<h1 align="center">
  <img alt="UDF Cron Jobs" title="UDF Cron Jobs" src=".github/logo-big.png" width="200px" />
</h1>

<h3 align="center">
  Middleware de integração da UDF:
  <br>
  Essa é uma aplicação feita em NodeJS com Jobs cronometrados e automatizados para integração entre vários serviços utilizados pela UDF, bem como, Tray, Netsuite, Portal do líder, PayU e Intelipost.
</h3>

<!-- <p align="center">See in action: <a href="#">click here</a></p> -->

<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/universidade-da-familia/udfcron?color=%2304D361">

  <img alt="License" src="https://img.shields.io/badge/license-MIT-%2304D361">

  <a href="https://github.com/lcoalves">
    <img alt="Made by UDF" src="https://img.shields.io/badge/made%20by-UDF-%2304D361">
  </a>

  <a href="https://github.com/universidade-da-familia/udfcron/stargazers">
    <img alt="Stargazers" src="https://img.shields.io/github/stars/universidade-da-familia/udfcron?style=social">
  </a>
</p>

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
- [NodeJS](https://nodejs.org/en/) - Environment runtime
- [Yarn](https://yarnpkg.com/getting-started/install) - Packager manager

What things you need to install the software and how to install them

```
$> git clone https://github.com/lcoalves/udfcron.git
```

### Installing

A step by step series of examples that tell you how to get a development env running

#### Databases
First install back-end dependencies
```
$> cd udfcron && yarn
```
Next open the code
```
$> code .
```

#### Back-end
Start back-end service
```
$> yarn dev:server
```

#### Back-end (Running TESTS)
First run
```
$> yarn test
```

## Built With
* [Typescript](https://www.typescriptlang.org/docs/home.html) - JavaScript that scales.
* [Express](https://expressjs.com/pt-br/starter/installing.html) - Fast, unopinionated, minimalist web framework for Node.js
* [Cron](https://www.npmjs.com/package/cron) - Cron is a tool that allows you to execute something on a schedule.
* [Jest](https://jestjs.io/docs/en/getting-started) - Jest is a delightful JavaScript Testing Framework with a focus on simplicity.

## Authors

* **Lucas Alves** - *Full Stack Developer* - [GitHub profile](https://github.com/lcoalves)
* **Erick Iwamoto** - *Full Stack Developer* - [GitHub profile](https://github.com/erick-iwamoto)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/universidade-da-familia/udfcron/blob/master/LICENSE) file for details

## Acknowledgments

* Express
* Cron Jobs
* Netsuite
* Tray Ecommerce
* Jest
* ESLint
* Prettier
