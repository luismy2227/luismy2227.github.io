import { getInput, setFailed, setOutput, debug } from "@actions/core";
import { context, getOctokit } from "@actions/github";

const mayorRegex = [/^BREAKING_CHANGE:.+/];
const minorRegex = [/^feat:.+/, /^perf:.+/, /^refactor:.+/, /^chore:.+/];
const patchRegex = [/^fix:.+/, /^docs:.+/, /^style:.+/, /^test:.+/];
const versionRegex = /^\d+\.\d+\.\d+-*.*$/;
const lastDigitDecoratorRegex = /^\d+-*.*$/;

async function CreateSemanticRelease() {
  try {
    const token = getInput("token");
    const actualVersion = getInput("actualVersion");
    const newVersionDecorator = getInput("newVersionDecorator");

    debug(`Actual version: ${actualVersion}`);
    debug(`New version decorator: ${newVersionDecorator}`);

    if (!token) {
      setFailed("The token is required");
    }

    if (!actualVersion) {
      setFailed("The actual version of your project is required");
    }

    if (!versionRegex.test(actualVersion)) {
      setFailed(
        "Your actual version doesn't match with the semantic versioning standard"
      );
    }

    const octokit = getOctokit(token);

    const pull_number = context.payload.pull_request?.number;
    if (!pull_number) {
      setFailed("This can only be executed on pull requests");
    }

    const commits = await octokit.rest.pulls.listCommits({
      ...context.repo,
      pull_number: pull_number!!,
    });

    debug(`Scanning ${commits.data.length} commits`);

    const mayorCount = commits.data.filter((commit) =>
      mayorRegex.some((reg) => reg.test(commit.commit.message.toUpperCase()))
    ).length;

    let minorCount = 0;
    let patchCount = 0;

    if (mayorCount === 0) {
      minorCount = commits.data.filter((commit) =>
        minorRegex.some((reg) => reg.test(commit.commit.message.toLowerCase()))
      ).length;
    }

    if (minorCount === 0) {
      patchCount = commits.data.filter((commit) =>
        patchRegex.some((reg) => reg.test(commit.commit.message.toLowerCase()))
      ).length;
    }

    debug(`Mayor count: ${mayorCount}`);
    debug(`Minor count: ${minorCount}`);
    debug(`Patch count: ${patchCount}`);

    const actualVersionDigits = actualVersion.split(".");

    if (actualVersionDigits.length != 3) {
      setFailed(
        "Something went wrong working with the provided actual version"
      );
    }

    let firstDigit = parseInt(actualVersionDigits[0], 10);
    let middleDigit = parseInt(actualVersionDigits[1], 10);
    let auxLastDigit = actualVersionDigits[2];
    let lastDigit = parseInt(auxLastDigit, 10);

    if (auxLastDigit.match(lastDigitDecoratorRegex)) {
      const splittedLastDigit = auxLastDigit.split("-");
      auxLastDigit = splittedLastDigit[0];
      lastDigit = parseInt(auxLastDigit, 10);
    }

    const newFirstDigit = firstDigit + mayorCount;
    const newMiddleDigit = mayorCount > 0 ? 0 : middleDigit + minorCount;
    const newLastDigit = newMiddleDigit > 0 ? 0 : lastDigit + patchCount;

    const newVersion = `${newFirstDigit}.${newMiddleDigit}.${newLastDigit}${
      newVersionDecorator ? `-${newVersionDecorator}` : ""
    }`;

    debug(`New version is: ${newVersion}`);
    setOutput("newVersion", newVersion);
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
}

CreateSemanticRelease();
