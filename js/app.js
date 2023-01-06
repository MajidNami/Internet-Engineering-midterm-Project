// --------- Start Utility Functions ---------
// function for click event of close btn in alert
function close_alert() {
  document.querySelector(".alert").style.display = "none";
  document.querySelector(".alert").innerHTML =
    '<img src="images/Close.png" class="alert-close" alt="Close btn" width="20" onclick="close_alert()">';
}
// function to set and show error on alert section
function set_Error(text) {
  document.querySelector(".alert").innerHTML += text + "<br/>";
  document.querySelector(".alert").style.display = "block";
  document.querySelector("#username").value = "";
  document.querySelector("#username").focus();
  setTimeout(() => {
    close_alert();
  }, 20000);
}

// function that gives data object and set it to user info section
function setValuesToPage(data) {
  document.querySelector(".name-section").innerHTML = data.name;
  document.querySelector(".blog-section").innerHTML = data.blog;
  document.querySelector(".location-section").innerHTML = data.location;
  var bio = data.bio.split("\r\n");
  var skill_list = "";
  bio.map((item) => {
    var li = '<li class="mb-1">' + item + "</li>";
    skill_list += li;
  });
  document.querySelector(".skill-list").innerHTML = skill_list;
  document.querySelector(".avatar").src = data.avatar_url;
}
// function to sort repositories by created date
function sort(data) {
  data = data.filter(i=>i.language!=null);
  data.sort(function(a, b) {
    var keyA = new Date(a.created_at),
      keyB = new Date(b.created_at);
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  data=data.reverse();
  return data;
}
// function to set user programming language on page
function setLanguage(data) {
  data = sort(data);
  // select 5 new repositories
  if (data.length > 5) {
    data = data.slice(0, 5);
  }
  // set repositories data to localStorage
  localStorage.setItem(
    data[0].owner.login + "-" + "repos",
    JSON.stringify(data)
  );

  // select the highest score language
  var repos = -1;
  data.map((item, i) => {
    const last_stars =
      repos == -1 ? data[0].stargazers_count : data[repos].stargazers_count;
    if (item.stargazers_count > last_stars) {
      repos = i;
    }
  });
  // show user favorite language on page
  document.querySelector(".language").innerHTML =
    '<img src="images/developer.png" class="mx-1" alt="language" width="20">' +
    data[repos].language;
  document.querySelector(".language").dataset.score =
    data[repos].stargazers_count;
}
// set all user info section and fetch status section to default
function setDefault() {
  // show user data on page
  document.querySelector(".name-section").innerHTML = "GitHub Username";
  document.querySelector(".blog-section").innerHTML = "GitHub Blog";
  document.querySelector(".location-section").innerHTML = "Location";
  document.querySelector(".skill-list").innerHTML = "Bio";
  document.querySelector(".language").innerHTML = "Language";
  document.querySelector(".avatar").src = "images/no photo.png";
  document.querySelector(".fetch-status").style.display = "none";
  document.querySelector(".fetch-status").innerHTML = "";
}
// --------- End Utility Functions ---------

// --------- Start SubmitHandler Function ---------
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  // get username from form and make it lowercase
  var username = e.target[0].value.toString().toLowerCase();
  if (username.length != 0) {
    // Get User Data from Github API Or localStorage
    if (localStorage.getItem(username) != null) {
      // if search username exists in LocalStorage
      document.querySelector(".fetch-status").style.display = "block";
      document.querySelector(".fetch-status").innerHTML =
        "Fetched From LocalStorage";
      // get user data from localStorage and convert it to object
      var data = JSON.parse(localStorage.getItem(username));
      setValuesToPage(data);
    } else {
      // if search username doesn't exists in LocalStorage and should Fetch from API
      fetch("https://api.github.com/users/" + username)
        .then((response) => response.json())
        .then((data) => {
          if (data.message == undefined || !data.message == "Not Found") {
            //Check if user found
            document.querySelector(".fetch-status").style.display = "block";
            document.querySelector(".fetch-status").innerHTML =
              "Fetched From API";
            // set user data to localStorage
            localStorage.setItem(data.login, JSON.stringify(data));
            setValuesToPage(data);
          } else {
            //if user not found , set error
            set_Error("Not Found : User " + username + " not found");
          }
        })
        .catch((error) => {
          // this section is for connection error and other
          set_Error(
            "Can not Connect to " + "https://api.github.com/users/" + username
          );
          setDefault();
        });
    }
    // Get User Language from Github API

    // set data-score of language element to 0
    // this value use for check the highest score between repositories
    document.querySelector(".language").dataset.score = 0;

    // check if localStorage has repository info of this input user
    if (localStorage.getItem(username + "-" + "repos") != null) {
      // get repositories data from localStorage and convert it to object
      var data = JSON.parse(localStorage.getItem(username + "-" + "repos"));
      // then send data to setLanguage function
      setLanguage(data);
    } else {
      // if localStorage doesn't have repository info of this input user
      // fetch repository data of user
      fetch("https://api.github.com/users/" + username + "/repos")
        .then((response) => response.json())
        .then((data) => {
          // then send data to setLanguage function
          setLanguage(data);
        })
        .catch((error) => {
          // this section is for connection error and other
          set_Error(
            "Can not Connect to " +
              "https://api.github.com/users/" +
              username +
              "/repos"
          );
          setDefault();
        });
    }
  } else {
    //set error if input text was empty
    set_Error("Username is empty or invalid");
    setDefault();
  }
});
// --------- End SubmitHandler Function ---------
