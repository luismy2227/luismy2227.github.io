const core = require("@actions/core");
const github = require("@actions/github");

async function CreateIssue() {
  try {
    const title = core.getInput("title");
    const body = core.getInput("body");
    const assignees = core.getInput("assignees");
    const token = core.getInput("token");

    if (!token) {
      core.setFailed("The token is required");
    }

    if (!title) {
      core.setFailed("The issue needs a title");
    }

    if (!body) {
      core.setFailed("The issue needs a body");
    }

    const octokit = new github.getOctokit(token);

    const response = await octokit.rest.issues.create({
      ...github.context.repo,
      title,
      body,
      assignees: assignees ? assignees.split("\n") : undefined,
    });

    core.setOutput("issue", JSON.stringify(response.data));
  } catch (error) {
    core.setFailed(error.message);
  }
}

CreateIssue();
