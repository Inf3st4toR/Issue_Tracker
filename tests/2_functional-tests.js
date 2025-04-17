const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  //Create dummy issues
  let issue1Id;
  let issue2Id;

  beforeEach(function (done) {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "Test Issue 1",
        issue_text: "This is a test issue",
        created_by: "Roger",
        open: false,
        assigned_to: "Joe",
        status_text: "optional text",
      })
      .end((err, res) => {
        issue1Id = res.body._id;

        chai
          .request(server)
          .post("/api/issues/apitest")
          .send({
            issue_title: "Test Issue 2",
            issue_text: "This is another test issue",
            created_by: "Roger",
            open: true,
          })
          .end((err, res) => {
            issue2Id = res.body._id;
            done();
          });
      });
  });

  //
  test("Create issue with all fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "Issue 1",
        issue_text: "text of issue 1",
        created_by: "Roger",
        assigned_to: "optional Patrick",
        status_text: "optional status",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Issue 1");
        assert.equal(res.body.issue_text, "text of issue 1");
        assert.equal(res.body.created_by, "Roger");
        assert.equal(res.body.assigned_to, "optional Patrick");
        assert.equal(res.body.status_text, "optional status");
        assert.property(res.body, "_id", "ID missing");
        assert.property(res.body, "created_on", "Creation date missing");
        assert.property(res.body, "updated_on", "Update date missing");
        assert.property(res.body, "open", "Open is missing");
        done();
      });
  });

  //
  test("Create issue with required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "Issue 1",
        issue_text: "text of issue 1",
        created_by: "Roger",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Issue 1");
        assert.equal(res.body.issue_text, "text of issue 1");
        assert.equal(res.body.created_by, "Roger");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.property(res.body, "_id", "ID missing");
        assert.property(res.body, "created_on", "Creation date missing");
        assert.property(res.body, "updated_on", "Update date missing");
        assert.property(res.body, "open", "Open is missing");
        done();
      });
  });

  //
  test("Create issue with missing fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "Issue 1",
        created_by: "Roger",
      })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: "required field(s) missing" });
        done();
      });
  });

  //
  test("View all issues", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "This should be an Array");
        done();
      });
  });

  //
  test("View a filtered issue", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest?open=true")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "This should be an Array");
        res.body.forEach((issue) => {
          assert.equal(issue.open, true, "All issues should be open");
        });
        done();
      });
  });

  //
  test("View several filters", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest?open=false&created_by=Roger")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "This should be an Array");
        res.body.forEach((issue) => {
          assert.equal(issue.open, false, "All issues should be close");
          assert.equal(
            issue.created_by,
            "Roger",
            "All issues should be from Roger"
          );
        });
        done();
      });
  });

  //
  test("Update one field", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: issue1Id,
        issue_text: "The text has been updated",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: issue1Id,
        });
        done();
      });
  });

  //
  test("Update several fields", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: issue2Id,
        issue_text: "The text has been updated",
        assigned_to: "Ramses",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: issue2Id,
        });
        done();
      });
  });

  //
  test("Update without an ID", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_text: "Attempt to update",
      })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });

  //
  test("Update no fields", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: issue1Id,
      })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: issue1Id,
        });
        done();
      });
  });

  //
  test("Update with invalid _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "invalid",
      })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          error: "could not update",
          _id: "invalid",
        });
        done();
      });
  });

  //
  test("Delete an issue", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: issue1Id,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully deleted",
          _id: issue1Id,
        });
        done();
      });
  });

  //
  test("Delete with invalid id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: "invalid",
      })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          error: "could not delete",
          _id: "invalid",
        });
        done();
      });
  });

  //
  test("Delete with no id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: "",
      })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });
});
