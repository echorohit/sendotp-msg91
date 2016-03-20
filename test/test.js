/**
 * Created by bll on 20/3/16.
 * complete test code will be written later
'use strict';

let msg91otp = require('../lib/index');

let options = {
    applicationKey:'yourapplication key',
    sandbox : false
};
let otpgen = new msg91otp.Definitions(options);

    otpgen.getOTP('mobile numner').then((code) => {
        console.log(code);
    })
    .catch((error)=>{
        console.log(error);
    })
 */
