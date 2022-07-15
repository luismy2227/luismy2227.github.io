import { getInput, setFailed, setOutput, debug } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function CreateRelease() {
  try {
    const token = getInput("token");
    const version = getInput("version");
    const target = getInput("target");

    debug(`Version: ${version}`);

    if (!token) {
      setFailed("The token is required");
    }

    if (!version) {
      setFailed("The actual version of your project is required");
    }

    if (!target) {
      setFailed("The target of your project is required");
    }

    const octokit = getOctokit(token);

    const release = await octokit.request(
      `POST /repos/${context.repo.owner}/${context.repo.repo}/releases`,
      {
        ...context.repo,
        tag_name: `v${version}`,
        target_commitish: target,
        name: `v${version}`,
        draft: false,
        prerelease: false,
        generate_release_notes: true,
      }
    );

    let url = '';
    if (release.status === 201){
      url = release.data;
    }
    debug(`New version is: ${url}`);
    setOutput("newVersion", url);
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
}

CreateRelease();
