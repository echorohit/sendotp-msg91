/**
 * Created by bll on 16/3/16.
 */
'use strict';
const Hoek = require('hoek');
const Joi = require('joi');
let rp = require('request-promise');

//Declare Internals
const internals = {};


internals.schema =  Joi.object({
    applicationKeyHeader : Joi.string(),
    getGeneratedOTP: Joi.boolean(),
    countryCode: Joi.any().allow('91'),
    getGenerateOTPApi : Joi.object({
        method : Joi.string(),
        url: Joi.string()
    }),
    applicationKey: Joi.string().required(),
    sandbox:Joi.boolean()
});

internals.defaults = {
    countryCode : '91',
    getGeneratedOTP: true,
    getGenerateOTPApi:{
        method : 'POST',
        url: 'https://sendotp.msg91.com/api/generateOTP'
    },
    applicationKey : '',
    sandbox:false
};



internals.otpResponseSchema = {
    success : Joi.object({
        status:Joi.any().allow('success').required(),
        response: Joi.object({
            code : Joi.any().allow('OTP_SENT_SUCCESSFULLY').required(),
            oneTimePassword : Joi.string().length(4).required()
        })
    }),
    error: Joi.object({
        status:Joi.any().allow('error').required(),
        response: Joi.object({
            code : Joi.string().required()
        })
    })

};


exports.Definitions = internals.Definitions = function(options){
    this.settings = Hoek.applyToDefaults(internals.defaults, options || {});
    Joi.assert(this.settings, internals.schema, 'Invalid options');
    this.otpResponse = {};
};


internals.Definitions.prototype.sandboxOtp = function(){
    return Math.floor(Math.random() * 9000) + 1000;
};


internals.Definitions.prototype.getOTP = function(mobile){
    let mobileRegex = /^[789]\d{9}$/;
    Hoek.assert(mobile && typeof mobile ==='string', 'invalid mobile number');
    Hoek.assert(mobileRegex.test(mobile) === true, 'Mobile number should be 10 digit with');
    if(this.settings.sandbox){
        return this.sandboxOtp();
    } else {
        return this.hitOtpAPI(mobile)
            .then((response) => {
                return response
            })
            .catch((error) =>{
                throw  error;
            });
    }
};

internals.Definitions.prototype.parseResponse = function(response){


};

internals.Definitions.prototype.hitOtpAPI = function(mobile){

    let options = {
        method: this.settings.getGenerateOTPApi.method,
        uri: this.settings.getGenerateOTPApi.url,
        body: {
            countryCode:this.settings.countryCode,
            mobileNumber: mobile,
            getGeneratedOTP: this.settings.getGeneratedOTP
        },
        json: true,
        headers: {
            'application-key': this.settings.applicationKey
        }
    };


    return rp(options)
        .then((body) => {
            if(Joi.validate(body), internals.otpResponseSchema.success){
                return body.response.oneTimePassword;
            } else {
                if(Joi.validate(body), internals.otpResponseSchema.error){
                    throw new Error(body.response.code);
                } else {
                    throw new Error('Something went wrong!');
                }
            }
        })
        .catch((error)=> {
            console.log('here i am waiting');
            console.log(JSON.stringify(error));
            throw new Error(error.name + ': ' + error.message);
        })

};
