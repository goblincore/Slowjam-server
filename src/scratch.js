'use strict';

console.log('No value for FOO yet:', process.env.FOO);

require('dotenv').load();


console.log('Now the value for FOO is:', process.env.FOO);