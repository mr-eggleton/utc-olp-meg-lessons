// lesson.js - lesson route module.
import express from "express";
import MarkdownIt from "markdown-it";
import namedheadings from "markdown-it-id-and-toc"; //markdown-it-named-headings"
import hljs from "highlight.js";
import fs from "fs";

var router = express.Router();

var aLessons = [];
const addLessons = async (app) => {
  await fs.readdir("./lessons", (err, files) => {
    aLessons = files
      .filter((file) => {
        const array = [...file.matchAll(/([0-9]+)/gi)];
        return array.length > 0;
      })
      .map((file) => {
        const array = [...file.matchAll(/([0-9]+)/gi)];
        return parseInt(array[0][1]);
      })
      .sort(function (a, b) {
        return a - b;
      });
  });
};
addLessons();

router.get("/:id", async (req, res) => {
  var content = fs.readFileSync("./lessons/" + req.params.id + ".md", {
    encoding: "utf8",
    flag: "r",
  });
  content = content.replace(
    "\n",
    `[](notoc)

## Contents[](notoc)

[](toc)

`
  );

  content = content
    .replaceAll("???", "")
    .replaceAll("---", "")
    .replaceAll("--", "");
  // Outputs: <h1>Remarkable rulezz!</h1>
  const md = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return ""; // use external default escaping
    },
  });
  md.use(namedheadings);

  res.render("lesson", {
    title: "Lesson " + req.params.id,
    content: md.render(content),
    lessons: aLessons,
  });
});

router.get("/:id/slides.html", async (req, res) => {
  var content = fs.readFileSync("./lessons/" + req.params.id + ".md", {
    encoding: "utf8",
    flag: "r",
  });

  //https://ethel-prismic-demo.glitch.me/lesson/16
  //app.locals.logincallback = "https://"+process.env.PROJECT_DOMAIN+".glitch.me/hello"

  const sLessonURL = "https://"+process.env.PROJECT_DOMAIN+".glitch.me/lesson/"+req.params.id
  
  var inClassContentStart = ""
  const inClassFileStart = "./inclass/" + req.params.id + "/begining.md";
  if (fs.existsSync(inClassFileStart)) {
    inClassContentStart = fs.readFileSync(inClassFileStart, {
      encoding: "utf8",
      flag: "r",
    });
    //content = content.replace("\n", "\n\n---\n\n" + inClassContentStart);
     inClassContentStart = "\n\n---\n\n" + inClassContentStart;
  }
  content = content.replace("\n", "\n"+ sLessonURL + inClassContentStart);

  //
  
  const inClassFileEnd = "./inclass/" + req.params.id + "/end.md";
  if (fs.existsSync(inClassFileEnd)) {
    const inClassContentEnd = fs.readFileSync(inClassFileEnd, {
      encoding: "utf8",
      flag: "r",
    });
    content += "\n\n---\n\n" + inClassContentEnd;
  }

  var html = fs.readFileSync("./views/remark.html", {
    encoding: "utf8",
    flag: "r",
  });
  html = html.replace("{{markdown}}", content);
  html = html.replace("{{title}}", "Lesson " + req.params.id);
  res.send(html);
});

export { router as lessonroutes }