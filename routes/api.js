"use strict";
const { v4: uuidv4 } = require("uuid");
let arrIssues = [];

//Filter function
const validFields = [
  "issue_title",
  "issue_text",
  "created_by",
  "assigned_to",
  "status_text",
  "open",
  "created_on",
  "updated_on",
];

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    // GET ROUTE
    .get(function (req, res) {
      let project = req.params.project;
      let filteredArr = [];
      let filters = {};
      arrIssues.forEach((obj) => {
        if (obj.project === project) filteredArr.push(obj);
      });

      for (const para in req.query) {
        if (!validFields.includes(para)) continue;
        filters[para] = req.query[para];
      }
      filteredArr = filteredArr.filter((obj) => {
        for (const key in filters) {
          if (obj[key] !== filters[key]) {
            return false;
          }
        }
        return true;
      });
      res.json(filteredArr);
    })

    //POST ROUTE
    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
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

    // PUT ROUTE
    .put(function (req, res) {
      let project = req.params.project;
      const _id = req.body._id;
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
      const issueTarget = arrIssues.find((obj) => obj._id === _id);
      if (!issueTarget)
        return res.json({ error: "could not update", _id: _id });
      if (Object.keys(req.body).length === 1) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }
      const indexTarget = arrIssues.findIndex((obj) => obj._id === _id);
      for (const key in issueTarget) {
        if (req.body.hasOwnProperty(key)) {
          issueTarget[key] = req.body[key];
        }
      }
      arrIssues[indexTarget] = issueTarget;
      return res.json({ result: "successfully updated", _id: _id });
    })

    //DELETE ROUTE
    .delete(function (req, res) {
      const _id = req.body._id;
      if (!_id) return res.json({ error: "missing _id" });
      const issueTarget = arrIssues.find((obj) => obj._id === _id);
      if (!issueTarget)
        return res.json({ error: "could not delete", _id: _id });
      const indexTarget = arrIssues.findIndex((obj) => obj._id === _id);
      arrIssues.splice(indexTarget, 1);
      return res.json({ result: "successfully deleted", _id: _id });
    });
};
