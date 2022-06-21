function toggleNav() {
  var x = document.getElementById("hamitems");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

document.querySelector("#hamnav a").onclick = toggleNav;

/* The search code */

var defaultText = "Search...";
var searchBox = document.getElementById("search"); //default text after load
searchBox.value = defaultText;

//on focus behaviour
searchBox.onfocus = function () {
  if (this.value == defaultText) {
    //clear text field
    this.value = "";
  }
};

//on blur behaviour
searchBox.onblur = function () {
  if (this.value == "") {
    //restore default text
    this.value = defaultText;
  }
};

// Prismic
import * as prismic from "https://cdn.skypack.dev/@prismicio/client";
import * as prismicH from "https://cdn.skypack.dev/@prismicio/helpers";

const repoName = "ethel-trust";

const routes = [
  {
    type: "post",
    path: "/post/:uid",
  },
  {
    type: "page",
    path: "/:uid",
  },
];

const endpoint = prismic.getEndpoint(repoName);
const client = prismic.createClient(endpoint, { routes });

const doSearch = async (search) => {
  var main = document.getElementById("searchresults");
  main.innerText = "";
  const ret = await getSearch(search);

  var ul = document.createElement("ul");
  ul.class = "searchresults";

  ret.forEach((doc) => {
    var a = document.createElement("a");
    a.href = doc.url;
    a.innerText = prismicH.asText(doc.data.title);
    main.appendChild(a);
  });
};

const getSearch = async (search) => {
  if(search.length <2){
    return []
  }
  var pred = prismic.predicate.fulltext("document", search);
  const ret = await client.query(pred);
  return ret.results;
};

searchBox.onkeyup = function () {
  var q = this.value;
  console.log("Handler for keyup called. " + q);
  doSearch(q);
};
