import got, { OptionsOfJSONResponseBody } from 'got';
import { RIOT_API_KEY } from '../../utils/constants';
import logger from '../../utils/logger';

const httpOptions: OptionsOfJSONResponseBody = {
  headers: {
    'X-Riot-Token': RIOT_API_KEY,
  },
  responseType: 'json',
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function makeApiCall(url: string, retryCount = 3) {
  try {
    let { body, statusCode, headers } = await got.get(url, httpOptions);
    let attemptCount = 0;
    while (statusCode !== 200 && attemptCount <= retryCount) {
      logger.warn(`Unable to access endpoint, retrying: ${url}`);
      if (statusCode === 429) {
        const secondsToWait = +headers['retry-after'] + 2;
        await sleep(secondsToWait * 1000);
      } else {
        await sleep(2 * 1000);
      }
      ({ body, statusCode, headers } = await got.get(url, httpOptions));
      attemptCount++;
    }

    if (statusCode != 200) {
      logger.error(`Unable to access endpoint after ${retryCount} retries: ${url}`);
      return null;
    }

    if (Array.isArray(body) && body.length === 0) {
      return null;
    }
    return body;
  } catch (error) {
    console.log('Error accessing API Endpoint: ' + url);
    console.log('Error: ' + error);
  }
}
