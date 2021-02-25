import { getopt } from 'stdio';

import { nh2ipld } from './nh-utils.mjs';

const options = getopt({
  number: { key: 'n', args: 1, required: true },
});

if (options.number) {
  try {
    const res = await nh2ipld(options.number);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}
