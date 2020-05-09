//* Firebase *//
// Set the configuration for your app
var config = {
  apiKey: "AIzaSyAm_huj1Z2UQORza1NFAtQjF7yi_lPYBiU",
  authDomain: "twotter-app.firebaseapp.com",
  databaseURL: "https://twotter-app.firebaseio.com",
  projectId: "twotter-app",
  storageBucket: "twotter-app.appspot.com",
  messagingSenderId: "833362549045",
  appId: "1:833362549045:web:867a9b7d2f7d2b4367547c",
  measurementId: "G-EJHW769W4N"
};

// Initialize Firebase
firebase.initializeApp(config);

// Set Database
const db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
          console.log("failed-precondition");
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
          console.log("unimplemented");
      }
  });

var name;


//* Google Auth *//
const auth = firebase.auth();

const signWithGoogle = () =>{
    const googleProvider =  new firebase.auth.GoogleAuthProvider();

    auth.signInWithRedirect(googleProvider)
    .then(()=> {
        console.log('loggeado');
    })
}

const signOutWithGoogle = () =>{
    auth.signOut().then(function() {
        name = '';
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
}

const signWithGoogleButton = document.getElementById('signWithGoogle');
const signOutWithGoogleButton = document.getElementById('signOutGoogle');
signWithGoogleButton.addEventListener('click', signWithGoogle);
signOutWithGoogleButton.addEventListener('click', signOutWithGoogle);


//* Post messages *//
const postScreen = document.getElementById('posted');
const postForm = document.getElementById('postform');
const postInput = document.getElementById('post-input');
const postBtn = document.getElementById('post-btn');
const tweets = document.getElementById('tweet-wrap');

const postRef = db.collection('posts');

postForm.addEventListener("submit", event => {
    event.preventDefault();
    const text = postInput.value;
    name = auth.currentUser.displayName;
    email = auth.currentUser.email;
    userImage = auth.currentUser.photoURL;
    console.log(auth);

    if(!name || name == null){
        return alert('Debes ingresar a tu cuenta');
    } else if (!text.trim()) return alert('Debes escribir algo en el post');

    const post = {
        date: firebase.firestore.FieldValue.serverTimestamp(),
        name: name,
        email: email,
        userImage: userImage,
        text: text
    }

    postRef.add(post)
    .then(function(docRef){
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
    postInput.value = '';
});

const updatePost = data => {
    //if (data.date === null) data.date = 
    const post = `<div class="tweet-header">
                    <img src="${data.userImage}" alt="" class="avator">
                    <div class="tweet-header-info">
                      ${data.name} <span>@${data.email.split("@")[0]}</span><span>${data.date}</span>
                      <p>${data.text}</p>
                    </div>
                  </div>`
    tweets.insertAdjacentHTML("afterBegin", post);
}

db.collection("posts").orderBy('date', 'asc')
.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
            console.log("Added post: ", change.doc.data());
            updatePost(change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified post: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed post: ", change.doc.data());
        }
    });
});
