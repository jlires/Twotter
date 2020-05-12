const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.createPost = functions.firestore.document('posts/{postId}').onCreate((snap, context) => {
  var newValue = snap.data();
  var message = "New Post Added : " + newValue.text;
  pushMessage(message);
  return true;
});


// Function to push notification to a topic.
function pushMessage(message) {
  var payload = {
    notification: {
      title: message,
    }
  };

  admin.messaging().sendToTopic("notifications", payload)
  .then(function(response) {
    console.log("Successfully sent message:", response);
  })
  .catch(function(error) {
    console.log("Error sending message:", error);
  });
}

exports.addUserToTopic = functions.auth.user().onCreate((user) => {
  console.log(user);
});
