const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.createPost = functions.firestore.document('posts/{postId}').onCreate((snap, context) => {
  var newValue = snap.data();
  var message = "New Post Added : " + newValue.text;
  pushMessage(message);
  return true;
});

function pushMessage(message) {
  var payload = {
    notification: {
      title: "Nuevo post",
      body: message,
    }
  };

  // Get all devices
  db.collection("user_subscriptions")
    .get()
    .then((snapshot) =>{
        let tokens = [];
        snapshot.forEach(function(doc) {
          if (doc.data().token != null) {
            tokens.push(doc.data().token);
          }
        });
        admin.messaging().sendToDevice(tokens, payload);
        //console.log(response);
    })
    .catch(function(error) {
        console.log("Error obteniendo las subscripciones: ", error);
    });
}
