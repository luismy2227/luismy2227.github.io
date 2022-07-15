const core = require("@actions/core");
const github = require("@actions/github");

async function CreatePR() {
  try {
    const head = core.getInput("head");
    const base = core.getInput("base");
    const title = core.getInput("title");
    const body = core.getInput("body");
    const assignees = core.getInput("assignees");
    const token = core.getInput("token");

    if (!token) {
      core.setFailed("The token is required");
    }

    if (!title) {
      core.setFailed("The pull request needs a title");
    }

    if (!body) {
      core.setFailed("The pull request needs a body");
    }

    const octokit = new github.getOctokit(token);

    const response = await octokit.rest.pulls.create({
      ...github.context.repo,
      title,
      body,
      head,
      base,
      assignees: assignees ? assignees.split("\n") : undefined,
    });

    core.setOutput("pull_request", JSON.stringify(response.data));
  } catch (error) {
    core.setFailed(error.message);
  }
}

CreatePR();
