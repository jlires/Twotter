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

const signWithGoogleButton = document.getElementById('signWithGoogle');
const signOutWithGoogleButton = document.getElementById('signOutGoogle');
signWithGoogleButton.addEventListener('click', signWithGoogle);
signOutWithGoogleButton.addEventListener('click', signOutWithGoogle);


//* Post messages *//
const postForm = document.getElementById('postform');
const postInput = document.getElementById('post-input');
const postBtn = document.getElementById('post-btn');
const publishBtn = document.getElementById('botonF1');
const exitBtn = document.getElementById('botonF2');
const formPublish = document.getElementById('formpost');
const tweets = document.getElementById('all');
const uploadImage = document.getElementById('cover');
const storage = firebase.storage();
const storageRef = storage.ref();

const processPublish = () =>{
    console.log('me hiciste click');
    publishBtn.style.display = 'none';
    formPublish.style.display = 'block';
};

const closePublish = () =>{
    console.log('Me cerraste man');
    publishBtn.style.display = 'block';
    formPublish.style.display = 'none';
    postInput.value = '';
    uploadImage.value = '';
};

publishBtn.addEventListener('click', processPublish);
exitBtn.addEventListener('click', closePublish);

const verification = () => {
    console.log("Entramos a VERIFICATION");
    if (auth.currentUser === null) {
        console.log('No hay currentUser');
        publishBtn.style.display = 'none';
        signOutWithGoogleButton.style.display = 'none';
    }
    else {
        console.log("currentUser: ", auth.currentUser.displayName);
        publishBtn.style.display = 'block';
        signOutWithGoogleButton.style.display = 'block';
    }
};



const postRef = db.collection('posts');

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


    if(!name || name == null){
        return alert('Debes ingresar a tu cuenta');
    } else if (!text.trim()) return alert('Debes escribir algo en el post');

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
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
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
                console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
            
            postInput.value = '';
            uploadImage.value = '';
}
    publishBtn.style.display = 'block';
    formPublish.style.display = 'none';
});


/* 
const getPosts = async() =>{
    let postArray = [];
    let docs = await postRef.get().catch(err => console.log(err));
    docs.forEach(doc => {
        postArray.push({"id": doc.id, "data": doc.data()});
    });

    createChildren(postArray);
}; */
/* 
https://www.youtube.com/watch?v=ppajI8xR__k&list=PLolX_BtuGc9RztjopfFSO_xLFsdGg9nBC&index=9 */
const createChildren = (data) => {
    if (tweets != null) {
            if (data.uploadImage == undefined ){
                const posted = `
                
                <div id="tweet-wrap">
                <div class="tweet-header">
                    <img src="${data.userImage}" alt="" class="avator">
                    <div class="tweet-header-info">
                      ${data.name} <span>@${data.email.split("@")[0]}</span><span>${data.date}</span>
                      <p>${data.text}</p>
                    </div>
                    </div>
                  </div>`
                tweets.insertAdjacentHTML("afterBegin", posted);
            }
            else{
                const posted = `
                <div id="tweet-wrap">
                <div class="tweet-header">
                    <img src="${data.userImage}" alt="" class="avator">
                    <div class="tweet-header-info">
                      ${data.name} <span>@${data.email.split("@")[0]}</span><span>${data.date}</span>
                      <p>${data.text}</p>
                      <img src="${data.uploadImage}" style="width: 300px; height: 300px;"/>
                    </div>
                    </div>
                  </div>`
                tweets.insertAdjacentHTML("afterBegin", posted);

            }
        };
};



/* const updatePost = data => {
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
 */

auth.onAuthStateChanged((user) => {
    console.log("-- Auth state changed ...");
    verification();
    if (user) {
      // User signed in, you can get redirect result here if needed.
      // ...
      console.log("-- Estamos loggeados!");
      // ....
    } else {
      console.log("-- No hay nadie loggeado!");
    }
  });

db.collection("posts").orderBy('date', 'asc')
.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
            console.log("Added post: ", change.doc.data());
            createChildren(change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified post: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed post: ", change.doc.data());
        }
    });
});