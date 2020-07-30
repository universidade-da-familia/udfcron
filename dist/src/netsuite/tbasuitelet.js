"use strict";
function main(req, res) {
    var frm = nlapiCreateForm("Generate Token Based Authentication Header for Restlet");
    if (req.method === "GET") {
        generateForm(frm);
    }
    else if (req.method === "POST") {
        var CONSUMER_KEY = req.getParameter('custpage_conskey');
        var CONSUMER_SECRET = req.getParameter('custpage_conssecret');
        var TOKEN_ID = req.getParameter('custpage_tokenid');
        var TOKEN_SECRET = req.getParameter('custpage_tokensecret');
        var SCRIPT_DEPLOYMENT_ID = req.getParameter('custpage_deploymentid');
        var OAUTH_NONCE = getNonce(32);
        var TIME_STAMP = Math.round(+new Date() / 1000);
        var OAUTH_VERSION = '1.0';
        var SCRIPT_ID = req.getParameter('custpage_scriptid');
        var HTTP_METHOD = req.getParameter('custpage_httpmethod').toUpperCase();
        var BASE_URL = req.getParameter('custpage_baseurl');
        var NETSUITE_ACCOUNT_ID = req.getParameter('custpage_accountid');
        nlapiLogExecution('debug', 'CONSUMER_KEY', CONSUMER_KEY);
        nlapiLogExecution('debug', 'CONSUMER_SECRET', CONSUMER_SECRET);
        nlapiLogExecution('debug', 'TOKEN_ID', TOKEN_ID);
        nlapiLogExecution('debug', 'TOKEN_SECRET', TOKEN_SECRET);
        nlapiLogExecution('debug', 'SCRIPT_DEPLOYMENT_ID', SCRIPT_DEPLOYMENT_ID);
        nlapiLogExecution('debug', 'OAUTH_NONCE', OAUTH_NONCE);
        nlapiLogExecution('debug', 'TIME_STAMP', TIME_STAMP);
        nlapiLogExecution('debug', 'OAUTH_VERSION', OAUTH_VERSION);
        nlapiLogExecution('debug', 'SCRIPT_ID', SCRIPT_ID);
        nlapiLogExecution('debug', 'HTTP_METHOD', HTTP_METHOD);
        nlapiLogExecution('debug', 'BASE_URL', BASE_URL);
        nlapiLogExecution('debug', 'NETSUITE_ACCOUNT_ID', NETSUITE_ACCOUNT_ID);
        generateForm(frm);
        var data = '';
        //data = data + 'count=5&';
        data = data + 'deploy=' + SCRIPT_DEPLOYMENT_ID + '&';
        data = data + 'oauth_consumer_key=' + CONSUMER_KEY + '&';
        data = data + 'oauth_nonce=' + OAUTH_NONCE + '&';
        data = data + 'oauth_signature_method=' + 'HMAC-SHA1' + '&';
        data = data + 'oauth_timestamp=' + TIME_STAMP + '&';
        data = data + 'oauth_token=' + TOKEN_ID + '&';
        data = data + 'oauth_version=' + OAUTH_VERSION + '&';
        data = data + 'script=' + SCRIPT_ID;
        var encodedData = encodeURIComponent(data);
        var completeData = HTTP_METHOD + '&' + encodeURIComponent(BASE_URL) + '&' + encodedData;
        var hmacsha1Data = CryptoJS.HmacSHA1(completeData, CONSUMER_SECRET + '&' + TOKEN_SECRET);
        var base64EncodedData = CryptoJS.enc.Base64.stringify(hmacsha1Data);
        var oauth_signature = encodeURIComponent(base64EncodedData);
        var OAuth = 'OAuth oauth_signature="' + oauth_signature + '",';
        OAuth = OAuth + 'oauth_version="1.0",';
        OAuth = OAuth + 'oauth_nonce="' + OAUTH_NONCE + '",';
        OAuth = OAuth + 'oauth_signature_method="HMAC-SHA1",';
        OAuth = OAuth + 'oauth_consumer_key="' + CONSUMER_KEY + '",';
        OAuth = OAuth + 'oauth_token="' + TOKEN_ID + '",';
        OAuth = OAuth + 'oauth_timestamp="' + TIME_STAMP + '",';
        OAuth = OAuth + 'realm="' + NETSUITE_ACCOUNT_ID + '"';
        frm.addField('custpage_oauth', 'textarea', 'OAuth').setDefaultValue(OAuth);
    }
    res.writePage(frm);
}
//Get Unique Value to be pass in header
function getNonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//Adding Objects for Form
function generateForm(frm) {
    frm.addField('custpage_conskey', 'text', 'Consumer Key').setMandatory(true);
    frm.addField('custpage_conssecret', 'text', 'Consumer Secret').setMandatory(true);
    frm.addField('custpage_tokenid', 'text', 'Token Id').setMandatory(true);
    frm.addField('custpage_tokensecret', 'text', 'Token Secret').setMandatory(true);
    frm.addField('custpage_scriptid', 'text', 'Script Id').setMandatory(true);
    frm.addField('custpage_deploymentid', 'text', 'Deployment Id').setMandatory(true);
    frm.addField('custpage_httpmethod', 'text', 'Http Method').setMandatory(true);
    frm.addField('custpage_baseurl', 'text', 'Restlet Base URL').setMandatory(true);
    frm.addField('custpage_accountid', 'text', 'Account ID').setMandatory(true);
    frm.addSubmitButton('Generate');
}
