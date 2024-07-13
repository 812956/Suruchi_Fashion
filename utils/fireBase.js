  
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
  import { getAuth , GoogleAuthProvider ,signInWithPopup,FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";


  const firebaseConfig = {
      apiKey: "AIzaSyCtv6uIqMYVd_Ucb8S7nH0KOPWi8p16Vso",
      authDomain: "myfashionsuruchi.firebaseapp.com",
      projectId: "myfashionsuruchi",
      storageBucket: "myfashionsuruchi.appspot.com",
      messagingSenderId: "781612978984",
      appId: "1:781612978984:web:359b9e0742e6d3d422f61d",
      measurementId: "G-4NE7CTWQL1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const auth = getAuth(app);
  auth.languageCode = 'en';
  const provider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider()
 

  const googelogin = document.getElementById('google-login-btn')

  googelogin.addEventListener('click',function(){
      signInWithPopup(auth, provider)
      .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;   
          
          fetch('/google_authentication',{
                method:'POST',
                headers:{
                  'Content-Type' : 'application/json'
                },
                body:JSON.stringify({
                  name:user.displayName,
                  email:user.email
                })
          })
          .then(response => response.json())
          .then(data =>{
            if(data.success){
              window.location.href = '/'
            }else{
              Swal.fire({
                title: 'Error!',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            }
          })
          

      }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          
      });
  })


const facebookLogin = document.getElementById('facebook-login-btn')

facebookLogin.addEventListener('click',function(){
  signInWithPopup(auth, facebookProvider)
  .then((result) => {
    
    const user = result.user;
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;

  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;

  });

})