////////////////////////////////////////////////////////////////////////////////
//*                             DOM elements                                 *//
////////////////////////////////////////////////////////////////////////////////
const signWithGoogleButton = document.getElementById('signWithGoogle');
const signOutWithGoogleButton = document.getElementById('signOutGoogle');
const goToProfileButton = document.getElementById('goToProfile');
const backToFeedButton = document.getElementById('backToFeed');
const postForm = document.getElementById('postform');
const postInput = document.getElementById('post-input');
const postBtn = document.getElementById('post-btn');
const publishBtn = document.getElementById('botonF1');
const exitBtn = document.getElementById('botonF2');
const formPublish = document.getElementById('formpost');
const tweets = document.getElementById('all');
const uploadImage = document.getElementById('cover');
const profileDiv = document.getElementById('profile');
const subCheckbox = document.getElementById("subscribeButton");
const subSwitch = document.getElementById("notificationsBar");


////////////////////////////////////////////////////////////////////////////////
//*                             Page interactions                            *//
////////////////////////////////////////////////////////////////////////////////

const processPublish = () =>{
    if( backToFeedButton.style.display == 'block'){
        publishBtn.style.display = 'none';
        formPublish.style.display = 'block';
        tweets.style.display = 'none';
        profileDiv.style.display = 'none';
        backToFeedButton.disabled = true;
        signOutWithGoogleButton.style.display = 'none';
        subSwitch.style.display = 'none';
    } else {
        publishBtn.style.display = 'none';
        formPublish.style.display = 'block';
        tweets.style.display = 'none';
        goToProfileButton.disabled = true;
        signOutWithGoogleButton.style.display = 'none';
        subSwitch.style.display = 'none';
}
};

const closePublish = () =>{
    if( goToProfileButton.style.display == 'block'){
        publishBtn.style.display = 'block';
        formPublish.style.display = 'none';
        tweets.style.display = 'block';
        signOutWithGoogleButton.style.display = 'block';
        subSwitch.style.display = 'block';
        goToProfileButton.disabled = false;
        postInput.value = '';
        uploadImage.value = '';
    } else{
        publishBtn.style.display = 'block';
        formPublish.style.display = 'none';
        profileDiv.style.display = 'block';
        signOutWithGoogleButton.style.display = 'block';
        subSwitch.style.display = 'block';
        backToFeedButton.disabled = false;
        postInput.value = '';
        uploadImage.value = '';
    }
};

publishBtn.addEventListener('click', processPublish);
exitBtn.addEventListener('click', closePublish);

const goToProfile = () => {
    profileDiv.style.display = 'block';
    tweets.style.display = 'none';
    goToProfileButton.style.display = 'none';
    backToFeedButton.style.display = 'block';
}

const backToFeed = () => {
    profileDiv.style.display = 'none';
    tweets.style.display = 'block';
    goToProfileButton.style.display = 'block';
    backToFeedButton.style.display = 'none';
}

goToProfileButton.addEventListener('click', goToProfile);
backToFeedButton.addEventListener('click', backToFeed);

////////////////////////////////////////////////////////////////////////////////
//*                             Firebase                                     *//
////////////////////////////////////////////////////////////////////////////////
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

var name;

////////////////////////////////////////////////////////////////////////////////
//*                 Firebase Authentication with Google                      *//
////////////////////////////////////////////////////////////////////////////////
const auth = firebase.auth();

const signWithGoogle = () =>{
    const googleProvider =  new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(googleProvider)
    .then(function() {
        console.log("- - - Loggeado - - - - ");
    })
    .catch(function(e) {
        console.log(e);
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

signWithGoogleButton.addEventListener('click', signWithGoogle);
signOutWithGoogleButton.addEventListener('click', signOutWithGoogle);

const verification = () => {
    console.log("Verificando usuario");
    if (auth.currentUser === null) {
        console.log('No hay usuario actualmente');
        publishBtn.style.display = 'none';
        signOutWithGoogleButton.style.display = 'none';
        subSwitch.style.display = 'none';
        goToProfileButton.style.display = 'none';
        profileDiv.style.display = 'none';
        tweets.style.display = 'block';
        backToFeedButton.style.display = 'none';
        signWithGoogleButton.style.display = 'block';
    }
    else {
        console.log("Usuario actual: ", auth.currentUser.displayName);
        signWithGoogleButton.style.display = 'none';
        publishBtn.style.display = 'block';
        signOutWithGoogleButton.style.display = 'block';
        subSwitch.style.display = 'block';
        goToProfileButton.style.display = 'block';
    }
};

auth.onAuthStateChanged((user) => {
    console.log("-- Auth state changed ...");
    verification();
    if (user) {
      console.log("Usuario  Loggeado!");
    } else {
      console.log("No hay nadie loggeado!");
    }
});

////////////////////////////////////////////////////////////////////////////////
//*                    Firebase Firestore configuration                      *//
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
//*                             Post Form                                    *//
////////////////////////////////////////////////////////////////////////////////

const storage = firebase.storage();
const storageRef = storage.ref();
const postRef = db.collection('posts');


//* Image manipulation (Upload)
uploadImage.addEventListener('change', function(e) {
    var label	 = uploadImage.nextElementSibling,
  	labelVal = label.querySelector('span').textContent;

  	var fileName = '';
  	if(this.files && this.files.length > 1) {
      fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    } else fileName = e.target.value.split("\\").pop();

  	if(fileName) label.querySelector('span').textContent = fileName;
  	else label.querySelector('span').textContent = labelVal;
});

postForm.addEventListener("submit", async(event) => {
    event.preventDefault();
    const text = postInput.value;
    name = auth.currentUser.displayName;
    email = auth.currentUser.email;
    userImage = auth.currentUser.photoURL;
    upImage= uploadImage.files[0];
    console.log(upImage);
    console.log(auth);
    console.log(firebase.firestore.FieldValue.serverTimestamp());


    if(!name || name == null) {
        return alert('Debes ingresar a tu cuenta');
    } else if (!text.trim()) {
      return alert('Debes escribir algo en el post');
    }

    if (upImage == undefined) {
        const post = {
            date: firebase.firestore.FieldValue.serverTimestamp(),
            name: name,
            email: email,
            userImage: userImage,
            text: text
        }

        postRef.add(post)
        .then(function(docRef){
            console.log("Post nuevo con ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error creando el post: ", error);
        });
        postInput.value = '';

    } else {
      /*  https://www.youtube.com/watch?v=ppajI8xR__k&list=PLolX_BtuGc9RztjopfFSO_xLFsdGg9nBC&index=9 */
      const storageChild = storageRef.child(upImage.name);
      const postImage = storageChild.put(upImage);

      await new Promise((resolve) => {
          postImage.on("state_changed", (snapshot) => {

          }, (error) => {
              console.log(error);
          }, async() => {
              const downloadURL =  await storageChild.getDownloadURL();
              downloadFile = downloadURL;
              console.log(downloadFile);
              resolve();
          });
      });

      const fileRef = await firebase.storage().refFromURL(downloadFile);


      const post = {
          date: firebase.firestore.FieldValue.serverTimestamp(),
          name: name,
          email: email,
          userImage: userImage,
          text: text,
          uploadImage: downloadFile,
          fileref: fileRef.location.path
      }

      await postRef.add(post)
      .then(function(docRef){
          console.log("Post nuevo con ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error creando el post: ", error);
      });

      postInput.value = '';
      uploadImage.value = '';
    }

    if(goToProfileButton.style.display == 'block'){
        tweets.style.display = 'block';
        goToProfileButton.disabled = false;
    } else if (backToFeedButton.style.display == 'block') {
        profileDiv.style.display = 'block';
        backToFeedButton.disabled = false;
    }
    signOutWithGoogleButton.style.display = 'block';
    subSwitch.style.display = 'block';
    publishBtn.style.display = 'block';
    formPublish.style.display = 'none';
});

/* https://www.youtube.com/watch?v=ppajI8xR__k&list=PLolX_BtuGc9RztjopfFSO_xLFsdGg9nBC&index=9 */
const createChildren = (data) => {
    if (tweets != null) {
        let date = data.date.toDate();
        let minute = date.getMinutes();
        let hour = `${date.getHours()}`.padStart(2, '0');
        let day = `${date.getDate()}`.padStart(2, '0');
        let month = `${date.getMonth()}`.padStart(2, '0');
        let formattedDate = `${day}/${month} at ${hour}:${minute}`;
        let name = `${data.name.split(' ')[0]} ${data.name.split(' ')[1]}`
        if (data.uploadImage == undefined ) {
            const posted = `

            <div class="tweet-wrap">
            <div class="tweet-header">
                <img src="${data.userImage}" alt="" class="avator">
                <div class="tweet-header-info">
                  ${name} <span>@${data.email.split("@")[0]}</span><span>${formattedDate}</span>
                  <p>${data.text}</p>
                </div>
                </div>
              </div>`
            tweets.insertAdjacentHTML("afterBegin", posted);
            if ( auth.currentUser != null && data.email == auth.currentUser.email){
                profileDiv.insertAdjacentHTML("afterBegin", posted);
            }

        }
        else {
            const posted = `
            <div class="tweet-wrap">
            <div class="tweet-header">
                <img src="${data.userImage}" alt="" class="avator">
                <div class="tweet-header-info">
                  ${name} <span>@${data.email.split("@")[0]}</span><span>${formattedDate}</span>
                  <p>${data.text}</p>
                  </br>
                  <img src="${data.uploadImage}" style="width: 300px; height: 300px;"/>
                </div>
                </div>
              </div>`
            tweets.insertAdjacentHTML("afterBegin", posted);
            if ( auth.currentUser != null && data.email == auth.currentUser.email){
                profileDiv.insertAdjacentHTML("afterBegin", posted);
            }
        }
    };
};


db.collection("posts").orderBy('date', 'asc')
.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
            console.log("Added post: ", change.doc.data());
            createChildren(change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified post: ", change.doc.data());
            createChildren(change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed post: ", change.doc.data());
        }
    });
});


//* Push notifications *//
let userToken = null;

const messaging = firebase.messaging();

messaging.requestPermission().then(() => {
  return messaging.getToken();
}).then((token) => {
  userToken = token;
  console.log("Token:", token);
  //* Set current subscription status
  db.collection("user_subscriptions").where("token", "==", token)
    .get()
    .then((snapshot) =>{
        const subCheckbox = document.getElementById("subscribeButton");
        if (snapshot.docs.length > 0) {
          subCheckbox.checked = true;
        } else {
          subCheckbox.checked = false;
        }
    })
    .catch(function(error) {
        console.log("Error obteniendo las subscripciones: ", error);
    });
}).catch((err) => {
  console.log("Permission denied", err);
});

messaging.onMessage((payload) => {
  //...
  console.log(payload);
});


//* Subscribe/Unsubscribe
subCheckbox.addEventListener("change", async(event) => {
  event.preventDefault();
  const subCheckbox = document.getElementById("subscribeButton");
  if (subCheckbox.checked == true){
    // Subscribe
    db.collection("user_subscriptions").add({
        user: auth.currentUser.email,
        token: userToken
    })
  } else {
    // Unsubscribe
    db.collection("user_subscriptions").where("token", "==", userToken)
      .get()
      .then((snapshot) =>{
          snapshot.forEach(function(doc) {
              firebase.firestore().batch().delete(doc.ref);
          });
      })
      .catch(function(error) {
          console.log("Error obteniendo las subscripciones: ", error);
      });
  }

});


const cancelinstallation = document.getElementById('Cancel');

const closeInstallation = () =>{
    const formInstall = document.getElementById('installform');
    formInstall.style.display = 'none';
};


cancelinstallation.addEventListener('click', closeInstallation);

window.addEventListener('appinstalled', (evt) => {
  console.log('a2hs installed');
  const formInstall = document.getElementById('installform');
    formInstall.style.display = 'none';

});

window.addEventListener('load', () => {
  if (navigator.standalone) {
    console.log('Launched: Installed (iOS)');
  } else if (matchMedia('(display-mode: standalone)').matches) {
    console.log('Launched: Installed');
  } else {
    console.log('Launched: Browser Tab');
  }
});

window.onload = (e) => { 
    // Declare init HTML elements
    const formInstall = document.getElementById('installform');
    formInstall.style.display = 'none';
    const buttonAdd = document.querySelector('#buttonAdd');

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      formInstall.style.display = 'block';
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
    });

    // Add event click function for Add button
    buttonAdd.addEventListener('click', (e) => {
        const formInstall = document.getElementById('installform');
        formInstall.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
    });
  } 