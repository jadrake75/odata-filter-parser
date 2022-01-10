module.exports = {
    "modulePaths": [
        "<rootDir>/src",
        "<rootDir>/node_modules"
    ],
    "moduleFileExtensions": [
        "js",
        "json"
    ],
    "transform": {
        "^.+\\.(js)$": "babel-jest"
    },
    "testRegex": "\\.spec\\.js$",
    "setupFiles": [
        "<rootDir>/test/jest-pretest.js"
    ],
    "testEnvironment": "node",
    "collectCoverage": true,
    "reporters": [
        "default",
        [
            "jest-junit",
            {
                "outputDirectory": "test/junit",
                "outputName": "TESTS.xml"
            }
        ]
    ],
    "collectCoverageFrom": [
        "src/**/*.js",
        "!**/node_modules/**",
        "!**/test/**"
    ],
    "coverageDirectory": "<rootDir>/coverage",
    "coverageReporters": [
        "json",
        "lcov",
        "html"
    ]
}