# Contact form serverless function

A lambda function setup to send a contact form message to myself from my CV website.

## Commands

To invoke function locally.

```
serverless invoke local --function sendMessage --data '{"body": {"name":"Burt", "email": "burt@mail.com", "message":"I love you!", "token": "test!"}}'
```

Curl command to test that serveless function works

```
curl -X POST -H "Content-Type:application/json" https://5d942gl0d8.execute-api.eu-west-2.amazonaws.com/dev --data '{"body": {"name":"Burt", "email": "burt@mail.com", "message":"I love you!", "token": "test!"}}'
```
