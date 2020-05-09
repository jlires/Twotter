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


//
const nameForm = document.getElementById('nameform')
const nameInput = document.getElementById('name-input')
const nameBtn = document.getElementById('name-btn')

//
const postScreen = document.getElementById('posted');
const postForm = document.getElementById('postform');
const postInput = document.getElementById('post-input');
const postBtn = document.getElementById('post-btn');
const db = firebase.database();
const postRef = db.ref('/posts');
const id = uuidv4();
var name;
const auth = firebase.auth();
const signWithGoogleButton = document.getElementById('signWithGoogle');
const signOutWithGoogleButton = document.getElementById('signOutGoogle');
const tweets = document.getElementById('tweet-wrap');
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

postForm.addEventListener("submit", event => {
    event.preventDefault();
    const text = postInput.value;
    name = auth.currentUser.displayName;
    console.log(auth.currentUser);
    if(!name || name == null){
        return alert('Debes ingresar a tu cuenta');
    } else if (!text.trim()) return alert('Debes escribir algo en el post');
    const post = {
        id: id ,
        name: name,
        text: text
    }
    postRef.push(post);
    postInput.value = '';
});

const updatePost = data => {
    const { id, name, text } = data.val();
    console.log(id,name,text);
   /*  const post = `<li class="post">
    <span>
      <i class="name">${name}</i> ${text}
    </span>
  </li>` */

  const post = `<div class="tweet-header">
  <img src="https://pbs.twimg.com/profile_images/1012717264108318722/9lP-d2yM_400x400.jpg" alt="" class="avator">
  <div class="tweet-header-info">
    Steve Schoger <span>${name}</span><span>. Jun 27
</span>
    <p>${text}</p>

  </div>`
  tweets.innerHTML += post;
};
postRef.on("child_added", updatePost);
signWithGoogleButton.addEventListener('click', signWithGoogle);
signOutWithGoogleButton.addEventListener('click', signOutWithGoogle);


/* nameForm.addEventListener("submit", e => {
    e.preventDefault();
    if(nameInput.value.trim().length <= 3)
        return alert("El nombre necesita mínimo 4 caracteres");
    nameForm.style.display = "none";
    postInput.removeAttribute("disabled");
    postBtn.removeAttribute("disabled");
     postRef.on("child_added", updatePost);
    return (name = nameInput.value)
}) */
