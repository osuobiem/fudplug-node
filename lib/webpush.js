const webPush = require('web-push');

class WebPush { 
    
    constructor() {
        // Check for VAPID keys and generate if they've not been set yet
        if(!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            console.log("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
              "environment variables not found. Set them with these:");

            console.log(webPush.generateVAPIDKeys());
            return;
        }

        // Set the keys used for encrypting the push messages.
        webPush.setVapidDetails(
            process.env.MAIN_SERVER,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    }

    send(subscription, payload, options, res) {
        webPush.sendNotification(subscription, payload, options)
        .then(() => {
            res.sendStatus(201)
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(500)
        })
    }

}

module.exports = WebPush;