const core = require("@actions/core");
import axios from "axios";

async function SendSlackMessage() {
  try {
    const text = core.getInput("text");
    const webhook = core.getInput("webhook");

    await axios.post(webhook, { text });
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

SendSlackMessage();
