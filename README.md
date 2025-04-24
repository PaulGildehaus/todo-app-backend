# Getting Started with ExpressJS

This project creates the backend server for a very basic todo-list tracking application. I was tired of the ads all over the regular todo-list trackers I tried, so I decided to make this one.

This app provides a backend server that has CRUD operations on a MongoDB instance, as well as a login service through Google's Oauth2.0. It also includes the logic for passing authentication cookies through Expressjs' `Sessions` across an AWS Loadbalancer and Route53 proxy. This is required for Google's Oauth2.0 to function, as it requires all routes in the data flow to be HTTPS, and by default AWS ElasticBeanstalk does not provide a secure protocol. 
---
It has a couple things that could improve it, but they are on the todo list. One of them being during startup create an `.ebextensions/https.config` file that looks like this:
``` 
option_settings:
  aws:elb:listener:443:
    SSLCertificateId: "YOUR_SSL_ARN_HERE"
    ListenerProtocol: HTTPS
    InstancePort: 80
```
---

## Running the App

The main things needed for running this app would be creating your own `.elasticbeakstalk/config.yml` and `.ebextensions/https.config` files. Getting the project into AWS EB has two options: Zipping or building the project and uploading it manually to an EB instance through the official [Elasticbeanstalk console](https://aws.amazon.com/elasticbeanstalk/). Option 2 is installing the [AWS EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html), then running `eb init`, `eb create`, and `eb deploy`.

Once the EB instance is deployed, the next step is adding the required environmental variables. There are two ways of achieving this: Through the [EB console](https://aws.amazon.com/elasticbeanstalk/) -> Select Environment -> Configuration -> 'Environment Properties' OR you can use the command `eb setenv -e *YOUR_ENV* VAR1="ABC",VAR2="XYZ",etc.. 

**Here is the list of environmental variables this project needs**
- MONGODB_URI (Can be locally hosted or an online Atlas instance)
- PORT (Defaults to 5000)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SESSION_SECRET
- AMPLIFY_URI (Full AWS Amplify URL)
- GOOGLE_CALLBACK_URL (Full AWS Route53 custom DNS for the backend server)
- DOMAIN_NAME (Just the domain name for the backend server 'myapp.com')
- SSL_CERTIFICATE_ID (SSL Cert ARN from AWS ACM)