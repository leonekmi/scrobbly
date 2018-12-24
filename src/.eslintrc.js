/*
    This file is part of Scrobbly.

    Scrobbly is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Scrobbly is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Scrobbly.  If not, see <https://www.gnu.org/licenses/>.
*/

module.exports = {
    "env": {
        "webextensions": true,
        "browser": true,
        "es6": true,
        "commonjs": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-console": [
            "off"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};