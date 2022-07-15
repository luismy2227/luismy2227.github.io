import { getInput, setFailed } from "@actions/core";
import axios from "axios";

async function SendSlackMessage() {
  try {
    const text = getInput("text");
    const webhook = getInput("webhook");

    await axios.post(webhook, { text });
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
}

SendSlackMessage();
