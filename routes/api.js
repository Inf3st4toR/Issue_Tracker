"use strict";
const { v4: uuidv4 } = require("uuid");
let arrIssues = [];

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      const arrRes = [];
      arrIssues.forEach((obj) => {
        if (obj.project == project) arrRes.push(obj);
      });
      res.json(arrRes);
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.status(400).json({ error: "required field(s) missing" });
      }
      const newIssue = {
        _id: uuidv4(),
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        open: true,
        created_on: new Date(),
        updated_on: new Date(),
        project: project,
      };
      arrIssues.push(newIssue);
      res.json(newIssue);
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
