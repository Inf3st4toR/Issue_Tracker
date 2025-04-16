"use strict";
const { v4: uuidv4 } = require("uuid");
let arrIssues = [];

//Filter function
const matchFilters = (issue, filters) => {
  for (let key in filters) {
    if (issue[key] != filters[key]) {
      return false;
    }
  }
  return true;
};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    // GET ROUTE
    .get(function (req, res) {
      let project = req.params.project;
      const arrRes = [];
      const filters = {};

      if (req.query.issue_title !== undefined) {
        filters.issue_title = req.query.issue_title;
      }
      if (req.query.issue_text !== undefined) {
        filters.issue_text = req.query.issue_text;
      }
      if (req.query.created_by !== undefined) {
        filters.created_by = req.query.created_by;
      }
      if (req.query.assigned_to !== undefined) {
        filters.assigned_to = req.query.assigned_to;
      }
      if (req.query.status_text !== undefined) {
        filters.status_text = req.query.status_text;
      }
      if (req.query.open !== undefined) {
        filters.open = req.query.open === "true";
      }

      arrIssues.forEach((obj) => {
        if (obj.project === project && matchFilters(obj, filters))
          arrRes.push(obj);
      });
      res.json(arrRes);
    })

    //POST ROUTE
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
